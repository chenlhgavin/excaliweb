# ExcaliWeb

A local whiteboard file manager for [Excalidraw](https://excalidraw.com/) files. Browse, edit, and manage your `.excalidraw` files directly from your local filesystem.

![ExcaliWeb Screenshot](docs/screenshot.png)

## Features

- **Local File Management** - Open any folder containing `.excalidraw` files
- **Recursive File Tree** - Navigate nested folder structures with ease
- **Real-time Editing** - Full Excalidraw editor integration
- **Auto-save** - Changes are automatically saved every 10 seconds
- **Quick Save** - Press `Ctrl+S` to save instantly
- **Search** - Filter files by name when browsing
- **Create & Rename** - Create new files and rename existing ones
- **Delete Files** - Remove files you no longer need
- **Persistent Sessions** - Remembers your last opened directory

## Getting Started

### Prerequisites

- Node.js 18+
- A modern browser with [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) support (Chrome, Edge, Opera)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/excaliweb.git
cd excaliweb

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Open a Folder** - Click "Open Folder" to select a directory containing your `.excalidraw` files
2. **Select a File** - Click on any file in the sidebar to open it in the editor
3. **Edit** - Use the full Excalidraw editor to create and modify drawings
4. **Save** - Your changes are auto-saved, or press `Ctrl+S` to save immediately

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current file |
| `Esc` | Close modal dialogs |

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Excalidraw** - Whiteboard editor component
- **File System Access API** - Local file operations
- **Playwright** - End-to-end testing

## Project Structure

```
excaliweb/
├── public/
│   └── favicon.svg          # App icon
├── src/
│   ├── components/
│   │   ├── Editor.tsx       # Excalidraw editor wrapper
│   │   ├── Modal.tsx        # Create/Rename modals
│   │   └── Sidebar.tsx      # File tree sidebar
│   ├── hooks/
│   │   └── useAutoSave.ts   # Auto-save hook
│   ├── utils/
│   │   ├── fileSystem.ts    # File operations
│   │   └── storage.ts       # IndexedDB persistence
│   ├── App.tsx              # Main application
│   ├── App.css              # Global styles
│   └── types.ts             # TypeScript types
├── tests/
│   └── app.spec.ts          # Playwright tests
└── package.json
```

## Browser Compatibility

ExcaliWeb requires the File System Access API, which is currently supported in:

- Google Chrome 86+
- Microsoft Edge 86+
- Opera 72+

Firefox and Safari do not yet support this API.

## Development

### Run Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npx playwright test

# Run tests with UI
npx playwright test --ui
```

### Lint

```bash
npm run lint
```

## License

MIT

## Acknowledgments

- [Excalidraw](https://excalidraw.com/) - The amazing whiteboard tool
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
