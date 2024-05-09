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
    return {
        do: () => line.show(),
        undo: () => line.hide()
    };
}

function text_f(position, text, color, fontSize) {
    let textElement = draw.text(text).fill(color).font({size: fontSize})
    textElement.move(position.x, position.y);
    return {
        do: () => textElement.show(),
        undo: () => textElement.hide()
    };
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

        movableBox.addEventListener('mousedown', function(e) {
            isDown = true;
            initialX = e.clientX - parseInt(movableBox.style.left);
            initialY = e.clientY - parseInt(movableBox.style.top);
        });

        document.addEventListener('mousemove', function(e) {
            if (isDown) {
                e.preventDefault();
                movableBox.style.left = (e.clientX - initialX) + 'px';
                movableBox.style.top = (e.clientY - initialY) + 'px';
            }
        });

        document.addEventListener('mousemove', function(e) {
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

        document.addEventListener('mouseup', function() {
            isDown = false;
        });
    }

