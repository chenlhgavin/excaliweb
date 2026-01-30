import { Router, Request, Response } from 'express';
import {
  decodeFileId,
  encodeFileId,
  readFile,
  saveFile,
  createFile,
  deleteFile,
  renameFile,
  getFileTree,
} from '../services/fileSystem.js';
import type {
  GetFileContentResponse,
  SaveFileRequest,
  CreateFileRequest,
  CreateFileResponse,
  RenameFileRequest,
  RenameFileResponse,
  ErrorResponse,
} from '../types/index.js';

const router = Router();

// GET /api/files - Get file tree
router.get('/', async (req: Request, res: Response) => {
  try {
    const rootFolder = await getFileTree();
    res.json({ rootFolder });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({
      error: 'Failed to get files',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET /api/files/:fileId - Get file content
router.get('/:fileId', async (req: Request, res: Response<GetFileContentResponse | ErrorResponse>) => {
  try {
    const { fileId } = req.params;
    const relativePath = decodeFileId(fileId);

    const content = await readFile(relativePath);
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({
      error: 'Failed to read file',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// PUT /api/files/:fileId - Save file content
router.put('/:fileId', async (req: Request<{ fileId: string }, {}, SaveFileRequest>, res: Response) => {
  try {
    const { fileId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Missing content' });
      return;
    }

    const relativePath = decodeFileId(fileId);
    await saveFile(relativePath, content);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({
      error: 'Failed to save file',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// POST /api/files - Create new file
router.post('/', async (req: Request<{}, {}, CreateFileRequest>, res: Response<CreateFileResponse | ErrorResponse>) => {
  try {
    const { name, parentPath } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Invalid file name' });
      return;
    }

    if (!parentPath || typeof parentPath !== 'string') {
      res.status(400).json({ error: 'Invalid parent path' });
      return;
    }

    const file = await createFile(name, parentPath);
    const fileId = encodeFileId(file.path);

    res.json({ fileId, file });
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({
      error: 'Failed to create file',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// DELETE /api/files/:fileId - Delete file
router.delete('/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const relativePath = decodeFileId(fileId);

    await deleteFile(relativePath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      error: 'Failed to delete file',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// PATCH /api/files/:fileId/rename - Rename file
router.patch('/:fileId/rename', async (req: Request<{ fileId: string }, {}, RenameFileRequest>, res: Response<RenameFileResponse | ErrorResponse>) => {
  try {
    const { fileId } = req.params;
    const { newName } = req.body;

    if (!newName || typeof newName !== 'string') {
      res.status(400).json({ error: 'Invalid file name' });
      return;
    }

    const oldRelativePath = decodeFileId(fileId);
    const file = await renameFile(oldRelativePath, newName);
    const newFileId = encodeFileId(file.path);

    res.json({ fileId: newFileId, file });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({
      error: 'Failed to rename file',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
