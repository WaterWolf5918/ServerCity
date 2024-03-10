import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
const socket = io(':5010',{port: 5010});



socket.on('console',(data) => {
    console.log(data.message);
    const consoleWindow = document.getElementById('console-window');
    const consoleLine = document.createElement('div');
    const span = document.createElement('span');
    let autoScroll = false;
    // console.log(consoleWindow.scrollTop == consoleWindow.scrollTopMax);
    if(consoleWindow.scrollTop == consoleWindow.scrollTopMax) {
        autoScroll = true;
    }
    span.innerText = data.message;
    consoleLine.appendChild(span);
    consoleWindow.appendChild(consoleLine);
    console.log(autoScroll);
    if (autoScroll) {consoleWindow.scrollTo(0,consoleWindow.scrollHeight);}
});

document.getElementById('console-input').addEventListener('keypress',(key) => {
    const consoleWindow = document.getElementById('console-window');
    console.log(key);
    if(key.key == 'Enter'){
        socket.emit('sendCommand',{serverID: 'wg-craft','command': document.getElementById('console-input').value});
        document.getElementById('console-input').value = '';
        consoleWindow.scrollTo(0,consoleWindow.scrollHeight);
    }
    
});



// <div id="console-window">
// <div class="console-line">
//     <span>[00:37:54] [Server thread/WARN] [minecraft/MinecraftServer]: Can't keep up! Did the system time change, or is the server overloaded? Running 2134ms behind, skipping 3 tick(s)</span>
// </div>
// </div>