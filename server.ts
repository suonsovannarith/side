import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getUserWorkspace,
  createChannelRecord,
  updateChannelRecord,
  deleteChannelRecord,
  createContentRecord,
  updateContentRecord,
  deleteContentRecord,
  createTaskRecord,
  updateTaskRecord,
  deleteTaskRecord,
  updateRotationPointer,
  resetUserWorkspace,
} from './src/db/repository.ts';
import {
  brainstormIdeasWithGemini,
  generateStageScriptWithGemini,
} from './src/lib/gemini.ts';
import {
  syncYouTubeChannelMetrics,
  publishToYouTubeStudio,
} from './src/lib/youtube.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // 1. GET full workspace (channels, contentItems, tasks, currentRotationChannelId)
  app.get('/api/workspace', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'creator@creatordesk.pro';
      const name = req.user!.name;
      const workspace = await getUserWorkspace(uid, email, name);
      res.json(workspace);
    } catch (error: any) {
      console.error('API Error GET /api/workspace:', error);
      res.status(500).json({ error: error.message || 'Failed to load workspace' });
    }
  });

  // 2. Channels CRUD
  app.post('/api/channels', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const channel = await createChannelRecord(uid, req.body);
      res.status(201).json(channel);
    } catch (error: any) {
      console.error('API Error POST /api/channels:', error);
      res.status(500).json({ error: error.message || 'Failed to create channel' });
    }
  });

  app.put('/api/channels/:code', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const code = String(req.params.code);
      await updateChannelRecord(uid, code, req.body);
      res.json({ ok: true });
    } catch (error: any) {
      console.error('API Error PUT /api/channels/:code:', error);
      res.status(500).json({ error: error.message || 'Failed to update channel' });
    }
  });

  app.delete('/api/channels/:code', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const code = String(req.params.code);
      await deleteChannelRecord(uid, code);
      res.json({ ok: true });
    } catch (error: any) {
      console.error('API Error DELETE /api/channels/:code:', error);
      res.status(500).json({ error: error.message || 'Failed to delete channel' });
    }
  });

  // 3. Content Items CRUD
  app.post('/api/content', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { item, generate7StagePipeline = true } = req.body;
      const result = await createContentRecord(uid, item, generate7StagePipeline);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('API Error POST /api/content:', error);
      res.status(500).json({ error: error.message || 'Failed to create content item' });
    }
  });

  app.put('/api/content/:code', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const code = String(req.params.code);
      await updateContentRecord(uid, code, req.body);
      res.json({ ok: true });
    } catch (error: any) {
      console.error('API Error PUT /api/content/:code:', error);
      res.status(500).json({ error: error.message || 'Failed to update content item' });
    }
  });

  app.delete('/api/content/:code', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const code = String(req.params.code);
      await deleteContentRecord(uid, code);
      res.json({ ok: true });
    } catch (error: any) {
      console.error('API Error DELETE /api/content/:code:', error);
      res.status(500).json({ error: error.message || 'Failed to delete content item' });
    }
  });

  // 4. Production Tasks CRUD
  app.post('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const task = await createTaskRecord(uid, req.body);
      res.status(201).json(task);
    } catch (error: any) {
      console.error('API Error POST /api/tasks:', error);
      res.status(500).json({ error: error.message || 'Failed to create production task' });
    }
  });

  app.put('/api/tasks/:code', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const code = String(req.params.code);
      await updateTaskRecord(uid, code, req.body);
      res.json({ ok: true });
    } catch (error: any) {
      console.error('API Error PUT /api/tasks/:code:', error);
      res.status(500).json({ error: error.message || 'Failed to update production task' });
    }
  });

  app.delete('/api/tasks/:code', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const code = String(req.params.code);
      await deleteTaskRecord(uid, code);
      res.json({ ok: true });
    } catch (error: any) {
      console.error('API Error DELETE /api/tasks/:code:', error);
      res.status(500).json({ error: error.message || 'Failed to delete production task' });
    }
  });

  // 5. Schedule Rotation Pointer Update
  app.put('/api/schedule/rotation', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { currentRotationChannelId } = req.body;
      await updateRotationPointer(uid, currentRotationChannelId);
      res.json({ ok: true });
    } catch (error: any) {
      console.error('API Error PUT /api/schedule/rotation:', error);
      res.status(500).json({ error: error.message || 'Failed to update rotation pointer' });
    }
  });

  // 6. Reset Workspace to Seed Data
  app.post('/api/workspace/reset', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'creator@creatordesk.pro';
      const name = req.user!.name;
      await resetUserWorkspace(uid);
      const workspace = await getUserWorkspace(uid, email, name);
      res.json(workspace);
    } catch (error: any) {
      console.error('API Error POST /api/workspace/reset:', error);
      res.status(500).json({ error: error.message || 'Failed to reset workspace' });
    }
  });

  // 7. Phase 6: Gemini AI Content Ideation & 7-Stage Scripting Endpoints
  app.post('/api/ai/brainstorm', async (req, res) => {
    try {
      const { channelName, category, persona = 'chill' } = req.body;
      const ideas = await brainstormIdeasWithGemini(channelName, category, persona);
      res.json({ ideas });
    } catch (error: any) {
      console.error('API Error POST /api/ai/brainstorm:', error);
      res.status(500).json({ error: error.message || 'Failed to generate ideas' });
    }
  });

  app.post('/api/ai/script', async (req, res) => {
    try {
      const { title, category, persona = 'chill' } = req.body;
      const script = await generateStageScriptWithGemini(title, category, persona);
      res.json({ script });
    } catch (error: any) {
      console.error('API Error POST /api/ai/script:', error);
      res.status(500).json({ error: error.message || 'Failed to generate stage script' });
    }
  });

  // 8. Phase 7: YouTube Data API v3 Sync & Stage 7 Publishing
  app.post('/api/youtube/sync', async (req, res) => {
    try {
      const { channelCode, channelName, currentSubscribers } = req.body;
      const syncResult = await syncYouTubeChannelMetrics(channelCode, channelName, currentSubscribers);
      res.json(syncResult);
    } catch (error: any) {
      console.error('API Error POST /api/youtube/sync:', error);
      res.status(500).json({ error: error.message || 'Failed to sync YouTube metrics' });
    }
  });

  app.post('/api/youtube/publish', async (req, res) => {
    try {
      const payload = req.body;
      const result = await publishToYouTubeStudio(payload);
      res.json(result);
    } catch (error: any) {
      console.error('API Error POST /api/youtube/publish:', error);
      res.status(500).json({ error: error.message || 'Failed to publish to YouTube' });
    }
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CreatorDesk server running on http://localhost:${PORT}`);
  });
}

startServer();
