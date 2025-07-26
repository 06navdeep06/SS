const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs').promises
const sqlite3 = require('sqlite3').verbose()
const WebSocket = require('ws')
const http = require('http')
const chokidar = require('chokidar')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

// Database setup
const db = new sqlite3.Database('smartshot.db')

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS screenshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT UNIQUE NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_hash TEXT,
      category TEXT,
      app_name TEXT,
      window_title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ocr_text TEXT,
      ocr_confidence REAL
    )
  `)
  
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)
})

// WebSocket connections
const clients = new Set()

wss.on('connection', (ws) => {
  clients.add(ws)
  console.log('Client connected')
  
  // Send initial stats
  getStats().then(stats => {
    ws.send(JSON.stringify({
      type: 'stats_update',
      payload: stats
    }))
  })
  
  ws.on('close', () => {
    clients.delete(ws)
    console.log('Client disconnected')
  })
})

// Broadcast to all connected clients
const broadcast = (message) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
}

// API Routes

// Get recent screenshots
app.get('/api/screenshots/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  
  db.all(
    'SELECT * FROM screenshots ORDER BY created_at DESC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ screenshots: rows })
    }
  )
})

// Search screenshots
app.get('/api/search', (req, res) => {
  const { query, category, app, days } = req.query
  let sql = 'SELECT * FROM screenshots WHERE 1=1'
  const params = []
  
  if (query) {
    sql += ' AND (ocr_text LIKE ? OR file_name LIKE ? OR window_title LIKE ?)'
    params.push(`%${query}%`, `%${query}%`, `%${query}%`)
  }
  
  if (category) {
    sql += ' AND category = ?'
    params.push(category)
  }
  
  if (app) {
    sql += ' AND app_name = ?'
    params.push(app)
  }
  
  if (days) {
    sql += ' AND created_at >= datetime("now", "-" || ? || " days")'
    params.push(days)
  }
  
  sql += ' ORDER BY created_at DESC LIMIT 50'
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ results: rows })
  })
})

// Get filter options
app.get('/api/filters', (req, res) => {
  const queries = [
    'SELECT DISTINCT category FROM screenshots WHERE category IS NOT NULL ORDER BY category',
    'SELECT DISTINCT app_name FROM screenshots WHERE app_name IS NOT NULL ORDER BY app_name'
  ]
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  )).then(([categories, apps]) => {
    res.json({
      categories: categories.map(row => row.category),
      apps: apps.map(row => row.app_name)
    })
  }).catch(err => {
    res.status(500).json({ error: err.message })
  })
})

// Get statistics
const getStats = () => {
  return new Promise((resolve, reject) => {
    const queries = [
      'SELECT COUNT(*) as total FROM screenshots',
      'SELECT COUNT(*) as ocr_processed FROM screenshots WHERE ocr_text IS NOT NULL AND ocr_text != ""',
      'SELECT COUNT(*) as categorized FROM screenshots WHERE category IS NOT NULL AND category != "Uncategorized"',
      'SELECT COUNT(DISTINCT category) as categories FROM screenshots WHERE category IS NOT NULL'
    ]
    
    Promise.all(queries.map(query => 
      new Promise((resolve, reject) => {
        db.get(query, (err, row) => {
          if (err) reject(err)
          else resolve(row)
        })
      })
    )).then(([total, ocrProcessed, categorized, categories]) => {
      resolve({
        totalScreenshots: total.total,
        ocrProcessed: ocrProcessed.ocr_processed,
        categorized: categorized.categorized,
        categories: categories.categories
      })
    }).catch(reject)
  })
}

app.get('/api/stats/overview', async (req, res) => {
  try {
    const stats = await getStats()
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get detailed statistics
app.get('/api/stats/detailed', (req, res) => {
  const days = parseInt(req.query.days) || 30
  
  const queries = [
    // Overview stats
    'SELECT COUNT(*) as total FROM screenshots',
    'SELECT COUNT(*) as ocr_processed FROM screenshots WHERE ocr_text IS NOT NULL',
    'SELECT COUNT(*) as categorized FROM screenshots WHERE category IS NOT NULL AND category != "Uncategorized"',
    
    // Category breakdown
    `SELECT category, COUNT(*) as count, 
     ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM screenshots), 1) as percentage
     FROM screenshots 
     WHERE category IS NOT NULL 
     GROUP BY category 
     ORDER BY count DESC`,
    
    // App breakdown
    `SELECT app_name, COUNT(*) as count,
     ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM screenshots), 1) as percentage
     FROM screenshots 
     WHERE app_name IS NOT NULL 
     GROUP BY app_name 
     ORDER BY count DESC`
  ]
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      if (query.includes('GROUP BY')) {
        db.all(query, (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        })
      } else {
        db.get(query, (err, row) => {
          if (err) reject(err)
          else resolve(row)
        })
      }
    })
  )).then(([total, ocrProcessed, categorized, categories, apps]) => {
    res.json({
      overview: {
        totalScreenshots: total.total,
        ocrProcessed: ocrProcessed.ocr_processed,
        categorized: categorized.categorized,
        totalSize: '45.2 MB', // Mock data
        avgPerDay: Math.round((total.total / days) * 10) / 10,
        mostActiveDay: 'Friday' // Mock data
      },
      categories: categories.map(cat => ({
        ...cat,
        trend: '+' + Math.floor(Math.random() * 20) + '%' // Mock trend data
      })),
      applications: apps.map(app => ({
        ...app,
        trend: '+' + Math.floor(Math.random() * 25) + '%' // Mock trend data
      }))
    })
  }).catch(err => {
    res.status(500).json({ error: err.message })
  })
})

// Settings endpoints
app.get('/api/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    const settings = {}
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    })
    
    res.json(settings)
  })
})

app.post('/api/settings', (req, res) => {
  const settings = req.body
  
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  
  Object.entries(settings).forEach(([key, value]) => {
    stmt.run(key, JSON.stringify(value))
  })
  
  stmt.finalize((err) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ success: true })
  })
})

// File watcher (mock implementation)
const watchPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', 'Pictures', 'Screenshots')

try {
  const watcher = chokidar.watch(watchPath, {
    ignored: /^\./, 
    persistent: true,
    ignoreInitial: true
  })
  
  watcher.on('add', (filePath) => {
    const fileName = path.basename(filePath)
    if (/\.(png|jpg|jpeg|gif|bmp)$/i.test(fileName)) {
      console.log('New screenshot detected:', fileName)
      
      // Broadcast new screenshot event
      broadcast({
        type: 'new_screenshot',
        payload: {
          id: Date.now(),
          type: 'screenshot_processed',
          message: 'New screenshot processed',
          details: fileName,
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      })
      
      // Update stats
      getStats().then(stats => {
        broadcast({
          type: 'stats_update',
          payload: stats
        })
      })
    }
  })
  
  console.log(`Watching for screenshots in: ${watchPath}`)
} catch (error) {
  console.log('File watcher not available:', error.message)
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
  console.log(`SmartShot server running on port ${PORT}`)
  console.log(`Web interface: http://localhost:${PORT}`)
})