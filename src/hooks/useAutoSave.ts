import { useCallback, useEffect, useRef } from 'react';

export function useAutoSave(
  isDirty: boolean,
  onSave: () => Promise<void>,
  intervalMs: number = 10000
) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  const save = useCallback(async () => {
    if (isDirty) {
      await saveRef.current();
    }
  }, [isDirty]);

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      save();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [save, intervalMs]);

  // Ctrl+S handler - use capture phase to intercept before Excalidraw
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        save();
      }
    };

    // Use capture phase to intercept the event before Excalidraw
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [save]);

  // Before unload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        save();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, save]);

  return save;
}
