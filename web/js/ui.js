import { selectedServer, consoleWindow } from '../index.js';
import { scanMessageForType } from './utils.js';
const noteArea = document.getElementById('notesArea');


export class Notification {

    /**
     * 
     * @param {string} title  
     * @param {string} body
     * @param {'info' | 'warning' | 'error' | 'bug_report' | 'wifi_off' | 'wifi'} type 
     * @param {number} autoCloseDelay
     */
    constructor(title,body,type,autoCloseDelay=8000,color=this.getColorFromType(type)){
        this.id = crypto.getRandomValues(new Uint8Array(8)).join('-');
        this.autoCloseDelay = autoCloseDelay;
        this.body = body;
        this.title = title;
        this.type = type;

        const note = document.createElement('div');
        note.classList.add('note');
        note.style.background = `linear-gradient(90deg, ${color} 0%, rgba(16,16,22,1) 20%)`;
        note.id = this.id;
        note.innerHTML = `
        <div class="note-icon">
            <span class="material-symbols-outlined status-icon">
                ${type}
            </span>
        </div>
        <div class="note-main">
            <span>${title}</span>
            <p>${body}</p>
        </div>
        <div id="${this.id}-close"class="note-close">
            <span class="material-symbols-outlined status-icon">
                close
            </span>
        </div>
        `;
        noteArea.appendChild(note);
        document.getElementById(`${this.id}-close`).onclick = () => {this.close();};
        note.style.animation = 'noteOpen 0.5s linear 1';
        this.autoClose();
    }
    close(){
        document.getElementById(this.id).style.animation = 'noteClose 0.8s linear 1';
        setTimeout(() => {
            document.getElementById(this.id).remove();
        },700);
    }

    autoClose(){
        setTimeout(() => {
            this.close();
        },this.autoCloseDelay);
    }

    getColorFromType(type){
        console.log(type);
        switch(type){
            case 'info':
                return 'rgba(108,25,127,1)';
            case 'warning':
                return 'rgba(255,174,0,1)';
            case 'error':
                return 'rgba(255,0,0,1)';
            case 'bug_report':
                return 'rgba(0,89,255,1)';
            case 'wifi_off':
                return 'rgba(255,0,0,1)';
            case 'wifi':
                return 'rgba(0,255,0,1)';
            default:
                return 'rgba(100,100,100,1)';
        }
    }
}

export function writeMessageToTerminal(message, color = 'unset') {
    if (color == 'unset') {
        color = scanMessageForType(message).color;
    }
    const consoleLine = document.createElement('div');
    const span = document.createElement('span');
    span.style = `color: ${color}`;
    let autoScroll = false;
    if (consoleWindow.scrollTop == consoleWindow.scrollTopMax) {
        autoScroll = true;
    }
    span.innerText = message;
    consoleLine.appendChild(span);
    consoleWindow.appendChild(consoleLine);
    // console.log(autoScroll);
    if (autoScroll) { consoleWindow.scrollTo(0, consoleWindow.scrollHeight); }
}

/**
 * 
 * @param {Array} playerlist 
 */
export function writePlayerList(list) {
    console.log(list);
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    for(let i=0;i<list.length;i++){
        const listItem = document.createElement('li');
        listItem.appendChild(document.createTextNode(list[i].name));
        playerList.appendChild(listItem);
    }
}

// export async function drawDirList() {
//     const dirListEl = document.getElementById('dirList');
//     dirListEl.innerHTML = '';
//     let messages = await fetch(`http://${location.hostname}:5010/dirList/${dirPath}/`);
//     messages = await messages.json();
//     const backButton = document.createElement('li');
//     backButton.innerText = '../';
//     backButton.onclick = () => {
//         const split = dirPath.split('@');
//         split.pop();
//         split.pop();
//         console.log(split);
//         setDirPath(split.join('@'));
//         if (dirPath.charAt(0) !== '@'){ setDirPath(`@${dirPath}@`); }
//         setDirPath(dirPath + '@');
//         drawDirList();
//     };
//     dirListEl.appendChild(backButton);
//     messages.forEach(element => {
//         const dirItem = document.createElement('li');
//         dirItem.innerText = element;
//         dirItem.onclick = () => {
//             setDirPath(`${dirPath}${element}@`); // I miss +=
//             drawDirList();
//         };
        
//         dirListEl.appendChild(dirItem);
//     });
// }

