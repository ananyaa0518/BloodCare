import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const useSSL = process.env.DB_SSL === 'true' || (connectionString && connectionString.includes('supabase.co'));

const pool = new Pool(
  connectionString
    ? {
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '10000', 10),
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '5000', 10),
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '5000', 10),
    }
    : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'bloodbank',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '10000', 10),
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '5000', 10),
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '5000', 10),
    }
);

pool.connect()
  .then((client) => {
    console.log('DB Connected successfully');
    client.release();
  })
  .catch((err) => {
    console.error('DB connection error:', err.message);
  });

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database');
});

// Initialize database tables
const initDB = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Blood Bank Staff', 'Hospital Staff', 'Donor')),
      blood_type VARCHAR(10),
      age INT,
      phone VARCHAR(20),
      city VARCHAR(100),
      last_donation_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);

    // Non-destructively add columns if they don't exist yet
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true');

    console.log('Users table initialized successfully');

    const historyQueryText = `
        CREATE TABLE IF NOT EXISTS donation_history (
          id SERIAL PRIMARY KEY,
          donor_id INT REFERENCES users(id) ON DELETE CASCADE,
          donation_date DATE NOT NULL,
          location VARCHAR(150),
          units INT NOT NULL,
          status VARCHAR(50) DEFAULT 'Completed',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
    await pool.query(historyQueryText);
    console.log('Donation History table initialized successfully');

    const inventoryQueryText = `
        CREATE TABLE IF NOT EXISTS inventory (
          id SERIAL PRIMARY KEY,
          blood_group VARCHAR(10) NOT NULL,
          units INT NOT NULL DEFAULT 1,
          collection_date DATE NOT NULL,
          expiry_date DATE NOT NULL,
          status VARCHAR(50) DEFAULT 'Available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
    await pool.query(inventoryQueryText);
    console.log('Inventory table initialized successfully');

    const emergencyQueryText = `
        CREATE TABLE IF NOT EXISTS emergency_requests (
          id SERIAL PRIMARY KEY,
          blood_type VARCHAR(10) NOT NULL,
          units_required INT NOT NULL,
          urgency_level VARCHAR(50) NOT NULL CHECK (urgency_level IN ('Critical', 'High', 'Normal')),
          hospital_name VARCHAR(255) NOT NULL,
          contact VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'Pending',
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
    await pool.query(emergencyQueryText);
    console.log('Emergency requests table initialized successfully');

    const responsesQueryText = `
        CREATE TABLE IF NOT EXISTS request_responses (
          id SERIAL PRIMARY KEY,
          request_id INT REFERENCES emergency_requests(id) ON DELETE CASCADE,
          donor_id INT REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(request_id, donor_id)
        );
        `;
    await pool.query(responsesQueryText);
    console.log('Request responses table initialized successfully');

  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

export { pool, initDB };
