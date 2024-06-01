pdfjsLib.GlobalWorkerOptions.workerSrc ="../../../node_modules/pdfjs-dist/build/pdf.worker.mjs";
window.CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
window.CMAP_PACKED = true;
var DEFAULT_URL = "../assets/test.pdf";
window.ENABLE_XFA = true;

const SANDBOX_BUNDLE_SRC = new URL(
  "../../node_modules/pdfjs-dist/build/pdf.sandbox.mjs",
  window.location
);

const container = document.getElementById("viewerContainer");

const eventBus = new pdfjsViewer.EventBus();

window.pdfLinkService = new pdfjsViewer.PDFLinkService({
  eventBus,
});

const pdfFindController = new pdfjsViewer.PDFFindController({
  eventBus,
  linkService: window.pdfLinkService,
});

const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
  eventBus,
  sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
});

window.pdfViewer = new pdfjsViewer.PDFViewer({
  container,
  eventBus,
  linkService: window.pdfLinkService,
  findController: pdfFindController,
  scriptingManager: pdfScriptingManager
});
window.pdfLinkService.setViewer(window.pdfViewer);
pdfScriptingManager.setViewer(window.pdfViewer);

eventBus.on("pagesinit", function () {
  let button = document.getElementById("openpdf");
  button.style.display = "none";
  window.pdfViewer.currentScaleValue = "page-width";
  var viewerContainer = document.getElementById('viewerContainer');

var observer = new MutationObserver(function(mutationsList) {
    mutationsList.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'zoom') {
            var newZoomLevel = mutation.target.getAttribute('zoom');
            window.pdfViewer.currentScaleValue = newZoomLevel;
        }
    });
});

observer.observe(viewerContainer, { attributes: true });


});
const loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL,
  cMapUrl: window.CMAP_URL,
  cMapPacked: window.CMAP_PACKED,
  enableXfa: window.ENABLE_XFA,
});

const pdfDocument = await loadingTask.promise;

let total_height = 0;
const pagePromises = [];
for (let i = 1; i <= pdfDocument.numPages; i++) {
  pagePromises.push(pdfDocument.getPage(i));
}

pdfDocument.getPage(1).then(function(page) {
  var viewport = page.getViewport({ scale: 1 });
  localStorage.setItem('first_page',[viewport.width, viewport.height]);
});


Promise.all(pagePromises)
  .then(pages => {
    pages.forEach(page => {
      const viewport = page.getViewport({ scale: 1 });
      total_height += viewport.height;
    });
    localStorage.setItem('total_height',total_height);
  })
  .catch(error => {
    console.error("Error retrieving pages:", error);
  });

