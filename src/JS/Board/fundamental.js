function getColor() {
    return document.getElementById('colorvalue').attributes.fill.value;
}

function getWidth() {
    return 2;
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


function rectangle_f(firstPosition, secondPosition, color, strokeWidth) {
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

function draw_f(points_array, path, path_object) {
    let points = points_array
    if (getEventListenerByName("drawing") != undefined) {
        disableEventListener(getEventListenerByName("drawing"));
    }

    function drawing(event) {
        let position = draw.point(event.clientX, event.clientY);
        let input_point = [position.x, position.y];
        points.push(input_point);
        path = path + " L " + position.x + " " + position.y;
        path_object.plot(path);
    }
    draw.on("mousemove", drawing);
    EventListenerTrack("drawing", "mousemove", drawing);
}

function InitDrawLine(object, collission_line) {
    let id = object_list.length;
    let combined = {
        object: object,
        type: "path",
        collission_object: collission_line,
        id: id,
        color: object.node.attributes.stroke.value,
        control_points: [],
        pivot: []
    };
    object_list.push(combined);
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

function points_to_path(points) {
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

function Catmull_Rom_Spline(data, k) {

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


function path_array(path) {
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