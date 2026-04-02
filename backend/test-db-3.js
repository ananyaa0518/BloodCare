import pkg from 'pg';
const { Client } = pkg;

const u3 = 'postgresql://postgres:bloodbank307456@db.felngskwecnnywipzgha.supabase.co:5432/postgres';

async function test(url) {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  console.log(`Connecting to: ${url}`);
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Success:', res.rows[0]);
  } catch (err) {
    console.error(`Failed ${url}:`, err.message);
  } finally {
    await client.end();
  }
}
test(u3);
