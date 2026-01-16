import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please create a .env file with: DATABASE_URL=postgresql://user:password@localhost:5432/qrmenu');
  process.exit(1);
}

// Validate DATABASE_URL format
try {
  const url = new URL(process.env.DATABASE_URL);
  if (!url.protocol.startsWith('postgres')) {
    throw new Error('Invalid protocol. Must be postgresql:// or postgres://');
  }
} catch (error: any) {
  console.error('ERROR: Invalid DATABASE_URL format!');
  console.error('Expected format: postgresql://user:password@host:port/database');
  console.error('Current value:', process.env.DATABASE_URL ? '***' : '(not set)');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', error);
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  return client;
};

export default pool;

