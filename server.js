

// const express = require('express');
// const sqlite3 = require('sqlite3').verbose();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const sanitizeHtml = require('sanitize-html');
// const NewsAPI = require('newsapi'); // Correct import
// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// console.log('Loading .env from:', path.resolve(__dirname, '.env'));
// console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[REDACTED]' : 'undefined');
// console.log('NEWSAPI_KEY:', process.env.NEWSAPI_KEY ? '[REDACTED]' : 'undefined');

// const app = express();
// const port = 3000;

// const newspapers = require('./newspapers.json');

// const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) throw new Error('JWT_SECRET must be set in .env');
// const saltRounds = 10;
// const newsapi = new NewsAPI(process.env.NEWSAPI_KEY); // Correct instantiation
// if (!process.env.NEWSAPI_KEY) throw new Error('NEWSAPI_KEY must be set in .env');

// app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'
// app.use(express.json());

// // SQLite Database Setup
// const db = new sqlite3.Database('./newsmania.db', (err) => {
//   if (err) {
//     console.error('Error opening database:', err.message);
//   } else {
//     console.log('Connected to SQLite database: newsmania.db');
//     db.run(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT NOT NULL)`, (err) => {
//       if (err) console.error('Error creating users table:', err.message);
//     });
//     db.run(`CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, note TEXT NOT NULL, date TEXT NOT NULL, FOREIGN KEY (username) REFERENCES users(username))`, (err) => {
//       if (err) console.error('Error creating notes table:', err.message);
//     });
//     db.run(`CREATE TABLE IF NOT EXISTS favorites (username TEXT, newspaper_id TEXT, FOREIGN KEY (username) REFERENCES users(username), PRIMARY KEY (username, newspaper_id))`, (err) => {
//       if (err) console.error('Error creating favorites table:', err.message);
//     });
//     db.run(`CREATE TABLE IF NOT EXISTS preferences (username TEXT PRIMARY KEY, headline_sources TEXT, FOREIGN KEY (username) REFERENCES users(username))`, (err) => {
//       if (err) console.error('Error creating preferences table:', err.message);
//     });
//     db.run(`CREATE INDEX IF NOT EXISTS idx_notes_username ON notes (username)`);
//     db.run(`CREATE INDEX IF NOT EXISTS idx_favorites_username ON favorites (username)`);
//   }
// });

// // Middleware
// const verifyToken = (req, res, next) => {
//   const token = req.headers['authorization']?.split(' ')[1];
//   if (!token) return res.status(401).json({ success: false, message: 'Token required' });
//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//     req.user = decoded;
//     next();
//   });
// };

// // Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ success: false, error: 'Internal server error' });
// });

// // Authentication Endpoints
// app.post('/api/login', async (req, res, next) => {
//   const { username, password } = req.body;
//   if (!username || !password || username.length < 3 || password.length < 6) {
//     return res.status(400).json({ success: false, message: 'Username (min 3 chars) and password (min 6 chars) are required' });
//   }

//   try {
//     db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
//       if (err) return next(err);
//       if (row && await bcrypt.compare(password, row.password)) {
//         const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30d' });
//         res.json({ success: true, message: 'Login successful', username, token });
//       } else {
//         res.status(401).json({ success: false, message: 'Invalid username or password' });
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// app.post('/api/signup', async (req, res, next) => {
//   const { username, password } = req.body;
//   if (!username || !password || username.length < 3 || password.length < 6) {
//     return res.status(400).json({ success: false, message: 'Username (min 3 chars) and password (min 6 chars) are required' });
//   }

//   try {
//     db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
//       if (err) return next(err);
//       if (row) return res.status(409).json({ success: false, message: 'Username already exists' });

//       const hashedPassword = await bcrypt.hash(password, saltRounds);
//       db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
//         if (err) return next(err);
//         res.json({ success: true, message: 'Signup successful. Please login.' });
//       });
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// app.post('/api/verify-token', (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ success: false, message: 'Token required' });

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//     res.json({ success: true, username: decoded.username });
//   });
// });

// // Notes Endpoints with Pagination
// app.get('/api/notes', verifyToken, (req, res, next) => {
//   const { username } = req.user;
//   const { page = 1, limit = 10 } = req.query;
//   const offset = (page - 1) * limit;

//   db.all('SELECT id, note, date FROM notes WHERE username = ? ORDER BY date DESC LIMIT ? OFFSET ?', 
//     [username, parseInt(limit), parseInt(offset)], (err, rows) => {
//       if (err) return next(err);
//       db.get('SELECT COUNT(*) as total FROM notes WHERE username = ?', [username], (err, countRow) => {
//         if (err) return next(err);
//         res.json({ 
//           success: true, 
//           notes: rows || [], 
//           pagination: { 
//             page: parseInt(page), 
//             limit: parseInt(limit), 
//             total: countRow.total 
//           }
//         });
//       });
//   });
// });

// app.post('/api/notes', verifyToken, (req, res, next) => {
//   const { note } = req.body;
//   const { username } = req.user;
//   if (!note) return res.status(400).json({ success: false, message: 'Note is required' });

//   const sanitizedNote = sanitizeHtml(note, { allowedTags: [], allowedAttributes: {} });
//   const date = new Date().toISOString().split('T')[0];
//   db.run('INSERT INTO notes (username, note, date) VALUES (?, ?, ?)', [username, sanitizedNote, date], function(err) {
//     if (err) return next(err);
//     res.json({ success: true, message: 'Note saved', id: this.lastID });
//   });
// });

// app.put('/api/notes/:id', verifyToken, (req, res, next) => {
//   const { note } = req.body;
//   const { id } = req.params;
//   const { username } = req.user;
//   if (!note) return res.status(400).json({ success: false, message: 'Note is required' });

//   const sanitizedNote = sanitizeHtml(note, { allowedTags: [], allowedAttributes: {} });
//   db.run('UPDATE notes SET note = ? WHERE id = ? AND username = ?', [sanitizedNote, id, username], function(err) {
//     if (err) return next(err);
//     if (this.changes === 0) return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
//     res.json({ success: true, message: 'Note updated' });
//   });
// });

// app.delete('/api/notes/:id', verifyToken, (req, res, next) => {
//   const { id } = req.params;
//   const { username } = req.user;
//   db.run('DELETE FROM notes WHERE id = ? AND username = ?', [id, username], function(err) {
//     if (err) return next(err);
//     if (this.changes === 0) return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
//     res.json({ success: true, message: 'Note deleted' });
//   });
// });

// // Favorites Endpoints with Pagination
// app.get('/api/favorites', verifyToken, (req, res, next) => {
//   const { username } = req.user;
//   const { page = 1, limit = 10 } = req.query;
//   const offset = (page - 1) * limit;

//   db.all('SELECT newspaper_id FROM favorites WHERE username = ? LIMIT ? OFFSET ?', 
//     [username, parseInt(limit), parseInt(offset)], (err, rows) => {
//       if (err) return next(err);
//       db.get('SELECT COUNT(*) as total FROM favorites WHERE username = ?', [username], (err, countRow) => {
//         if (err) return next(err);
//         res.json({ 
//           success: true, 
//           favorites: rows.map(row => row.newspaper_id), 
//           pagination: { 
//             page: parseInt(page), 
//             limit: parseInt(limit), 
//             total: countRow.total 
//           }
//         });
//       });
//   });
// });

// app.post('/api/favorites', verifyToken, (req, res, next) => {
//   const { newspaper_id } = req.body;
//   const { username } = req.user;
//   if (!newspaper_id) return res.status(400).json({ success: false, message: 'Newspaper ID is required' });

//   db.run('INSERT OR IGNORE INTO favorites (username, newspaper_id) VALUES (?, ?)', [username, newspaper_id], (err) => {
//     if (err) return next(err);
//     res.json({ success: true, message: 'Newspaper added to favorites' });
//   });
// });

// app.delete('/api/favorites/:newspaper_id', verifyToken, (req, res, next) => {
//   const { newspaper_id } = req.params;
//   const { username } = req.user;
//   db.run('DELETE FROM favorites WHERE username = ? AND newspaper_id = ?', [username, newspaper_id], function(err) {
//     if (err) return next(err);
//     if (this.changes === 0) return res.status(404).json({ success: false, message: 'Favorite not found' });
//     res.json({ success: true, message: 'Newspaper removed from favorites' });
//   });
// });

// // User Preferences for Headlines
// app.post('/api/preferences', verifyToken, (req, res, next) => {
//   const { headline_sources } = req.body;
//   const { username } = req.user;
//   if (!Array.isArray(headline_sources)) return res.status(400).json({ success: false, message: 'Headline sources must be an array' });

//   const sources = JSON.stringify(headline_sources);
//   db.run('INSERT OR REPLACE INTO preferences (username, headline_sources) VALUES (?, ?)', [username, sources], (err) => {
//     if (err) return next(err);
//     res.json({ success: true, message: 'Preferences updated' });
//   });
// });

// app.get('/api/preferences', verifyToken, (req, res, next) => {
//   const { username } = req.user;
//   db.get('SELECT headline_sources FROM preferences WHERE username = ?', [username], (err, row) => {
//     if (err) return next(err);
//     res.json({ 
//       success: true, 
//       headline_sources: row ? JSON.parse(row.headline_sources) : [] 
//     });
//   });
// });

// // Newspapers Endpoint
// app.get('/api/newspapers', (req, res) => {
//   const enhancedNewspapers = newspapers.map(n => ({
//     ...n,
//     id: n.id || n.name.replace(/\s+/g, '-').toLowerCase()
//   }));
//   res.json(enhancedNewspapers);
// });

// // RSS Feed Endpoint
// app.get('/api/rss/:newspaper_id', async (req, res, next) => {
//   const { newspaper_id } = req.params;
//   const newspaper = newspapers.find(n => (n.id || n.name.replace(/\s+/g, '-').toLowerCase()) === newspaper_id);
//   if (!newspaper || !newspaper.rss) {
//     return res.status(404).json({ success: false, message: 'RSS feed not available for this newspaper' });
//   }

//   const fetch = (await import('node-fetch')).default;
//   const xml2js = require('xml2js');
//   try {
//     const response = await fetch(newspaper.rss);
//     if (!response.ok) throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
//     const xml = await response.text();
//     xml2js.parseString(xml, (err, result) => {
//       if (err) throw err;
//       const items = (result.rss?.channel[0]?.item || []).slice(0, 5).map(item => ({
//         title: item.title?.[0] || 'No title',
//         link: item.link?.[0] || '#',
//         pubDate: item.pubDate?.[0] || null,
//       }));
//       res.json({ success: true, articles: items });
//     });
//   } catch (error) {
//     console.error('RSS fetch error:', error.message);
//     next(error);
//   }
// });

// // News Headlines with Preferences and Fallback
// app.get('/api/headlines', async (req, res, next) => {
//   const { username } = req.user || {};
//   let preferredSources = [];

//   if (username) {
//     await new Promise((resolve) => {
//       db.get('SELECT headline_sources FROM preferences WHERE username = ?', [username], (err, row) => {
//         if (!err && row) preferredSources = JSON.parse(row.headline_sources);
//         resolve();
//       });
//     });
//   }

//   try {
//     const sources = preferredSources.length ? preferredSources.join(',') : 'the-times-of-india,the-hindu';
//     const response = await newsapi.v2.topHeadlines({
//       country: 'in',
//       sources,
//       pageSize: 5,
//     });
//     if (response.status !== 'ok') throw new Error('NewsAPI response not OK');
//     const headlines = response.articles.map(a => ({
//       title: a.title,
//       source: a.source.name,
//       url: a.url
//     }));
//     res.json({ success: true, headlines });
//   } catch (error) {
//     console.error('NewsAPI error:', error.message);
//     const mockHeadlines = [
//       { title: 'Breaking: Major Event in India', source: 'Example News', url: '#' },
//       { title: 'Weather Update: Rain Expected', source: 'Weather Today', url: '#' },
//       { title: 'Tech Breakthrough Announced', source: 'Tech Times', url: '#' },
//     ];
//     res.json({ success: true, headlines: mockHeadlines, message: 'Using fallback data due to API error' });
//   }
// });

// // Start Server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

// // Graceful Shutdown
// process.on('SIGINT', () => {
//   db.close((err) => {
//     if (err) console.error('Error closing database:', err.message);
//     console.log('Database closed.');
//     process.exit(0);
//   });
// });

// app.get('/api/headlines', async (req, res, next) => {
//   const { username } = req.user || {};
//   let preferredSources = [];

//   if (username) {
//     await new Promise((resolve) => {
//       db.get('SELECT headline_sources FROM preferences WHERE username = ?', [username], (err, row) => {
//         if (!err && row) preferredSources = JSON.parse(row.headline_sources);
//         resolve();
//       });
//     });
//   }

//   try {
//     const sources = preferredSources.length ? preferredSources.join(',') : 'the-times-of-india,the-hindu';
//     console.log('Fetching headlines from NewsAPI with sources:', sources);
//     const response = await newsapi.v2.topHeadlines({
//       country: 'in',
//       sources,
//       pageSize: 5,
//     });
//     if (response.status !== 'ok') throw new Error('NewsAPI response not OK');
//     const headlines = response.articles.map(a => ({
//       title: a.title,
//       source: a.source.name,
//       url: a.url
//     }));
//     res.json({ success: true, headlines });
//   } catch (error) {
//     console.error('NewsAPI error:', error.message);
//     const mockHeadlines = [
//       { title: 'Breaking: Major Event in India', source: 'Example News', url: '#' },
//       { title: 'Weather Update: Rain Expected', source: 'Weather Today', url: '#' },
//       { title: 'Tech Breakthrough Announced', source: 'Tech Times', url: '#' },
//     ];
//     res.json({ success: true, headlines: mockHeadlines, message: 'Using fallback data due to API error' });
//   }
// });

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// SQLite Database Setup
const db = new sqlite3.Database('./newsmania.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database: newsmania.db');
    db.run(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT NOT NULL)`, (err) => {
      if (err) console.error('Error creating users table:', err.message);
    });
    db.run(`CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, note TEXT NOT NULL, date TEXT NOT NULL, FOREIGN KEY (username) REFERENCES users(username))`, (err) => {
      if (err) console.error('Error creating notes table:', err.message);
    });
    db.run(`CREATE TABLE IF NOT EXISTS favorites (username TEXT, newspaper_id TEXT, FOREIGN KEY (username) REFERENCES users(username), PRIMARY KEY (username, newspaper_id))`, (err) => {
      if (err) console.error('Error creating favorites table:', err.message);
    });
    db.run(`CREATE TABLE IF NOT EXISTS preferences (username TEXT PRIMARY KEY, headline_sources TEXT, FOREIGN KEY (username) REFERENCES users(username))`, (err) => {
      if (err) console.error('Error creating preferences table:', err.message);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_notes_username ON notes (username)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_favorites_username ON favorites (username)`);
  }
});

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token required' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
};

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Authentication Endpoints
app.post('/api/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Username (min 3 chars) and password (min 6 chars) are required' });
  }
  try {
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) return next(err);
      if (row && await bcrypt.compare(password, row.password)) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, message: 'Login successful', username, token });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    });
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
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) return next(err);
      if (row) return res.status(409).json({ success: false, message: 'Username already exists' });
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) return next(err);
        res.json({ success: true, message: 'Signup successful. Please login.' });
      });
    });
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

// Notes Endpoints
app.get('/api/notes', verifyToken, (req, res, next) => {
  const { username } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  db.all('SELECT id, note, date FROM notes WHERE username = ? ORDER BY date DESC LIMIT ? OFFSET ?', 
    [username, parseInt(limit), parseInt(offset)], (err, rows) => {
      if (err) return next(err);
      db.get('SELECT COUNT(*) as total FROM notes WHERE username = ?', [username], (err, countRow) => {
        if (err) return next(err);
        res.json({ 
          success: true, 
          notes: rows || [], 
          pagination: { 
            page: parseInt(page), 
            limit: parseInt(limit), 
            total: countRow.total 
          }
        });
      });
    });
});

app.post('/api/notes', verifyToken, (req, res, next) => {
  const { note } = req.body;
  const { username } = req.user;
  if (!note) return res.status(400).json({ success: false, message: 'Note is required' });
  const sanitizedNote = sanitizeHtml(note, { allowedTags: [], allowedAttributes: {} });
  const date = new Date().toISOString().split('T')[0];
  db.run('INSERT INTO notes (username, note, date) VALUES (?, ?, ?)', [username, sanitizedNote, date], function(err) {
    if (err) return next(err);
    res.json({ success: true, message: 'Note saved', id: this.lastID });
  });
});

app.put('/api/notes/:id', verifyToken, (req, res, next) => {
  const { note } = req.body;
  const { id } = req.params;
  const { username } = req.user;
  if (!note) return res.status(400).json({ success: false, message: 'Note is required' });
  const sanitizedNote = sanitizeHtml(note, { allowedTags: [], allowedAttributes: {} });
  db.run('UPDATE notes SET note = ? WHERE id = ? AND username = ?', [sanitizedNote, id, username], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    res.json({ success: true, message: 'Note updated' });
  });
});

app.delete('/api/notes/:id', verifyToken, (req, res, next) => {
  const { id } = req.params;
  const { username } = req.user;
  db.run('DELETE FROM notes WHERE id = ? AND username = ?', [id, username], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    res.json({ success: true, message: 'Note deleted' });
  });
});

// Favorites Endpoints
app.get('/api/favorites', verifyToken, (req, res, next) => {
  const { username } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  db.all('SELECT newspaper_id FROM favorites WHERE username = ? LIMIT ? OFFSET ?', 
    [username, parseInt(limit), parseInt(offset)], (err, rows) => {
      if (err) return next(err);
      db.get('SELECT COUNT(*) as total FROM favorites WHERE username = ?', [username], (err, countRow) => {
        if (err) return next(err);
        res.json({ 
          success: true, 
          favorites: rows.map(row => row.newspaper_id), 
          pagination: { 
            page: parseInt(page), 
            limit: parseInt(limit), 
            total: countRow.total 
          }
        });
      });
    });
});

app.post('/api/favorites', verifyToken, (req, res, next) => {
  const { newspaper_id } = req.body;
  const { username } = req.user;
  if (!newspaper_id) return res.status(400).json({ success: false, message: 'Newspaper ID is required' });
  db.run('INSERT OR IGNORE INTO favorites (username, newspaper_id) VALUES (?, ?)', [username, newspaper_id], (err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Newspaper added to favorites' });
  });
});

app.delete('/api/favorites/:newspaper_id', verifyToken, (req, res, next) => {
  const { newspaper_id } = req.params;
  const { username } = req.user;
  db.run('DELETE FROM favorites WHERE username = ? AND newspaper_id = ?', [username, newspaper_id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Favorite not found' });
    res.json({ success: true, message: 'Newspaper removed from favorites' });
  });
});

// User Preferences
app.post('/api/preferences', verifyToken, (req, res, next) => {
  const { headline_sources } = req.body;
  const { username } = req.user;
  if (!Array.isArray(headline_sources)) return res.status(400).json({ success: false, message: 'Headline sources must be an array' });
  const sources = JSON.stringify(headline_sources);
  db.run('INSERT OR REPLACE INTO preferences (username, headline_sources) VALUES (?, ?)', [username, sources], (err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Preferences updated' });
  });
});

app.get('/api/preferences', verifyToken, (req, res, next) => {
  const { username } = req.user;
  db.get('SELECT headline_sources FROM preferences WHERE username = ?', [username], (err, row) => {
    if (err) return next(err);
    res.json({ 
      success: true, 
      headline_sources: row ? JSON.parse(row.headline_sources) : [] 
    });
  });
});

// Newspapers Endpoint
app.get('/api/newspapers', (req, res) => {
  const enhancedNewspapers = newspapers.map(n => ({
    ...n,
    id: n.id || n.name.replace(/\s+/g, '-').toLowerCase()
  }));
  res.json(enhancedNewspapers);
});

// Updated News Headlines Endpoint
app.get('/api/headlines', async (req, res, next) => {
  try {
    console.log('Fetching headlines from NewsAPI with query: { q: "news" }');
    const response = await newsapi.v2.topHeadlines({
      q: 'news', // Broad search for any news
      pageSize: 5
    });
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
    res.json({ success: true, headlines: mockHeadlines, message: 'Using fallback data due to API error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err.message);
    console.log('Database closed.');
    process.exit(0);
  });
});