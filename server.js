const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from root directory

// TiDB Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to TiDB');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error connecting to TiDB:', err.message);
    });

// ==================== Root Route ====================

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static assets explicitly
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/app.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.js'));
});

app.get('/favicon.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.png'));
});

app.get('/brick.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'brick.jpg'));
});

app.get('/brickindustry.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'brickindustry.jpg'));
});

// ==================== Authentication Routes ====================

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { userid, password } = req.body;
        const [rows] = await pool.query(
            'SELECT userid FROM users WHERE userid = ? AND password = ?',
            [userid, password]
        );

        if (rows.length > 0) {
            res.json({ success: true, user: { userid: rows[0].userid } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== Worker Routes ====================

// Get all workers
app.get('/api/workers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM worker ORDER BY worker_id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Get workers error:', error);
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
});

// Add worker
app.post('/api/workers', async (req, res) => {
    try {
        const { f_name, l_name, age, gender, dept, salary } = req.body;
        const w_name = `${f_name} ${l_name}`;

        const [result] = await pool.query(
            'INSERT INTO worker (f_name, l_name, w_name, age, gender, dept, salary) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [f_name, l_name, w_name, age, gender, dept, salary]
        );

        const [newWorker] = await pool.query('SELECT * FROM worker WHERE worker_id = ?', [result.insertId]);
        res.json(newWorker[0]);
    } catch (error) {
        console.error('Add worker error:', error);
        res.status(500).json({ error: 'Failed to add worker' });
    }
});

// Update worker
app.put('/api/workers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { f_name, l_name, age, gender, dept, salary } = req.body;
        const w_name = `${f_name} ${l_name}`;

        await pool.query(
            'UPDATE worker SET f_name = ?, l_name = ?, w_name = ?, age = ?, gender = ?, dept = ?, salary = ? WHERE worker_id = ?',
            [f_name, l_name, w_name, age, gender, dept, salary, id]
        );

        const [updated] = await pool.query('SELECT * FROM worker WHERE worker_id = ?', [id]);
        res.json(updated[0]);
    } catch (error) {
        console.error('Update worker error:', error);
        res.status(500).json({ error: 'Failed to update worker' });
    }
});

// Delete worker
app.delete('/api/workers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM worker WHERE worker_id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete worker error:', error);
        res.status(500).json({ error: 'Failed to delete worker' });
    }
});

// ==================== Production Routes ====================

// Get all production records
app.get('/api/production', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM production ORDER BY p_date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Get production error:', error);
        res.status(500).json({ error: 'Failed to fetch production records' });
    }
});

// Add production record
app.post('/api/production', async (req, res) => {
    try {
        const { p_date, brick_id, quantity } = req.body;

        // Get brick type
        const [brick] = await pool.query('SELECT brick_type FROM brick WHERE brick_id = ?', [brick_id]);
        const brick_type = brick[0]?.brick_type || '';

        await pool.query(
            'INSERT INTO production (p_date, brick_id, quantity, brick_type) VALUES (?, ?, ?, ?)',
            [p_date, brick_id, quantity, brick_type]
        );

        res.json({ p_date, brick_id, quantity, brick_type });
    } catch (error) {
        console.error('Add production error:', error);
        res.status(500).json({ error: 'Failed to add production record' });
    }
});

// Delete production record
app.delete('/api/production/:date/:brickId', async (req, res) => {
    try {
        const { date, brickId } = req.params;
        await pool.query('DELETE FROM production WHERE p_date = ? AND brick_id = ?', [date, brickId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete production error:', error);
        res.status(500).json({ error: 'Failed to delete production record' });
    }
});

// ==================== Purchase Routes ====================

// Get all purchases
app.get('/api/purchases', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM purchase ORDER BY invoice DESC');
        res.json(rows);
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ error: 'Failed to fetch purchases' });
    }
});

// Add purchase
app.post('/api/purchases', async (req, res) => {
    try {
        const { p_date, brick_id, p_name, quantity } = req.body;

        // Get brick rate and calculate total cost
        const [brick] = await pool.query('SELECT rate_per_1000 FROM brick WHERE brick_id = ?', [brick_id]);
        const total_cost = brick[0].rate_per_1000 * parseInt(quantity);

        const [result] = await pool.query(
            'INSERT INTO purchase (p_date, brick_id, p_name, quantity, total_cost) VALUES (?, ?, ?, ?, ?)',
            [p_date, brick_id, p_name, quantity, total_cost]
        );

        const [newPurchase] = await pool.query('SELECT * FROM purchase WHERE invoice = ?', [result.insertId]);
        res.json(newPurchase[0]);
    } catch (error) {
        console.error('Add purchase error:', error);
        res.status(500).json({ error: 'Failed to add purchase' });
    }
});

// Delete purchase
app.delete('/api/purchases/:invoice', async (req, res) => {
    try {
        const { invoice } = req.params;
        await pool.query('DELETE FROM purchase WHERE invoice = ?', [invoice]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete purchase error:', error);
        res.status(500).json({ error: 'Failed to delete purchase' });
    }
});

// ==================== Supply Routes ====================

// Get all supplies
app.get('/api/supplies', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM supplies ORDER BY s_date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Get supplies error:', error);
        res.status(500).json({ error: 'Failed to fetch supplies' });
    }
});

// Add supply
app.post('/api/supplies', async (req, res) => {
    try {
        const { invoice, location, vehicle_no, s_date } = req.body;

        await pool.query(
            'INSERT INTO supplies (invoice, location, vehicle_no, s_date) VALUES (?, ?, ?, ?)',
            [invoice, location, vehicle_no, s_date]
        );

        res.json({ invoice, location, vehicle_no, s_date });
    } catch (error) {
        console.error('Add supply error:', error);
        res.status(500).json({ error: 'Failed to add supply' });
    }
});

// Delete supply
app.delete('/api/supplies/:invoice', async (req, res) => {
    try {
        const { invoice } = req.params;
        await pool.query('DELETE FROM supplies WHERE invoice = ?', [invoice]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete supply error:', error);
        res.status(500).json({ error: 'Failed to delete supply' });
    }
});

// ==================== Account Routes ====================

// Get all accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM account ORDER BY s_no ASC');
        res.json(rows);
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

// Add account transaction
app.post('/api/accounts', async (req, res) => {
    try {
        const { a_date, description, credit, debit } = req.body;

        // Get previous balance
        const [lastAccount] = await pool.query('SELECT balance FROM account ORDER BY s_no DESC LIMIT 1');
        const previousBalance = lastAccount.length > 0 ? lastAccount[0].balance : 0;
        const balance = previousBalance + (parseInt(credit) || 0) - (parseInt(debit) || 0);

        const [result] = await pool.query(
            'INSERT INTO account (a_date, description, credit, debit, balance) VALUES (?, ?, ?, ?, ?)',
            [a_date, description, credit || 0, debit || 0, balance]
        );

        const [newAccount] = await pool.query('SELECT * FROM account WHERE s_no = ?', [result.insertId]);
        res.json(newAccount[0]);
    } catch (error) {
        console.error('Add account error:', error);
        res.status(500).json({ error: 'Failed to add account transaction' });
    }
});

// Delete account transaction
app.delete('/api/accounts/:sno', async (req, res) => {
    try {
        const { sno } = req.params;
        await pool.query('DELETE FROM account WHERE s_no = ?', [sno]);

        // Recalculate all balances
        const [accounts] = await pool.query('SELECT * FROM account ORDER BY s_no ASC');
        let balance = 0;

        for (const account of accounts) {
            balance += (account.credit || 0) - (account.debit || 0);
            await pool.query('UPDATE account SET balance = ? WHERE s_no = ?', [balance, account.s_no]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account transaction' });
    }
});

// ==================== Utility Routes ====================

// Get brick types
app.get('/api/brick-types', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM brick ORDER BY brick_id');
        res.json(rows);
    } catch (error) {
        console.error('Get brick types error:', error);
        res.status(500).json({ error: 'Failed to fetch brick types' });
    }
});

// Get departments
app.get('/api/departments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM department ORDER BY dept_id');
        res.json(rows);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
