import express from 'express';
import cors from 'cors';
import workspaceRoutes from './routes/workspace.js';
import filesRoutes from './routes/files.js';
import filesystemRoutes from './routes/filesystem.js';
import { errorHandler, requestLogger } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' })); // Support large excalidraw files
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/workspace', workspaceRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/filesystem', filesystemRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ExcaliWeb server running on http://localhost:${PORT}`);
  console.log(`📁 Ready to serve files from workspace`);
});
