import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { BroadcastOperator, Socket } from 'socket.io';
import { DecorateAcknowledgementsWithMultipleResponses, DefaultEventsMap } from 'socket.io/dist/typed-events';

type ServerState = 'started' | 'stopping' |'stopped' 

interface MySocket extends Socket {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor (socket,serverName, serverID, serverPath, java8=true){
        this.name = serverName;
        this.id = serverID;
        this.path = serverPath;
        this.socket = socket;
        this.state = 'stopped';
        this.java8 = java8;
        this.fullConsole = [];
        console.log(this.id);
    }

    commandHandler(data){
        console.log(data);
        //@ts-expect-error There is no mcThis in the main class but this function runs in the context of socket.io and we have a socket.io value called mcThis. Now i hate this but i have no other ways to do this  im sorry.
        
        if (data.serverID !== this.mcThis.id) return;

        //@ts-expect-error There is no mcThis in the main class but this function runs in the context of socket.io and we have a socket.io value called mcThis. Now i hate this but i have no other ways to do this  im sorry.
        this.mcThis.child.stdin.write(data.command + '\n');
    }

    start(){
        if (this.state !== 'stopped'){console.error('Server can\'t be started well running or in the process of stopping.'); return;}
        this.child = spawn('java8',['-jar','server.jar'],{'cwd': this.path});
        this.state = 'started';
        this.socket.mcThis = this;
        this.socket.on('sendCommand',this.commandHandler);


        this.child.stdout.on('data',(d) => {
            if (this.socket !== undefined) {this.socket.emit('console',{serverID: this.id, message: d.toString()});}
            this.fullConsole.push(d.toString());
            console.log(d.toString());
        });

        this.child.stderr.on('data',(d) => {
            console.log(d.toString());
        });

        this.child.on('close',() => {
            if (this.socket !== undefined) {this.socket.emit('close',{serverID: this.id});}
            if (this.state == 'stopped') return;
            console.debug('On a 1 to 10 scale this process is fucked');
            this.state = 'stopped';
            this.fullConsole = [];
        });

    }
    stop(){
        if(this.state == 'stopped' || this.state == 'stopping') {console.error('Sorry but the server you are trying to stop is not online'); return;}
        this.child.stdin.write(this.child.stdin.write('stop\n'));
        this.socket.off('sendCommand',this.commandHandler);
        this.state = 'stopping';
        
    }

    forceStop(){
        if(this.state == 'stopped' || this.state == 'stopping') {console.error('Sorry but the server you are trying to stop is not online'); return;}
        this.child.kill();
        this.socket.off('sendCommand',this.commandHandler);
        this.state = 'stopping';
    }


}