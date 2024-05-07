const { app, BrowserWindow } = require('electron');

app.once('ready', () => {
    let win = new BrowserWindow({
        width: 1800,
        height: 800,
        webPreferences: {
            plugins: true
        }
    });
    win.loadFile('src/layout.html');
});

