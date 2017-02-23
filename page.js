function $(id) { return document.getElementById(id); };

var img = new Image();                  // Main image to be displayed on summary page
var recentContainer = $('recent');      // Element to hold recent history images
var presentContainer = $('present');    // Big container for selected image
var images = JSON.parse(localStorage.getItem('recent'));

if(images) {


    img.src = images[images.length - 1];

    var downloadBtn = document.createElement('a');
    var copyBtn = document.createElement('a');
    downloadBtn.setAttribute('download', 'capture.png');
    downloadBtn.setAttribute('alt', 'Download image')
    downloadBtn.setAttribute('href', images[images.length - 1]);
    downloadBtn.innerHTML = '<img src="images/open.png" width="42px" alt="Download image"/>';

    copyBtn.setAttribute('href', '#');
    copyBtn.addEventListener('click', copyToClipboard);
    copyBtn.innerHTML = '<img src="images/copy-icon.png" width="42px"/>';

    // Show recent images
    for (var i = 0; i < images.length; i++) {
        let image = new Image();
        image.src = images[i];
        image.onclick = changePresent.bind(null, i);
        recentContainer.appendChild(image);
    }

    presentContainer.appendChild(img);
    presentContainer.appendChild(document.createElement('br'));
    presentContainer.appendChild(downloadBtn);
    presentContainer.appendChild(copyBtn);
}

function changePresent(index) {
    // On click on recent image's thumbnail, main image will be replaced
    // with currently selected thumbnail
    img.src = images[index];
    downloadBtn .setAttribute('href', images[index]);
}

function copyToClipboard() {
    window.prompt("Copy to clipboard: Ctrl+C, Enter", img.src);
}