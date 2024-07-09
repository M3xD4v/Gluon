function line_util(firstPosition, secondPosition, color, strokeWidth) {
    let line = draw.line(firstPosition.x, firstPosition.y, secondPosition.x, secondPosition.y).stroke({
        width: strokeWidth
    });
    line.stroke({
        color: color
    });

    let collission_line = draw.line(firstPosition.x, firstPosition.y, secondPosition.x, secondPosition.y).stroke({
        width: "2vh"
    });
    collission_line.stroke({
        color: "#00ff0d42"
    });
    collission_line.node.setAttribute("class", "collission_line");
    collission_line.node.setAttribute("id", "collission_line");

    initiateLine(line, collission_line)
    return {
        do: () => line.show(),
        undo: () => line.hide()
    };
}

function initiateLine(line, collission_line) {
    let id = objectList.length;
    let combined = {
        object: line,
        type: "line",
        collission_object: collission_line,
        id: id,
        color: line.node.attributes.stroke.value,
        controlPoints: [],
        pivot: []
    };
    objectList.push(combined);
}

function createMovableTextbox(position, text, width, height) {
    let txt_template = document.getElementById("text_box_template");
    let new_instance = txt_template.cloneNode(true);
    new_instance.style.display = "block";
    new_instance.style.left = position.x + "px";
    new_instance.style.top = position.y + "px";
    if (text != undefined && width != undefined && height != undefined) {
        new_instance.getElementsByClassName("textbox")[0].innerHTML = text;
        new_instance.getElementsByClassName("textbox")[0].style.width = width + "vh";
        new_instance.getElementsByClassName("textbox")[0].style.height = height + "vh";
    }
    document.getElementById("drawing").appendChild(new_instance);
    initiateText(new_instance);
}

function initiateText(object) {
    let id = objectList.length;
    let combined = {
        object: object,
        type: "text",
        id: id,
    };
    objectList.push(combined);
    let buttons = object.getElementsByClassName("textbox_button");
    let button_container = object.getElementsByClassName("text_buttons");
    let textbox = object.getElementsByClassName("textbox");

    const [moveButton, increaseButton, decreaseButton, boldButton, italicButton, underlineButton, colorPicker, hide, scaleDown, remove,] = buttons;

    function increaseFontSelected(factor) {
        var selection = window.getSelection();
        if (!selection.rangeCount) return;
        if (selection.anchorNode instanceof HTMLSpanElement) {
            selection.anchorNode.style.fontSize = (parseInt(selection.anchorNode.style.fontSize) + factor) + 'px';
            return;
        }
        var range = selection.getRangeAt(0);
        var selectedText = range.extractContents();
        var span = document.createElement('span');
        span.appendChild(selectedText);
        var currentFontSize = window.getComputedStyle(range.startContainer.parentNode).fontSize;
        span.style.fontSize = (parseInt(currentFontSize) + factor) + 'px';
        range.insertNode(span);

        var newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }


    moveButton.addEventListener('mousedown', (e) => {
        e.preventDefault(); 
        isTextMoving = true;
        selectedText = e.target.parentElement.parentElement;
    });


    document.addEventListener('mouseup', () => {
        if (isTextMoving = true) {
            isTextMoving = false;
        }
    });


    function textmove(e) {
        if (isTextMoving) {
            let newX = draw.point(e.clientX, e.clientY).x;
            let newY = draw.point(e.clientX, e.clientY).y;

            var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            var pixels = 3 * (vh / 100);

            let offsetx = selectedText.getBoundingClientRect().left - moveButton.getBoundingClientRect().left;
            let offsety = selectedText.getBoundingClientRect().top - moveButton.getBoundingClientRect().top;
            selectedText.style.left = newX + offsetx - pixels + "px";
            selectedText.style.top = newY + offsety - pixels + "px";
        }
    }

    object.addEventListener('click', () => {
        document.addEventListener('mousemove', textmove);
        textSelected = object;
        button_container[0].style.display = "flex";
        let rect = button_container[0].getBoundingClientRect();
        let isOnScreen = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
        isOnScreen = true;
        if (isOnScreen == false) {
            let textbox_height = textbox[0].offsetHeight;
            button_container[0].style.left = "0px";
            button_container[0].style.top = `${textbox_height}px`;

        }
        if (isOnScreen == true) {
            button_container[0].style.left = "0px";
            button_container[0].style.top = `-6vh`;
        }
    });

    textbox[0].addEventListener('blur', () => {
        button_container[0].style.display = "none";
        textSelected = null;
        document.removeEventListener('mousemove', textmove);
    });

    increaseButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    increaseButton.addEventListener('click', () => {
        increaseFontSelected(5);
    });
    decreaseButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    decreaseButton.addEventListener('mousedown', (e) => {
        increaseFontSelected(-5);
    });

    colorPicker.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    colorPicker.addEventListener('input', () => {
        document.execCommand('foreColor', false, colorPicker.value);
    });

    boldButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    boldButton.addEventListener('mousedown', () => {
        document.execCommand('bold', false, null);
    });

    italicButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    italicButton.addEventListener('mousedown', () => {
        document.execCommand('italic', false, null);
    });

    underlineButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    underlineButton.addEventListener('mousedown', () => {
        document.execCommand('underline', false, null);
    });

    remove.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    remove.addEventListener('mousedown', () => {
        if (delete_click_count == 0) {
            window.parent.showNotification("double click for confirmation", 0)
            delete_click_count = 1;
        }
        else if (delete_click_count == 1) {
            delete_click_count = 0
            objectList.splice(id, 1);
            object.remove();
        }
    });

    scaleDown.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    scaleDown.addEventListener('mousedown', () => {
    
        textbox[0].style.height = 50 + "vh";
        textbox[0].style.width = 50 + "vh";
    });
    
    hide.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    hide.addEventListener('mousedown', () => {
        object.style.display = "none";
    });

}

function rectangle_util(firstPosition, secondPosition, color, strokeWidth) {
    let rectangle = draw.rect(secondPosition.x - firstPosition.x, secondPosition.y - firstPosition.y).stroke({
        width: strokeWidth
    });
    rectangle.stroke({
        color: color
    });
    rectangle.fill('none');
    let collission_rectangle = draw.rect(secondPosition.x - firstPosition.x, secondPosition.y - firstPosition.y).stroke({
        width: strokeWidth * 4
    });
    collission_rectangle.stroke({
        color: "transparent"
    });
    collission_rectangle.fill('none');
    collission_rectangle.node.setAttribute("class", "collission_rectangle");
    collission_rectangle.node.setAttribute("id", "collission_rectangle");
    InitRectangle(rectangle, collission_rectangle)
    return {
        do: () => rectangle.show(),
        undo: () => rectangle.hide()
    };
}

function draw_util(points_array, path, path_object) {
    let points = points_array
    if (findEventListener("drawing") != undefined) {
        unregisterEventListener(findEventListener("drawing"));
    }

    function drawing(event) {
        let position = draw.point(event.clientX, event.clientY);
        let input_point = [position.x, position.y];
        points.push(input_point);
        path = path + " L " + position.x + " " + position.y;
        path_object.plot(path);
    }
    draw.on("mousemove", drawing);
    registerEventListener("drawing", "mousemove", drawing);
}

function initFreeDraw(object, collission_line) {
    let id = objectList.length;
    let smooth_value = smooth_free_draw ? "true" : "false";
    let combined = {
        object: object,
        type: "path",
        collission_object: collission_line,
        id: id,
        color: object.node.attributes.stroke.value,
        controlPoints: [],
        pivot: [],
        smoothing: smooth_value
    };
    objectList.push(combined);
}

function distanceFromPointToLine(point, lineStart, lineEnd) {
    let dx = lineEnd[0] - lineStart[0];
    let dy = lineEnd[1] - lineStart[1];
    let t = ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / (dx * dx + dy * dy);
    let closestPoint;
    if (t < 0) {
        closestPoint = lineStart;
    } else if (t > 1) {
        closestPoint = lineEnd;
    } else {
        closestPoint = [lineStart[0] + t * dx, lineStart[1] + t * dy];
    }
    dx = point[0] - closestPoint[0];
    dy = point[1] - closestPoint[1];
    return Math.sqrt(dx * dx + dy * dy);
}

function ramerDouglasPeucker(pointList, epsilon) {
    let dmax = 0;
    let index = 0;
    let endIndex = pointList.length - 1;
    for (let i = 1; i < endIndex; i++) {
        let d = distanceFromPointToLine(pointList[i], pointList[0], pointList[endIndex]);
        if (d > dmax) {
            index = i;
            dmax = d;
        }
    }
    if (dmax > epsilon) {
        let recResults1 = ramerDouglasPeucker(pointList.slice(0, index + 1), epsilon);
        let recResults2 = ramerDouglasPeucker(pointList.slice(index, endIndex + 1), epsilon);
        let result = recResults1.slice(0, recResults1.length - 1).concat(recResults2);
        return result;
    } else {
        return [pointList[0], pointList[endIndex]];
    }
}

function pointsToPath(points) {
    let path = "";
    let m = "M " + points[0][0] + " " + points[0][1];
    let l = "";
    for (let i = 1; i < points.length; i++) {
        l = l + " L " + points[i][0] + " " + points[i][1];
    }
    path = m + l;
    return path;
}

function transformArray(inputArray) {
    const outputArray = [];
    inputArray.forEach(item => {
        outputArray.push(...item);
    });
    return outputArray;
}

function catmullRomSpline(data, k) {

    if (k == null) k = 1;

    var size = data.length;
    var last = size - 4;

    var path = "M " + [data[0], data[1]];

    for (var i = 0; i < size - 2; i += 2) {

        var x0 = i ? data[i - 2] : data[0];
        var y0 = i ? data[i - 1] : data[1];

        var x1 = data[i + 0];
        var y1 = data[i + 1];

        var x2 = data[i + 2];
        var y2 = data[i + 3];

        var x3 = i !== last ? data[i + 4] : x2;
        var y3 = i !== last ? data[i + 5] : y2;

        var cp1x = x1 + (x2 - x0) / 6 * k;
        var cp1y = y1 + (y2 - y0) / 6 * k;

        var cp2x = x2 - (x3 - x1) / 6 * k;
        var cp2y = y2 - (y3 - y1) / 6 * k;

        path += " C " + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    }

    return path;
}

function thinPoints(points, threshold) {
    let thinned = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
        let prevPoint = thinned[thinned.length - 1];
        let currPoint = points[i];
        let dist = Math.sqrt(Math.pow(currPoint[0] - prevPoint[0], 2) + Math.pow(currPoint[1] - prevPoint[1], 2));
        if (dist > threshold) {
            thinned.push(currPoint);
        }
    }
    thinned.push(points[points.length - 1]); // Always include the last point
    return thinned;
}


function pathArray(path) {
    var regex = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/ig;
    var points = [];
    var match;
    while ((match = regex.exec(path)) !== null) {

        var command = match[1];
        var coords = match[2].trim().split(/\s*,\s*|\s+/);

        switch (command) {
            case 'M':
            case 'L':
                for (var i = 0; i < coords.length; i += 2) {
                    points.push({
                        x: parseFloat(coords[i]),
                        y: parseFloat(coords[i + 1])
                    });
                }
                break;
            case 'H':
                for (var i = 0; i < coords.length; i++) {
                    points.push({
                        x: parseFloat(coords[i]),
                        y: points[points.length - 1].y
                    });
                }
                break;
            case 'V':
                for (var i = 0; i < coords.length; i++) {
                    points.push({
                        x: points[points.length - 1].x,
                        y: parseFloat(coords[i])
                    });
                }
                break;
            case 'C':
                for (var i = 0; i < coords.length; i += 6) {
                    points.push({
                        x: parseFloat(coords[i + 4]),
                        y: parseFloat(coords[i + 5])
                    });
                }


                break;
            default:
                console.error("Unsupported command: " + command);
                break;
        }
    }

    return points;
}