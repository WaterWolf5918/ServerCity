import { selectedServer, setSelectedServer, consoleWindow } from '../index.js';
import { getStatus, restorePastConsole } from './utils.js';

export const serversList = document.getElementById('serverList');
export function init() {
    loadServerList();
}


export async function loadServerList() {
    let servers = await fetch(`http://${location.hostname}:5010/servers`);
    servers = await servers.json();
    
    servers.forEach((serv) => {
        const listItem = document.createElement('li');
        listItem.innerText = serv.name;
        listItem.id = serv.id;

        listItem.onclick = () => {
            if (selectedServer !== null) { document.getElementById(selectedServer).classList.remove('selected'); }
            setSelectedServer(serv.id);
            document.getElementById(selectedServer).classList.add('selected');
            consoleWindow.innerHTML = '';
            restorePastConsole();
            getStatus();
            document.getElementById('selectMenu').classList.remove('hidden');
            document.getElementById('menuStatus').click();
        };
        serversList.appendChild(listItem);
        console.log(serv.id);
    });
}