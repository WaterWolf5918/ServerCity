import express from 'express';
import { createServer } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { Server, Socket } from 'socket.io';
import { ConfigHelper, getModListByDir } from './utils.js';
import { createRequire } from 'module';
import { spawn } from 'child_process';
import cors from 'cors';
import { MinecraftServer, MySocket } from './server.js';

const serversList = [
    {
        name: 'WG-Craft',
        id: 'wg-craft',
        path: 'C:\\Users\\lucas\\Downloads\\plainMinecraftServedr',
    },
    {
        name: 'SG30 Clone',
        id: 'sg50',
        path: 'C:\\Users\\lucas\\Downloads\\plainMinecraftServedr',
    }
];

const port = 5010;

const app = express();
const server = createServer(app);
export const io = new Server(server,{cors: {origin: '*'}});
let socket: MySocket ;

app.use(express.json());
app.use(cors({origin:'*'})); // remove this for public release
app.use(express.static(path.join(__dirname, '../', 'web')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'web', 'index.html'));
});


io.on('connection', (sock: MySocket) => {
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

function main(socket: MySocket){
    const servers = [];
    serversList.forEach((ser) => {
        servers.push(new MinecraftServer(socket, ser.name, ser.id, ser.path));
    });

    app.get('/servers',(req, res) => {
        res.send(serversList);
    });

    app.get('/getConsole/:serverID/',(req, res) => {
        let noMatch = true;
        servers.forEach((server: MinecraftServer) => {
            if(server.id !== req.params.serverID) {return;}
            noMatch = false;
            res.send(server.fullConsole);
        });
        if (noMatch) res.status(404);
    });


    app.get('/status/:serverID/',(req, res) => {
        let noMatch = true;
        
        servers.forEach((server: MinecraftServer) => {
            if(server.id !== req.params.serverID) {return;}
            noMatch = false;
            const modlist = getModListByDir(server.path);
            
            const status = {
                state: server.state,
                cpu: 'N/A',
                ram : 'N/A',
                startTime: server.startTime,
                players: server.players.length,
                loaded: `${modlist.loaded.length} / ${modlist.loaded.length + modlist.disabled.length}`
            };
            res.send(status);
        });
        if (noMatch) res.status(404);
    });

    app.post('/stop/:serverID/force/',(req, res) => {
        console.log(req.params.serverID);
        let noMatch = true;
        servers.forEach((server) => {
            if(server.id !== req.params.serverID) {return;}
            noMatch = false;
            server.forceStop();
        });
        noMatch ? res.sendStatus(404) : res.sendStatus(200);
    });
    



    app.post('/stop/:serverID/',(req, res) => {
        console.log(req.params.serverID);
        let noMatch = true;
        servers.forEach((server) => {
            if(server.id !== req.params.serverID) {return;}
            noMatch = false;
            server.stop();
        });
        noMatch ? res.sendStatus(404) : res.sendStatus(200);
    });

    app.post('/start/:serverID/',(req, res) => {
        console.log(req.params.serverID);
        let noMatch = true;
        servers.forEach((server) => {
            if(server.id !== req.params.serverID) {return;}
            noMatch = false;
            server.start();
        });
        noMatch ? res.sendStatus(404) : res.sendStatus(200);
    });

    app.post('/command/:serverID/',(req, res) => {
        const body = req.body;
        console.log(body);
        let noMatch = true;
        servers.forEach((server: MinecraftServer) => {
            if(server.id !== req.params.serverID) {return;}
            noMatch = false;
            server.sendCommand(body.command);
        });
        noMatch ? res.sendStatus(404) : res.sendStatus(200);
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
