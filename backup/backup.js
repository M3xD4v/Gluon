<!DOCTYPE html>
<html lang="en">

<head>
  <link rel="stylesheet" href="CSS/Board.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/4.5.0/fabric.min.js"></script>
  <script src="JS/Board/main.js"></script>
  <script src="JS/Board/fundamental.js"></script>
  <script src="JS/Board/tool.js"></script>
  <script src="JS/Board/currentTool.js"></script>
  <script src="JS/Board/update.js"></script>
</head>



<body>
  <p id="currentTool" style="color: #0700a6; font-family: Lucida Console"></p>
  <div id="menu">
    <button onclick="setTool('text')">text</button>
    <button onclick="setTool('line')">line</button>
    <button onclick="setTool('edit')">edit</button>
    <button onclick="setTool('delete')">delete</button>
    <button onclick="saveCanvas()">save Canvas</button>
    <button onclick="loadCanvas()">load Canvas</button>
  </div>


  <label for="fontSize">Font Size:</label>
  <input type="number" id="fontSize" min="1" value="20">
  <br>
  <label for="fontFamily">Font Family:</label>
  <select id="fontFamily">
    <option value="Arial">Arial</option>
    <option value="Times New Roman">Times New Roman</option>
    <option value="Courier New">Courier New</option>
  </select>
  <br>
  
  <label for="ColorI">Color:</label>
  <input type="color" id="ColorI" value="#000000">

  <br>
  <input type="checkbox" id="bold">
  <label for="bold">Bold</label>
  <input type="checkbox" id="italic">
  <label for="italic">Italic</label>
  <br>
  <label for="selectedText">Selected Text:</label>
  <input type="text" id="selectedText" readonly>


  <div class="canvas_container">
    <canvas id="my_canvas" width="1000" height="9000" style="border:1px solid #ccc"></canvas>
  </div>



  <script>
    var canvas = new fabric.Canvas('my_canvas');
    var current_tool = GAV("tool");
    var currentToolElement = document.getElementById("currentTool");


    if (current_tool) {
      currentToolElement.textContent = "The current tool is: " + current_tool;
    } else {
      currentToolElement.textContent = "No tool is currently selected.";
    }

    var fontSizeInput = document.getElementById('fontSize');
    var fontFamilySelect = document.getElementById('fontFamily');
    var boldCheckbox = document.getElementById('bold');
    var italicCheckbox = document.getElementById('italic');
    var selectedTextInput = document.getElementById('selectedText');

    fontSizeInput.addEventListener('input', function () {
      updateText();
    });

    fontFamilySelect.addEventListener('change', function () {
      updateText();
    });

    boldCheckbox.addEventListener('change', function () {
      updateText();
    });

    italicCheckbox.addEventListener('change', function () {
      updateText();
    });

    function updateText() {
      var activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fontSize', parseInt(fontSizeInput.value, 10));
        activeObject.set('fontFamily', fontFamilySelect.value);
        //activeObject.set('fill', fontColorInput.value);
        activeObject.set('fontWeight', boldCheckbox.checked ? 'bold' : 'normal');
        activeObject.set('fontStyle', italicCheckbox.checked ? 'italic' : 'normal');
        canvas.renderAll();
      }
    }

    canvas.on('selection:cleared', function () {
      selectedTextInput.value = '';
    });

    canvas.on('selection:created', function (e) {
      if (e.selected.length === 1 && e.selected[0].type === 'textbox') {
        selectedTextInput.value = e.selected[0].text;
      }
    });

    canvas.on('selection:updated', function (e) {
      if (e.selected.length === 1 && e.selected[0].type === 'textbox') {
        selectedTextInput.value = e.selected[0].text;
      }
    });
  </script>


</body>

</html>