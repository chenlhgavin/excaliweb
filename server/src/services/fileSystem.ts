import { promises as fs } from 'fs';
import path from 'path';
import type { FileInfo, FolderInfo, ExcalidrawFileData } from '../types/index.js';

// Workspace state (in production, use session or database)
let currentWorkspacePath: string | null = null;

// Set the current workspace path
export function setWorkspacePath(workspacePath: string): void {
  currentWorkspacePath = workspacePath;
}

// Get the current workspace path
export function getWorkspacePath(): string | null {
  return currentWorkspacePath;
}

// Validate path is within workspace (prevent directory traversal attacks)
function validatePath(relativePath: string): string {
  if (!currentWorkspacePath) {
    throw new Error('No workspace selected');
  }

  const absolutePath = path.join(currentWorkspacePath, relativePath);
  const normalizedPath = path.normalize(absolutePath);

  // Ensure the path is within the workspace
  if (!normalizedPath.startsWith(path.normalize(currentWorkspacePath))) {
    throw new Error('Invalid path: outside workspace');
  }

  return normalizedPath;
}

// Encode path to fileId (base64)
export function encodeFileId(relativePath: string): string {
  return Buffer.from(relativePath).toString('base64url');
}

// Decode fileId to path
export function decodeFileId(fileId: string): string {
  return Buffer.from(fileId, 'base64url').toString('utf-8');
}

// Check if a file/directory exists
async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Recursively list all excalidraw files and folders
export async function listExcalidrawFilesRecursive(
  dirPath: string,
  parentPath: string = ''
): Promise<FolderInfo> {
  const dirName = path.basename(dirPath);
  const currentPath = parentPath ? `${parentPath}/${dirName}` : dirName;
  const children: (FileInfo | FolderInfo)[] = [];

  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.excalidraw')) {
      children.push({
        name: entry.name.replace('.excalidraw', ''),
        path: `${currentPath}/${entry.name}`,
        parentPath: currentPath,
      });
    } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const subDirPath = path.join(dirPath, entry.name);
      const subFolder = await listExcalidrawFilesRecursive(subDirPath, currentPath);
      // Only include folders that have excalidraw files
      if (hasExcalidrawFiles(subFolder)) {
        children.push(subFolder);
      }
    }
  }

  // Sort: folders first, then files, alphabetically
  children.sort((a, b) => {
    const aIsFolder = 'children' in a;
    const bIsFolder = 'children' in b;
    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;
    return a.name.localeCompare(b.name);
  });

  return {
    name: dirName,
    path: currentPath,
    parentPath,
    children,
    isExpanded: parentPath === '', // Root folder is expanded by default
  };
}

// Check if a folder has any excalidraw files (recursively)
function hasExcalidrawFiles(folder: FolderInfo): boolean {
  for (const child of folder.children) {
    if ('children' in child) {
      if (hasExcalidrawFiles(child)) return true;
    } else {
      return true;
    }
  }
  return false;
}

// Read a file
export async function readFile(relativePath: string): Promise<ExcalidrawFileData> {
  const absolutePath = validatePath(relativePath);

  if (!(await exists(absolutePath))) {
    throw new Error('File not found');
  }

  const content = await fs.readFile(absolutePath, 'utf-8');
  return JSON.parse(content);
}

// Save a file
export async function saveFile(relativePath: string, data: ExcalidrawFileData): Promise<void> {
  const absolutePath = validatePath(relativePath);
  await fs.writeFile(absolutePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Create a new file
export async function createFile(name: string, parentPath: string): Promise<FileInfo> {
  const fileName = name.endsWith('.excalidraw') ? name : `${name}.excalidraw`;
  const relativePath = parentPath === currentWorkspacePath ? fileName : `${parentPath}/${fileName}`;
  const absolutePath = validatePath(relativePath);

  if (await exists(absolutePath)) {
    throw new Error('File already exists');
  }

  const initialData: ExcalidrawFileData = {
    type: "excalidraw",
    version: 2,
    source: "excaliweb",
    elements: [],
    appState: {
      viewBackgroundColor: "#ffffff",
    },
    files: {},
  };

  await fs.writeFile(absolutePath, JSON.stringify(initialData, null, 2), 'utf-8');

  // Get parent directory name for path construction
  const parentDirName = path.basename(path.dirname(absolutePath));
  const workspaceName = path.basename(currentWorkspacePath!);
  const fileParentPath = parentPath === workspaceName ? workspaceName : parentPath;

  return {
    name: name.replace('.excalidraw', ''),
    path: `${fileParentPath}/${fileName}`,
    parentPath: fileParentPath,
  };
}

// Delete a file
export async function deleteFile(relativePath: string): Promise<void> {
  const absolutePath = validatePath(relativePath);

  if (!(await exists(absolutePath))) {
    throw new Error('File not found');
  }

  await fs.unlink(absolutePath);
}

// Rename a file
export async function renameFile(oldRelativePath: string, newName: string): Promise<FileInfo> {
  const oldAbsolutePath = validatePath(oldRelativePath);

  if (!(await exists(oldAbsolutePath))) {
    throw new Error('File not found');
  }

  const fileName = newName.endsWith('.excalidraw') ? newName : `${newName}.excalidraw`;
  const dirPath = path.dirname(oldAbsolutePath);
  const newAbsolutePath = path.join(dirPath, fileName);

  if (await exists(newAbsolutePath)) {
    throw new Error('A file with this name already exists');
  }

  await fs.rename(oldAbsolutePath, newAbsolutePath);

  // Construct new file info
  const parentDirPath = path.dirname(oldRelativePath);
  const newRelativePath = path.join(parentDirPath, fileName);

  return {
    name: newName.replace('.excalidraw', ''),
    path: newRelativePath,
    parentPath: parentDirPath,
  };
}

// Get file tree for current workspace
export async function getFileTree(): Promise<FolderInfo | null> {
  if (!currentWorkspacePath) {
    return null;
  }

  if (!(await exists(currentWorkspacePath))) {
    throw new Error('Workspace path does not exist');
  }

  return await listExcalidrawFilesRecursive(currentWorkspacePath);
}
