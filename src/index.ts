import express from 'express';
import { createServer } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { Server, Socket } from 'socket.io';
import { ServerManager, ServerObject, getModListByDir } from './utils.js';
import { createRequire } from 'module';
import { spawn } from 'child_process';
import cors from 'cors';
import { MinecraftServer, MySocket } from './server.js';
import { error } from 'console';




// let remove = serversList.deleteServerByID('notnuke');
// if (remove.error){
//     console.log('error');
//     console.log(remove.msg);
// }else {
//     console.log('ok');

// }


// const oldServersList = [
//     {
//         name: 'WG-Craft',
//         id: 'wg-craft',
//         path: 'C:\\Users\\lucas\\Downloads\\plainMinecraftServedr',
//     },
//     {
//         name: 'SG30 Clone',
//         id: 'sg50',
//         path: 'C:\\Users\\lucas\\Downloads\\plainMinecraftServedr',
//     }
// ];
let socket: MySocket ;
const port = 5010;
const app = express();
const server = createServer(app);
const serverManager = new ServerManager(path.join(__dirname,'../servers.json'));
export const io = new Server(server,{cors: {origin: '*'}});




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
    process.on('SIGINT',() => {
        server.close();
        process.exit();
    });
});

server.on('listening',() => {
    const timer = setInterval(() => {
        if (socket == undefined) {return;}
        clearInterval(timer);
        main(socket);
    },200);
});

function main(socket: MySocket){
    serverManager.init(socket);
    console.log(serverManager.getServerByID('wg-craft').name);


    app.get('/servers',(req, res) => {
        res.send(serverManager.getServersFile());
    });

    app.get('/getConsole/:serverID/',(req, res) => {
        const server = serverManager.getServerByID(req.params.serverID);
        if (!server) res.status(404);
        res.send(server.fullConsole);
    });


    app.get('/status/:serverID/',(req, res) => {
        const server = serverManager.getServerByID(req.params.serverID);
        if (!server) res.status(404);
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

    app.post('/stop/:serverID/force/',(req, res) => {
        const server = serverManager.getServerByID(req.params.serverID);
        if (!server) res.status(404);
        server.forceStop();
        res.sendStatus(200);
    });
    
    app.post('/stop/:serverID/',(req, res) => {
        const server = serverManager.getServerByID(req.params.serverID);
        if (!server) res.status(404);
        server.stop();
        res.sendStatus(200);
    });

    app.post('/start/:serverID/',(req, res) => {
        const server = serverManager.getServerByID(req.params.serverID);
        if (!server) res.status(404);
        server.start();
        res.sendStatus(200);
    });

    app.post('/command/:serverID/',(req, res) => {
        const server = serverManager.getServerByID(req.params.serverID);
        if (!server) res.status(404);
        server.sendCommand(req.body.command);
        res.sendStatus(200);
    });

}

