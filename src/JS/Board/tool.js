function notool() {
    clearDrawEventListeners()
    deselect();
    if (preview) {
        preview.remove();
    }
    console.log("notool")
}

function line() {
    change_selection_state("off");
    clearDrawEventListeners()
    deselect();

    function handleClick(event) {
        const position = draw.point(event.clientX, event.clientY);
        if (firstPosition === null) {
            firstPosition = position;
            previewLine(position);

        } else if (secondPosition === null) {
            disableEventListener(getEventListenerByName("previewLine"));
            preview.remove();
            secondPosition = position;
            execute(line_f(firstPosition, secondPosition, getColor(), getWidth()));
            resetTools()
        }
    }

    draw.on('click', handleClick);
    EventListenerTrack("line_drawing", "click", handleClick);
}

function previewLine(startingPosition) {
    function handleMouseMove(event) {
        const position = draw.point(event.clientX, event.clientY);
        if (preview) {
            preview.remove();
        }
        preview = draw.line(startingPosition.x, startingPosition.y, position.x, position.y).stroke({
            width: getWidth()
        });
        preview.stroke({
            color: 'lightgray'
        });
    }

    draw.on('mousemove', handleMouseMove);
    EventListenerTrack("previewLine", "mousemove", handleMouseMove);
}


function text() {
    change_selection_state("off");
    clearDrawEventListeners()
    deselect();
    if (preview) {
        preview.remove();
    }

    function handleClick(event) {
        const position = draw.point(event.clientX, event.clientY);
        createMovableTextbox(position);
        resetTools();
    }
    draw.on('click', handleClick);
    EventListenerTrack("text_drawing", "click", handleClick);
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
    let m = "M" + points[0][0] + " " + points[0][1];
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
  
    var path = "M" + [data[0], data[1]];
  
    for (var i = 0; i < size - 2; i +=2) {
  
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
     
      path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    } 
  
    return path;
  }

function free_draw() {
    let path = "";
    let points = [];
    let path_object;
    function draw_f() {
        draw.on("mousemove", function (event) {
            let position = draw.point(event.clientX, event.clientY);
            console.log(position);
            let input_point = [position.x, position.y];
            points.push(input_point);
            path = path + " L " + position.x + " " + position.y;
            path_object.plot(path);
        });
    }

    draw.on("mousedown", function (event) {
        let position = draw.point(event.clientX, event.clientY);
        path = "m " + position.x + " " + position.y;
        path_object = draw.path(path).stroke({
            width: getWidth()
        });
        path_object.stroke({
            color: getColor()
        });
        path_object.node.style.fill = "transparent";
        draw_f();
    });
    draw.on("mouseup", function (event) {
        path_object.remove();
        let ramerDouglasPeucker_points = ramerDouglasPeucker(points, 3.0);
        let smooth_path = points_to_path(ramerDouglasPeucker_points);

        let index = 1;
        let a = points_to_path(points);
        if (ramer == true) {
            a = smooth_path
        }
        if (catmull == true && ramer == false) {
            a = Catmull_Rom_Spline(transformArray(points), index)
        }
        if (catmull == true && ramer == true) {
            a = Catmull_Rom_Spline(transformArray(ramerDouglasPeucker_points), index)
        }

        let new_path = draw.path(a).stroke({
            width: getWidth()
        });

        new_path.stroke({
            color: getColor()
        });
        new_path.node.style.fill = "transparent";
        points = [];
        path = "";
        draw.off("mousemove");
    });
}
