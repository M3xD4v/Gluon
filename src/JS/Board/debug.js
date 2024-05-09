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
      'activeTool': activeTool,
      'eventlisteners': JSON.stringify(DrawEventListeners),
      "firstPosition": JSON.stringify(firstPosition),
      "secondPosition": JSON.stringify(secondPosition),
      "history": JSON.stringify(history),
      "pointer": JSON.stringify(pointer)
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
});