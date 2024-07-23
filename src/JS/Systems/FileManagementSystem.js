
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
        let pdfID = "pdfViewer?ID=" + id 
        ipcRenderer.once('importpdf_response', (event, file) => {
            let int8Array = new Int8Array(file);
            console.log(pdfID)
            let container = document.getElementById(pdfID)
            container.contentWindow.loadNewPDF(int8Array)
        });
    }

    function export_pdf() {
        PDF_Iframe.contentWindow.exportPDF().then(function(pdf) {
            openDialog("export_pdf", pdf);
        });
    }
    function export_svg() {
        let boardWindow = Board_Iframe.contentDocument.defaultView
        let svg = boardWindow.exportSVG();
        openDialog("export_svg", svg);
    }
    function save_File() {
        let pdfWindow = PDF_Iframe.contentDocument.defaultView
        let boardWindow = Board_Iframe.contentDocument.defaultView
        let pdf_data = pdfWindow.exportPDF()
        boardWindow.exportCanvas();
    }

    function save_project() {
        let pdfWindow = PDF_Iframe.contentDocument.defaultView
        let boardWindow = Board_Iframe.contentDocument.defaultView

        let pdf_data;
        let board_data = boardWindow.exportBoard()

        pdfWindow.exportPDF().then(function (binaryData) {

            let combinedData = JSON.stringify({
                id: generateRandomHash(),
                pdfData: arrayToBase64(binaryData),
                boardData: board_data,
                viewType: "SplitView"
            });
            openDialog("saveproject", combinedData)
        });
    }

    function load_project() {
        openDialog("loadproject")
        ipcRenderer.once('project_open', (event, file) => {
                let json = JSON.parse(file);
                loadProject(json)
        });

    }
