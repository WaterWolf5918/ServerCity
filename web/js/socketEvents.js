import {socket, selectedServer} from '../index.js';
import { Notification, writeMessageToTerminal, writePlayerList } from './ui.js';

export function handleSocketEvents() {
    socket.on('connect', (data) => {
        new Notification('Socket Connected', `Socket connected to ${location.hostname}:5010`,'wifi',4000);
    });

    socket.on('disconnect', (data) => {
        console.log(data);
        new Notification('Socket Disconnected', `Socket disconnected from ${location.hostname}:5010\nReason: ${data}`,'wifi_off',4000);
    });

    socket.on('connect_error', (data) => {
        new Notification('Connect Error', `Socket connect error\nReason: ${data}`,'error',4000);
    });


    // handle new console messages
    socket.on('console', (data) => {
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        writeMessageToTerminal(data.message);
    });

    //handle server status updates
    socket.on('statusUpdate',(data) => {
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        console.log(data);
        document.getElementById('state-text').innerText = data.state;
        
        switch(data.state.toLowerCase()){
            case 'started':
                new Notification('Server Started',`${data.serverName} started successfully.`,'info',5000);
                break;
            case 'stopped':
                new Notification('Server Stopped',`${data.serverName} stopped gracefully.`,'info',5000);
                break;
            case 'crashed':
                new Notification('Server Crashed',`${data.serverName} stopped unexpectedly!`,'warning',5000);
                break;

        }
        
    });

    socket.on('playerlistUpdate',(data) => {
        console.log(data);
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        console.log(data);
        writePlayerList(data.playerlist);
    });
}

