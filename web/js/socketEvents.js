import { socket, selectedServer, serverCPUChart, serverRamChart } from '../index.js';
import { Notification, writeMessageToTerminal, writePlayerList } from './ui.js';
import { statsChart } from './chartUI.js';
import { clock, getStatus } from './utils.js';
export function handleSocketEvents() {
    socket.on('connect', (data) => {
        new Notification('Socket Connected', `Socket connected to ${location.hostname}:5010`, 'wifi', 4000);
    });

    socket.on('disconnect', (data) => {
        console.log(data);
        new Notification('Socket Disconnected', `Socket disconnected from ${location.hostname}:5010\nReason: ${data}`, 'wifi_off', 4000);
    });

    socket.on('connect_error', (data) => {
        new Notification('Connect Error', `Socket connect error\nReason: ${data}`, 'error', 4000);

    });


    // handle new console messages
    socket.on('console', (data) => {
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        writeMessageToTerminal(data.message);
    });

    //handle server status updates
    socket.on('statusUpdate', (data) => {
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        console.log(data);
        document.getElementById('state-text').innerText = data.state.charAt(0).toUpperCase() + data.state.slice(1);
        switch (data.state.toLowerCase()) {
            case 'started':
                getStatus();
                new Notification('Server Started', `${data.serverName} started successfully.`, 'info', 5000);
                break;
            case 'stopped':
                new Notification('Server Stopped', `${data.serverName} stopped gracefully.`, 'info', 5000);
                clearInterval(clock);
                break;
            case 'crashed':
                clearInterval(clock);
                new Notification('Server Crashed', `${data.serverName} stopped unexpectedly!`, 'warning', 5000);
                break;

        }

    });

    socket.on('playerlistUpdate', (data) => {
        console.log(data);
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        console.log(data);
        writePlayerList(data.playerlist);
    });

    function roundDec(float,places){
        return +parseFloat(float).toFixed(places);
    }

    let statsLastPing = -1;
    let lastSigCPU = 'pie';
    let lastSigRam = 'pie';
    socket.on('statsUpdate', (data) => {
        if (selectedServer == null) return;
        if (data.serverID !== selectedServer) return;
        document.getElementById('cpu-text').innerText = roundDec(data.newStats.cpuUsage.yUsage,2) + '%';
        document.getElementById('ram-text').innerText = `${Math.round(data.newStats.ramUsage.yProcessUsagePercent)}% (${Math.round(data.newStats.ramUsage.yProcessUsage / 1000)}MB / ${data.newStats.ramUsage.yProcessMax}MB)`;
        // console.log((Date.now() / 1000) - statsLastPing);
        serverRamChart.chart.options.scales.y.max = data.newStats.ramUsage.yProcessMax;

        if (lastSigCPU == 'pie' || data.newStats.cpuUsage.yUsage - lastSigCPU  >= 0.4 || lastSigCPU - data.newStats.cpuUsage.yUsage >= 0.4) {

            serverCPUChart.addPoint(data.newStats.xTimestamp,data.newStats.cpuUsage.yUsage);
            lastSigCPU = data.newStats.cpuUsage.yUsage;
        }
        
        if (lastSigRam == 'pie' || data.newStats.ramUsage.yProcessUsage / 1000 - lastSigRam >= 5 || lastSigRam - (data.newStats.ramUsage.yProcessUsage / 1000) >= 5) {

            serverRamChart.addPoint(data.newStats.xTimestamp,((data.newStats.ramUsage.yProcessUsage * 1000) / 1000) / 1000);
            lastSigRam = data.newStats.ramUsage.yProcessUsage / 1000;
        }

        console.log((Date.now() / 1000) - statsLastPing );

        if (statsLastPing == -1){
            setTimeout(() => {
                serverRamChart.addPoint(Date.now(),((data.newStats.ramUsage.yProcessUsage * 1000) / 1000) / 1000);
                serverCPUChart.addPoint(Date.now(),data.newStats.cpuUsage.yUsage);
                statsLastPing = Date.now() / 1000;
            },2000);
        } else if ((Date.now() / 1000) - statsLastPing >= 15) {
            // force update every 5 secs
            serverRamChart.addPoint(data.newStats.xTimestamp,((data.newStats.ramUsage.yProcessUsage * 1000) / 1000) / 1000);
            serverCPUChart.addPoint(data.newStats.xTimestamp,data.newStats.cpuUsage.yUsage);
            statsLastPing = Date.now() / 1000;
        }
        


        

        
        
        

        //     const info = {
        //         x: time.getTime(),
        //         y: int
        //     };
        //     cpuChart.data.datasets[0].data.push(info);

        //     cpuChart.update('none');
        console.log(data);
    });
}

