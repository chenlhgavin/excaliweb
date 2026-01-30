import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const router = Router();

interface DirectoryItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isAccessible: boolean;
}

interface ListDirectoriesResponse {
  currentPath: string;
  parentPath: string | null;
  directories: DirectoryItem[];
}

// Check if user has read permissions
async function checkAccess(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

// GET /api/filesystem/list - List directories
router.get('/list', async (req: Request, res: Response<ListDirectoriesResponse | { error: string }>) => {
  try {
    const requestedPath = req.query.path as string;

    // Default to user's home directory
    let currentPath = requestedPath || os.homedir();

    // Normalize and resolve the path
    currentPath = path.resolve(currentPath);

    // Check if directory exists and is accessible
    const accessible = await checkAccess(currentPath);
    if (!accessible) {
      res.status(403).json({ error: 'Cannot access directory' });
      return;
    }

    const stat = await fs.stat(currentPath);
    if (!stat.isDirectory()) {
      res.status(400).json({ error: 'Path is not a directory' });
      return;
    }

    // Read directory contents
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    // Filter and map to directories only
    const directoryPromises = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(async (entry) => {
        const fullPath = path.join(currentPath, entry.name);
        const isAccessible = await checkAccess(fullPath);

        return {
          name: entry.name,
          path: fullPath,
          isDirectory: true,
          isAccessible,
        };
      });

    const directories = await Promise.all(directoryPromises);

    // Sort: accessible directories first, then alphabetically
    directories.sort((a, b) => {
      if (a.isAccessible && !b.isAccessible) return -1;
      if (!a.isAccessible && b.isAccessible) return 1;
      return a.name.localeCompare(b.name);
    });

    // Get parent path
    const parentPath = currentPath === '/' ? null : path.dirname(currentPath);

    res.json({
      currentPath,
      parentPath,
      directories,
    });
  } catch (error) {
    console.error('Error listing directories:', error);
    res.status(500).json({
      error: 'Failed to list directories',
    });
  }
});

// GET /api/filesystem/home - Get user's home directory
router.get('/home', (req: Request, res: Response) => {
  res.json({ path: os.homedir() });
});

// GET /api/filesystem/common - Get common directories
router.get('/common', async (req: Request, res: Response) => {
  const homeDir = os.homedir();
  const commonDirs = [
    { name: 'Home', path: homeDir },
    { name: 'Documents', path: path.join(homeDir, 'Documents') },
    { name: 'Desktop', path: path.join(homeDir, 'Desktop') },
    { name: 'Downloads', path: path.join(homeDir, 'Downloads') },
  ];

  // Check which directories exist
  const validDirs = await Promise.all(
    commonDirs.map(async (dir) => {
      const accessible = await checkAccess(dir.path);
      return accessible ? dir : null;
    })
  );

  res.json({
    directories: validDirs.filter(Boolean),
  });
});

export default router;
