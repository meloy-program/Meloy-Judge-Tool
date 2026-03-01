import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import ExcelJS from 'exceljs';
import { query, queryOne } from '../../db/connection';
import { errorResponse } from '../../utils/response';

interface TeamData {
    id: string;
    name: string;
    mentor_name: string | null;
    avg_score: number;
    rank: number;
}

interface JudgeData {
    id: string;
    name: string;
}

interface ScoreData {
    team_id: string;
    judge_id: string;
    judge_name: string;
    communication: number;
    funding: number;
    presentation: number;
    cohesion: number;
    total: number;
}

interface AwardData {
    team_id: string;
    award_type: string;
}

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const eventId = event.pathParameters?.eventId;
        if (!eventId) {
            return errorResponse('Event ID is required', 400);
        }

        // Get event details
        const eventData = await queryOne(
            `SELECT e.*, s.name as sponsor_name
             FROM events e
             LEFT JOIN sponsors s ON e.sponsor_id = s.id
             WHERE e.id = $1`,
            [eventId]
        );

        if (!eventData) {
            return errorResponse('Event not found', 404);
        }

        // Get teams with rankings
        const teams = await query<TeamData>(
            `WITH judge_totals AS (
                SELECT 
                    ss.team_id,
                    ss.judge_id,
                    COALESCE(SUM(s.score), 0) as judge_total
                FROM score_submissions ss
                LEFT JOIN scores s ON ss.id = s.submission_id
                WHERE ss.submitted_at IS NOT NULL
                GROUP BY ss.team_id, ss.judge_id
            )
            SELECT 
                t.id,
                t.name,
                t.mentor_name,
                COALESCE(ROUND(AVG(jt.judge_total)::numeric, 2), 0) as avg_score,
                ROW_NUMBER() OVER (ORDER BY AVG(jt.judge_total) DESC) as rank
            FROM teams t
            LEFT JOIN judge_totals jt ON t.id = jt.team_id
            WHERE t.event_id = $1
            GROUP BY t.id, t.name, t.mentor_name
            ORDER BY avg_score DESC`,
            [eventId]
        );

        // Get judges
        const judges = await query<JudgeData>(
            `SELECT id, name
             FROM event_judges
             WHERE event_id = $1
             ORDER BY name`,
            [eventId]
        );

        // Get detailed scores by criteria
        const scores = await query<ScoreData>(
            `SELECT 
                ss.team_id,
                ss.judge_id,
                ej.name as judge_name,
                MAX(CASE WHEN rc.short_name = 'Communication' THEN s.score ELSE 0 END) as communication,
                MAX(CASE WHEN rc.short_name = 'Funding' THEN s.score ELSE 0 END) as funding,
                MAX(CASE WHEN rc.short_name = 'Presentation' THEN s.score ELSE 0 END) as presentation,
                MAX(CASE WHEN rc.short_name = 'Cohesion' THEN s.score ELSE 0 END) as cohesion,
                COALESCE(SUM(s.score), 0) as total
            FROM score_submissions ss
            JOIN event_judges ej ON ss.judge_id = ej.id
            LEFT JOIN scores s ON ss.id = s.submission_id
            LEFT JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
            WHERE ss.event_id = $1 AND ss.submitted_at IS NOT NULL
            GROUP BY ss.team_id, ss.judge_id, ej.name`,
            [eventId]
        );

        // Get awards
        const awards = await query<AwardData>(
            `SELECT team_id, award_type
             FROM team_awards
             WHERE event_id = $1`,
            [eventId]
        );

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        
        // Generate the three sheets
        await createJudgeTeamNamesSheet(workbook, eventData, teams, judges);
        await createScoreSheet(workbook, teams, judges, scores);
        await createFinalResultsSheet(workbook, eventData, teams, awards);

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${eventData.name.replace(/[^a-z0-9]/gi, '_')}_Results.xlsx"`,
            },
            body: base64,
            isBase64Encoded: true,
        };
    } catch (error: any) {
        console.error('Excel export error:', error);
        return errorResponse('Failed to generate Excel export', 500, error);
    }
};

async function createJudgeTeamNamesSheet(
    workbook: ExcelJS.Workbook,
    eventData: any,
    teams: TeamData[],
    judges: JudgeData[]
) {
    const sheet = workbook.addWorksheet('Judge & Team Names');
    
    // Title
    sheet.mergeCells('A1:B1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `${eventData.sponsor_name || 'Meloy Program'} - ${eventData.name}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Judges section
    sheet.getCell('A3').value = 'Judges';
    sheet.getCell('A3').font = { bold: true, size: 14 };
    
    let row = 4;
    judges.forEach((judge, index) => {
        sheet.getCell(`A${row}`).value = `Judge ${index + 1}:`;
        sheet.getCell(`B${row}`).value = judge.name;
        row++;
    });
    
    // Teams section
    row += 2;
    sheet.getCell(`A${row}`).value = 'Teams';
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row++;
    
    teams.forEach((team, index) => {
        sheet.getCell(`A${row}`).value = `Team ${index + 1}:`;
        sheet.getCell(`B${row}`).value = team.name;
        row++;
        if (team.mentor_name) {
            sheet.getCell(`A${row}`).value = 'Mentor:';
            sheet.getCell(`B${row}`).value = team.mentor_name;
            row++;
        }
    });
    
    // Column widths
    sheet.getColumn('A').width = 15;
    sheet.getColumn('B').width = 40;
}

async function createScoreSheet(
    workbook: ExcelJS.Workbook,
    teams: TeamData[],
    judges: JudgeData[],
    scores: ScoreData[]
) {
    const sheet = workbook.addWorksheet('Score Sheet');
    
    // Header row
    const headerRow = ['Team', 'Judge', 'Communication (25)', 'Funding (25)', 'Presentation (25)', 'Cohesion (25)', 'Total (100)'];
    sheet.addRow(headerRow);
    
    const headerRowObj = sheet.getRow(1);
    headerRowObj.font = { bold: true };
    headerRowObj.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Data rows
    teams.forEach(team => {
        judges.forEach(judge => {
            const scoreData = scores.find(s => s.team_id === team.id && s.judge_id === judge.id);
            
            sheet.addRow([
                team.name,
                judge.name,
                scoreData?.communication || 0,
                scoreData?.funding || 0,
                scoreData?.presentation || 0,
                scoreData?.cohesion || 0,
                scoreData?.total || 0
            ]);
        });
    });
    
    // Column widths
    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 20;
    sheet.getColumn(4).width = 20;
    sheet.getColumn(5).width = 20;
    sheet.getColumn(6).width = 20;
    sheet.getColumn(7).width = 15;
}

async function createFinalResultsSheet(
    workbook: ExcelJS.Workbook,
    eventData: any,
    teams: TeamData[],
    awards: AwardData[]
) {
    const sheet = workbook.addWorksheet('Final Results');
    
    // Title
    sheet.mergeCells('A1:C1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `${eventData.sponsor_name || 'Meloy Program'} - Final Results`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Rankings section
    sheet.getCell('A3').value = 'Rankings';
    sheet.getCell('A3').font = { bold: true, size: 14 };
    
    const rankingHeader = ['Rank', 'Team Name', 'Average Score'];
    sheet.addRow(rankingHeader);
    const rankHeaderRow = sheet.getRow(4);
    rankHeaderRow.font = { bold: true };
    
    teams.forEach(team => {
        sheet.addRow([team.rank, team.name, team.avg_score]);
    });
    
    // Awards section
    const awardsStartRow = teams.length + 7;
    sheet.getCell(`A${awardsStartRow}`).value = 'Special Awards';
    sheet.getCell(`A${awardsStartRow}`).font = { bold: true, size: 14 };
    
    const awardTypes = [
        { type: 'first_place', label: 'First Place' },
        { type: 'second_place', label: 'Second Place' },
        { type: 'third_place', label: 'Third Place' },
        { type: 'most_feasible', label: 'Most Feasible Solution' },
        { type: 'best_prototype', label: 'Best Prototype' },
        { type: 'best_video', label: 'Best Video' },
        { type: 'best_presentation', label: 'Best Presentation' }
    ];
    
    let awardRow = awardsStartRow + 1;
    awardTypes.forEach(({ type, label }) => {
        const award = awards.find(a => a.award_type === type);
        const team = award ? teams.find(t => t.id === award.team_id) : null;
        
        sheet.getCell(`A${awardRow}`).value = label + ':';
        sheet.getCell(`B${awardRow}`).value = team?.name || '(Not Assigned)';
        awardRow++;
    });
    
    // Column widths
    sheet.getColumn('A').width = 25;
    sheet.getColumn('B').width = 30;
    sheet.getColumn('C').width = 15;
}
