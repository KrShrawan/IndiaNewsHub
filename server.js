const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sanitizeHtml = require('sanitize-html');
const NewsAPI = require('newsapi');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = 3000;

const newspapers = require('./newspapers.json');

console.log('Loading .env from:', path.resolve(__dirname, '.env'));
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[REDACTED]' : 'undefined');
console.log('NEWSAPI_KEY:', process.env.NEWSAPI_KEY ? '[REDACTED]' : 'undefined');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET must be set in .env');
const saltRounds = 10;
const newsapi = new NewsAPI(process.env.NEWSAPI_KEY);
if (!process.env.NEWSAPI_KEY) throw new Error('NEWSAPI_KEY must be set in .env');

// In-memory cache for NewsAPI responses
const headlineCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Request queue for throttling NewsAPI calls
const requestQueue = [];
let isProcessingQueue = false;
const REQUEST_INTERVAL = 1000; // 1 second between requests
const MAX_REQUESTS_PER_MINUTE = 10; // Conservative limit to stay under 50/12hr

const pool = mysql.createPool({
  host: 'localhost',
  user: 'indianewshub',
  password: 'IndiaNews2025',
  database: 'indianewshub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database: indianewshub');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(255) PRIMARY KEY,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255),
        note TEXT NOT NULL,
        date VARCHAR(10) NOT NULL,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        username VARCHAR(255),
        newspaper_id VARCHAR(255),
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
        PRIMARY KEY (username, newspaper_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS preferences (
        username VARCHAR(255) PRIMARY KEY,
        headline_sources TEXT,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255),
        newspaper_id VARCHAR(255),
        visit_date VARCHAR(255) NOT NULL,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS login_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        login_time DATETIME NOT NULL,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS active_sessions (
        token VARCHAR(512) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        expiry BIGINT NOT NULL,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
      )
    `);

    // Clean up expired sessions on startup
    await connection.query('DELETE FROM active_sessions WHERE expiry < ?', [Date.now()]);

    try {
      await connection.query(`CREATE INDEX idx_notes_username ON notes (username)`);
    } catch (indexErr) {
      if (indexErr.code !== 'ER_DUP_KEYNAME') {
        console.error('Error creating idx_notes_username:', indexErr.message);
      }
    }

    try {
      await connection.query(`CREATE INDEX idx_favorites_username ON favorites (username)`);
    } catch (indexErr) {
      if (indexErr.code !== 'ER_DUP_KEYNAME') {
        console.error('Error creating idx_favorites_username:', indexErr.message);
      }
    }

    try {
      await connection.query(`CREATE INDEX idx_visits_username ON visits (username)`);
    } catch (indexErr) {
      if (indexErr.code !== 'ER_DUP_KEYNAME') {
        console.error('Error creating idx_visits_username:', indexErr.message);
      }
    }

    connection.release();
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    process.exit(1);
  }
}

// Throttle NewsAPI requests
async function enqueueNewsAPIRequest(fn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ fn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;

  const { fn, resolve, reject } = requestQueue.shift();
  try {
    const result = await fn();
    resolve(result);
  } catch (error) {
    reject(error);
  }

  setTimeout(() => {
    isProcessingQueue = false;
    processQueue();
  }, REQUEST_INTERVAL);
}

// Preload cache for all newspapers
async function preloadCache() {
  console.log('Preloading cache for top headlines and newspapers...');
  
  // Fetch top headlines
  try {
    const topHeadlines = await enqueueNewsAPIRequest(() =>
      newsapi.v2.topHeadlines({ q: 'news', pageSize: 5 })
    );
    if (topHeadlines.status === 'ok') {
      const headlines = topHeadlines.articles.map(a => ({
        title: a.title || 'No title',
        source: a.source.name || 'Unknown source',
        url: a.url || '#',
        urlToImage: a.urlToImage || null,
        publishedAt: a.publishedAt || null
      }));
      headlineCache.set('top-headlines', {
        data: headlines,
        expiry: Date.now() + CACHE_DURATION
      });
      console.log('Cached top headlines');
    }
  } catch (error) {
    console.error('Error preloading top headlines:', error.message);
  }

  // Fetch headlines for all newspapers with valid sourceId
  const validNewspapers = newspapers.filter(n => n.sourceId);
  const sourceIds = validNewspapers.map(n => n.sourceId).join(',');
  try {
    const response = await enqueueNewsAPIRequest(() =>
      newsapi.v2.everything({ sources: sourceIds, pageSize: 30, sortBy: 'publishedAt' })
    );
    if (response.status === 'ok') {
      validNewspapers.forEach(newspaper => {
        const headlines = response.articles
          .filter(a => a.source.id === newspaper.sourceId)
          .slice(0, 3)
          .map(a => ({
            title: a.title || 'No title',
            url: a.url || '#',
            publishedAt: a.publishedAt || null
          }));
        headlineCache.set(`headlines-${newspaper.id}`, {
          data: headlines,
          expiry: Date.now() + CACHE_DURATION
        });
        console.log(`Cached headlines for ${newspaper.id}`);
      });
    }
  } catch (error) {
    console.error('Error preloading newspaper headlines:', error.message);
  }
}

initializeDatabase().then(() => preloadCache());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token required' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  const { username } = req.user;
  try {
    const [rows] = await pool.query('SELECT is_admin FROM users WHERE username = ?', [username]);
    if (rows.length === 0 || !rows[0].is_admin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Error verifying admin:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.post('/api/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Username (min 3 chars) and password (min 6 chars) are required' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const row = rows[0];
    if (row && await bcrypt.compare(password, row.password)) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30d' });
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      
      // Record login event
      await pool.query(
        'INSERT INTO login_events (username, login_time) VALUES (?, NOW())',
        [username]
      );
      
      // Store active session
      await pool.query(
        'INSERT INTO active_sessions (token, username, expiry) VALUES (?, ?, ?)',
        [token, username, expiry]
      );
      
      res.json({ success: true, message: 'Login successful', username, token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    next(err);
  }
});

app.post('/api/signup', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Username (min 3 chars) and password (min 6 chars) are required' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) return res.status(409).json({ success: false, message: 'Username already exists' });
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query(
      'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
      [username, hashedPassword, username === 'admin' ? 1 : 0]
    );
    res.json({ success: true, message: 'Signup successful. Please login.' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/verify-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token required' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    res.json({ success: true, username: decoded.username });
  });
});

app.post('/api/logout', verifyToken, async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  try {
    await pool.query('DELETE FROM active_sessions WHERE token = ?', [token]);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

app.get('/api/notes', verifyToken, async (req, res, next) => {
  const { username } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.query(
      'SELECT id, note, date FROM notes WHERE username = ? ORDER BY date DESC LIMIT ? OFFSET ?',
      [username, parseInt(limit), parseInt(offset)]
    );
    const [[countRow]] = await pool.query('SELECT COUNT(*) as total FROM notes WHERE username = ?', [username]);
    res.json({
      success: true,
      notes: rows || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countRow.total
      }
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/notes', verifyToken, async (req, res, next) => {
  const { note } = req.body;
  const { username } = req.user;
  if (!note) return res.status(400).json({ success: false, message: 'Note is required' });
  const sanitizedNote = sanitizeHtml(note, { allowedTags: [], allowedAttributes: {} });
  const date = new Date().toISOString().split('T')[0];
  try {
    const [result] = await pool.query(
      'INSERT INTO notes (username, note, date) VALUES (?, ?, ?)',
      [username, sanitizedNote, date]
    );
    res.json({ success: true, message: 'Note saved', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

app.put('/api/notes/:id', verifyToken, async (req, res, next) => {
  const { note } = req.body;
  const { id } = req.params;
  const { username } = req.user;
  if (!note) return res.status(400).json({ success: false, message: 'Note is required' });
  const sanitizedNote = sanitizeHtml(note, { allowedTags: [], allowedAttributes: {} });
  try {
    const [result] = await pool.query(
      'UPDATE notes SET note = ? WHERE id = ? AND username = ?',
      [sanitizedNote, id, username]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    res.json({ success: true, message: 'Note updated' });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/notes/:id', verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const { username } = req.user;
  try {
    const [result] = await pool.query(
      'DELETE FROM notes WHERE id = ? AND username = ?',
      [id, username]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
});

app.get('/api/favorites', verifyToken, async (req, res, next) => {
  const { username } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.query(
      'SELECT newspaper_id FROM favorites WHERE username = ? LIMIT ? OFFSET ?',
      [username, parseInt(limit), parseInt(offset)]
    );
    const [[countRow]] = await pool.query('SELECT COUNT(*) as total FROM favorites WHERE username = ?', [username]);
    res.json({
      success: true,
      favorites: rows.map(row => row.newspaper_id),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countRow.total
      }
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/favorites', verifyToken, async (req, res, next) => {
  const { newspaper_id } = req.body;
  const { username } = req.user;
  if (!newspaper_id) return res.status(400).json({ success: false, message: 'Newspaper ID is required' });
  try {
    await pool.query(
      'INSERT IGNORE INTO favorites (username, newspaper_id) VALUES (?, ?)',
      [username, newspaper_id]
    );
    res.json({ success: true, message: 'Newspaper added to favorites' });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/favorites/:newspaper_id', verifyToken, async (req, res, next) => {
  const { newspaper_id } = req.params;
  const { username } = req.user;
  try {
    const [result] = await pool.query(
      'DELETE FROM favorites WHERE username = ? AND newspaper_id = ?',
      [username, newspaper_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Favorite not found' });
    res.json({ success: true, message: 'Newspaper removed from favorites' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/visits', verifyToken, async (req, res, next) => {
  const { newspaper_id } = req.body;
  const { username } = req.user;
  if (!newspaper_id) return res.status(400).json({ success: false, message: 'Newspaper ID is required' });
  const visit_date = new Date().toISOString();
  try {
    await pool.query(
      'INSERT INTO visits (username, newspaper_id, visit_date) VALUES (?, ?, ?)',
      [username, newspaper_id, visit_date]
    );
    res.json({ success: true, message: 'Visit recorded' });
  } catch (err) {
    next(err);
  }
});

app.get('/api/visits', verifyToken, async (req, res, next) => {
  const { username } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.query(
      'SELECT newspaper_id, visit_date FROM visits WHERE username = ? ORDER BY visit_date DESC LIMIT ? OFFSET ?',
      [username, parseInt(limit), parseInt(offset)]
    );
    const [[countRow]] = await pool.query('SELECT COUNT(*) as total FROM visits WHERE username = ?', [username]);
    res.json({
      success: true,
      visits: rows || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countRow.total
      }
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/preferences', verifyToken, async (req, res, next) => {
  const { headline_sources } = req.body;
  const { username } = req.user;
  if (!Array.isArray(headline_sources)) return res.status(400).json({ success: false, message: 'Headline sources must be an array' });
  const sources = JSON.stringify(headline_sources);
  try {
    await pool.query(
      'INSERT INTO preferences (username, headline_sources) VALUES (?, ?) ON DUPLICATE KEY UPDATE headline_sources = ?',
      [username, sources, sources]
    );
    res.json({ success: true, message: 'Preferences updated' });
  } catch (err) {
    next(err);
  }
});

app.get('/api/preferences', verifyToken, async (req, res, next) => {
  const { username } = req.user;
  try {
    const [rows] = await pool.query('SELECT headline_sources FROM preferences WHERE username = ?', [username]);
    const row = rows[0];
    res.json({
      success: true,
      headline_sources: row ? JSON.parse(row.headline_sources) : []
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/newspapers', (req, res) => {
  const enhancedNewspapers = newspapers.map(n => ({
    ...n,
    id: n.id || n.name.replace(/\s+/g, '-').toLowerCase()
  }));
  res.json(enhancedNewspapers);
});

app.get('/api/headlines', async (req, res, next) => {
  const cacheKey = 'top-headlines';
  const cached = headlineCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log('Serving top headlines from cache');
    return res.json({ success: true, headlines: cached.data });
  }

  try {
    console.log('Fetching headlines from NewsAPI with query: { q: "news" }');
    const response = await enqueueNewsAPIRequest(() =>
      newsapi.v2.topHeadlines({ q: 'news', pageSize: 5 })
    );
    console.log('Full NewsAPI response:', JSON.stringify(response, null, 2));
    if (response.status !== 'ok') throw new Error(`NewsAPI response not OK: ${response.status}`);
    
    const headlines = response.articles.map(a => ({
      title: a.title || 'No title',
      source: a.source.name || 'Unknown source',
      url: a.url || '#',
      urlToImage: a.urlToImage || null,
      publishedAt: a.publishedAt || null
    }));
    console.log('Headlines fetched:', headlines);

    // Cache the response
    headlineCache.set(cacheKey, {
      data: headlines,
      expiry: Date.now() + CACHE_DURATION
    });

    if (headlines.length === 0) {
      console.warn('No articles returned from NewsAPI. Using mock data instead.');
      const mockHeadlines = [
        { title: 'Breaking: Major Event in India', source: 'Example News', url: '#', urlToImage: 'https://via.placeholder.com/150', publishedAt: '2025-04-07' },
        { title: 'Weather Update: Rain Expected', source: 'Weather Today', url: '#', urlToImage: 'https://via.placeholder.com/150', publishedAt: '2025-04-07' },
        { title: 'Tech Breakthrough Announced', source: 'Tech Times', url: '#', urlToImage: 'https://via.placeholder.com/150', publishedAt: '2025-04-07' },
      ];
      return res.json({ success: true, headlines: mockHeadlines });
    }
    res.json({ success: true, headlines });
  } catch (error) {
    console.error('NewsAPI error:', error.message);
    const mockHeadlines = [
      { title: 'Breaking: Major Event in India', source: 'Example News', url: '#', urlToImage: 'https://via.placeholder.com/150', publishedAt: '2025-04-07' },
      { title: 'Weather Update: Rain Expected', source: 'Weather Today', url: '#', urlToImage: 'https://via.placeholder.com/150', publishedAt: '2025-04-07' },
      { title: 'Tech Breakthrough Announced', source: 'Tech Times', url: '#', urlToImage: 'https://via.placeholder.com/150', publishedAt: '2025-04-07' },
    ];
    res.json({ success: true, headlines: mockHeadlines });
  }
});

app.get('/api/newspaper-headlines/:newspaperId', async (req, res, next) => {
  const { newspaperId } = req.params;
  const cacheKey = `headlines-${newspaperId}`;
  const cached = headlineCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log(`Serving headlines for ${newspaperId} from cache`);
    return res.json({ success: true, headlines: cached.data });
  }

  try {
    const newspaper = newspapers.find(n => n.id === newspaperId);
    if (!newspaper) {
      return res.status(404).json({ success: false, message: 'Newspaper not found' });
    }
    const sourceId = newspaper.sourceId;
    if (!sourceId) {
      console.log(`No valid sourceId for ${newspaperId}. Using fallback headlines.`);
      return res.json({
        success: true,
        headlines: [
          { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' },
          { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' },
          { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' }
        ]
      });
    }
    const response = await enqueueNewsAPIRequest(() =>
      newsapi.v2.everything({ sources: sourceId, pageSize: 3, sortBy: 'publishedAt' })
    );
    console.log(`NewsAPI response for ${sourceId}:`, JSON.stringify(response, null, 2));
    if (response.status !== 'ok') throw new Error(`NewsAPI response not OK: ${response.status}`);
    
    const headlines = response.articles.map(a => ({
      title: a.title || 'No title',
      url: a.url || '#',
      publishedAt: a.publishedAt || null
    }));

    // Cache the response
    headlineCache.set(cacheKey, {
      data: headlines,
      expiry: Date.now() + CACHE_DURATION
    });

    if (headlines.length === 0) {
      console.warn(`No headlines for ${sourceId}. Using fallback.`);
      return res.json({
        success: true,
        headlines: [
          { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' },
          { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' },
          { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' }
        ]
      });
    }
    res.json({ success: true, headlines });
  } catch (error) {
    console.error(`Error fetching headlines for ${newspaperId}:`, error.message);
    res.json({
      success: true,
      headlines: [
        { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' },
        { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' },
        { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' }
      ]
    });
  }
});

app.get('/api/active-users', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    // Remove expired sessions
    await pool.query('DELETE FROM active_sessions WHERE expiry < ?', [Date.now()]);
    const [rows] = await pool.query(
      'SELECT username, expiry FROM active_sessions ORDER BY expiry DESC'
    );
    res.json({
      success: true,
      activeUsers: rows.map(row => ({
        username: row.username,
        expiresAt: new Date(row.expiry).toISOString()
      }))
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/login-history', verifyToken, verifyAdmin, async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.query(
      'SELECT username, login_time FROM login_events ORDER BY login_time DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    const [[countRow]] = await pool.query('SELECT COUNT(*) as total FROM login_events');
    res.json({
      success: true,
      loginHistory: rows.map(row => ({
        username: row.username,
        loginTime: row.login_time
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countRow.total
      }
    });
  } catch (err) {
    next(err);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  try {
    await pool.end();
    console.log('MySQL connection pool closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MySQL pool:', err.message);
    process.exit(1);
  }
});