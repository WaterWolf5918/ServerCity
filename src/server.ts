import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { BroadcastOperator, Socket } from 'socket.io';
import { DecorateAcknowledgementsWithMultipleResponses, DefaultEventsMap } from 'socket.io/dist/typed-events';
import { io } from '.';
import pidusage from 'pidusage';
import { getInfoByPID } from './utils';
type ServerState = 'started' | 'stopping' |'stopped' | 'forceStopping' | 'crashed'

export interface MySocket extends Socket {
    mcThis: {id: string, child: ChildProcessWithoutNullStreams}
}

export interface Stats {
    cpu: number;
    memory: number;
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
    players: string[];
    constructor (socket: MySocket,serverName: string, serverID: string, serverPath: string, java8=true){
        this.name = serverName;
        this.id = serverID;
        this.path = serverPath;
        this.socket = socket;
        this.state = 'stopped';
        this.java8 = java8;
        this.fullConsole = [];
        this.startTime = -1;
        this.timer = '';
        this.newTimer = false;
        this.cpuChart = [];
        this.players = [];
        console.log(this.id);
    }

    sendCommand(command){
        this.child.stdin.write(command + '\n');
    }

    
    statsUpdate(time){
        setTimeout(() => {
            this.getStats((stats:Stats) => {
                console.log(stats);
                if (this.newTimer == false) return;
                this.statsUpdate(time);
            });
        },time);
    }

    getStats(callback){
        if (!this.child.pid) return;
        pidusage(this.child.pid, (err, stats: Stats) => {
            this.cpuChart.push({time: Date.now(),cpuUsage: stats.cpu});
            io.emit('cpuUpdate',{serverID: this.id, time: Date.now(), cpuUsage: stats.cpu});
            callback(stats);
        });
        
    }

    start(){
        if (this.state !== 'stopped'){console.error('Server can\'t be started well running or in the process of stopping.'); return;}
        this.child = spawn('java8',['-jar','server.jar'],{'cwd': this.path});
        this.state = 'started';
        io.emit('start',{serverID: this.id});
        io.emit('statusUpdate',{serverID: this.id, state: this.state });
        
        this.startTime = Date.now();
        this.child.stdout.on('data',(d) => {
            // if (this.socket !== undefined) {this.socket.emit('console',{serverID: this.id, message: d.toString()});}
            io.emit('console',{serverID: this.id, message: d.toString()});
            this.fullConsole.push(d.toString());
            console.log(d.toString());
        });
        this.newTimer = true;
        // this.statsUpdate(1000);
        this.child.stderr.on('data',(d) => {
            console.log(d.toString());
        });

        this.child.on('close',() => {
            if (this.state == 'stopped') return; // not sure how this could happen
            // run code for when process stops or crashs
            io.emit('close',{serverID: this.id});

            //run code for when the process crashs
            if (this.state !== 'stopping'){
                // server crash give up hope
                const message = `[${new Date().toISOString()}] [Fatel] ${this.id}: Server has stopped unexpectedly`;
                io.emit('statusUpdate',{serverID: this.id, state: 'Crashed' });
                io.emit('console',{serverID: this.id, message: message });
                this.fullConsole.push(message);
                console.debug('On a 1 to 10 scale this server process is fucked');
                console.log(message);
                this.state = 'crashed';
            } else {
                // run code for when the process stops nicely
                const message = `[${new Date().toISOString()}] [INFO] ${this.id}: Server has stopped gracefully`;
                io.emit('statusUpdate',{serverID: this.id, state: 'Stopped' });
                io.emit('console',{serverID: this.id, message: message });
                this.fullConsole.push(message);
                console.log(message);
                this.state = 'stopped';
            }
            this.newTimer = false;
            
        });

    }
    stop(){
        if(this.state == 'stopped' || this.state == 'stopping') {console.error('Sorry but the server you are trying to stop is not online'); return;}
        this.state = 'stopping';
        this.child.stdin.write(this.child.stdin.write('stop\n'));
        
        
    }

    forceStop(){
        if(this.state == 'stopped' || this.state == 'stopping') {console.error('Sorry but the server you are trying to stop is not online'); return;}
        this.state = 'stopping';
        this.child.kill();
        
    }


}