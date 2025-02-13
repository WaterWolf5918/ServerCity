const fileManagerDiv = document.getElementById('fileManager');
const fileManagerOverlay = document.getElementById('fileManagerOverlay');
let resizerListener;
let lastClicked;
let selectedFolder = '';
export let dirPath = '/';
export function setDirPath(value) { dirPath = value; }

function resizeCols(){
    const elSIze = (window.innerWidth) / 2;
    const root = document.querySelector(':root');
    root.style.setProperty('--cols',Math.floor(elSIze/ (200 + 20)));
}

function defaultFileManagerHTML(){
    const div = document.createElement('div');
    div.innerHTML = 
`
<span class="material-symbols-outlined fileManager-folder-icon">
    folder
</span>
<span>/</span>
`;
    div.classList.add('fileManager-folder');

    div.addEventListener('click',() => {
        if (lastClicked){
            lastClicked.classList.remove('fileManager-folder-active');
        }

        div.classList.add('fileManager-folder-active');
        selectedFolder = dirPath;
        lastClicked = div;
    });
    
    div.addEventListener('dblclick',() => {
        if (dirPath.split('/').length < 3) {
            dirPath = '/';
        } else {
            dirPath = dirPath.slice(0,dirPath.lastIndexOf('/'));
        }
        
        renderFolderList();
    });

    fileManagerDiv.append(div);
}


function renderFolderList(){
    fileManagerDiv.innerHTML = '';
    defaultFileManagerHTML();
    fetch(`/dirList/${encodeURIComponent(dirPath)}/`)
        .then(data => data.json())
        .then(data => {
            console.log(data);

            data.forEach(element => {
                const div = document.createElement('div');
                div.innerHTML = 
            `
            <span class="material-symbols-outlined fileManager-folder-icon">
                folder
            </span>
            <span>${element}</span>
            `;
                div.classList.add('fileManager-folder');
                div.addEventListener('click',() => {
                    if (lastClicked){
                        lastClicked.classList.remove('fileManager-folder-active');
                    }

                    div.classList.add('fileManager-folder-active');
                    selectedFolder = element;
                    lastClicked = div;
                });
                div.addEventListener('dblclick',() => {
                    if (dirPath == '/') {
                        dirPath = `/${element}`; 
                    } else {
                        dirPath = `${dirPath}/${element}`;
                    }
                    
                    renderFolderList();
                });

                fileManagerDiv.append(div);
            });
        });
}

export function openFileManager(){
    // eslint-disable-next-line no-undef
    fileManagerOverlay.classList.remove('hidden');
    resizeCols();
    resizerListener = window.addEventListener('resize',() => {
        resizeCols();
    });
    renderFolderList();

}

export function closeFileManager(){
    document.removeEventListener(resizerListener);
    fileManagerOverlay.classList.add('hidden');
    selectedFolder = '';
    dirPath = '/';
}