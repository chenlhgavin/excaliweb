import { Router, Request, Response } from 'express';
import { setWorkspacePath, getFileTree } from '../services/fileSystem.js';
import type { SelectWorkspaceRequest, SelectWorkspaceResponse, ErrorResponse } from '../types/index.js';

const router = Router();

// POST /api/workspace/select - Set workspace path
router.post('/select', async (req: Request<{}, {}, SelectWorkspaceRequest>, res: Response<SelectWorkspaceResponse | ErrorResponse>) => {
  try {
    const { path } = req.body;

    if (!path || typeof path !== 'string') {
      res.status(400).json({ error: 'Invalid path' });
      return;
    }

    // Set workspace path
    setWorkspacePath(path);

    // Get file tree
    const rootFolder = await getFileTree();

    if (!rootFolder) {
      res.status(500).json({ error: 'Failed to read workspace' });
      return;
    }

    res.json({
      workspacePath: path,
      rootFolder,
    });
  } catch (error) {
    console.error('Error selecting workspace:', error);
    res.status(500).json({
      error: 'Failed to select workspace',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET /api/workspace - Get current workspace info
router.get('/', async (req: Request, res: Response) => {
  try {
    const rootFolder = await getFileTree();
    res.json({ rootFolder });
  } catch (error) {
    console.error('Error getting workspace:', error);
    res.status(500).json({
      error: 'Failed to get workspace',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
