let loadedWorkspaces = {};
let sessionID = generateRandomHash();
let iframes = {};
let activeID;

function generateRandomHash(length = 40) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let hash = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        hash += characters[randomIndex];
    }
    return hash;
}

function disableAnyActiveNavbar() {
    let activeNavbar = document.querySelector('.buttonWrapperActive');
    if (activeNavbar != null) {
        activeNavbar.className = 'buttonWrapper';
    }
    let container = document.querySelector('.activeContainer');
    if (container != null) {
        container.classList.remove('activeContainer');
        container.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', (event) => {
    let splitView = document.getElementById("SplitViewCard");
    let readView = document.getElementById("ReadViewCard");
    let boardView = document.getElementById("BoardViewCard");
    let BlankTempView = document.getElementById("TempBlank");
    splitView.addEventListener('click', SplitProject);
    readView.addEventListener('click', ReadProject);
    boardView.addEventListener('click', BoardProject);
    BlankTempView.addEventListener('click', BlankTempProject);
});

function updateIframeTheme() {
    const themeName = CurrnetTheme;
    console.log(themeName);
    const root = document.documentElement;
    root.classList.remove('theme-gold', 'theme-a', 'theme-b');
    root.classList.add(`theme-${themeName}`);

    const iframes = document.getElementsByTagName('iframe');
    for (let i = 0; i < iframes.length; i++) {
        const iframeRoot = iframes[i].contentDocument.documentElement;
        iframeRoot.classList.remove('theme-gold', 'theme-a', 'theme-b');
        iframeRoot.classList.add(`theme-${themeName}`);
    }
}

function SplitProject() {
    let startmenu = document.getElementById("StartMenuContainer");
    let ID = generateRandomHash();
    startmenu.style.display = "none";
    disableAnyActiveNavbar();
    initiateSplitElements(ID);
    VisibleContainer = document.getElementsByClassName('container')[0];
    addNewNavBarElement('New Split Project', ID);
    activeID = ID;
}

function changeActiveIFrames(id) {
    let object = iframes[id];
    if (object.PDF_Iframe != undefined) {
        PDF_Iframe = object.PDF_Iframe;
    }
    if (object.Board_Iframe != undefined) {
        Board_Iframe = object.Board_Iframe;
    }
}

function addEventListeners(PDF_Iframe, Board_Iframe) {
    PDF_Iframe.addEventListener('load', function () {
        setActiveIframe('PDF');
        const PDF_iframeDocument = PDF_Iframe.contentDocument || PDF_Iframe.contentWindow.document;
        const PDF_DIV = PDF_iframeDocument.getElementById('viewerContainer');
        let lastScrollTop = PDF_DIV.scrollTop;
        PDF_DIV.addEventListener('scroll', debounce(() => {
            console.log("a")
            const scrollTop = PDF_DIV.scrollTop;
            if (scrollTop !== lastScrollTop) {
                lastScrollTop = scrollTop;
                if (activeIframe === 'PDF') {
                    syncScroll(PDF_DIV, document.getElementById('Board_Viewer'));
                }
            }
        }, 1));
    });

    Board_Iframe.addEventListener("load", function () {
        setActiveIframe('Board');
        const iframeWindow = Board_Iframe.contentWindow;
        const iframeDocument = iframeWindow.document;
        let lastScrollTop = iframeDocument.documentElement.scrollTop || iframeDocument.body.scrollTop;

        iframeDocument.addEventListener('scroll', debounce(() => {
            console.log("a")
            lastScrollTop = iframeDocument.documentElement.scrollTop || iframeDocument.body
                .scrollTop;
            if (activeIframe === 'Board') {
                syncScroll_Second(lastScrollTop);
            }
        }, 1));
    });

    PDF_Iframe.addEventListener('mouseover', function () {
        setActiveIframe('PDF');
    });

    Board_Iframe.addEventListener('mouseover', function () {
        setActiveIframe('Board');
    });
}


function initiateSplitElements(ID) {
    var container = document.createElement('div');
    container.className = "container activeContainer";
    container.id = ID;

    var PDFiframeContainer = document.createElement('div');
    PDFiframeContainer.className = "iframe-container";
    PDFiframeContainer.id = "pdf_iframe";

    var BoardiframeContainer = document.createElement('div');
    BoardiframeContainer.className = "iframe-container";
    BoardiframeContainer.id = "board_iframe";

    var PDFiFrame = document.createElement('iframe');
    PDFiFrame.src = "../WebDocuments/PDFViewer.html?ID=" + ID;
    PDFiFrame.id = "pdfViewer";
    PDFiFrame.className = "innerIframe";

    var BoardIFrame = document.createElement('iframe');
    BoardIFrame.src = "../WebDocuments/CanvasViewer.html?ID=" + ID;
    BoardIFrame.id = "Board_Viewer";
    BoardIFrame.className = "innerIframe";

    PDFiframeContainer.appendChild(PDFiFrame);
    BoardiframeContainer.appendChild(BoardIFrame);
    container.appendChild(PDFiframeContainer);
    container.appendChild(BoardiframeContainer);

    document.body.appendChild(container);

    iframes[ID] = {
        PDF_Iframe: PDFiFrame,
        Board_Iframe: BoardIFrame
    };
    changeActiveIFrames(ID)
    addEventListeners(iframes[ID].PDF_Iframe, iframes[ID].Board_Iframe);

    BoardIFrame.onload = function () {
        updateIframeTheme();
    };
}


function ReadProject() {
    let ID = generateRandomHash();
    let startmenu = document.getElementById("StartMenuContainer");
    disableAnyActiveNavbar();
    startmenu.style.display = "none";
    initiateReadElements(ID);
    addNewNavBarElement('New Read Project', ID);
    activeID = ID;
}

function initiateReadElements(ID) {
    var container = document.createElement('div');
    container.className = "container activeContainer";
    container.id = ID;

    var iframeContainer = document.createElement('div');
    iframeContainer.className = "iframe-container";
    iframeContainer.id = "pdf_iframe";

    var iframe = document.createElement('iframe');
    iframe.src = "../WebDocuments/PDFViewer.html?ID=" + ID;
    iframe.id = "pdfViewer?ID=" + ID;
    iframe.className = "innerIframe";

    iframeContainer.appendChild(iframe);
    container.appendChild(iframeContainer);

    document.body.appendChild(container);

    iframes[ID] = {
        PDF_Iframe: document.getElementById("pdfViewer?ID=" + ID),
        Board_Iframe: "undefined"
    };
    changeActiveIFrames(ID)
    iframe.onload = function () {
        updateIframeTheme();
    };
}

function BoardProject() {
    console.log("Board Project");
    let ID = generateRandomHash();
    let startmenu = document.getElementById("StartMenuContainer");
    disableAnyActiveNavbar();
    startmenu.style.display = "none";
    initiateBoardElements(ID);
    addNewNavBarElement('New Board Project', ID);
    activeID = ID;
}

function initiateBoardElements(ID) {
    var container = document.createElement('div');
    container.className = "container activeContainer";
    container.id = ID;

    var iframeContainer = document.createElement('div');
    iframeContainer.className = "iframe-container";
    iframeContainer.id = "board_iframe";

    var iframe = document.createElement('iframe');
    iframe.src = "../WebDocuments/CanvasViewer.html?ID=" + ID;
    iframe.id = "Board_Viewer?ID=" + ID;
    iframe.className = "innerIframe";

    iframeContainer.appendChild(iframe);
    container.appendChild(iframeContainer);

    document.body.appendChild(container);

    iframes[ID] = {
        PDF_Iframe: "undefined",
        Board_Iframe: document.getElementById("Board_Viewer?ID=" + ID)
    };
    changeActiveIFrames(ID)
    iframe.onload = function () {
        updateIframeTheme();
    };
}

function BlankTempProject() {
    let ID = generateRandomHash();
    let startmenu = document.getElementById("StartMenuContainer");
    disableAnyActiveNavbar();
    startmenu.style.display = "none";
    initiateBlankTempElements(ID);
    addNewNavBarElement('New Blank Project', ID);
    activeID = ID;
}

function initiateBlankTempElements(ID) {
    var container = document.createElement('div');
    container.className = "container activeContainer";
    container.id = ID;

    var iframeContainer = document.createElement('div');
    iframeContainer.className = "iframe-container";
    iframeContainer.id = "temp_iframe";

    var iframe = document.createElement('iframe');
    iframe.src = "../WebDocuments/BlankDocument.html?ID=" + ID;
    iframe.id = "temp?ID=" + ID;
    iframe.className = "innerIframe";
    iframeContainer.appendChild(iframe);
    container.appendChild(iframeContainer);

    document.body.appendChild(container);

    iframes[ID] = {
        PDF_Iframe: document.getElementById("temp?ID=" + ID),
        Board_Iframe: "undefined"
    };
    changeActiveIFrames(ID)
    iframe.onload = function () {
        updateIframeTheme();

        // Create a new webview element
        var webview = document.createElement('webview');
        webview.setAttribute('id', 'foo');
        webview.setAttribute('src', 'https://www.wikiwand.com/');
        webview.setAttribute('style', 'display:inline-flex; width:100%; height:100%');
        this.contentDocument.body.style.overflow = 'hidden';
        this.contentDocument.body.appendChild(webview);
    };
}






function clearProject() {
    if (document.getElementsByClassName('activeContainer').length > 0) {
        document.getElementsByClassName('activeContainer')[0].remove();
    }
}

function addNewNavBarElement(fileName, id) {
    var fileNavBar = document.querySelector('.fileNavBar');
    var newDiv = document.createElement('div');
    newDiv.className = 'buttonWrapperActive';

    var newImg = document.createElement('img');
    newImg.src = '../../assets/SVGs/atom-svgrepo-com.svg';
    newImg.className = 'fileIcon';

    var newButton = document.createElement('button');
    newButton.className = 'fileButton';
    newButton.addEventListener('click', function () {
        swapToProject(id);
    });
    newButton.textContent = fileName;

    var newCloseButton = document.createElement('button');
    newCloseButton.className = 'fileCloseButton';
    newCloseButton.textContent = 'X';

    newDiv.id = id + "_button";
    newDiv.appendChild(newImg);
    newDiv.appendChild(newButton);
    newDiv.appendChild(newCloseButton);

    fileNavBar.appendChild(newDiv);
    let NavBarAddButton = document.getElementsByClassName('NavAddButton')[0];
    fileNavBar.appendChild(NavBarAddButton);
    return newDiv;
}

function splitLoadProject(projectFile) {
    let startmenu = document.getElementById("StartMenuContainer");
    startmenu.style.display = "none";
    if (document.getElementsByClassName('activeContainer').length > 0) {
        let element = document.getElementsByClassName('activeContainer')[0];
        element.classList.remove('activeContainer');
        element.style.display = 'none';
    }

    var containerHTML = `
    <div class="container activeContainer" id="${projectFile.id}">
        <div class="iframe-container" id="pdf_iframe">
            <iframe src="../WebDocuments/PDFViewer.html" id="pdfViewer" class="innerIframe"></iframe>
        </div>
        <div class="iframe-container" id="board_iframe">
            <iframe src="../WebDocuments/CanvasViewer.html" id="Board_Viewer" class="innerIframe"></iframe>
        </div>
    </div>`;

    var container = document.createElement('div');
    container.innerHTML = containerHTML;
    document.body.appendChild(container.firstElementChild);



    setTimeout(() => {
        iframes[projectFile.id] = {
            PDF_Iframe: document.getElementById('pdfViewer'),
            Board_Iframe: document.getElementById('Board_Viewer')
        };

        addEventListeners(iframes[projectFile.id].PDF_Iframe, iframes[projectFile.id].Board_Iframe);

        let pdf_data = base64ToArray(projectFile.pdfData);
        let board_data = projectFile.boardData;
        console.log(iframes[projectFile.id].Board_Iframe);
        iframes[projectFile.id].PDF_Iframe.contentWindow.load_new_pdf(pdf_data);
        iframes[projectFile.id].Board_Iframe.contentWindow.importCanvas(board_data);
    }, 1000);

}

function loadProject(projectFile) {
    if (projectFile.viewType === "SplitView") {
        let id = projectFile.id;
        activeID = id;
        let pdf_data = base64ToArray(projectFile.pdfData);
        let board_data = projectFile.boardData;
        splitLoadProject(projectFile)


        let activeNavbar = document.querySelector('.buttonWrapperActive');
        if (activeNavbar != null) {
            activeNavbar.className = 'buttonWrapper';
        }
        addNewNavBarElement('New File', id);
        let Data = {
            pdf: pdf_data,
            board: board_data
        };
        loadedWorkspaces[id] = Data;
        console.log(loadedWorkspaces)
    }
}

function swapToProject(id) {

    let activeWorkspace = document.querySelector('.activeContainer');
    if (activeWorkspace != null) {
        if (activeWorkspace.id === id) {
            return;
        } else {
            let button = document.getElementById(id + '_button');
            let activeButton = document.querySelector('.buttonWrapperActive');
            if (activeButton != null) {
                activeButton.className = 'buttonWrapper';
            }
            button.className = 'buttonWrapperActive';
            activeWorkspace.classList.remove('activeContainer');
            activeWorkspace.style.display = 'none';
            let workspace = document.getElementById(id);
            console.log(id);
            console.log(workspace);
            workspace.classList.add('activeContainer');
            workspace.style.display = 'flex';
            changeActiveIFrames(id);
        }
    } else {
        let workspace = document.getElementById(id);
        workspace.classList.add('activeContainer');
        workspace.style.display = 'flex';
        let button = document.getElementById(id + '_button');
        button.className = 'buttonWrapperActive';
        changeActiveIFrames(id);
        if (document.getElementById("StartMenuContainer").style.display === "block") {
            document.getElementById("StartMenuContainer").style.display = "none";
        }
    }

}

function NewTemplatePage() {
    let startmenu = document.getElementById("StartMenuContainer");
    startmenu.style.display = "block";
    let activeProject = document.querySelector('.activeContainer');
    if (activeProject != null) {
        activeProject.classList.remove('activeContainer');
        activeProject.style.display = 'none';
        let button = document.querySelector('.buttonWrapperActive');
        button.className = 'buttonWrapper';


    }
}