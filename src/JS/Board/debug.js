document.addEventListener('DOMContentLoaded', function () {

  var previousDebugValues = {};

  function addDebugInfo(title, value) {
    var debugContent = document.getElementById('debugContent');
    var debugInfo = document.createElement('div');
    debugInfo.innerHTML = '<strong>' + title + ':</strong> ' + value;
    debugContent.appendChild(debugInfo);
  }

  function updateDebugValues() {
    var debugValues = {
      'Active Tool': GAV("tool"),
      'Active Object': JSON.stringify(canvas.getActiveObject()),
      'In Control': JSON.stringify(InControl),
    };

    var hasChanges = false;

    for (var key in debugValues) {
      if (debugValues.hasOwnProperty(key)) {
        if (!previousDebugValues.hasOwnProperty(key) || debugValues[key] !== previousDebugValues[key]) {
          hasChanges = true;
          previousDebugValues[key] = debugValues[key];
        }
      }
    }

    if (hasChanges) {
      var debugContent = document.getElementById('debugContent');
      debugContent.innerHTML = '';
      for (var key in debugValues) {
        if (debugValues.hasOwnProperty(key)) {
          addDebugInfo(key, debugValues[key]);
        }
      }
    }
  }

  // Initial update of debug values
  updateDebugValues();
  // Update debug values periodically
  setInterval(updateDebugValues, 100);







  var toggleButton = document.getElementById('btoggleButton');
  var boundingBoxEnabled = false;
  var boundingBoxes = [];
  var intervalId;
  toggleButton.addEventListener('click', function () {
    boundingBoxEnabled = !boundingBoxEnabled;
    if (boundingBoxEnabled) {
      intervalId = setInterval(drawBoundingBoxes, 20);
    } else {
      clearInterval(intervalId);
      clearBoundingBoxes();
    }
  });
  
  function drawBoundingBoxes() {
    clearBoundingBoxes();
    canvas.getObjects().forEach(function (obj) {
      var bbox = obj.getBoundingRect();
      var rect = new fabric.Rect({
        left: bbox.left,
        top: bbox.top,
        width: bbox.width,
        height: bbox.height,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        isBoundingBox: true // Custom property to identify bounding box rectangles
      });
      canvas.add(rect);
      boundingBoxes.push(rect); // Push bounding box to array for easy access
    });
  }
  
  function clearBoundingBoxes() {
    boundingBoxes.forEach(function (rect) {
      canvas.remove(rect);
    });
    boundingBoxes = []; // Clear the array
  }

});