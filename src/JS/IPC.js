    var { ipcRenderer } = require('electron');

    ipcRenderer.on('open-file_pdf', () => {
        open_newFile_pdf();
    });
    ipcRenderer.on('save-file', () => {
        save_File();
    });