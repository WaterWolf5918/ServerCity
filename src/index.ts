import express from 'express';
import { createServer } from 'http';
import * as path from 'path';
import { Server } from 'socket.io';
import { ServerManager, formatLog, getModListByDir } from './utils.js';
import cors from 'cors';
import { MySocket } from './server.js';
import { readdirSync } from 'fs';
import { networkInterfaces } from 'os';
import chalk from 'chalk';
import { info,warn } from './logger.js';


let socket: MySocket;

/**@deprecated */
const __dirname = import.meta.dirname;
const port = 5010;
const app = express();
const server = createServer(app);
const serverManager = new ServerManager(path.join(import.meta.dirname,'../servers.json'));
export const io = new Server(server,{cors: {origin: '*'}});

app.use(express.json());
app.use(cors({origin:'*'})); // remove this for public release
app.use(express.static(path.join(import.meta.dirname, '../', 'web')));

app.get('/', (req, res) => {
    res.sendFile(path.join(import.meta.dirname, '../web/index.html'));
});


// @todo There should be a little popup or modal
// telling the client it's not the active one.
io.on('connection', (sock: MySocket) => {
    if(socket) warn('SocketIO','Client attempted to connect while another one is connected.');
    socket = sock;
});

server.listen(port, () => {
    info('Main',`Server started on port ${port}`);
    const interfaces = networkInterfaces();
    Object.entries(interfaces).forEach(item => {
        item[1].forEach(info => {
            console.log(`    ${item[0]}: ${chalk.cyan(`http://${info.address}:${port}`)}`);
        });
    });
    main();
});

function main() {
    serverManager.init();
    
    app.get('/dirList/:dir', (_req, res) => {
        const list = [];
        let dir = _req.params.dir;
        dir = dir.replaceAll('@','/');
        readdirSync(dir,{withFileTypes: true}).forEach(item => {
            if (!item.isDirectory()) return;
            list.push(item.name);
        });
        res.send(list);
    });

    app.get('/servers', (_req, res) => {
        res.send(serverManager.getServersFile());
    });

    app.get('/getConsole/:serverID/', (req, res) => {
        const server = serverManager.getServerByID(req.params.serverID);
        if (!server) res.status(404);
        res.send(server.fullConsole);
    });


    app.get('/status/:serverID/', (req, res) => {
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