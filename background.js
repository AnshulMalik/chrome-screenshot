chrome.runtime.onConnect.addListener(function(port) {

    // Listen for image capture messages from script running on tab
    port.onMessage.addListener(function(request, sender) {
        chrome.tabs.captureVisibleTab(
            /*
            Capture all the visible tab and then crop it
            according to coordinates received from tab process(capture.js)
             */
            null, {format: 'png', quality: 100}, function(dataURI) {
                if (dataURI) {
                    console.log('Sending url of image');
                    var cropped = crop(dataURI, request.data.start, request.data.end, request.data.width, request.data.height);

                    // Keep track of some of recent captures
                    // save in local storage as array
                    var recent = JSON.parse(localStorage.getItem('recent'));
                    if(!recent)
                        recent = [];
                    if(recent.length >= 5)
                        recent.shift();     // Remove one item from start (queue pop)
                    recent.push(cropped);
                    localStorage.setItem('recent', JSON.stringify(recent));

                    chrome.tabs.create({
                        url: 'background.html'
                    });
                }
            });
    });
});

function crop(dataURL, startCoords, endCoords, width, height) {
    var crop_canvas;
    var sourceImage = new Image();
    sourceImage.src = dataURL;

    // Temporary canvas is created to crop the image
    crop_canvas = document.createElement('canvas');
    crop_canvas.width =  Math.abs(endCoords.x - startCoords.x);
    crop_canvas.height = Math.abs(endCoords.y - startCoords.y);

    var start;

    // Since, user can drag in multiple directions, the top right corner's coordinates
    // are calculated to draw image
    if(startCoords.x < endCoords.x) {
        if(startCoords.y > endCoords.y) {
            start = { x: startCoords.x, y: endCoords.y};
        }
        else {
            start = startCoords;
        }
    }
    else {
        if(startCoords.y > endCoords.y) {
            start = endCoords;
        }
        else {
            start = { x: endCoords.x, y: startCoords.y };
        }
    }


    crop_canvas.getContext('2d').drawImage(sourceImage, start.x, start.y, width, height, 0, 0, width, height);
    return crop_canvas.toDataURL("image/png");
}
