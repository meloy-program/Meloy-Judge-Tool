import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { transaction } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';
import * as fs from 'fs';
import * as path from 'path';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const migrationName = event.pathParameters?.migrationName;
    
    if (!migrationName) {
      return errorResponse('Migration name required', 400);
    }

    console.log(`🔧 Running migration: ${migrationName}`);

    // Read migration file
    const migrationPath = path.join(__dirname, '../../../database/migrations', `${migrationName}.sql`);
    
    if (!fs.existsSync(migrationPath)) {
      return errorResponse(`Migration file not found: ${migrationName}.sql`, 404);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await transaction(async (client) => {
      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && s.length > 0);

      console.log(`Executing ${statements.length} SQL statements...`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`Statement ${i + 1}/${statements.length}:`, statement.substring(0, 100) + '...');
        await client.query(statement);
      }

      console.log('✅ Migration completed successfully!');
    });

    return successResponse({
      message: `Migration '${migrationName}' completed successfully`,
      migration: migrationName,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return errorResponse(`Failed to run migration: ${error.message}`, 500, error);
  }
};
