import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { CreateFileModal, RenameFileModal } from './components/Modal';
import { useAutoSave } from './hooks/useAutoSave';
import {
  openDirectory,
  listExcalidrawFilesRecursive,
  readFile,
  saveFile,
  createFile,
  deleteFile,
  renameFile,
  getParentDirectory,
  flattenFiles,
} from './utils/fileSystem';
import { saveDirectoryHandle, getDirectoryHandle } from './utils/storage';
import type { FileInfo, FolderInfo, ExcalidrawFileData } from './types';
import './App.css';

function App() {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fileTree, setFileTree] = useState<FolderInfo | null>(null);
  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null);
  const [excalidrawData, setExcalidrawData] = useState<ExcalidrawFileData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FileInfo | null>(null);
  const [currentFolderPath, setCurrentFolderPath] = useState<string | null>(null);
  const [createInFolderPath, setCreateInFolderPath] = useState<string | null>(null);

  const currentDataRef = useRef<ExcalidrawFileData | null>(null);
  currentDataRef.current = excalidrawData;

  const currentFileRef = useRef<FileInfo | null>(null);
  currentFileRef.current = currentFile;

  // Load saved directory on mount
  useEffect(() => {
    const loadSavedDirectory = async () => {
      try {
        const handle = await getDirectoryHandle();
        if (handle) {
          setDirectoryHandle(handle);
          const tree = await listExcalidrawFilesRecursive(handle);
          setFileTree(tree);
        }
      } catch (error) {
        console.error('Failed to load saved directory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedDirectory();
  }, []);

  const handleSave = useCallback(async () => {
    if (currentFileRef.current && currentDataRef.current && isDirty) {
      try {
        await saveFile(currentFileRef.current.handle, currentDataRef.current);
        setIsDirty(false);
        console.log('File saved:', currentFileRef.current.name);
      } catch (error) {
        console.error('Failed to save file:', error);
        alert('Failed to save. Please try again.');
      }
    }
  }, [isDirty]);

  useAutoSave(isDirty, handleSave);

  const handleOpenDirectory = async () => {
    try {
      // Save current file before switching directory
      if (isDirty && currentFile && excalidrawData) {
        await saveFile(currentFile.handle, excalidrawData);
      }

      const handle = await openDirectory();
      setDirectoryHandle(handle);
      await saveDirectoryHandle(handle);

      const tree = await listExcalidrawFilesRecursive(handle);
      setFileTree(tree);
      setCurrentFile(null);
      setExcalidrawData(null);
      setIsDirty(false);
      setCurrentFolderPath(null);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to open directory:', error);
        alert('Failed to open directory');
      }
    }
  };

  const handleSelectFile = async (file: FileInfo) => {
    if (currentFile?.path === file.path) return;

    try {
      // Save current file before switching
      if (isDirty && currentFile && excalidrawData) {
        await saveFile(currentFile.handle, excalidrawData);
        setIsDirty(false);
      }

      const data = await readFile(file.handle);
      console.log('File loaded:', file.name, {
        elementsCount: data.elements?.length,
        hasAppState: !!data.appState,
        hasFiles: !!data.files,
      });
      setCurrentFile(file);
      setExcalidrawData(data);
      setIsDirty(false);
      // Update current folder to the file's parent folder
      setCurrentFolderPath(file.parentPath);
    } catch (error) {
      console.error('Failed to read file:', error);
      alert('Failed to read file');
    }
  };

  const handleSelectFolder = (folderPath: string | null) => {
    setCurrentFolderPath(folderPath);
  };

  const handleOpenCreateModal = (folderPath: string | null) => {
    if (!directoryHandle) {
      alert('Please open a folder first');
      return;
    }
    // Use the passed folder path, or fallback to current folder or root
    setCreateInFolderPath(folderPath || currentFolderPath || fileTree?.path || null);
    setIsCreateModalOpen(true);
  };

  const handleCreateFile = async (name: string) => {
    if (!directoryHandle || !fileTree) return;

    try {
      // Save current file before creating new one
      if (isDirty && currentFile && excalidrawData) {
        await saveFile(currentFile.handle, excalidrawData);
      }

      // Get the target directory handle
      const targetPath = createInFolderPath || fileTree.path;
      const targetDirHandle = await getParentDirectory(directoryHandle, targetPath);

      const fileHandle = await createFile(targetDirHandle, name);
      const tree = await listExcalidrawFilesRecursive(directoryHandle);
      setFileTree(tree);

      // Open the newly created file
      const files = flattenFiles(tree);
      const newFile = files.find((f) => f.handle === fileHandle);
      if (newFile) {
        const data = await readFile(newFile.handle);
        setCurrentFile(newFile);
        setExcalidrawData(data);
        setIsDirty(false);
        setCurrentFolderPath(newFile.parentPath);
      }
    } catch (error) {
      console.error('Failed to create file:', error);
      alert('Failed to create file');
    }
  };

  const handleDeleteFile = async (file: FileInfo) => {
    if (!directoryHandle) return;

    try {
      const parentHandle = await getParentDirectory(directoryHandle, file.parentPath);
      await deleteFile(parentHandle, file.name);
      const tree = await listExcalidrawFilesRecursive(directoryHandle);
      setFileTree(tree);

      if (currentFile?.path === file.path) {
        setCurrentFile(null);
        setExcalidrawData(null);
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  const handleOpenRenameModal = (file: FileInfo) => {
    setRenameTarget(file);
  };

  const handleRenameFile = async (newName: string) => {
    if (!directoryHandle || !renameTarget) return;

    try {
      // Save current file before renaming if it's the one being renamed
      if (isDirty && currentFile?.path === renameTarget.path && excalidrawData) {
        await saveFile(currentFile.handle, excalidrawData);
      }

      const parentHandle = await getParentDirectory(directoryHandle, renameTarget.parentPath);
      const newHandle = await renameFile(parentHandle, renameTarget.name, newName);

      // Refresh file tree
      const tree = await listExcalidrawFilesRecursive(directoryHandle);
      setFileTree(tree);

      // If the renamed file was the current file, update it
      if (currentFile?.path === renameTarget.path) {
        const files = flattenFiles(tree);
        const updatedFile = files.find((f) => f.handle === newHandle);
        if (updatedFile) {
          setCurrentFile(updatedFile);
        }
      }

      setIsDirty(false);
    } catch (error) {
      console.error('Failed to rename file:', error);
      alert('Failed to rename file');
    }
  };

  const handleEditorChange = useCallback(
    (
      elements: ExcalidrawFileData['elements'],
      appState: ExcalidrawFileData['appState'],
      files: ExcalidrawFileData['files']
    ) => {
      if (!currentFile) return;

      setExcalidrawData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          elements,
          appState,
          files,
        };
      });
      setIsDirty(true);
    },
    [currentFile]
  );

  if (isLoading) {
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        fileTree={fileTree}
        currentFile={currentFile}
        isDirty={isDirty}
        currentFolderPath={currentFolderPath}
        onSelectFile={handleSelectFile}
        onOpenDirectory={handleOpenDirectory}
        onCreateFile={handleOpenCreateModal}
        onDeleteFile={handleDeleteFile}
        onRenameFile={handleOpenRenameModal}
        onSelectFolder={handleSelectFolder}
      />
      <Editor fileKey={currentFile?.path ?? null} data={excalidrawData} onChange={handleEditorChange} />

      <CreateFileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateFile}
      />

      <RenameFileModal
        isOpen={renameTarget !== null}
        currentName={renameTarget?.name ?? ''}
        onClose={() => setRenameTarget(null)}
        onConfirm={handleRenameFile}
      />
    </div>
  );
}

export default App;
