function $(id) { return document.getElementById(id); }

var captureBtn = $('newCaptureBtn');

captureBtn.addEventListener('click', capture);

function capture() {
    chrome.tabs.executeScript({
        file: 'capture.js'
    });

}