import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Tool } from './models/Tool.js';
import { SEORoute } from './models/SEORoute.js';
import { SiteSettings } from './models/SiteSettings.js';
import { Analytics } from './models/Analytics.js';
import { AuditLog } from './models/AuditLog.js';
import { getMongoStatus } from './mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'nexora_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function isMongoLive() {
  return mongoose.connection.readyState === 1;
}

// File fallback readers
function readFileDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return null;
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

function writeFileDB(data) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (e) {
    console.error('File fallback write error:', e);
  }
}

export const db = {
  // Status check
  getStatus() {
    const mongo = getMongoStatus();
    return {
      connected: true,
      database: mongo.connected ? 'MongoDB (Mongoose)' : 'Local File Store (MongoDB Connecting)',
      engine: mongo.connected ? 'MongoDB' : 'JSON / SQLite Fallback',
      mongoState: mongo.state,
      mongoUri: mongo.uri,
      timestamp: new Date().toISOString(),
    };
  },

  // 1. Site Settings
  async getSiteSettings() {
    if (isMongoLive()) {
      let settings = await SiteSettings.findOne({ key: 'global_config' }).lean();
      if (!settings) {
        settings = await SiteSettings.create({ key: 'global_config' });
      }
      return settings;
    }
    const file = readFileDB();
    return file?.site_settings || { admin_pin: 'nexora2026' };
  },

  async updateSiteSettings(updates) {
    if (isMongoLive()) {
      const settings = await SiteSettings.findOneAndUpdate(
        { key: 'global_config' },
        {
          $set: {
            ...updates,
            last_updated: new Date().toISOString(),
          },
        },
        { new: true, upsert: true }
      ).lean();
      return settings;
    }
    const file = readFileDB() || {};
    file.site_settings = { ...file.site_settings, ...updates, last_updated: new Date().toISOString() };
    writeFileDB(file);
    return file.site_settings;
  },

  // 2. PIN Management
  async verifyPin(pin) {
    if (isMongoLive()) {
      const settings = await SiteSettings.findOne({ key: 'global_config' }).lean();
      const currentPin = settings?.admin_pin || 'nexora2026';
      return String(pin).trim() === String(currentPin).trim();
    }
    const file = readFileDB();
    const currentPin = file?.site_settings?.admin_pin || 'nexora2026';
    return String(pin).trim() === String(currentPin).trim();
  },

  async changePin(newPin) {
    const clean = String(newPin).trim();
    if (isMongoLive()) {
      await SiteSettings.findOneAndUpdate(
        { key: 'global_config' },
        { $set: { admin_pin: clean, last_updated: new Date().toISOString() } },
        { upsert: true }
      );
      await this.addAuditLog('CHANGE_PIN', 'Master PIN updated in MongoDB');
      return true;
    }
    const file = readFileDB() || {};
    file.site_settings = file.site_settings || {};
    file.site_settings.admin_pin = clean;
    file.site_settings.last_updated = new Date().toISOString();
    writeFileDB(file);
    return true;
  },

  // 3. Tools CRUD
  async getTools() {
    if (isMongoLive()) {
      const tools = await Tool.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
      return tools.map(({ _id, __v, ...rest }) => rest);
    }
    const file = readFileDB();
    return file?.tools || [];
  },

  async getToolById(id) {
    if (isMongoLive()) {
      return Tool.findOne({ id }).lean();
    }
    const file = readFileDB();
    return (file?.tools || []).find((t) => t.id === id);
  },

  async addTool(toolData) {
    const toolObj = {
      ...toolData,
      id: toolData.id || `custom-tool-${Date.now()}`,
      enabled: toolData.enabled !== false,
      isCustom: true,
    };

    if (isMongoLive()) {
      const created = await Tool.create(toolObj);
      await this.addAuditLog('ADD_TOOL', `Created tool in MongoDB: ${toolObj.name}`);
      const { _id, __v, ...clean } = created.toObject();
      return clean;
    }

    const file = readFileDB() || { tools: [] };
    file.tools = file.tools || [];
    file.tools.unshift(toolObj);
    writeFileDB(file);
    return toolObj;
  },

  async updateTool(id, updates) {
    if (isMongoLive()) {
      const updated = await Tool.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      if (updated) {
        await this.addAuditLog('UPDATE_TOOL', `Updated tool in MongoDB: ${id}`);
        const { _id, __v, ...clean } = updated;
        return clean;
      }
      return null;
    }

    const file = readFileDB() || {};
    file.tools = file.tools || [];
    const idx = file.tools.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    file.tools[idx] = { ...file.tools[idx], ...updates };
    writeFileDB(file);
    return file.tools[idx];
  },

  async toggleTool(id) {
    if (isMongoLive()) {
      const tool = await Tool.findOne({ id });
      if (!tool) return null;
      tool.enabled = !tool.enabled;
      await tool.save();
      await this.addAuditLog('TOGGLE_TOOL', `Toggled tool in MongoDB: ${id} -> ${tool.enabled}`);
      const { _id, __v, ...clean } = tool.toObject();
      return clean;
    }

    const file = readFileDB() || {};
    file.tools = file.tools || [];
    const idx = file.tools.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const next = !file.tools[idx].enabled;
    file.tools[idx].enabled = next;
    writeFileDB(file);
    return file.tools[idx];
  },

  async deleteTool(id) {
    if (isMongoLive()) {
      const res = await Tool.deleteOne({ id });
      await this.addAuditLog('DELETE_TOOL', `Deleted tool from MongoDB: ${id}`);
      return res.deletedCount > 0;
    }

    const file = readFileDB() || {};
    file.tools = (file.tools || []).filter((t) => t.id !== id);
    writeFileDB(file);
    return true;
  },

  // 4. SEO Routes CRUD
  async getSEORoutes() {
    if (isMongoLive()) {
      const list = await SEORoute.find().lean();
      const map = {};
      list.forEach((item) => {
        const { _id, __v, ...clean } = item;
        map[clean.path] = clean;
      });
      return map;
    }
    const file = readFileDB();
    return file?.seo_routes || {};
  },

  async updateSEORoute(pathKey, seoData) {
    const payload = {
      ...seoData,
      path: pathKey,
      lastUpdated: new Date().toISOString(),
    };

    if (isMongoLive()) {
      const updated = await SEORoute.findOneAndUpdate(
        { path: pathKey },
        { $set: payload },
        { new: true, upsert: true }
      ).lean();
      await this.addAuditLog('UPDATE_SEO', `Updated SEO in MongoDB: ${pathKey}`);
      const { _id, __v, ...clean } = updated;
      return clean;
    }

    const file = readFileDB() || {};
    file.seo_routes = file.seo_routes || {};
    file.seo_routes[pathKey] = payload;
    writeFileDB(file);
    return payload;
  },

  async deleteSEORoute(pathKey) {
    if (isMongoLive()) {
      const res = await SEORoute.deleteOne({ path: pathKey });
      await this.addAuditLog('DELETE_SEO', `Deleted SEO from MongoDB: ${pathKey}`);
      return res.deletedCount > 0;
    }

    const file = readFileDB() || {};
    if (file.seo_routes && file.seo_routes[pathKey]) {
      delete file.seo_routes[pathKey];
      writeFileDB(file);
      return true;
    }
    return false;
  },

  // 5. Analytics
  async getAnalytics() {
    if (isMongoLive()) {
      let metrics = await Analytics.findOne({ key: 'global_metrics' }).lean();
      if (!metrics) {
        metrics = await Analytics.create({ key: 'global_metrics' });
      }
      const { _id, __v, key, ...clean } = metrics;
      return clean;
    }
    const file = readFileDB();
    return (
      file?.analytics || {
        totalProcessed: 142,
        passportPhotosCreated: 58,
        idCardsMerged: 42,
        pdfsGenerated: 26,
        scansCompleted: 16,
        batchItemsProcessed: 0,
        lastActive: new Date().toISOString(),
      }
    );
  },

  async trackTask(type, count = 1) {
    if (isMongoLive()) {
      const incField =
        type === 'passport'
          ? 'passportPhotosCreated'
          : type === 'idMerger'
          ? 'idCardsMerged'
          : type === 'pdf'
          ? 'pdfsGenerated'
          : type === 'scanner'
          ? 'scansCompleted'
          : type === 'batch'
          ? 'batchItemsProcessed'
          : null;

      const incObj = { totalProcessed: count };
      if (incField) incObj[incField] = count;

      const updated = await Analytics.findOneAndUpdate(
        { key: 'global_metrics' },
        {
          $inc: incObj,
          $set: { lastActive: new Date().toISOString() },
        },
        { new: true, upsert: true }
      ).lean();

      const { _id, __v, key, ...clean } = updated;
      return clean;
    }

    const file = readFileDB() || { analytics: {} };
    file.analytics = file.analytics || {};
    file.analytics.totalProcessed = (file.analytics.totalProcessed || 0) + count;
    if (type === 'passport') file.analytics.passportPhotosCreated = (file.analytics.passportPhotosCreated || 0) + count;
    if (type === 'idMerger') file.analytics.idCardsMerged = (file.analytics.idCardsMerged || 0) + count;
    if (type === 'pdf') file.analytics.pdfsGenerated = (file.analytics.pdfsGenerated || 0) + count;
    if (type === 'scanner') file.analytics.scansCompleted = (file.analytics.scansCompleted || 0) + count;
    if (type === 'batch') file.analytics.batchItemsProcessed = (file.analytics.batchItemsProcessed || 0) + count;
    file.analytics.lastActive = new Date().toISOString();
    writeFileDB(file);
    return file.analytics;
  },

  // 6. Audit Logs
  async getAuditLogs(limit = 50) {
    if (isMongoLive()) {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
      return logs.map(({ _id, __v, ...clean }) => clean);
    }
    const file = readFileDB();
    return (file?.audit_logs || []).slice(0, limit);
  },

  async addAuditLog(action, details) {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
    };
    if (isMongoLive()) {
      await AuditLog.create(logItem).catch(() => {});
    }
    const file = readFileDB() || {};
    file.audit_logs = file.audit_logs || [];
    file.audit_logs.unshift(logItem);
    if (file.audit_logs.length > 200) file.audit_logs = file.audit_logs.slice(0, 200);
    writeFileDB(file);
  },

  // 7. Backup & Restore
  async getFullBackup() {
    const [settings, tools, seoRoutes, analytics, auditLogs] = await Promise.all([
      this.getSiteSettings(),
      this.getTools(),
      this.getSEORoutes(),
      this.getAnalytics(),
      this.getAuditLogs(100),
    ]);

    return {
      version: '2.5.0',
      database_type: isMongoLive() ? 'MongoDB' : 'JSON_File',
      site_settings: settings,
      tools,
      seo_routes: seoRoutes,
      analytics,
      audit_logs: auditLogs,
    };
  },

  async restoreBackup(backupData) {
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Invalid backup payload');
    }

    if (isMongoLive()) {
      if (backupData.site_settings) {
        await SiteSettings.findOneAndUpdate({ key: 'global_config' }, { $set: backupData.site_settings }, { upsert: true });
      }
      if (Array.isArray(backupData.tools)) {
        await Tool.deleteMany({});
        await Tool.insertMany(backupData.tools);
      }
      if (backupData.seo_routes && typeof backupData.seo_routes === 'object') {
        await SEORoute.deleteMany({});
        const seoList = Object.values(backupData.seo_routes);
        if (seoList.length > 0) await SEORoute.insertMany(seoList);
      }
      if (backupData.analytics) {
        await Analytics.findOneAndUpdate({ key: 'global_metrics' }, { $set: backupData.analytics }, { upsert: true });
      }
      await this.addAuditLog('RESTORE_BACKUP', 'MongoDB restored from JSON backup');
      return true;
    }

    writeFileDB(backupData);
    return true;
  },

  async resetToDefaults() {
    if (isMongoLive()) {
      await Tool.deleteMany({});
      await SEORoute.deleteMany({});
      await SiteSettings.deleteMany({});
      await Analytics.deleteMany({});
      await this.addAuditLog('FACTORY_RESET', 'MongoDB reset to defaults');
      return true;
    }
    return true;
  },
};
