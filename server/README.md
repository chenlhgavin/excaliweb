# ExcaliWeb - Backend Edition

A local Excalidraw file manager with backend support for better browser compatibility.

## Architecture

```
┌─────────────┐         HTTP API        ┌─────────────┐
│   Frontend  │  ←─────────────────→    │   Backend   │
│  (React)    │   JSON Exchange          │  (Express)  │
└─────────────┘                          └─────────────┘
                                                ↓
                                         ┌─────────────┐
                                         │ File System │
                                         │ (.excalidraw)│
                                         └─────────────┘
```

## Getting Started

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Start Development Servers

#### Option A: Start both servers together (recommended)
```bash
npm run dev:all
```

#### Option B: Start servers separately

Terminal 1 - Backend:
```bash
npm run dev:server
# Server will run on http://localhost:3001
```

Terminal 2 - Frontend:
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

### 3. Select Workspace

When you first open the app:
1. Click "Open Folder" or wait for the workspace modal to appear
2. Enter the **absolute path** to your excalidraw files directory on the server
   - Example: `/home/ubuntu/my-drawings`
   - The directory must exist on the server's file system
3. Click "Select"

## Features

- ✅ **Universal Browser Compatibility** - Works on all modern browsers
- ✅ **File Management** - Create, rename, delete excalidraw files
- ✅ **Folder Support** - Organize files in nested folders
- ✅ **Auto-Save** - Changes are automatically saved
- ✅ **Search** - Quickly find files by name
- ✅ **No File System API Required** - Uses HTTP API instead

## API Endpoints

### Workspace
- `POST /api/workspace/select` - Set workspace directory
- `GET /api/workspace` - Get current workspace file tree

### Files
- `GET /api/files` - Get file tree
- `GET /api/files/:fileId` - Get file content
- `PUT /api/files/:fileId` - Save file content
- `POST /api/files` - Create new file
- `DELETE /api/files/:fileId` - Delete file
- `PATCH /api/files/:fileId/rename` - Rename file

## Project Structure

```
excaliweb/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── utils/
│   │   ├── api.ts         # API client
│   │   └── fileTreeUtils.ts
│   └── App.tsx
├── server/                 # Backend source
│   └── src/
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── middleware/     # Express middleware
│       └── server.ts       # Entry point
└── package.json
```

## Environment Variables

Create a `.env` file in the server directory (optional):

```env
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Building for Production

```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Start production server
cd server && npm start
```

## Security Notes

- The backend validates all file paths to prevent directory traversal attacks
- Only `.excalidraw` files are accessible through the API
- File operations are restricted to the selected workspace directory

## Troubleshooting

### Cannot connect to server
- Ensure the backend server is running on port 3001
- Check that no firewall is blocking the connection

### Workspace not found
- Verify the path exists on the server's file system
- Use absolute paths, not relative paths
- Ensure the server process has read/write permissions

### Files not loading
- Check the browser console for API errors
- Verify the workspace path is correctly set
- Ensure `.excalidraw` files are valid JSON

## License

MIT
