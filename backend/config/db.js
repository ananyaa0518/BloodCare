import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bloodbank',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
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

  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

export { pool, initDB };
