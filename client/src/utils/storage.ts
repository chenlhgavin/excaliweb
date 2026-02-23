// Storage utilities for workspace path

const WORKSPACE_PATH_KEY = 'excaliweb:workspacePath';

export function saveWorkspacePath(path: string): void {
  localStorage.setItem(WORKSPACE_PATH_KEY, path);
}

export function getWorkspacePath(): string | null {
  return localStorage.getItem(WORKSPACE_PATH_KEY);
}

export function clearWorkspacePath(): void {
  localStorage.removeItem(WORKSPACE_PATH_KEY);
}
