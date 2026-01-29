import '../types';
import type { FileInfo, FolderInfo, ExcalidrawFileData } from '../types';

export async function openDirectory(): Promise<FileSystemDirectoryHandle> {
  return await window.showDirectoryPicker({ mode: 'readwrite' });
}

// Recursively list all excalidraw files and folders
export async function listExcalidrawFilesRecursive(
  dirHandle: FileSystemDirectoryHandle,
  parentPath: string = ''
): Promise<FolderInfo> {
  const currentPath = parentPath ? `${parentPath}/${dirHandle.name}` : dirHandle.name;
  const children: (FileInfo | FolderInfo)[] = [];

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.excalidraw')) {
      children.push({
        name: entry.name.replace('.excalidraw', ''),
        handle: entry as FileSystemFileHandle,
        path: `${currentPath}/${entry.name}`,
        parentPath: currentPath,
      });
    } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
      const subDirHandle = await dirHandle.getDirectoryHandle(entry.name);
      const subFolder = await listExcalidrawFilesRecursive(subDirHandle, currentPath);
      // Only include folders that have excalidraw files (directly or in subfolders)
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
    name: dirHandle.name,
    handle: dirHandle,
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

// Flat list for backward compatibility
export async function listExcalidrawFiles(dirHandle: FileSystemDirectoryHandle): Promise<FileInfo[]> {
  const rootFolder = await listExcalidrawFilesRecursive(dirHandle);
  return flattenFiles(rootFolder);
}

// Flatten all files from folder tree
export function flattenFiles(folder: FolderInfo): FileInfo[] {
  const files: FileInfo[] = [];

  for (const child of folder.children) {
    if ('children' in child) {
      files.push(...flattenFiles(child));
    } else {
      files.push(child);
    }
  }

  return files;
}

// Get total file count in folder tree
export function countFiles(folder: FolderInfo): number {
  let count = 0;
  for (const child of folder.children) {
    if ('children' in child) {
      count += countFiles(child);
    } else {
      count++;
    }
  }
  return count;
}

// Search files by name
export function searchFiles(folder: FolderInfo, query: string): FileInfo[] {
  const results: FileInfo[] = [];
  const lowerQuery = query.toLowerCase();

  function search(f: FolderInfo) {
    for (const child of f.children) {
      if ('children' in child) {
        search(child);
      } else {
        if (child.name.toLowerCase().includes(lowerQuery)) {
          results.push(child);
        }
      }
    }
  }

  search(folder);
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export async function readFile(fileHandle: FileSystemFileHandle): Promise<ExcalidrawFileData> {
  const file = await fileHandle.getFile();
  const content = await file.text();
  return JSON.parse(content);
}

export async function saveFile(fileHandle: FileSystemFileHandle, data: ExcalidrawFileData): Promise<void> {
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

export async function createFile(
  dirHandle: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemFileHandle> {
  const fileName = name.endsWith('.excalidraw') ? name : `${name}.excalidraw`;
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });

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

  await saveFile(fileHandle, initialData);
  return fileHandle;
}

export async function deleteFile(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<void> {
  const fullName = fileName.endsWith('.excalidraw') ? fileName : `${fileName}.excalidraw`;
  await dirHandle.removeEntry(fullName);
}

// Rename a file
export async function renameFile(
  parentDirHandle: FileSystemDirectoryHandle,
  oldName: string,
  newName: string
): Promise<FileSystemFileHandle> {
  const oldFullName = oldName.endsWith('.excalidraw') ? oldName : `${oldName}.excalidraw`;
  const newFullName = newName.endsWith('.excalidraw') ? newName : `${newName}.excalidraw`;

  // Read the old file content
  const oldHandle = await parentDirHandle.getFileHandle(oldFullName);
  const content = await readFile(oldHandle);

  // Create new file with the content
  const newHandle = await parentDirHandle.getFileHandle(newFullName, { create: true });
  await saveFile(newHandle, content);

  // Delete the old file
  await parentDirHandle.removeEntry(oldFullName);

  return newHandle;
}

// Get parent directory handle from path
export async function getParentDirectory(
  rootHandle: FileSystemDirectoryHandle,
  parentPath: string
): Promise<FileSystemDirectoryHandle> {
  if (!parentPath || parentPath === rootHandle.name) {
    return rootHandle;
  }

  const parts = parentPath.split('/').filter(Boolean);
  // Skip the first part if it's the root name
  if (parts[0] === rootHandle.name) {
    parts.shift();
  }

  let currentHandle = rootHandle;
  for (const part of parts) {
    currentHandle = await currentHandle.getDirectoryHandle(part);
  }

  return currentHandle;
}
