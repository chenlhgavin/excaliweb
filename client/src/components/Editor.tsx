import { useRef, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { ExcalidrawFileData } from '../types';
import './Editor.css';

interface EditorProps {
  fileKey: string | null;
  data: ExcalidrawFileData | null;
  onChange: (elements: ExcalidrawFileData['elements'], appState: ExcalidrawFileData['appState'], files: ExcalidrawFileData['files']) => void;
}

// Fields that should not be passed to Excalidraw from saved files
const EXCLUDED_APP_STATE_KEYS = new Set([
  'collaborators',
  'currentItemFontFamily',
  'currentItemFontSize',
  'currentItemTextAlign',
  'cursorButton',
  'editingGroupId',
  'editingLinearElement',
  'isBindingEnabled',
  'isLoading',
  'isResizing',
  'isRotating',
  'lastPointerDownWith',
  'multiElement',
  'name',
  'newElement',
  'openDialog',
  'openMenu',
  'openPopup',
  'openSidebar',
  'pasteDialog',
  'pendingImageElementId',
  'previousSelectedElementIds',
  'resizingElement',
  'scrolledOutside',
  'selectedElementIds',
  'selectedGroupIds',
  'selectionElement',
  'shouldCacheIgnoreZoom',
  'showStats',
  'startBoundElement',
  'suggestedBindings',
  'toastMessage',
]);

function cleanAppState(appState: Record<string, any> | undefined): Record<string, any> {
  if (!appState) return { viewBackgroundColor: '#ffffff' };

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(appState)) {
    if (!EXCLUDED_APP_STATE_KEYS.has(key)) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

interface ExcalidrawWrapperProps {
  data: ExcalidrawFileData;
  onChange: (elements: readonly any[], appState: any, files: any) => void;
}

// Separate component that receives clean data
function ExcalidrawWrapper({ data, onChange }: ExcalidrawWrapperProps) {
  const isFirstChange = useRef(true);

  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      // Skip the very first onChange call which happens on mount
      if (isFirstChange.current) {
        isFirstChange.current = false;
        return;
      }
      onChange(elements, appState, files);
    },
    [onChange]
  );

  const cleanedAppState = cleanAppState(data.appState);

  return (
    <Excalidraw
      initialData={{
        elements: data.elements,
        appState: cleanedAppState,
        files: data.files,
      }}
      onChange={handleChange}
    />
  );
}

// Welcome illustration
const WelcomeIllustration = () => (
  <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Canvas/Board */}
    <rect x="30" y="20" width="140" height="100" rx="8" fill="#f8f8f8" stroke="#e5e5e5" strokeWidth="2"/>

    {/* Drawing elements */}
    <path d="M50 90 L70 50 L90 70 L120 40 L150 90" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="65" cy="60" r="12" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2"/>
    <rect x="100" y="55" width="30" height="25" rx="4" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="2"/>
    <circle cx="140" cy="70" r="8" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"/>

    {/* Cursor */}
    <path d="M155 95 L160 110 L165 105 L170 115" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

    {/* Decorative dots */}
    <circle cx="45" cy="35" r="3" fill="#e5e5e5"/>
    <circle cx="55" cy="35" r="3" fill="#e5e5e5"/>
    <circle cx="65" cy="35" r="3" fill="#e5e5e5"/>

    {/* Sparkles */}
    <path d="M25 60 L28 55 L31 60 L28 65 Z" fill="#f59e0b"/>
    <path d="M175 45 L177 42 L179 45 L177 48 Z" fill="#6366f1"/>
    <path d="M180 85 L182 82 L184 85 L182 88 Z" fill="#8b5cf6"/>
  </svg>
);

// Keyboard shortcut hint
const KeyboardHint = ({ keys, action }: { keys: string[]; action: string }) => (
  <div className="keyboard-hint">
    <div className="keyboard-keys">
      {keys.map((key, i) => (
        <span key={i}>
          <kbd className="keyboard-key">{key}</kbd>
          {i < keys.length - 1 && <span className="keyboard-plus">+</span>}
        </span>
      ))}
    </div>
    <span className="keyboard-action">{action}</span>
  </div>
);

export function Editor({ fileKey, data, onChange }: EditorProps) {
  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      // Only save specific appState fields that we want to persist
      const persistedAppState = {
        viewBackgroundColor: appState.viewBackgroundColor,
        gridSize: appState.gridSize,
        gridStep: appState.gridStep,
        zenModeEnabled: appState.zenModeEnabled,
      };
      onChange(elements, persistedAppState, files);
    },
    [onChange]
  );

  if (!data || !fileKey) {
    return (
      <div className="editor-empty">
        <div className="welcome-container">
          <WelcomeIllustration />
          <div className="welcome-content">
            <h2 className="welcome-title">Welcome to ExcaliWeb</h2>
            <p className="welcome-subtitle">Your local whiteboard file manager</p>
            <div className="welcome-steps">
              <div className="welcome-step">
                <span className="step-number">1</span>
                <span className="step-text">Open a folder containing .excalidraw files</span>
              </div>
              <div className="welcome-step">
                <span className="step-number">2</span>
                <span className="step-text">Select a file to start editing</span>
              </div>
              <div className="welcome-step">
                <span className="step-number">3</span>
                <span className="step-text">Your changes are saved automatically</span>
              </div>
            </div>
          </div>
          <div className="welcome-shortcuts">
            <h3 className="shortcuts-title">Keyboard Shortcuts</h3>
            <div className="shortcuts-list">
              <KeyboardHint keys={['Ctrl', 'S']} action="Save" />
              <KeyboardHint keys={['Esc']} action="Close modal" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <ExcalidrawWrapper
        key={fileKey}
        data={data}
        onChange={handleChange}
      />
    </div>
  );
}
