function getColor() {
    return document.getElementById('ColorValue').value;
}

function getWidth() {
    return document.getElementById('WidthValue').value;
}

function line_f(firstPosition, secondPosition, color, strokeWidth) {
    let line = draw.line(firstPosition.x, firstPosition.y, secondPosition.x, secondPosition.y).stroke({
        width: strokeWidth
    });
    line.stroke({
        color: color
    });

    let collission_line = draw.line(firstPosition.x, firstPosition.y, secondPosition.x, secondPosition.y).stroke({
        width: strokeWidth * 4
    });
    collission_line.stroke({
        color: "#00ff0d42"
    });
    collission_line.node.setAttribute("class", "collission_line");
    collission_line.node.setAttribute("id", "collission_line");
    
    InitLine(line, collission_line) 
    return {
        do: () => line.show(),
        undo: () => line.hide()
    };
}

function InitLine(line, collission_line) {
    let id = object_list.length;
    let combined = {
        object: line,
        type: "line",
        collission_object: collission_line,
        id: id,
        color: line.node.attributes.stroke.value,
        control_points: [],
        pivot: []
    };
    object_list.push(combined);
}

function getLineByID(id) {
    let current_line = object_list.find(element => element.id == id);
    return current_line;
}

function createMovableTextbox(position) {
    console.log('ah')
    var offsetX = 100; // Adjust this value if you want the box to be offset from the mouse position
    var offsetY = 50; // Adjust this value if you want the box to be offset from the mouse position


    var movableBox = document.createElement('div');
    var drawingDiv = document.getElementById('drawing');
    console.log(drawingDiv)
    drawingDiv.appendChild(movableBox);


    movableBox.className = 'movableBox';
    movableBox.style.position = 'absolute';
    movableBox.style.left = position.x + 'px';
    movableBox.style.top = position.y + 'px';
    movableBox.setAttribute('contenteditable', 'true');
    movableBox.innerHTML = 'text';


    var isDown = false;
    var initialX, initialY;

    movableBox.addEventListener('mousedown', function (e) {
        isDown = true;
        initialX = e.clientX - parseInt(movableBox.style.left);
        initialY = e.clientY - parseInt(movableBox.style.top);
    });

    document.addEventListener('mousemove', function (e) {
        if (isDown) {
            e.preventDefault();
            movableBox.style.left = (e.clientX - initialX) + 'px';
            movableBox.style.top = (e.clientY - initialY) + 'px';
        }
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDown) return;

        e.preventDefault();

        var drawingDivRect = drawingDiv.getBoundingClientRect();

        var newX = e.clientX - initialX;
        var newY = e.clientY - initialY;

        // Check boundaries
        if (newX < drawingDivRect.left) {
            newX = drawingDivRect.left;
        } else if (newX + movableBox.offsetWidth > drawingDivRect.right) {
            newX = drawingDivRect.right - movableBox.offsetWidth;
        }

        if (newY < drawingDivRect.top) {
            newY = drawingDivRect.top;
        } else if (newY + movableBox.offsetHeight > drawingDivRect.bottom) {
            newY = drawingDivRect.bottom - movableBox.offsetHeight;
        }

        movableBox.style.left = newX + 'px';
        movableBox.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', function () {
        isDown = false;
    });
}