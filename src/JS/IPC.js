    var { ipcRenderer } = require('electron');



    ipcRenderer.on('save-project', () => {
        save_project();
    });

    ipcRenderer.on('load-project', () => {
        load_project();
    });

    ipcRenderer.on('export_pdf', () => {
        export_pdf();
    });
    ipcRenderer.on('export_svg', () => {
        export_svg();
    });
    ipcRenderer.on('import_pdf', () => {
        import_pdf();
    });
    ipcRenderer.on('restart', () => {
        app.relaunch();
    });


    function openDialog(type,data) {
        if (type === 'loadproject') {
            ipcRenderer.send('open_dialog_project');
        } else if (type === 'saveproject') {
            ipcRenderer.send('open_dialog_saveproject',data);
        } else if (type === 'exportpdf') {
            ipcRenderer.send('open_dialog_exportpdf',data);
        } else if (type === 'exportsvg') {
            ipcRenderer.send('open_dialog_exportsvg',data);
        }else if (type === 'import_pdf') {
            ipcRenderer.send('importpdf');
        }else if (type === 'export_pdf') {
            ipcRenderer.send('exportpdf',data);
        }else if (type === 'export_svg') {
            ipcRenderer.send('exportsvg',data);
        }
    }