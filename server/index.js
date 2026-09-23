import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';
import { connectMongoDB, getMongoStatus } from './mongo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-pin'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' && req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ==========================================
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    const status = db.getStatus();
    const mongo = getMongoStatus();
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      server: 'Nexora Tools Full-Stack API v2.5.0',
      database: status,
      mongo,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION & PIN MANAGEMENT
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, error: 'Master PIN is required' });
    }

    const isValid = await db.verifyPin(pin);
    if (isValid) {
      return res.json({
        success: true,
        message: 'Master authentication successful',
        authenticated: true,
        token: `nexora-session-${Date.now()}`,
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Incorrect Master PIN / Password',
        authenticated: false,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/change-pin', async (req, res) => {
  try {
    const { newPin } = req.body;
    if (!newPin || String(newPin).trim().length < 4) {
      return res.status(400).json({ success: false, error: 'PIN must be at least 4 characters' });
    }

    await db.changePin(newPin);
    res.json({ success: true, message: 'Master PIN updated successfully in database' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. FULL SITE CONFIG (AGGREGATED)
// ==========================================
app.get('/api/config', async (req, res) => {
  try {
    const [settings, tools, seoRoutes] = await Promise.all([
      db.getSiteSettings(),
      db.getTools(),
      db.getSEORoutes(),
    ]);

    res.json({
      success: true,
      data: {
        tools,
        seoRoutes,
        globalSEO: settings.global_seo,
        announcement: settings.announcement,
        branding: settings.branding,
        adminPin: settings.admin_pin,
        lastUpdated: settings.last_updated,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const payload = req.body;
    if (payload.globalSEO) {
      await db.updateSiteSettings({ global_seo: payload.globalSEO });
    }
    if (payload.announcement) {
      await db.updateSiteSettings({ announcement: payload.announcement });
    }
    if (payload.branding) {
      await db.updateSiteSettings({ branding: payload.branding });
    }
    if (payload.adminPin) {
      await db.changePin(payload.adminPin);
    }
    res.json({ success: true, message: 'Site configuration updated in database' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. TOOLS CRUD API
// ==========================================
app.get('/api/tools', async (req, res) => {
  try {
    const tools = await db.getTools();
    res.json({ success: true, count: tools.length, data: tools });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tools', async (req, res) => {
  try {
    const tool = req.body;
    if (!tool.name || !tool.path) {
      return res.status(400).json({ success: false, error: 'Tool name and path are required' });
    }
    const created = await db.addTool(tool);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/tools/:id', async (req, res) => {
  try {
    const updated = await db.updateTool(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/tools/:id/toggle', async (req, res) => {
  try {
    const updated = await db.toggleTool(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/tools/:id', async (req, res) => {
  try {
    const deleted = await db.deleteTool(req.params.id);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. DYNAMIC ROUTE SEO API
// ==========================================
app.get('/api/seo', async (req, res) => {
  try {
    const routes = await db.getSEORoutes();
    res.json({ success: true, data: routes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/seo', async (req, res) => {
  try {
    const { path: routePath, ...seoData } = req.body;
    if (!routePath) {
      return res.status(400).json({ success: false, error: 'Path is required' });
    }
    const updated = await db.updateSEORoute(routePath, seoData);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/seo', async (req, res) => {
  try {
    const routePath = req.query.path || req.body.path;
    if (!routePath) {
      return res.status(400).json({ success: false, error: 'Path is required' });
    }
    const cleanPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
    const deleted = await db.deleteSEORoute(cleanPath);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/seo/:routePath', async (req, res) => {
  try {
    const cleanPath = `/${req.params.routePath}`;
    const deleted = await db.deleteSEORoute(cleanPath);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. ANNOUNCEMENT API
// ==========================================
app.get('/api/announcement', async (req, res) => {
  try {
    const settings = await db.getSiteSettings();
    res.json({ success: true, data: settings.announcement });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/announcement', async (req, res) => {
  try {
    const settings = await db.getSiteSettings();
    const updatedAnnouncement = {
      ...settings.announcement,
      ...req.body,
    };
    await db.updateSiteSettings({ announcement: updatedAnnouncement });
    res.json({ success: true, data: updatedAnnouncement });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. BRANDING & SCRIPTS API
// ==========================================
app.get('/api/branding', async (req, res) => {
  try {
    const settings = await db.getSiteSettings();
    res.json({
      success: true,
      data: {
        branding: settings.branding,
        globalSEO: settings.global_seo,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/branding', async (req, res) => {
  try {
    const settings = await db.getSiteSettings();
    if (req.body.branding) {
      await db.updateSiteSettings({ branding: { ...settings.branding, ...req.body.branding } });
    }
    if (req.body.globalSEO) {
      await db.updateSiteSettings({ global_seo: { ...settings.global_seo, ...req.body.globalSEO } });
    }
    res.json({ success: true, message: 'Branding updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. ANALYTICS & TASK TRACKING
// ==========================================
app.get('/api/analytics', async (req, res) => {
  try {
    const stats = await db.getAnalytics();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/analytics/track', async (req, res) => {
  try {
    const { type, count = 1 } = req.body;
    const stats = await db.trackTask(type, count);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. AUDIT LOGS
// ==========================================
app.get('/api/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await db.getAuditLogs(limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 10. BACKUP / RESTORE / FACTORY RESET
// ==========================================
app.get('/api/backup/export', async (req, res) => {
  try {
    const backup = await db.getFullBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=nexora-db-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    res.json(backup);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backup/import', async (req, res) => {
  try {
    const payload = req.body;
    await db.restoreBackup(payload);
    res.json({ success: true, message: 'Database successfully restored from backup' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/reset', async (req, res) => {
  try {
    await db.resetToDefaults();
    res.json({ success: true, message: 'Database reset to default settings' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server and Connect to MongoDB
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 [Nexora Backend Server] Running on http://localhost:${PORT}`);
  await connectMongoDB();
});
