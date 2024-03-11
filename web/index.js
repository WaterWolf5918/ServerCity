import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
let selectedServer = null;
let lestSelectedServer = null;
const socket = io(':5010',{port: 5010});
const powerButton = document.getElementById('powerButton');
const consoleWindow = document.getElementById('console-window');
const serversList = document.getElementById('serverList');
powerButton.addEventListener('click',() => {
    document.getElementById('powerMenu').classList.toggle('hidden');
});

socket.on('connect', () => {
    console.log('Connected to socket');
});

socket.on('console',(data) => {
    if(selectedServer == null) return;
    if (data.serverID !== selectedServer) return;
    writeMessageToTerminal(data.message);
});

document.getElementById('console-input').addEventListener('keypress',(key) => {
    console.log(key);
    if(key.key == 'Enter'){
        socket.emit('sendCommand',{serverID: selectedServer,'command': document.getElementById('console-input').value});
        document.getElementById('console-input').value = '';
        consoleWindow.scrollTo(0,consoleWindow.scrollHeight);
    }
});

let servers = await fetch(`http://${location.hostname}:5010/servers`);
servers = await servers.json();
servers.forEach((serv) => {
    const listItem = document.createElement('li');
    listItem.innerText = serv.name;
    listItem.id = serv.id;

    listItem.onclick = () => {
        if (selectedServer !== null) { document.getElementById(selectedServer).classList.remove('selectedServer'); }
        selectedServer = serv.id;
        document.getElementById(selectedServer).classList.add('selectedServer');
        consoleWindow.innerHTML = '';
        restorePastConsole();
    };
    serversList.appendChild(listItem);
    console.log(serv.id);
});

async function restorePastConsole(){
    let messages = await fetch(`http://${location.hostname}:5010/getConsole/${selectedServer}/`);
    messages = await messages.json();
    consoleWindow.scrollTo(0,consoleWindow.scrollHeight);
    messages.forEach((msg) => {
        writeMessageToTerminal(msg);
    });
    

}

/**
 * 
 * @param {string} message 
 * @returns {object} returns a color code and type
 */
function scanMessageForType(message){
    const info = /\/(INFO)] /gm;
    const warn = /\/(WARN)] /gm;
    const error = /\/(ERROR)] /gm;
    const fatal = /\/(FATAL)] /gm;
    if (info.test(message)){
        return {color: '#c4c8f4', type: 'info'};
    }
    if (warn.test(message)){
        return {color: '#eaa560', type: 'warn'};
    }
    if (error.test(message)){
        return {color: '#df6355', type: 'error'};
    }
    if (fatal.test(message)){
        return {color: '#ff5555', type: 'fatal  '};
    }
    // const regex = new RegExp(/\/(.*)] /gm);
    // if (!regex.test(message)) return {color: '#c4c8f4', type: 'unknown' };
    // const regex2 = new RegExp(/\/(.*)] /gm);
    // const scan = regex2.exec(message)[1];

    // console.log(scan);
    // let type;
    // let color;
    // switch(scan.toLowerCase()){
    // case 'info': {
    //     type = 'info';
    //     color = '#c4c8f4';
    //     break;
    // }
    // case 'warn': {
    //     type = 'warn';
    //     color = '#eaa560';
    //     break;
    // }
    // case 'error': {
    //     type = 'error';
    //     color = '#df6355';
    //     break;
    // }
    // default: {
    //     console.log(`HELP ${scan}`);
    //     type = 'error';
    //     color = '#df6355';
    // }
    // }
    return {color: '#00FFFF', type: 'unknow'};
}

function writeMessageToTerminal(message,color='unset'){
    if(color == 'unset'){
        color = scanMessageForType(message).color;
    }
    const consoleLine = document.createElement('div');
    const span = document.createElement('span');
    span.style = `color: ${color}`;
    let autoScroll = false;
    // console.log(consoleWindow.scrollTop == consoleWindow.scrollTopMax);
    if(consoleWindow.scrollTop == consoleWindow.scrollTopMax) {
        autoScroll = true;
    }
    span.innerText = message;
    consoleLine.appendChild(span);
    consoleWindow.appendChild(consoleLine);
    console.log(autoScroll);
    if (autoScroll) {consoleWindow.scrollTo(0,consoleWindow.scrollHeight);}
}

// <div id="console-window">
// <div class="console-line">
//     <span>[00:37:54] [Server thread/WARN] [minecraft/MinecraftServer]: Can't keep up! Did the system time change, or is the server overloaded? Running 2134ms behind, skipping 3 tick(s)</span>
// </div>
// </div>