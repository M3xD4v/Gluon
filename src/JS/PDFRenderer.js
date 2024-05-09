pdfjsLib.GlobalWorkerOptions.workerSrc ="../../../node_modules/pdfjs-dist/build/pdf.worker.mjs";
const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

//const DEFAULT_URL = "../assets/numbered-test.pdf";
const DEFAULT_URL = "../assets/norse.pdf";
const ENABLE_XFA = true;

const SANDBOX_BUNDLE_SRC = new URL(
  "../../node_modules/pdfjs-dist/build/pdf.sandbox.mjs",
  window.location
);

const container = document.getElementById("viewerContainer");

const eventBus = new pdfjsViewer.EventBus();

// (Optionally) enable hyperlinks within PDF files.
const pdfLinkService = new pdfjsViewer.PDFLinkService({
  eventBus,
});

// (Optionally) enable find controller.
const pdfFindController = new pdfjsViewer.PDFFindController({
  eventBus,
  linkService: pdfLinkService,
});

// (Optionally) enable scripting support.
const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
  eventBus,
  sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
});

const pdfViewer = new pdfjsViewer.PDFViewer({
  container,
  eventBus,
  linkService: pdfLinkService,
  findController: pdfFindController,
  scriptingManager: pdfScriptingManager,
});
pdfLinkService.setViewer(pdfViewer);
pdfScriptingManager.setViewer(pdfViewer);

eventBus.on("pagesinit", function () {
  pdfViewer.currentScaleValue = "page-width";
  var viewerContainer = document.getElementById('viewerContainer');

// Create a MutationObserver instance
var observer = new MutationObserver(function(mutationsList) {
    mutationsList.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'zoom') {
            var newZoomLevel = mutation.target.getAttribute('zoom');
            console.log('Zoom level changed:', newZoomLevel);
            pdfViewer.currentScaleValue = newZoomLevel;
        }
    });
});

observer.observe(viewerContainer, { attributes: true });


});

// Loading document.
const loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL,
  cMapUrl: CMAP_URL,
  cMapPacked: CMAP_PACKED,
  enableXfa: ENABLE_XFA,
});

const pdfDocument = await loadingTask.promise;
// Document loaded, specifying document for the viewer and
// the (optional) linkService.
pdfViewer.setDocument(pdfDocument);

pdfLinkService.setDocument(pdfDocument, null);