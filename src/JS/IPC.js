    var { ipcRenderer } = require('electron');

    // Example data to send
    const data = {
        message: 'Hello from PDF.html!'
    };

    ipcRenderer.send('pdfData', data);