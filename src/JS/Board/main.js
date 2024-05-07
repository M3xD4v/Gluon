var click = 0 
var startPoint;
var IntervalArray = [];

var InControl = [];


function setTool(tool) {

    const activeTool = localStorage.getItem("activeTool");

    if (activeTool === tool) {
        TC()
    } else {
        localStorage.setItem("activeTool", tool);
        activateTool(tool);
        actTool = tool;
    }

}

function GAV(key) {
    return localStorage.getItem("active" + key.charAt(0).toUpperCase() + key.slice(1));
}

function stopChecking() {
    IntervalArray.forEach(function(intervalId) {
        clearInterval(intervalId);
    });
}

function TC() {
    setTool("none")
    stopChecking()
    click = 0;
    startPoint = undefined;
}

function saveCanvas() {
    var jsonData = JSON.stringify(canvas.toJSON());
    downloadFile(jsonData, 'temp.json', 'application/json');
}
function loadCanvas() {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';

    fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            var jsonData = event.target.result;
            canvas.loadFromJSON(jsonData, canvas.renderAll.bind(canvas));
        };
        reader.readAsText(file);
    });

    fileInput.click();
}

function downloadFile(data, filename, type) {
    var file = new Blob([data], {type: type});
    var a = document.createElement("a");
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}


