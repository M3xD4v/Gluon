const {
    app,
    BrowserWindow,
    Menu,
    screen,
    ipcMain,
    dialog
} = require('electron');
var fs = require('fs');
app.once('ready', () => {
    const {
        width,
        height
    } = screen.getPrimaryDisplay().workAreaSize;

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
    win.setMaximizable(true)

    ipcMain.on('open_dialog_project', (event) => {
        dialog.showOpenDialog(win, {
            filters: [{
                name: 'Gluon',
                extensions: ['gluon']
            }]
        }).then(result => {
            let path = result.filePaths[0];
            fs.readFile(path, 'utf8', function (err, data) {
                if (err) return console.log(err);
                event.sender.send('project_open', data);
            });
        }).catch(err => {
            console.log(err);
        });
    });

    ipcMain.on('open_dialog_saveproject', (event, data) => {
        dialog.showSaveDialog(win, {
            filters: [{
                name: 'Gluon',
                extensions: ['gluon']
            }]
        }).then(result => {
            let path = result.filePath
            fs.writeFile(path, data, function (err) {
                if (err) return console.log(err);
            });
        });
    });

    ipcMain.on('importpdf', (event) => {
        dialog.showOpenDialog(win, {
            filters: [{
                name: 'PDF',
                extensions: ['pdf']
            }]
        }).then(result => {
            let path = result.filePaths[0];
            fs.readFile(path, function (err, data) {
                if (err) return console.log(err);
                event.sender.send('importpdf_response', data);
            });
        }).catch(err => {
            console.log(err);
        });
    });

    ipcMain.on('exportpdf', (event, data) => {
        dialog.showSaveDialog(win, {
            filters: [{
                name: 'pdf',
                extensions: ['pdf']
            }]
        }).then(result => {
            let path = result.filePath
            console.log(data);
            fs.writeFile(path, data, function (err) {
                if (err) return console.log(err);
            });
        });
    });
    ipcMain.on('exportsvg', (event, data) => {
        dialog.showSaveDialog(win, {
            filters: [{
                name: 'SVG',
                extensions: ['svg']
            }]
        }).then(result => {
            let path = result.filePath
            console.log(data);
            fs.writeFile(path, data, function (err) {
                if (err) return console.log(err);
            });
        });
    });
    const menuTemplate = [{
            label: 'File',
            submenu: [{
                    label: 'New',
                    click: () => {
                        app.relaunch()
                        app.exit()
                    }
                },
                {
                    label: 'Import PDF',
                    click: () => {
                        win.webContents.send('import_pdf');
                    }
                },
                {
                    label: 'Save Project',
                    click: () => {
                        win.webContents.send('save-project');
                    }
                },
                {
                    label: 'Load Project',
                    click: () => {
                        win.webContents.send('load-project');
                    }
                },
                {
                    type: 'separator'
                },

                {
                    label: 'Inpsect',
                    click: () => {
                        win.webContents.openDevTools();
                    }
                },
            ],

        }, {
            label: 'Export',
            submenu: [{
                    label: 'Export PDF',
                    click: () => {
                        win.webContents.send('export_pdf');
                    }
                },
                {
                    label: 'Export SVG',
                    click: () => {
                        win.webContents.send('export_svg');
                    }
                },
            ],

        },

    ];


    // Create the menu with the template
    const menu = Menu.buildFromTemplate(menuTemplate);

    // Set the application's menu
    Menu.setApplicationMenu(menu);

});