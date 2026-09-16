/**
 * DEARLY - Application Server
 * "The technology should disappear. The emotion should remain."
 *
 * Powered by native Node.js HTTP, zero third-party production dependencies.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { getMimeType, sendJson, sendError, parseJsonBody } = require('./src/utils/http-helpers');
const { AIOrchestrator } = require('./src/ai/ai-orchestrator');
const usageService = require('./src/services/usage-service');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const CREATIONS_FILE = path.join(__dirname, 'data/creations.json');
const PEOPLE_FILE = path.join(__dirname, 'data/people.json');
// Create data directory if needed
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Load variables from a simple KEY=VALUE env file into process.env.
// Skips keys that are already set (so shell env always wins).
function loadEnvFile(filepath) {
  try {
    if (!fs.existsSync(filepath)) return;
    const lines = fs.readFileSync(filepath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch (e) {
    // non-fatal — server still starts without the file
  }
}

// Load order: .env → .env.local (local overrides base)
loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '.env.local'));

const orchestrator = new AIOrchestrator();

// =========================================================================
// DATA HELPERS
// =========================================================================

function loadJson(filepath, defaultVal = []) {
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${filepath}:`, err);
  }
  return defaultVal;
}

function saveJson(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error saving ${filepath}:`, err);
    return false;
  }
}

function loadCreations() { return loadJson(CREATIONS_FILE, []); }
function saveCreations(data) { return saveJson(CREATIONS_FILE, data); }
function loadPeople() { return loadJson(PEOPLE_FILE, []); }
function savePeople(data) { return saveJson(PEOPLE_FILE, data); }

// =========================================================================
// HTTP SERVER
// =========================================================================

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

  // Security & CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // =====================================================================
    // REST API ENDPOINTS
    // =====================================================================
    if (pathname.startsWith('/api/')) {

      // 1. Session / Usage Status
      if (pathname === '/api/session' && method === 'GET') {
        const user = usageService.getUser('default_user');
        return sendJson(res, 200, { success: true, user });
      }

      // 2. Pre-flight creation check
      if (pathname === '/api/can-create' && method === 'POST') {
        const body = await parseJsonBody(req);
        const isArtistic = Boolean(body.isArtistic);
        const check = usageService.checkCanCreate('default_user', { isArtistic });
        return sendJson(res, 200, check);
      }

      // 3. AI Message Generation
      if (pathname === '/api/generate-message' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { photoInfo, intention, recipient, mood } = body;

        const photoAnalysis = await orchestrator.analyzePhoto(photoInfo || {});
        const candidates = await orchestrator.generateMessageCandidates({
          photoInfo: { ...(photoInfo || {}), ...photoAnalysis },
          intention: intention || '',
          recipient: recipient || 'Someone Special',
          mood: mood || 'Loving'
        });

        return sendJson(res, 200, {
          success: true,
          photoAnalysis,
          candidates,
          recommendedDesign: photoAnalysis.recommendedTemplate
        });
      }

      // 4. Message Refinement
      if (pathname === '/api/refine-message' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { currentMessage, refinementType, context } = body;
        const refined = await orchestrator.refineMessage(currentMessage, refinementType, context || {});
        return sendJson(res, 200, { success: true, refinedMessage: refined });
      }

      // 5. Saved Creations
      if (pathname === '/api/creations' && method === 'GET') {
        const creations = loadCreations();
        return sendJson(res, 200, { success: true, creations });
      }

      if (pathname === '/api/creations' && method === 'POST') {
        const body = await parseJsonBody(req);
        const isArtistic = body.artisticStyle && body.artisticStyle !== 'original';

        const usageResult = usageService.consumeCreation('default_user', { isArtistic });
        if (!usageResult.success) {
          return sendError(res, 402, usageResult.reason || 'Upgrade required');
        }

        const creations = loadCreations();
        const newCreation = {
          id: 'creation_' + Date.now(),
          title: body.title || 'Special Moment',
          recipient: body.recipient || 'Someone Special',
          mood: body.mood || 'Loving',
          designTemplate: body.designTemplate || 'Warm',
          artisticStyle: body.artisticStyle || 'original',
          message: body.message || '',
          aspectRatio: body.aspectRatio || 'square',
          photoUrl: body.photoUrl,
          dataUrl: body.dataUrl || null,
          photoDescription: body.photoDescription || 'Personal photograph',
          category: body.category || 'Family',
          createdAt: new Date().toISOString()
        };

        creations.unshift(newCreation);
        saveCreations(creations);

        return sendJson(res, 201, {
          success: true,
          creation: newCreation,
          user: usageResult.user
        });
      }

      if (pathname.startsWith('/api/creations/') && method === 'DELETE') {
        const id = pathname.split('/').pop();
        const creations = loadCreations().filter(c => c.id !== id);
        saveCreations(creations);
        return sendJson(res, 200, { success: true, id });
      }

      // 6. Relationships (My People)
      if (pathname === '/api/people' && method === 'GET') {
        return sendJson(res, 200, { success: true, people: loadPeople() });
      }

      if (pathname === '/api/people' && method === 'POST') {
        const body = await parseJsonBody(req);
        const people = loadPeople();
        const newPerson = {
          id: 'rel_' + Date.now(),
          name: body.name || 'Loved One',
          relationship: body.relationship || 'Someone Special',
          avatarEmoji: body.avatarEmoji || '❤️',
          notes: body.notes || ''
        };
        people.push(newPerson);
        savePeople(people);
        return sendJson(res, 201, { success: true, person: newPerson });
      }

      // 7. Billing & Plans
      if (pathname === '/api/billing/upgrade' && method === 'POST') {
        const body = await parseJsonBody(req);
        const updatedUser = usageService.updatePlan('default_user', body.plan);
        return sendJson(res, 200, { success: true, user: updatedUser });
      }

      if (pathname === '/api/billing/buy-single' && method === 'POST') {
        const updatedUser = usageService.purchaseSingle('default_user', 1);
        return sendJson(res, 200, { success: true, user: updatedUser });
      }

      // 8. Gemini API Key
      if (pathname === '/api/settings/gemini-key' && method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const key = (body.key || '').trim();
          if (!key) return sendError(res, 400, 'API key is required');

          // Save to .env.local
          // Write the key into .env (preserving other vars already there)
          const envPath = path.join(__dirname, '.env');
          let envContent = '';
          try { envContent = fs.readFileSync(envPath, 'utf8'); } catch (_) {}
          if (/^GEMINI_API_KEY=.*/m.test(envContent)) {
            envContent = envContent.replace(/^GEMINI_API_KEY=.*/m, `GEMINI_API_KEY=${key}`);
          } else {
            envContent += `\nGEMINI_API_KEY=${key}\n`;
          }
          fs.writeFileSync(envPath, envContent, 'utf8');
          process.env.GEMINI_API_KEY = key;
          orchestrator.geminiApiKey = key;
          orchestrator.useGemini = true;
          console.log('✨ Gemini API key updated and activated');

          return sendJson(res, 200, { success: true });
        } catch (e) {
          return sendError(res, 500, 'Could not save API key');
        }
      }

      // 9. Privacy & Data Erasure
      if (pathname === '/api/user/delete-data' && method === 'POST') {
        saveCreations([]);
        return sendJson(res, 200, {
          success: true,
          message: 'All your creations and saved moments have been deleted.'
        });
      }

      if (pathname === '/api/user/delete-account' && method === 'POST') {
        saveCreations([]);
        savePeople([]);
        usageService.deleteUserData('default_user');
        return sendJson(res, 200, {
          success: true,
          message: 'Your account and all data have been permanently erased.'
        });
      }

      return sendError(res, 404, 'API endpoint not found');
    }

    // =====================================================================
    // STATIC FILE SERVING
    // =====================================================================
    let safePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    let filePath = path.join(PUBLIC_DIR, safePath);

    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Access denied');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // SPA fallback — serve index.html
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(indexPath).pipe(res);
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not found');
      }

      const mimeType = getMimeType(filePath);
      const cacheControl = mimeType.startsWith('image/') ? 'public, max-age=86400' : 'public, max-age=3600';
      res.writeHead(200, { 'Content-Type': mimeType, 'Cache-Control': cacheControl });
      fs.createReadStream(filePath).pipe(res);
    });

  } catch (error) {
    console.error('Server error:', error);
    sendError(res, 500, "We couldn't process that just yet. Let's try again. ❤️");
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌸 DEARLY is ready at http://localhost:${PORT}`);
  console.log(`"Make something special for someone you love."`);
  if (process.env.GEMINI_API_KEY) {
    console.log(`✨ Gemini AI: Active`);
  } else {
    console.log(`💡 Gemini AI: Add GEMINI_API_KEY to enable (Settings → AI Power)\n`);
  }
});
