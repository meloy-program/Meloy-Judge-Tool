"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    BarChart3,
    Users,
    MessageSquare,
    GitCompare,
    Target,
    User,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    Activity,
    AlertCircle,
    Clock
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import type { DetailedLeaderboardEntry } from "@/lib/types/api"

interface AnalyticsTabProps {
    leaderboard: DetailedLeaderboardEntry[]
}

export function FinalLeaderboardAnalyticsTab({ leaderboard }: AnalyticsTabProps) {
    const [selectedTeamForComments, setSelectedTeamForComments] = useState<string>("")
    const [comparisonTeam1, setComparisonTeam1] = useState<string>("")
    const [comparisonTeam2, setComparisonTeam2] = useState<string>("")
    const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set())
    const [expandedScoreCell, setExpandedScoreCell] = useState<{
        teamId: string
        judgeId: string
    } | null>(null)

    const toggleScoreCell = (teamId: string, judgeId: string) => {
        setExpandedScoreCell(prev =>
            prev && prev.teamId === teamId && prev.judgeId === judgeId
                ? null
                : { teamId, judgeId }
        )
    }

    const toggleCriteriaExpanded = (criteriaName: string) => {
        setExpandedCriteria(prev => {
            const newSet = new Set(prev)
            if (newSet.has(criteriaName)) {
                newSet.delete(criteriaName)
            } else {
                newSet.add(criteriaName)
            }
            return newSet
        })
    }

    // Get all unique judges
    const allJudges = leaderboard.length > 0 && leaderboard[0].judge_scores.length > 0
        ? leaderboard[0].judge_scores.map(js => ({ id: js.judge_id, name: js.judge_name }))
        : []

    // Get all criteria names
    const allCriteria = leaderboard.length > 0 &&
        leaderboard[0].judge_scores.length > 0 &&
        leaderboard[0].judge_scores[0].criteria_scores
        ? leaderboard[0].judge_scores[0].criteria_scores.map(cs => cs.criteria_name)
        : []

    // Team-by-Team Judge Comparison (ALL teams)
    const teamJudgeComparisonData = leaderboard.map(team => {
        const dataPoint: any = {
            team: team.team_name.length > 15 ? team.team_name.substring(0, 15) + '...' : team.team_name,
            fullName: team.team_name
        }
        team.judge_scores.forEach(js => {
            dataPoint[js.judge_name] = js.total_score
        })
        return dataPoint
    })

    const COLORS = ['#500000', '#3d0000', '#2a0000', '#1f0000', '#6b0000']

    if (leaderboard.length === 0) {
        return (
            <div className="pt-2">
                <p className="text-base text-slate-500">No data available for analytics.</p>
            </div>
        )
    }

    const selectedTeamData = leaderboard.find(t => t.team_id === selectedTeamForComments)
    const team1Data = leaderboard.find(t => t.team_id === comparisonTeam1)
    const team2Data = leaderboard.find(t => t.team_id === comparisonTeam2)

    return (
        <div className="space-y-6">
            <div className="pt-2">
                <h2 className="text-[2.2rem] font-semibold text-slate-900">Visual Analytics</h2>
                <p className="mt-2 text-lg text-slate-500">
                    Interactive tools to support deliberation and final decision-making
                </p>
            </div>

            {/* 1. All Teams: Judge Scoring Patterns */}
            {teamJudgeComparisonData.length > 0 && allJudges.length > 0 && (
                <Card className="relative overflow-hidden rounded-[28px] border-2 border-primary/25 bg-white/95 shadow-lg">
                    <CardHeader className="px-8 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                                <BarChart3 className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-semibold text-slate-900">Judge Scoring Patterns</CardTitle>
                                <CardDescription className="text-lg text-slate-600">
                                    Compare how each judge scored all teams
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <ResponsiveContainer width="100%" height={Math.max(400, leaderboard.length * 40)}>
                            <BarChart data={teamJudgeComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="team"
                                    tick={{ fill: '#64748b', fontSize: 13 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis
                                    tick={{ fill: '#64748b', fontSize: 13 }}
                                    label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '2px solid #500000',
                                        borderRadius: '12px',
                                        padding: '12px'
                                    }}
                                />
                                <Legend />
                                {allJudges.map((judge, index) => (
                                    <Bar
                                        key={judge.id}
                                        dataKey={judge.name}
                                        fill={COLORS[index % COLORS.length]}
                                        radius={[8, 8, 0, 0]}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-5 text-base text-slate-600 text-center">
                            Identifies if certain judges consistently score higher or lower than others across all teams
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 2. Head-to-Head Team Comparison */}
            <Card className="relative overflow-hidden rounded-[28px] border-2 border-primary/25 bg-white/95 shadow-lg">
                <CardHeader className="px-8 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                            <GitCompare className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-semibold text-slate-900">Head-to-Head Comparison</CardTitle>
                            <CardDescription className="text-lg text-slate-600">
                                Compare two teams side-by-side across all judges and criteria
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="text-lg font-semibold text-slate-700 mb-3 block">Team 1</label>
                            <Select value={comparisonTeam1} onValueChange={setComparisonTeam1}>
                                <SelectTrigger className="w-full h-16 rounded-xl text-lg border-2 border-slate-200 hover:border-primary/30 transition-colors">
                                    <SelectValue placeholder="Select first team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaderboard.map(team => (
                                        <SelectItem key={team.team_id} value={team.team_id} className="text-base py-3">
                                            #{team.rank} - {team.team_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-lg font-semibold text-slate-700 mb-3 block">Team 2</label>
                            <Select value={comparisonTeam2} onValueChange={setComparisonTeam2}>
                                <SelectTrigger className="w-full h-16 rounded-xl text-lg border-2 border-slate-200 hover:border-primary/30 transition-colors">
                                    <SelectValue placeholder="Select second team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaderboard.map(team => (
                                        <SelectItem key={team.team_id} value={team.team_id} className="text-base py-3">
                                            #{team.rank} - {team.team_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {team1Data && team2Data ? (
                        <div className="space-y-8">
                            {/* Consensus Summary - Informational Only */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Judge Agreement */}
                                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-6">
                                    <div className="text-sm font-medium text-slate-600 mb-2">Judge Agreement</div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">
                                        {allJudges.filter(judge => {
                                            const t1Score = team1Data.judge_scores.find(js => js.judge_id === judge.id)
                                            const t2Score = team2Data.judge_scores.find(js => js.judge_id === judge.id)
                                            return t1Score && t2Score && t1Score.total_score > t2Score.total_score
                                        }).length} - {allJudges.filter(judge => {
                                            const t1Score = team1Data.judge_scores.find(js => js.judge_id === judge.id)
                                            const t2Score = team2Data.judge_scores.find(js => js.judge_id === judge.id)
                                            return t1Score && t2Score && t2Score.total_score > t1Score.total_score
                                        }).length}
                                    </div>
                                    <div className="text-sm text-slate-600">split across judges</div>
                                </div>

                                {/* Score Differential */}
                                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-6">
                                    <div className="text-sm font-medium text-slate-600 mb-2">Total Score Gap</div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">
                                        {Math.abs(team1Data.total_score - team2Data.total_score)} pts
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        difference between teams
                                    </div>
                                </div>

                                {/* Scoring Consistency */}
                                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-6">
                                    <div className="text-sm font-medium text-slate-600 mb-3">Scoring Consistency</div>
                                    <div className="flex items-center gap-3 mb-1">
                                        {[{ data: team1Data, label: team1Data.team_name }, { data: team2Data, label: team2Data.team_name }].map(({ data, label }) => {
                                            const level = data.score_stddev < 5 ? 'high' : data.score_stddev < 10 ? 'medium' : 'low'
                                            return (
                                                <Badge
                                                    key={data.team_id}
                                                    className={`text-sm px-3 py-1.5 ${level === 'high'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : level === 'medium'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}
                                                    title={label}
                                                >
                                                    {level === 'high' ? (
                                                        <><CheckCircle className="h-4 w-4 mr-1 inline" />High</>
                                                    ) : level === 'medium' ? (
                                                        <><Activity className="h-4 w-4 mr-1 inline" />Moderate</>
                                                    ) : (
                                                        <><AlertCircle className="h-4 w-4 mr-1 inline" />Wide</>
                                                    )}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        judge agreement per team
                                    </div>
                                </div>
                            </div>

                            {/* Judge Scores Table - Neutral Presentation */}
                            <div className="rounded-xl border border-primary/20 bg-white overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white border-b border-primary/20">
                                            <th className="bg-linear-to-br from-primary to-[#3d0000] px-6 py-4 text-left min-w-[200px] border-r border-white/20">
                                                <p className="text-sm font-semibold text-white">Team</p>
                                            </th>
                                            {allJudges.map((judge) => (
                                                <th key={judge.id} className="bg-linear-to-br from-primary to-[#3d0000] px-5 py-4 border-r border-white/20 min-w-[120px]">
                                                    <p className="text-sm font-semibold text-white text-center">{judge.name}</p>
                                                </th>
                                            ))}
                                            <th className="bg-linear-to-br from-primary to-[#3d0000] px-5 py-4 w-[120px] border-r border-white/20">
                                                <p className="text-sm font-semibold text-white text-center">Avg</p>
                                            </th>
                                            <th className="bg-linear-to-br from-primary to-[#3d0000] px-5 py-4 w-[120px]">
                                                <p className="text-sm font-semibold text-white text-center">Total</p>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Team 1 Row */}
                                        <tr className="bg-slate-50 hover:bg-slate-100 transition-all duration-300 border-b border-slate-200">
                                            <td className="bg-white px-6 py-4 border-r border-slate-200">
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-base">{team1Data.team_name}</p>
                                                    <p className="text-sm text-slate-500 mt-0.5">Rank #{team1Data.rank}</p>
                                                </div>
                                            </td>
                                            {allJudges.map((judge) => {
                                                const judgeScore = team1Data.judge_scores.find(js => js.judge_id === judge.id)
                                                const isExpanded = expandedScoreCell?.teamId === team1Data.team_id && expandedScoreCell?.judgeId === judge.id
                                                return (
                                                    <td key={judge.id} className="bg-white px-5 py-4 border-r border-slate-200">
                                                        {judgeScore ? (
                                                            <button
                                                                onClick={() => toggleScoreCell(team1Data.team_id, judge.id)}
                                                                className={`flex flex-col items-center w-full rounded-lg p-2 transition-colors cursor-pointer ${isExpanded ? 'bg-primary/10 ring-2 ring-primary/30' : 'hover:bg-primary/5'
                                                                    }`}
                                                            >
                                                                <span className="text-lg font-bold text-slate-900">
                                                                    {judgeScore.total_score}
                                                                </span>
                                                                <span className="text-sm text-slate-500">/100</span>
                                                            </button>
                                                        ) : (
                                                            <div className="flex justify-center">
                                                                <span className="inline-flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 text-base text-slate-400">
                                                                    —
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                            <td className="bg-white px-5 py-4 border-r border-slate-200">
                                                <div className="text-center">
                                                    <span className="text-xl font-bold text-slate-900">
                                                        {team1Data.avg_score.toFixed(1)}
                                                    </span>
                                                    <br />
                                                    <span className="text-sm text-slate-500">/100</span>
                                                </div>
                                            </td>
                                            <td className="bg-white px-5 py-4">
                                                <div className="text-center">
                                                    <Badge className="bg-slate-700 text-white font-bold text-lg px-4 py-1.5">
                                                        {team1Data.total_score}
                                                    </Badge>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Inline Expanded Score Detail (for Team 1) */}
                                        {expandedScoreCell && expandedScoreCell.teamId === team1Data.team_id && (() => {
                                            const judgeScore = team1Data.judge_scores.find(js => js.judge_id === expandedScoreCell.judgeId)
                                            const judgeName = allJudges.find(j => j.id === expandedScoreCell.judgeId)?.name ?? ''
                                            if (!judgeScore) return null
                                            return (
                                                <tr className="bg-slate-50">
                                                    <td colSpan={allJudges.length + 3} className="px-8 py-6">
                                                        <div className="rounded-[22px] border border-slate-200/70 bg-white p-6 space-y-5 shadow-sm">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                                                                        <User className="h-6 w-6 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900 text-lg">{judgeName}</p>
                                                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>{new Date(judgeScore.submitted_at).toLocaleDateString()} • {Math.floor(judgeScore.time_spent_seconds / 60)} min {judgeScore.time_spent_seconds % 60} sec</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Badge className="bg-primary text-white font-bold text-base px-3 py-1.5">
                                                                    {judgeScore.total_score}/100
                                                                </Badge>
                                                            </div>
                                                            <div className="space-y-3 pt-3 border-t border-slate-200">
                                                                {judgeScore.criteria_scores.map(criteria => (
                                                                    <div key={criteria.criteria_id} className="space-y-2 rounded-[18px] border border-slate-200/70 bg-slate-50/70 px-5 py-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-base font-semibold text-slate-900">{criteria.criteria_name}</span>
                                                                            <Badge className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
                                                                                {criteria.score}/{criteria.max_score}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                                            <div
                                                                                className="h-full rounded-full bg-primary transition-all duration-500"
                                                                                style={{ width: `${(criteria.score / criteria.max_score) * 100}%` }}
                                                                            />
                                                                        </div>
                                                                        {criteria.reflection && (
                                                                            <div className="pt-2 border-t border-slate-200">
                                                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Reflection</p>
                                                                                <p className="text-sm text-slate-700 leading-relaxed italic">"{criteria.reflection}"</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })()}

                                        {/* Team 2 Row */}
                                        <tr className="bg-slate-50 hover:bg-slate-100 transition-all duration-300">
                                            <td className="bg-white px-6 py-4 border-r border-slate-200">
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-base">{team2Data.team_name}</p>
                                                    <p className="text-sm text-slate-500 mt-0.5">Rank #{team2Data.rank}</p>
                                                </div>
                                            </td>
                                            {allJudges.map((judge) => {
                                                const judgeScore = team2Data.judge_scores.find(js => js.judge_id === judge.id)
                                                const isExpanded = expandedScoreCell?.teamId === team2Data.team_id && expandedScoreCell?.judgeId === judge.id
                                                return (
                                                    <td key={judge.id} className="bg-white px-5 py-4 border-r border-slate-200">
                                                        {judgeScore ? (
                                                            <button
                                                                onClick={() => toggleScoreCell(team2Data.team_id, judge.id)}
                                                                className={`flex flex-col items-center w-full rounded-lg p-2 transition-colors cursor-pointer ${isExpanded ? 'bg-primary/10 ring-2 ring-primary/30' : 'hover:bg-primary/5'
                                                                    }`}
                                                            >
                                                                <span className="text-lg font-bold text-slate-900">
                                                                    {judgeScore.total_score}
                                                                </span>
                                                                <span className="text-sm text-slate-500">/100</span>
                                                            </button>
                                                        ) : (
                                                            <div className="flex justify-center">
                                                                <span className="inline-flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 text-base text-slate-400">
                                                                    —
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                            <td className="bg-white px-5 py-4 border-r border-slate-200">
                                                <div className="text-center">
                                                    <span className="text-xl font-bold text-slate-900">
                                                        {team2Data.avg_score.toFixed(1)}
                                                    </span>
                                                    <br />
                                                    <span className="text-sm text-slate-500">/100</span>
                                                </div>
                                            </td>
                                            <td className="bg-white px-5 py-4">
                                                <div className="text-center">
                                                    <Badge className="bg-slate-700 text-white font-bold text-lg px-4 py-1.5">
                                                        {team2Data.total_score}
                                                    </Badge>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Inline Expanded Score Detail (for Team 2) */}
                                        {expandedScoreCell && expandedScoreCell.teamId === team2Data.team_id && (() => {
                                            const judgeScore = team2Data.judge_scores.find(js => js.judge_id === expandedScoreCell.judgeId)
                                            const judgeName = allJudges.find(j => j.id === expandedScoreCell.judgeId)?.name ?? ''
                                            if (!judgeScore) return null
                                            return (
                                                <tr className="bg-slate-50">
                                                    <td colSpan={allJudges.length + 3} className="px-8 py-6">
                                                        <div className="rounded-[22px] border border-slate-200/70 bg-white p-6 space-y-5 shadow-sm">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                                                                        <User className="h-6 w-6 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900 text-lg">{judgeName}</p>
                                                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>{new Date(judgeScore.submitted_at).toLocaleDateString()} • {Math.floor(judgeScore.time_spent_seconds / 60)} min {judgeScore.time_spent_seconds % 60} sec</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Badge className="bg-primary text-white font-bold text-base px-3 py-1.5">
                                                                    {judgeScore.total_score}/100
                                                                </Badge>
                                                            </div>
                                                            <div className="space-y-3 pt-3 border-t border-slate-200">
                                                                {judgeScore.criteria_scores.map(criteria => (
                                                                    <div key={criteria.criteria_id} className="space-y-2 rounded-[18px] border border-slate-200/70 bg-slate-50/70 px-5 py-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-base font-semibold text-slate-900">{criteria.criteria_name}</span>
                                                                            <Badge className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
                                                                                {criteria.score}/{criteria.max_score}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                                            <div
                                                                                className="h-full rounded-full bg-primary transition-all duration-500"
                                                                                style={{ width: `${(criteria.score / criteria.max_score) * 100}%` }}
                                                                            />
                                                                        </div>
                                                                        {criteria.reflection && (
                                                                            <div className="pt-2 border-t border-slate-200">
                                                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Reflection</p>
                                                                                <p className="text-sm text-slate-700 leading-relaxed italic">"{criteria.reflection}"</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            {/* Interactive Criteria Deep-Dive */}
                            <div>
                                <h4 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Criteria-by-Criteria Breakdown
                                </h4>
                                <div className="space-y-4">
                                    {allCriteria.map(criteriaName => {
                                        const isExpanded = expandedCriteria.has(criteriaName)

                                        // Calculate totals for this criterion
                                        const team1CriteriaScores = team1Data.judge_scores.map(js => {
                                            const criteria = js.criteria_scores.find(cs => cs.criteria_name === criteriaName)
                                            return criteria ? criteria.score : 0
                                        })
                                        const team2CriteriaScores = team2Data.judge_scores.map(js => {
                                            const criteria = js.criteria_scores.find(cs => cs.criteria_name === criteriaName)
                                            return criteria ? criteria.score : 0
                                        })

                                        const team1Total = team1CriteriaScores.reduce((a, b) => a + b, 0)
                                        const team2Total = team2CriteriaScores.reduce((a, b) => a + b, 0)
                                        const maxPossible = (team1Data.judge_scores[0]?.criteria_scores.find(cs => cs.criteria_name === criteriaName)?.max_score ?? 25) * allJudges.length
                                        const differential = Math.abs(team1Total - team2Total)

                                        return (
                                            <div key={criteriaName} className="rounded-[22px] border border-slate-200/70 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                {/* Criteria Header - Clickable */}
                                                <button
                                                    onClick={() => toggleCriteriaExpanded(criteriaName)}
                                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                                                            <Target className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div className="text-left">
                                                            <h5 className="text-lg font-semibold text-slate-900">{criteriaName}</h5>
                                                            <p className="text-sm text-slate-500 mt-0.5">
                                                                {differential} point difference
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-base font-semibold text-primary">
                                                                {team1Total}/{maxPossible}
                                                            </Badge>
                                                            <span className="text-slate-400 text-sm">vs</span>
                                                            <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-base font-semibold text-primary">
                                                                {team2Total}/{maxPossible}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-5 w-5 text-primary" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5 text-primary" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Expanded Content - Judge-by-Judge Breakdown */}
                                                {isExpanded && (
                                                    <div className="border-t border-slate-200 p-6">
                                                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                                            {allJudges.map(judge => {
                                                                const team1JudgeScore = team1Data.judge_scores.find(js => js.judge_id === judge.id)
                                                                const team2JudgeScore = team2Data.judge_scores.find(js => js.judge_id === judge.id)

                                                                const team1Criteria = team1JudgeScore?.criteria_scores.find(cs => cs.criteria_name === criteriaName)
                                                                const team2Criteria = team2JudgeScore?.criteria_scores.find(cs => cs.criteria_name === criteriaName)

                                                                return (
                                                                    <div key={judge.id} className="rounded-[18px] border border-slate-200/70 bg-slate-50/70 p-5 space-y-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/10">
                                                                                <User className="h-5 w-5 text-primary" />
                                                                            </div>
                                                                            <p className="font-semibold text-slate-900 text-base">{judge.name}</p>
                                                                        </div>

                                                                        {/* Team 1 Score */}
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-sm font-medium text-slate-600 truncate mr-2">{team1Data.team_name}</span>
                                                                                <Badge className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
                                                                                    {team1Criteria?.score ?? 0}/{team1Criteria?.max_score ?? 0}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                                                <div
                                                                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                                                                    style={{ width: `${((team1Criteria?.score ?? 0) / (team1Criteria?.max_score || 1)) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                            {team1Criteria?.reflection && (
                                                                                <div className="pt-2 border-t border-slate-200">
                                                                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Reflection</p>
                                                                                    <p className="text-sm text-slate-700 leading-relaxed italic">"{team1Criteria.reflection}"</p>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Divider */}
                                                                        <div className="border-t border-slate-200" />

                                                                        {/* Team 2 Score */}
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-sm font-medium text-slate-600 truncate mr-2">{team2Data.team_name}</span>
                                                                                <Badge className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
                                                                                    {team2Criteria?.score ?? 0}/{team2Criteria?.max_score ?? 0}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                                                <div
                                                                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                                                                    style={{ width: `${((team2Criteria?.score ?? 0) / (team2Criteria?.max_score || 1)) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                            {team2Criteria?.reflection && (
                                                                                <div className="pt-2 border-t border-slate-200">
                                                                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Reflection</p>
                                                                                    <p className="text-sm text-slate-700 leading-relaxed italic">"{team2Criteria.reflection}"</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500">
                            <GitCompare className="h-20 w-20 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg">Select two teams to compare</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 3. Judge Comments Explorer */}
            <Card className="relative overflow-hidden rounded-[28px] border-2 border-primary/25 bg-white/95 shadow-lg">
                <CardHeader className="px-8 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                            <MessageSquare className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-semibold text-slate-900">Judge Comments Explorer</CardTitle>
                            <CardDescription className="text-lg text-slate-600">
                                View all judge feedback and reflections for a specific team
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    <div className="mb-8">
                        <label className="text-lg font-semibold text-slate-700 mb-3 block">Select Team</label>
                        <Select value={selectedTeamForComments} onValueChange={setSelectedTeamForComments}>
                            <SelectTrigger className="w-full h-16 rounded-xl text-lg border-2 border-slate-200 hover:border-primary/30 transition-colors">
                                <SelectValue placeholder="Choose a team to view comments" />
                            </SelectTrigger>
                            <SelectContent>
                                {leaderboard.map(team => (
                                    <SelectItem key={team.team_id} value={team.team_id} className="text-base py-3">
                                        #{team.rank} - {team.team_name} ({team.avg_score.toFixed(1)} pts)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedTeamData ? (
                        <div className="space-y-5">
                            {selectedTeamData.judge_scores.map(judgeScore => (
                                <div key={judgeScore.judge_id} className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                                <Users className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-lg">{judgeScore.judge_name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(judgeScore.submitted_at).toLocaleDateString()} • {Math.floor(judgeScore.time_spent_seconds / 60)} min
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-primary text-white font-bold text-lg px-4 py-2">
                                            {judgeScore.total_score}/100
                                        </Badge>
                                    </div>

                                    <div className="space-y-5">
                                        {judgeScore.criteria_scores.map(criteria => (
                                            <div key={criteria.criteria_id} className="pl-5 border-l-2 border-primary/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-base font-medium text-slate-700">{criteria.criteria_name}</span>
                                                    <span className="text-base font-bold text-slate-900">{criteria.score}/{criteria.max_score}</span>
                                                </div>
                                                {criteria.reflection && (
                                                    <p className="text-base text-slate-600 italic mt-2 leading-relaxed">
                                                        "{criteria.reflection}"
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500">
                            <MessageSquare className="h-20 w-20 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg">Select a team to view judge comments and reflections</p>
                        </div>
                    )}
                </CardContent>
            </Card>


        </div>
    )
}
