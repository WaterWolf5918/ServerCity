import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { BroadcastOperator, Socket } from 'socket.io';
import { DecorateAcknowledgementsWithMultipleResponses, DefaultEventsMap } from 'socket.io/dist/typed-events';
import { io } from '.';

type ServerState = 'started' | 'stopping' |'stopped' 

export interface MySocket extends Socket {
    mcThis: {id: string, child: ChildProcessWithoutNullStreams}
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
    constructor (socket: MySocket,serverName: string, serverID: string, serverPath: string, java8=true){
        this.name = serverName;
        this.id = serverID;
        this.path = serverPath;
        this.socket = socket;
        this.state = 'stopped';
        this.java8 = java8;
        this.fullConsole = [];
        console.log(this.id);
    }

    sendCommand(command){
        this.child.stdin.write(command + '\n');
    }

    start(){
        if (this.state !== 'stopped'){console.error('Server can\'t be started well running or in the process of stopping.'); return;}
        this.child = spawn('java8',['-jar','server.jar'],{'cwd': this.path});
        this.state = 'started';
        io.emit('start',{serverID: this.id});

        this.child.stdout.on('data',(d) => {
            // if (this.socket !== undefined) {this.socket.emit('console',{serverID: this.id, message: d.toString()});}
            io.emit('console',{serverID: this.id, message: d.toString()});
            this.fullConsole.push(d.toString());
            console.log(d.toString());
        });

        this.child.stderr.on('data',(d) => {
            console.log(d.toString());
        });

        this.child.on('close',() => {
            io.emit('close',{serverID: this.id});
            
            this.fullConsole = [];
            if (this.state == 'stopped') return;
            console.debug('On a 1 to 10 scale this process is fucked');
            this.state = 'stopped';

        });

    }
    stop(){
        if(this.state == 'stopped' || this.state == 'stopping') {console.error('Sorry but the server you are trying to stop is not online'); return;}
        this.child.stdin.write(this.child.stdin.write('stop\n'));
        this.state = 'stopping';
        
    }

    forceStop(){
        if(this.state == 'stopped' || this.state == 'stopping') {console.error('Sorry but the server you are trying to stop is not online'); return;}
        this.child.kill();
        this.state = 'stopping';
    }


}