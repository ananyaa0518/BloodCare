import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('Connected locally');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log(res.rows);
    client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    client.end();
  });
