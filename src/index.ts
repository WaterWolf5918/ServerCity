import express from 'express';
import { createServer } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { Server, Socket } from 'socket.io';
import { ConfigHelper } from './utils.js';
import { createRequire } from 'module';
import Rcon from 'rcon-srcds';
import { spawn } from 'child_process';
import cors from 'cors';
import { MinecraftServer } from './server.js';

// const servers = [
//     {
//         name: 'WG-Craft',
//         id: 'wg-craft',
//         path: 'C:\\Users\\lucas\\Downloads\\plainMinecraftServedr',
//         state: 'stopped',
//         stop: void '',
//         forceStop: void ''
//     }
// ];

const port = 5010;

const app = express();
const server = createServer(app);
const io = new Server(server,{cors: {origin: '*'}});
let socket: Socket ;



app.use(express.static(path.join(__dirname, '../', 'web')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'web', 'index.html'));
});


io.on('connection', (sock) => {
    console.log('a user connected');
    socket = sock;

});

server.listen(port, () => {
    console.log('server starting on port : ' + port);
});

server.on('listening',() => {
    const timer = setInterval(() => {
        if (socket == undefined) {return;}
        clearInterval(timer);
        main(socket);
    },200);
    
});

function main(socket){
    const servers = [
        new MinecraftServer(socket,'WG-Craft','wg-craft','C:\\Users\\lucas\\Downloads\\plainMinecraftServedr')
    ];
    servers[0].start();


    app.post('/stop/:serverID/force/',(req, res) => {
        console.log(req.params.serverID);
        servers.forEach((server) => {
            if(server.id !== req.params.serverID) {res.sendStatus(404); return;}
            server.forceStop();
            res.sendStatus(200);
        });
    });
    
    app.post('/stop/:serverID/force/',(req, res) => {
        console.log(req.params.serverID);
        servers.forEach((server) => {
            if(server.id !== req.params.serverID) {res.sendStatus(404); return;}
            server.stop();
            res.sendStatus(200);
        });
    });
}

// function startServer(server){
//     if (socket == undefined) {
//         setTimeout(() => {
//             startServer(server);
//         }),200;
//         return;
//     }
//     const child = spawn('java8',['-jar','server.jar'],{'cwd': server.path});
//     server.state = 'started';
//     const commandHandler = (data) => {
//         console.log(data);
//         if (data.serverID !== server.id) return;
//         child.stdin.write(data.command + '\n');
//     };
//     socket.on('sendCommand',commandHandler);


//     child.stdout.on('data',(d) => {
//         if (socket !== undefined) {socket.emit('console',{serverID: server.id, message: d.toString()});}
//         console.log(d.toString());
//     });
//     child.stderr.on('data',(d) => {
//         console.log(d.toString());
//     });
//     child.on('close',() => {
//         if (socket !== undefined) {socket.emit('close',{serverID: server.id});}
//         if (server.state == 'stopped') return;
//         console.log('On a 1 to 10 scale this process is fucked');
//         server.state = 'stopped';
//     });

//     const stopServer = () => {
//         if (server.state == 'stopped') return;
//         server.state = 'stopped';
//         child.stdin.write('stop\n');
//         socket.off('sendCommand', commandHandler);
//     };

//     const forceStopServer = () => {
//         if (server.state == 'stopped') return;
//         server.state = 'stopped';
//         child.kill();
//         socket.off('sendCommand', commandHandler);
//     };

//     server.stop = stopServer;
//     server.forceStop = forceStopServer;
//     // process.on('message',() => {});
// }

// function startServerByID(id: string){
//     servers.forEach((server) => {
//         if(server.id !== id) return;
//         startServer(server);
//     });
// }
// startServerByID('wg-craft');
