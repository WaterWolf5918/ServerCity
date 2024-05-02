import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { statsChart } from './js/chartUI.js';
import { drawDirList } from './js/ui.js';
import { init } from './js/startup.js';
import { handleDOMEvents } from './js/DOMEvents.js';
import { handleSocketEvents } from './js/SocketEvents.js';
export const socket = io(':5010', { port: 5010 });
export const consoleWindow = document.getElementById('console-window');

export let selectedServer = null;
export let selectedMenu = 'menuNone';
export let dirPath = '@';

init();
handleDOMEvents();
handleSocketEvents();
drawDirList('@');
export function setSelectedServer(value) { selectedServer = value; }
export function setSelectedMenu(value) { selectedMenu = value; }
export function setDirPath(value) { dirPath = value; }

export const serverCPUChart = new statsChart(document.getElementById('serverCPUChart'),'CPU Usage','#0C6291','#0B5076CC',undefined,(value,index,ticks) => {
    return value + '%';
});
export const serverRamChart = new statsChart(document.getElementById('serverRAMChart'),'Memory Usage',undefined,undefined,undefined,(value,index,ticks) => {
    return value + 'MB';
});


function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}


