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
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    click: () => {
                        console.log('New File');
                    }
                },
                {
                    label: 'Open new PDF',
                    click: () => {
                        win.webContents.send('open-file_pdf');
                    }
                },
                {
                    label: 'Save',
                    click: () => {
                        win.webContents.send('save-file');
                    }
                },
            ]
        },
    ];

    // Create the menu with the template
    const menu = Menu.buildFromTemplate(menuTemplate);

    // Set the application's menu
    Menu.setApplicationMenu(menu);
    win.webContents.openDevTools();

});