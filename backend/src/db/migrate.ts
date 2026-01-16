import fs from 'fs';
import path from 'path';
import { query } from './connection';
import pool from './connection';

async function migrate() {
  try {
    // Test connection first
    console.log('Testing database connection...');
    await query('SELECT NOW()');
    console.log('✓ Database connection successful');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Running ${statements.length} migration statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          await query(statement);
          console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (error: any) {
          // Ignore "already exists" errors for CREATE TABLE IF NOT EXISTS
          if (error.code === '42P07' || error.message?.includes('already exists')) {
            console.log(`⚠ Statement ${i + 1}/${statements.length} skipped (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✓ Database migration completed successfully');
  } catch (error: any) {
    console.error('✗ Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.message?.includes('password')) {
      console.error('\nHint: Check your DATABASE_URL in .env file');
      console.error('Format: postgresql://username:password@host:port/database');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

