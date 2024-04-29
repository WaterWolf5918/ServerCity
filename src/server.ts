import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Socket } from 'socket.io';
import { io } from './index.js';
import pidusage from 'pidusage';
import { formatLog } from './utils.js';
import { debug, fatal, info } from './logger.js';
import { error } from 'console';

type ServerState = 'started' | 'stopping' | 'stopped' | 'forceStopping' | 'crashed'

export interface MySocket extends Socket {
    mcThis: { id: string, child: ChildProcessWithoutNullStreams }
}

export interface Stats {
    cpu: number;
    memory: number;
    ppid: number;
    pid: number;
    ctime: number;
    elapsed: number;
    timestamp: number;
}

export interface player {
    name: string,
    ip: string,
    eid: string | number,
    joinCords: string
}

export class MinecraftServer {
    java8: boolean;
    name: string;
    id: string;
    path: string;
    child: ChildProcessWithoutNullStreams;
    state: ServerState;
    socket: MySocket;
    fullConsole: string[];
    startTime: number | Date;
    timer: ReturnType<typeof setInterval> | string;
    newTimer: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cpuChart: any[];
    players: player[];
    constructor(serverName: string, serverID: string, serverPath: string, java8 = true) {
        this.name = serverName;
        this.id = serverID;
        this.path = serverPath;

        this.state = 'stopped';
        this.java8 = java8;
        this.fullConsole = [];
        this.startTime = -1;
        this.timer = '';
        this.newTimer = false;
        this.cpuChart = [];
        this.players = [];
    }

    sendCommand(command: string) {
        this.child.stdin.write(command + '\n');
    }

    statsUpdate(time: number) {
        setTimeout(() => {
            this.getStats((stats: Stats) => {
                console.log(stats);
                if (this.newTimer == false) return;
                this.statsUpdate(time);
            });
        }, time);
    }

    getStats(callback: (stats: Stats) => void) {
        if (!this.child.pid) return;

        pidusage(this.child.pid, (_err, stats) => {
            this.cpuChart.push({ time: Date.now(), cpuUsage: stats.cpu });
            io.emit('cpuUpdate', { serverID: this.id, time: Date.now(), cpuUsage: stats.cpu });
            callback(stats);
        });
    }

    start() {
        if (this.state == 'stopping' || this.state == 'started') {
            error(this.id,'Server can\'t be started well running or in the process of stopping.');
            return;
        }

        info(this.id,'Server is starting');

        this.child = spawn('java8', ['-jar', 'server.jar'], { 'cwd': this.path });
        this.state = 'started';

        io.emit('start', { serverID: this.id });
        io.emit('statusUpdate', { serverID: this.id, serverName:this.name, state: this.state });

        this.startTime = Date.now();

        this.child.stdout.on('data', (d) => {
            io.emit('console', { serverID: this.id, message: d.toString() });
            this.fullConsole.push(d.toString());
            this.parseJoinLeaveEvents(d.toString());
        });

        this.newTimer = true;

        this.child.on('close', () => {
            if (this.state == 'stopped') return;

            io.emit('close', { serverID: this.id });

            if (this.state !== 'stopping') {
                const message = `[${new Date().toISOString()}] [${this.id}/FATAL] : Server has stopped unexpectedly`;
                
                io.emit('statusUpdate', { serverID: this.id, serverName:this.name, state: 'crashed' });
                io.emit('console', { serverID: this.id, message: message });

                this.fullConsole.push(message);
                debug(this.id,'On a 1 to 10 scale this server process is fucked');
                fatal(this.id,'Server has stopped unexpectedly');

                this.state = 'crashed';
            } else {
                const message = formatLog(this.id, 'INFO', 'Server has stopped gracefully');
                
                io.emit('statusUpdate', { serverID: this.id, serverName:this.name, state: 'stopped' });
                io.emit('console', { serverID: this.id, message });
                
                this.fullConsole.push(message);
                info(this.id,'Server has stopped gracefully');
                
                this.state = 'stopped';
            }

            this.newTimer = false;
        });
    }

    stop() {
        if (this.state == 'stopped' || this.state == 'stopping') { console.error('Sorry but the server you are trying to stop is not online'); return; }
        this.state = 'stopping';
        this.child.stdin.write(this.child.stdin.write('stop\n'));
    }

    forceStop() {
        if (this.state == 'stopped' || this.state == 'stopping') { console.error('Sorry but the server you are trying to stop is not online'); return; }

        this.child.kill();
    }

    private parseJoinLeaveEvents(message: string) {
        const joinRegex = /.*\[Server thread\/INFO] \[minecraft\/PlayerList]: (.*)\[\/(.*):.*] logged in with entity id (.*) at \((.*)\)/gm;
        const leaveRegex = /.*\[Server thread\/INFO] \[minecraft\/NetHandlerPlayServer]: (.*) lost connection: (.*)/gm;
        const join = joinRegex.exec(message);
        const leave = leaveRegex.exec(message);
        if (join) {
            join.shift();
            const joinData = {name: join[0],ip: join[1],eid: join[2],joinCords: join[3]};
            this.players.push(joinData);
            console.log(joinData);
            console.table(this.players);
            io.emit('playerlistUpdate', { serverID: this.id, playerlist: this.players });
        } 
        else if (leave) {
            leave.shift();
            const leaveData = {name: leave[0],disconnectReason: leave[1]};
            for (let i=0;i<this.players.length;i++) {
                if (this.players[i].name == leaveData.name) {
                    this.players.splice(i,1);
                }
            }
            console.log(leaveData);
            io.emit('playerlistUpdate', { serverID: this.id, playerlist: this.players });
        }
    }
}