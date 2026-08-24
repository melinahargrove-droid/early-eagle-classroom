const { app, BrowserWindow } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const HOST = '127.0.0.1';
const PORT = 47831;
let server;
let mainWindow;

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({
    '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
    '.json':'application/json; charset=utf-8', '.webmanifest':'application/manifest+json', '.png':'image/png', '.jpg':'image/jpeg',
    '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.mp3':'audio/mpeg', '.m4a':'audio/mp4',
    '.wav':'audio/wav', '.mp4':'video/mp4'
  })[ext] || 'application/octet-stream';
}

function startServer() {
  const root = path.join(__dirname, 'app');
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      let reqPath = decodeURIComponent(url.parse(req.url).pathname || '/');
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.normalize(path.join(root, reqPath));
      if (!filePath.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-store' });
        fs.createReadStream(filePath).pipe(res);
      });
    });
    server.once('error', err => {
      if (err && err.code === 'EADDRINUSE') {
        reject(new Error('Early Eagle Companion local port is already in use. Close any other Companion window and try again.'));
      } else reject(err);
    });
    server.listen(PORT, HOST, () => resolve());
  });
}

async function createWindow() {
  try {
    await startServer();
    mainWindow = new BrowserWindow({
      width: 1600,
      height: 900,
      minWidth: 1024,
      minHeight: 650,
      autoHideMenuBar: true,
      backgroundColor: '#d9e4e7',
      webPreferences: {
        contextIsolation: true,
        sandbox: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });
    mainWindow.on('closed', () => { mainWindow = null; });
    mainWindow.maximize();
    await mainWindow.loadURL(`http://${HOST}:${PORT}/index.html`);
  } catch (err) {
    console.error('Early Eagle Companion failed to start:', err);
    app.quit();
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && !server) createWindow();
});
