import pkg from 'pg';
const { Client } = pkg;

const u1 = 'postgresql://postgres.felngskwecnnywipzgha:bloodbank307456@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';
const u2 = 'postgresql://postgres.felngskwecnnywipzgha:bloodbank307456@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

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

async function run() {
  await test(u1);
  await test(u2);
}
run();
