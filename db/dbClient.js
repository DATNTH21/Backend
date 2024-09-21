const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.DB,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

client.connect()
    .then(() => console.log('connected'))
    .catch(err => console.error('connection error', err.stack));

async function createTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS test_embedding (
            id SERIAL PRIMARY KEY,
            content TEXT,
            embedding VECTOR(768)
        );
    `;

    try {
        await client.query(createTableQuery);
        console.log('Table created or already exists.');
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

module.exports = {
    client,
    createTable,
};
