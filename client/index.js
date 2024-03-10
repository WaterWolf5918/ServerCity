
import { io } from 'socket.io-client';
const deviceMac = '04-7C-16-47-21-62';

const socket = io('ws://localhost:5000');
const response = await socket.emitWithAck('create',{type: 'desktop', mac: deviceMac});
socket.on('hibernate',(mac) => {
    if (deviceMac == mac){
        console.log('run code to hibernate');
    }
});
socket.io.on('reconnect', async () => {
    console.log('Reconnected to Server');

    const response = await socket.emitWithAck('create',{type: 'desktop', mac: deviceMac});
    console.log(response);
});

console.log(response);