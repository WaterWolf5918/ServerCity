import {socket, selectedServer} from '../index.js';
import { writeMessageToTerminal, writePlayerList } from './ui.js';

export function handleSocketEvents() {
    // handle new console messages
    socket.on('console', (data) => {
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        writeMessageToTerminal(data.message);
    });

    //handle server status updates
    socket.on('statusUpdate',(data) => {
        console.log(data);
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        console.log(data);
        document.getElementById('state-text').innerText = data.state;
    });

    socket.on('playerlistUpdate',(data) => {
        console.log(data);
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        console.log(data);
        writePlayerList(data.playerlist);
    });
}

