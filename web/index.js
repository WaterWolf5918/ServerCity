import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { DateTime } from 'https://moment.github.io/luxon/es6/luxon.min.js';
let selectedServer = null;
let selectedMenu = 'menuNone';
let uptimeTimer = '';
const socket = io(':5010', { port: 5010 });
const powerButton = document.getElementById('powerButton');
const consoleWindow = document.getElementById('console-window');
const serversList = document.getElementById('serverList');
powerButton.addEventListener('click', () => {
    document.getElementById('powerMenu').classList.toggle('hidden');
});

socket.on('connect', () => {
    console.log('Connected to socket');
});

socket.on('console', (data) => {
    if (selectedServer == null) return;
    if (data.serverID !== selectedServer) return;
    writeMessageToTerminal(data.message);
});

document.getElementById('console-input').addEventListener('keypress', (key) => {
    if (key.key == 'Enter') {
        const command = document.getElementById('console-input').value;

        fetch(`http://${location.hostname}:5010/command/${selectedServer}/`,
            {
                body: JSON.stringify({ 'command': command }),
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
        // console.log(command);
        document.getElementById('console-input').value = '';
        consoleWindow.scrollTo(0, consoleWindow.scrollHeight);
    }
});

let servers = await fetch(`http://${location.hostname}:5010/servers`);
servers = await servers.json();
servers.forEach((serv) => {
    const listItem = document.createElement('li');
    listItem.innerText = serv.name;
    listItem.id = serv.id;

    listItem.onclick = () => {
        if (selectedServer !== null) { document.getElementById(selectedServer).classList.remove('selected'); }
        selectedServer = serv.id;
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

async function getStatus() {
    const stateText = document.getElementById('state-text');
    const cpuText = document.getElementById('cpu-text');
    const ramText = document.getElementById('ram-text');

    const uptimeText = document.getElementById('uptime-text');
    const playersText = document.getElementById('player-text');
    const loadedText = document.getElementById('loaded-text');
    
    let status = await fetch(`http://${location.hostname}:5010/status/${selectedServer}/`);
    status = await status.json();
    console.log(status);

    status.state = status.state.charAt(0).toUpperCase() + status.state.slice(1);
    stateText.innerText = status.state;
    cpuText.innerText   = status.cpu;
    ramText.innerText   = status.ram;

    uptimeText.innerText = 'Loading...';
    playersText.innerText = status.players;
    loadedText.innerText = status.loaded;
}


async function restorePastConsole() {
    let messages = await fetch(`http://${location.hostname}:5010/getConsole/${selectedServer}/`);
    messages = await messages.json();
    consoleWindow.scrollTo(0, consoleWindow.scrollHeight);
    messages.forEach((msg) => {
        writeMessageToTerminal(msg);
    });
}

/**
 * 
 * @param {string} message 
 * @returns {object} returns a color code and type
 */
function scanMessageForType(message) {
    const info = /\/(INFO)] /gm;
    const warn = /\/(WARN)] /gm;
    const error = /\/(ERROR)] /gm;
    const fatal = /\/(FATAL)] /gm;
    if (info.test(message)) {
        return { color: '#c4c8f4', type: 'info' };
    }
    if (warn.test(message)) {
        return { color: '#eaa560', type: 'warn' };
    }
    if (error.test(message)) {
        return { color: '#df6355', type: 'error' };
    }
    if (fatal.test(message)) {
        return { color: '#ff5555', type: 'fatal' };
    }
    return { color: '#00FFFF', type: 'unknow' };
}

function writeMessageToTerminal(message, color = 'unset') {
    if (color == 'unset') {
        color = scanMessageForType(message).color;
    }
    const consoleLine = document.createElement('div');
    const span = document.createElement('span');
    span.style = `color: ${color}`;
    let autoScroll = false;
    // console.log(consoleWindow.scrollTop == consoleWindow.scrollTopMax);
    if (consoleWindow.scrollTop == consoleWindow.scrollTopMax) {
        autoScroll = true;
    }
    span.innerText = message;
    consoleLine.appendChild(span);
    consoleWindow.appendChild(consoleLine);
    // console.log(autoScroll);
    if (autoScroll) { consoleWindow.scrollTo(0, consoleWindow.scrollHeight); }
}



document.getElementById('actionsMenu').childNodes.forEach((el) => {
    el.onclick = async () => {
        console.log(el.id);
        if (selectedMenu !== 'menuNone') {
            document.getElementById(selectedMenu).classList.remove('selected');
        }
        document.getElementById(selectedMenu + 'Col').classList.add('hidden');
        selectedMenu = el.id;
        switch(selectedMenu){
        case 'menuConsole': {
            document.getElementById('playerListCol').classList.remove('hidden');
            break;
        }
        case 'menuStatus': {
            break;
        }
        }
        document.getElementById('playerListCol').classList.add('hidden');

        // if (selectedMenu == 'menuConsole') {
        //     document.getElementById('playerListCol').classList.remove('hidden');
        //     consoleWindow.innerHTML = '';
        //     restorePastConsole();
        // } else { document.getElementById('playerListCol').classList.add('hidden'); }
        document.getElementById(selectedMenu).classList.add('selected');
        document.getElementById(selectedMenu + 'Col').classList.remove('hidden');
    };

});

document.getElementById('powerStart').addEventListener('click', () => {
    fetch(`http://${location.hostname}:5010/start/${selectedServer}/`, { method: 'post' });
});

document.getElementById('powerFStop').addEventListener('click', () => {
    fetch(`http://${location.hostname}:5010/stop/${selectedServer}/force`, { method: 'post' });
});

document.getElementById('powerStop').addEventListener('click', () => {
    fetch(`http://${location.hostname}:5010/stop/${selectedServer}/`, { method: 'post' });
});



socket.on('statusUpdate',(data) => {
    console.log(data);
    if (selectedServer == null) return;
    if (data.serverID !== selectedServer) return;
    console.log(data);
    document.getElementById('state-text').innerText = data.state;
});



const ctx = document.getElementById('myChart');
let labels = [];
let count = 0;
let entries = [];
socket.on('cpuUpdate', (data) => {
    if (selectedServer == null) return;
    if (data.serverID !== selectedServer) return;
    console.log(data);
    const date = new Date(data.time);
    const formatter = new Intl.DateTimeFormat('en-us', {'dateStyle': 'short','timeStyle':'medium'});
    if (count < 2){
        entries.push(data.cpuUsage);
        count++;
        return;
    }
    let total = 0;
    entries.forEach((e) => {
        total += e;
    });
    chart.data.labels.push(formatter.format(date));
    chart.data.datasets.forEach((dataset) => {
        console.log(`${count} | ${total}`);
        dataset.data.push(total / count);
    });
    chart.update();
    entries = [];
    count = 0;
});


// eslint-disable-next-line no-undef
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: '# of Votes',
            data: [0],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});