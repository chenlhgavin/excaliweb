export interface FileInfo {
  name: string;
  path: string; // Full path relative to root directory
  parentPath: string; // Path to parent folder
}

export interface FolderInfo {
  name: string;
  path: string;
  parentPath: string;
  children: (FileInfo | FolderInfo)[];
  isExpanded?: boolean;
}

export type FileTreeItem = FileInfo | FolderInfo;

export function isFolder(item: FileTreeItem): item is FolderInfo {
  return 'children' in item;
}

export interface ExcalidrawFileData {
  type: "excalidraw";
  version: number;
  source: string;
  elements: readonly any[];
  appState?: Record<string, any>;
  files?: Record<string, any>;
}

export {};
