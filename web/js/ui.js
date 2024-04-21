import { selectedServer, consoleWindow, dirPath, setDirPath } from '../index.js';
import { scanMessageForType } from './utils.js';


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

export async function drawDirList() {
    const dirListEl = document.getElementById('dirList');
    dirListEl.innerHTML = '';
    let messages = await fetch(`http://${location.hostname}:5010/dirList/${dirPath}/`);
    messages = await messages.json();
    const backButton = document.createElement('li');
    backButton.innerText = '../';
    backButton.onclick = () => {
        const split = dirPath.split('@');
        split.pop();
        split.pop();
        console.log(split);
        setDirPath(split.join('@'));
        if (dirPath.charAt(0) !== '@'){ setDirPath(`@${dirPath}@`); }
        setDirPath(dirPath + '@');
        drawDirList();
    };
    dirListEl.appendChild(backButton);
    messages.forEach(element => {
        const dirItem = document.createElement('li');
        dirItem.innerText = element;
        dirItem.onclick = () => {
            setDirPath(`${dirPath}${element}@`); // I miss +=
            drawDirList();
        };
        
        dirListEl.appendChild(dirItem);
    });
}