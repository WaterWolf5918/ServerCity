/* eslint-disable no-irregular-whitespace */
import { Dirent, existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { MinecraftServer, MySocket } from './server.js';
import { execSync } from 'child_process';
import path from 'path';
import { info } from './logger.js';

export interface ServerObject {
    autoStart: boolean;
    name: string;
    path: string;
    id: string;
}

interface GetProcess {
    'BasePriority': number;
    'Id': number;
    'MainWindowTitle': string;
    'PagedMemorySize': number;
    'PagedMemorySize64': number;
    'WorkingSet': number;
    'WorkingSet64': number;
    'Name': string;
}

export class ServerManager {
    configFile: string;
    servers: MinecraftServer[];

    constructor(configFile: string) {
        this.configFile = configFile;
        this.servers = [];
    }

    private len(): number {
        return (this.getServersFile().length as number);
    }

    getServersFile(): ServerObject[] {
        return JSON.parse(readFileSync(this.configFile, 'utf-8'));
    }

    private setFull(json: string) {
        writeFileSync(path.join(this.configFile), JSON.stringify(json, null, 4), );
        this.configFile = json;
    }

    private set(key: string | number, value: unknown): string {
        if (this.getServersFile()[key] !== null) {
            const full = this.getServersFile();
            full[key] = value;
            writeFileSync(
                path.join(this.configFile),
                JSON.stringify(full, null, 4),
            );
            return;
        } else {
            return 'ERROR';
        }
    }

    init() {
        this.getServersFile().forEach((ser) => {
            const mcServer = new MinecraftServer(ser.name, ser.id, ser.path);
            this.servers.push(mcServer);
            // do this after so the server is added to the server list so nothing explodes
            if (ser.autoStart) {
                info('Init',`Automatically starting server ${ser.name}`);
                mcServer.start();
                
            } 
        });
    }

    addServer(serverObject: ServerObject) {
        this.set(this.len(),serverObject);
    }

    // Uncomment when used (not sure it needs to exist atm)
    // deleteServerByID(id: string) {
    //     console.log(`[WARN] looking for server with id: "${id}".`);

    //     const configs = this.getServersFile();

    //     for(let i=0;i<configs.length;i++) {
    //         if(configs[i].id == id) {
    //             configs.splice(i, 1);
    //             this.setFull(configs[i]);
    //             console.log(`Deleted ${configs[i].name}`);
                
    //             return;
    //         }
    //     }
    // }


    getServerByID(id: string) {
        for(const server of this.servers) {
            if(server.id == id) return server;
        }
    }

    getServerConsoleByID(id: string) {
        const server = this.getServerByID(id);
        if(server) return server.fullConsole;
    }
}

export function getModListByDir(dir: string) {
    const list = { loaded: [], disabled: [] };

    const enabledFileTypes  = ['.jar'];
    const disabledFileTypes = ['.d','.disabled'];
    const modsDir           = path.join(dir, 'mods');
    const pluginsDir        = path.join(dir, 'plugins');
    
    const fileList:{type: 'mod'|'plugin', file: Dirent}[] = [];
    
    if(existsSync(modsDir))     readdirSync(modsDir,    { 'withFileTypes': true }).forEach(dir => fileList.push({type: 'mod',       file: dir}));
    if(existsSync(pluginsDir))  readdirSync(pluginsDir, { 'withFileTypes': true }).forEach(dir => fileList.push({type: 'plugin',    file: dir}));

    fileList.forEach(item => {
        if (!item.file.isFile()) return;
        const fileExt = path.extname(item.file.name);
        if(enabledFileTypes.includes(fileExt))          list.loaded.push(item.file.name);
        else if(disabledFileTypes.includes(fileExt))    list.disabled.push(item.file.name);
    });

    return list;
}

export function getMemoryUsage(pid: number) {
    throw new Error('`getMemoryUsage()` is not implemented yet!');
}

export function getInfoByPID(pid: number){
    const memory = execSync(`Get-Process -Id ${pid} | ConvertTo-Json`,{shell: 'powershell.exe'});
    const memJson: GetProcess = JSON.parse(memory.toString());

    return { ram: memJson.WorkingSet64 };
}

export function formatLog(id: string, level: string, text: string){
    const date = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-US',{dateStyle: 'short','timeStyle': 'short','hourCycle':'h24'}).format;
    const string = `[${timeFormatter(date)}] [${id}/${level}]: ${text}`;
    return string;
}