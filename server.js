const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const axios = require('axios');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Notion configuration
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI;
const DATABASE_ID = process.env.DATABASE_ID;

if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET || !NOTION_REDIRECT_URI || !DATABASE_ID || !process.env.SESSION_SECRET) {
  console.error('ERROR: Missing OAuth credentials, DATABASE_ID, or SESSION_SECRET in your .env.local file.');
  console.error('Please create a .env.local file in the root directory with your credentials and restart the server.');
  process.exit(1);
}

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.accessToken) {
    next();
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

// Routes
app.get('/api/auth/status', (req, res) => {
  if (req.session.accessToken) {
    res.json({
      isAuthenticated: true,
      workspace: req.session.workspaceName || 'Notion Workspace'
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// 1. Redirect to Notion's authorization page
app.get('/api/auth/notion', (req, res) => {
  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(NOTION_REDIRECT_URI)}`;
  res.redirect(authUrl);
});

// 2. Handle the callback from Notion
app.get('/api/auth/notion/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('OAuth Error:', error);
    return res.status(500).json({ error: 'OAuth process failed.' });
  }

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided.' });
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await axios.post('https://api.notion.com/v1/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: NOTION_REDIRECT_URI,
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    const { access_token, workspace_name } = tokenResponse.data;
    req.session.accessToken = access_token;
    req.session.workspaceName = workspace_name;

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  } catch (err) {
    console.error('Error exchanging token:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Failed to exchange authorization code for token.' });
  }
});

app.get('/api/verify', requireAuth, async (req, res) => {
  try {
    const notion = new Client({ auth: req.session.accessToken });
    const response = await notion.databases.retrieve({ database_id: DATABASE_ID });
    console.log('Successfully connected to database:', response.title[0]?.plain_text);
    res.json({ success: true, title: response.title[0]?.plain_text });
  } catch (error) {
    console.error('Verification failed:', error);
    // The Notion client error object has a helpful 'body' property
    const errorBody = error.body ? JSON.parse(error.body) : { code: error.code, message: error.message };
    res.status(500).json({
      success: false,
      error: 'Failed to connect to the Notion database.',
      message: 'This usually means the Integration token is invalid or the integration does not have permission to access the database.',
      details: errorBody
    });
  }
});

app.post('/api/tasks', requireAuth, async (req, res) => {
  try {
    const notion = new Client({ auth: req.session.accessToken });
    const { sorts = [] } = req.body;
    console.log('Starting fetch tasks, sorts:', sorts);

    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: sorts,
        start_cursor: startCursor,
        page_size: 100
      });

      console.log('Response has_more:', response.has_more, 'results length:', response.results.length);
      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    console.log('Total allResults:', allResults.length);
    if (allResults.length > 0) {
      console.log('First task properties:', JSON.stringify(allResults[0].properties, null, 2));
    }
    res.json({ results: allResults });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    const errorBody = error.body ? JSON.parse(error.body) : { code: error.code, message: error.message };
    res.status(500).json({ error: 'Failed to fetch tasks', details: errorBody });
  }
});

app.post('/api/course-names', requireAuth, async (req, res) => {
  try {
    const notion = new Client({ auth: req.session.accessToken });
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Course IDs are required' });
    }

    const courseNames = {};

    for (const id of ids) {
      try {
        const page = await notion.pages.retrieve({ page_id: id });
        const title = page.properties?.Name?.title?.[0]?.plain_text || 'Unknown Course';
        courseNames[id] = title;
      } catch (error) {
        console.error(`Error fetching course ${id}:`, error);
        courseNames[id] = 'Unknown Course';
      }
    }

    res.json({ mapping: courseNames });
  } catch (error) {
    console.error('Error fetching course names:', error);
    const errorBody = error.body ? JSON.parse(error.body) : { code: error.code, message: error.message };
    res.status(500).json({ error: 'Failed to fetch course names', details: errorBody });
  }
});

app.get('/api/database-schema', requireAuth, async (req, res) => {
  try {
    const notion = new Client({ auth: req.session.accessToken });
    const database = await notion.databases.retrieve({ database_id: DATABASE_ID });

    const typeProperty = database.properties['Type'];
    const typeOptions = typeProperty?.select?.options || [];

    res.json({ typeOptions });
  } catch (error) {
    console.error('Error fetching database schema:', error);
    const errorBody = error.body ? JSON.parse(error.body) : { code: error.code, message: error.message };
    res.status(500).json({ error: 'Failed to fetch database schema', details: errorBody });
  }
});

app.patch('/api/tasks/:taskId', requireAuth, async (req, res) => {
  try {
    const notion = new Client({ auth: req.session.accessToken });
    const { taskId } = req.params;
    const { properties } = req.body;

    await notion.pages.update({
      page_id: taskId,
      properties
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    const errorBody = error.body ? JSON.parse(error.body) : { code: error.code, message: error.message };
    res.status(500).json({ error: 'Failed to update task', details: errorBody });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
