/*
    This script is executed when user presses the
    camera button to capture screenshot
 */

(function() {
    var port = chrome.runtime.connect({name:"content-script"});

    // overlay is an canvas element used in overlay with screen,
    // to select the area to crop
    var overlay = document.createElement('canvas');
    var selecting = false;                          // Whether currently dragging/selecting area
    overlay.setAttribute('id', 'capture-area');
    var ctx = overlay.getContext('2d');
    var width = document.documentElement.clientWidth;
    var height = window.innerHeight;
    overlay.width = width;
    overlay.height = height;
    overlay.style.position = 'fixed';
    overlay.style.margin = '0px';
    overlay.style.padding = '0px';
    overlay.style.zIndex = 114033;
    overlay.style.opacity = .5;
    overlay.style.top = 0;
    ctx.fillRect(0, 0, width, height);              // Make screen darker to indicate area selection

    overlay.onmousedown = toggleCapture;
    overlay.onmouseup = toggleCapture;


    var startCoords;
    var endCoords;

    document.body.appendChild(overlay);

    function calcXY(event) {
        return {
            x: event.clientX,
            y: event.clientY
        }
    }

    function toggleCapture(event) {
        /*
        Handles when to start capturing area and when to stop
         */
        overlay.onmousemove = areaSelect;

        if(!startCoords) {
            // Start capturing/selecting area
            startCoords = calcXY(event);
            selecting = true;
        }
        else {
            // Done selection, send coordinates to worker process
            // for cropping
            reset();
            endCoords = calcXY(event);
            port.postMessage({
                'message': 'startCapture',
                data: {
                    start: startCoords,
                    end: endCoords,
                    width: width,
                    height: height
                }
            });

            startCoords = null;
            endCoords = null;
            selecting = false;
        }
    };

    port.onMessage.addListener(function(request, sender) {
        switch(request.message) {
            case 'captured':
                //
                console.log('captured');
                window.open(request.data);
                break;
       }
    });

    function areaSelect(event) {
        /*
        Called when user is selecting area i.e. drag and mousemove
        Updates start and end coordinates of rectangle selected
         */
        if(selecting) {
            // If mouse is clicked and dragged, then execute this code
            endCoords = calcXY(event);
            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, width, height);
            ctx.clearRect(startCoords.x, startCoords.y, endCoords.x - startCoords.x, endCoords.y - startCoords.y);
        }
    };

    function onWindowResize(event) {
        width = document.documentElement.clientWidth;
        height = window.innerHeight;
        overlay.width = width;
        overlay.height = height;
        ctx.fillRect(0, 0, width, height);
    }

    function reset() {
        // Called when a capture is finished
        document.body.style.cursor = 'default';
        document.body.removeChild(overlay);
    }

    document.body.style.cursor = 'crosshair';
    document.body.onresize = onWindowResize;
})();
