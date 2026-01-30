// Utility functions for file tree operations
import type { FileInfo, FolderInfo } from './api';

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
