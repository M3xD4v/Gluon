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

    // Create a custom menu
    const menuTemplate = [
        {
          label: 'File',
          submenu: [
            {
              label: 'Exit', 
              click: () => {
                app.quit(); // Action to quit the application
              }
            }
          ]
        },
        {
          label: 'lorem',
          submenu: [
            {
              label: 'lorem', 
              click: () => {
               
              }
            },
            {
              label: 'lorem', 
              click: () => {
              }
            },
            { type: 'separator' },
            {
              label: 'lorem', 
              click: () => {
        
              }
            },
            {
              label: 'lorem', 
              click: () => {
               
              }
            },
            {
              label: 'lorem', 
              click: () => {
                
              }
            }
          ]
        }
      ];

    // Set the menu for the application
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    win.loadFile('src/layout.html');
});