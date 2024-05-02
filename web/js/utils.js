import {selectedServer, consoleWindow} from '../index.js';
import {writeMessageToTerminal} from './ui.js';


export let clock;

export function divideTime(time) {
    const result = {};
    result.days = Math.floor(time / 1000 / 60 / 60 / 24);
    time -= result.days * 1000 * 60 * 60 * 24;

    result.hours = Math.floor(time / 1000 / 60 / 60);
    time -= result.hours * 1000 * 60 * 60;

    result.mins = Math.floor(time / 1000 / 60);
    time -= result.mins * 1000 * 60;

    result.secs = Math.floor(time / 1000);
    return result;

}



export async function getStatus() {
    clearInterval(clock);

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
    if (status.startTime == -1) return;
    const then = new Date(status.startTime);
    const now = new Date();

    
    clock = setInterval(() => {
        const timeElapsed = (Date.now() - then);
        const time = divideTime(timeElapsed);
        // console.log(divideTime(timeElapsed));
        let string = '';
        
        if (time.days >= 1) string += `${time.days} days`;
        if (time.hours >= 1) string += `${time.hours} hours`;
        if (time.mins >= 1) string += `${time.mins} mins`;
        
        if (time.mins <= 1) string += `${time.secs} secs`;

        uptimeText.innerText = string;
    },1000);
}


export async function restorePastConsole() {
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
export function scanMessageForType(message) {
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