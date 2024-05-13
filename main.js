const { app, BrowserWindow, Menu, ipcMain } = require('electron');

app.once('ready', () => {
    let win = new BrowserWindow({
        width: 1800,
        height: 800,
        webPreferences: {
            plugins: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    });


    win.loadFile('src/layout.html');
});