const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');

app.once('ready', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    let win = new BrowserWindow({
        width: width,
        height: height,
        //resizable: false,
        maximizable: true,
        webPreferences: {
            plugins: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.setAspectRatio(16 / 9);
    win.loadFile('src/layout.html');
    win.setMaximizable (true)
});