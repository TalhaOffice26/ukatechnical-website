require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path'), express = require('express'), helmet = require('helmet'), cookieParser = require('cookie-parser'), rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { adminPage } = require('./middleware/auth');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) { console.error('Set a long JWT_SECRET in .env'); process.exit(1); }

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// ager frontend "message" key chay, notun code "error" pathay. duto-i pathabe
app.use('/api', (req, res, next) => {
  const j = res.json.bind(res);
  res.json = b => { if (b && b.error && !b.message) b.message = b.error; return j(b); };
  next();
});

// Health check & Keep-alive Ping endpoints (exempt from rate limit)
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/api/ping', (req, res) => res.status(200).json({ status: 'ok', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() }));

const lim = (max, min = 15) => rateLimit({ windowMs: min * 60 * 1000, max, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many requests, please try again later' } });
app.use('/api', lim(300));
app.use('/api/auth', lim(30));
app.post('/api/contact', lim(10, 60));
app.post('/api/admissions', lim(10, 60));
app.use('/api/exam-dates', require('./routes/examdates'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/content', require('./routes/content'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

// Clean URL Redirection (strip .html from URLs and 301 redirect)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  if (req.path === '/index.html' || req.path === '/index') {
    const q = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, '/' + q);
  }
  if (req.path.endsWith('.html')) {
    const cleanPath = req.path.slice(0, -5);
    const q = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, cleanPath + q);
  }
  next();
});

// Admin Route Guards & Entrypoint
app.get('/admin', adminPage, (req, res) => res.redirect('/admin/dashboard'));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'login.html')));
app.get('/admin/content', adminPage, (req, res) => res.redirect('/admin/site-content-admin'));
app.use('/admin', adminPage);

app.use(express.static(path.join(__dirname, '..', 'frontend'), { extensions: ['html'] }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
  if (err.code === 11000) return res.status(409).json({ message: 'This value already exists' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  if (err.name === 'MulterError') return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5MB' : err.message });
  if (err.message === 'Only images allowed') return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Running on http://localhost:' + PORT);

    // 10-Minute Automatic Self-Ping for Render Free Tier Keep-Alive
    const pingTarget = process.env.PING_URL || process.env.RENDER_EXTERNAL_URL;
    const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

    if (pingTarget) {
      console.log(`[Keep-Alive] 10-minute ping initialized for: ${pingTarget}`);
      setInterval(async () => {
        try {
          const pingUrl = pingTarget.replace(/\/$/, '') + '/ping';
          const r = await fetch(pingUrl);
          console.log(`[Keep-Alive Ping] ${new Date().toLocaleTimeString()} -> ${pingUrl} (status: ${r.status})`);
        } catch (err) {
          console.warn(`[Keep-Alive Ping Error]: ${err.message}`);
        }
      }, PING_INTERVAL);
    } else {
      console.log('[Keep-Alive] Note: Set RENDER_EXTERNAL_URL or PING_URL in environment to enable auto self-ping.');
    }
  });
}).catch(e => { console.error('DB error:', e.message); process.exit(1); });