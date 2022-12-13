
import { App } from './canvas.js';


let dragzone = document.querySelector('#dragzone');
let buttonClose = document.querySelector('#closePreview');


let file;

let browseButton = document.querySelector('.dragzone__button');
let browseInput = document.querySelector('#fileInput');

browseInput.addEventListener('change', (e) => {
    file = e.target.files[0];
    readImageFile(file)
});
browseButton.addEventListener('click', () => {
    browseInput.click();
});

buttonClose.addEventListener('click', (e) => {
    preview.querySelector('.file').innerHTML = ''
    preview.style.zIndex ='-2'
});


dragzone.addEventListener('drop', (e) => {

    e.preventDefault();
    dragzone.classList.remove('active');

    file = e.dataTransfer.files[0];

    readImageFile(file)

});

dragzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dragzone.classList.contains('active')) {
        dragzone.classList.add('active');
    }
});

dragzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragzone.classList.remove('active');
});





function readImageFile(file) {
    
    let validExtensions =  ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
    fileType = file.type;
    
    if (!validExtensions.includes(fileType)) {
        alert("File not valid. Must be a image type");
        return
    }
    
    let fileReader = new FileReader()
    
    fileReader.readAsDataURL(file);
    
    fileReader.onload = () => {
        let fileURL = fileReader.result;
        preview.querySelector('.file').innerHTML = `<img src="${fileURL}" alt="" class="preview-media"></img>`
        preview.style.zIndex = '1';
        changeImageCanvas(fileURL)
    }
    
}

function changeImageCanvas(src) {
    palette.innerHTML = ''
    app.setImageSource(src);
    
}

/* App */
let preview = document.querySelector('.preview');
let palette = document.querySelector('.palette');
const canvas =  document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

let painel = document.querySelector('.painel');


const app = new App({
    canvas,
    ctx,
    'width': painel.offsetWidth,
    'height': painel.offsetHeight,
    'img': {
        'element': document.createElement('img'),
        'src': ''
    },
    palette
})

app.canvas.addEventListener('click', (e) => {
    let color = app.getPixel(e);
    painel.style.outline = `4px solid rgba(${color.r}, ${color.g},${color.b}, 1)`
});
