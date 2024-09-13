
    function arrayToBase64(array) {
        let binary = '';
        let bytes = new Uint8Array(array);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function base64ToArray(base64) {
        let binary_string = window.atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    function import_pdf(IFrame_URL) {
        openDialog("import_pdf")
        const urlObj = new URL(IFrame_URL);
        const id = urlObj.searchParams.get("ID");
        let pdfID = "pdfViewer?ID=" + id ;
        ipcRenderer.once('importpdf_response', (event, file) => {
            let int8Array = new Int8Array(file);
            let container = document.getElementById(pdfID);
            container.contentWindow.loadNewPDF(int8Array);
        });
    }

    function export_pdf() {
        PDF_Iframe.contentWindow.exportPDF().then(function(pdf) {
            openDialog("export_pdf", pdf);
        });
    }
    function export_svg() {
        let boardWindow = Board_Iframe.contentDocument.defaultView
        let svg = boardWindow.exportSVG();s
        openDialog("export_svg", svg);
    }

    function save_project() {
        let type = document.getElementsByClassName("activeContainer")[0].dataset.type;

        if (type == "SplitView") save_splitview_project();
        else if (type == "ReadView") save_readview_project();
        else if (type == "BoardView") save_boardview_project();
        else window.parent.showNotification("Saveing: Unknown type at save_project()", 1);
    }

    function load_project() {
        openDialog("loadproject")
        ipcRenderer.once('project_open', (event, file) => {
                let json = JSON.parse(file);
                loadProject(json)
        });

    }

    function save_splitview_project() {
        let pdfWindow = PDF_Iframe.contentDocument.defaultView
        let boardWindow = Board_Iframe.contentDocument.defaultView
        let board_data = boardWindow.exportBoard()

        pdfWindow.exportPDF().then(function (binaryData) {

            let combinedData = JSON.stringify({
                id: generateRandomHash(),
                pdfID: pdfWindow.frameElement.id,
                BoardID: boardWindow.frameElement.id,
                pdfData: arrayToBase64(binaryData),
                boardData: board_data,
                viewType: "SplitView"
            });
            openDialog("saveproject", combinedData)
        });
    }

    function save_readview_project() {
        let pdfWindow = PDF_Iframe.contentDocument.defaultView
        pdfWindow.exportPDF().then(function (binaryData) {
            let combinedData = JSON.stringify({
                id: generateRandomHash(),
                pdfID: pdfWindow.frameElement.id,
                pdfData: arrayToBase64(binaryData),
                viewType: "ReadView"
            });
            openDialog("saveproject", combinedData)
        });
    }

    function save_boardview_project() {
        let boardWindow = Board_Iframe.contentDocument.defaultView
        let board_data = boardWindow.exportBoard()
        let combinedData = JSON.stringify({
            id: generateRandomHash(),
            BoardID: boardWindow.frameElement.id,
            boardData: board_data,
            viewType: "BoardView"
        });
            openDialog("saveproject", combinedData)
    }