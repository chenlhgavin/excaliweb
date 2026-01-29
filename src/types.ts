export interface FileInfo {
  name: string;
  handle: FileSystemFileHandle;
  path: string; // Full path relative to root directory
  parentPath: string; // Path to parent folder
}

export interface FolderInfo {
  name: string;
  handle: FileSystemDirectoryHandle;
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

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  }

  interface FileSystemFileHandle {
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
    queryPermission(options?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission(options?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: string | BufferSource | Blob): Promise<void>;
    close(): Promise<void>;
  }
}

export {};
