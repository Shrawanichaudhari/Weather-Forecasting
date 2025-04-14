const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based API
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'weather',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create weather_data table if not exists
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS weather_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                city VARCHAR(100) NOT NULL,
                temperature DECIMAL(5,2) NOT NULL,
                humidity INT NOT NULL,
                wind_speed DECIMAL(5,2) NOT NULL,
                conditions VARCHAR(100) NOT NULL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        connection.release();
        console.log('Database initialized');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}
initializeDatabase();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Weather Data Endpoints
app.post('/api/weather', async (req, res) => {
    try {
        const { city, temperature, humidity, wind_speed, conditions } = req.body;
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO weather_data (city, temperature, humidity, wind_speed, conditions) VALUES (?, ?, ?, ?, ?)',
            [city, temperature, humidity, wind_speed, conditions]
        );
        connection.release();
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('Error storing weather data:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/weather/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM weather_data WHERE city = ? ORDER BY recorded_at DESC LIMIT 1',
            [city]
        );
        connection.release();
        res.json(rows[0] || {});
    } catch (err) {
        console.error('Error fetching current weather:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/weather/:city/history', async (req, res) => {
    try {
        const { city } = req.params;
        const { days = 7 } = req.query;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM weather_data WHERE city = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY recorded_at DESC',
            [city, days]
        );
        connection.release();
        res.json(rows);
    } catch (err) {
        console.error('Error fetching historical weather:', err);
        res.status(500).json({ error: err.message });
    }
});

// Existing login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM signup WHERE user_name = ? AND password = ?',
            [username, password]
        );
        connection.release();
        
        if (rows.length > 0) {
            res.redirect('/madurai.html');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
