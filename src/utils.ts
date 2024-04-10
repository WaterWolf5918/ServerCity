/* eslint-disable no-irregular-whitespace */
import { exec, execSync } from 'child_process';
import { Dirent, existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import path from 'path';
import { MinecraftServer } from './server';

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

    private setFull(json) {
        writeFileSync(
            path.join(this.configFile),
            JSON.stringify(json, null, 4),
        );
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

    init(socket){
        this.getServersFile().forEach((ser) => { this.servers.push(new MinecraftServer(socket, ser.name, ser.id, ser.path)); });
    }

    addServer(serverObject: ServerObject){
        console.log(this.len());
        this.set(this.len(),serverObject);
    }

    deleteServerByID(id){
        let result:{error?: string, msg:string} = {error: 'notFound', msg: `Server ${id} was not found`};
        console.log(`looking for ID ${id}`);
        const config:ServerObject[] = this.getServersFile();
        for(let i=0;i<config.length;i++){
            if (config[i].id !== id) continue;
            console.log(`Deleted ${config[i].name}`);
            config.splice(i,1);
            result = {msg: `Server ${id} was deleted.`};
        }
        this.setFull(config);
        return result;
    }
    getServerByID(id): MinecraftServer{
        let server;
        this.servers.forEach(ser => {
            if (ser.id !== id) return;
            server = ser;
        });
        return server;
    }


    getServerConsoleByID(id){
        const server = this.getServerByID(id);
        if (server){
            return (server.fullConsole);
        } else {
            return false;
        }
    }
}




export interface ServerObject {
    name: string,
    id: string,
    path: string,
}


interface GetProcess {
    'BasePriority': number;
    'Id': number;
    'MainWindowTitle': string;
    'PagedMemorySize': number;
    'PagedMemorySize64': number;
    'WorkingSet': number;
    'WorkingSet64': number
    'Name': string
    // i want working set
}


export function getModListByDir(dir){
    const list = {loaded: [], disabled: []};
    const enabledFileTypes = ['.jar'];
    const disabledFileTypes = ['.d','.disabled'];
    const modsDir = path.join(dir,'mods');
    const pluginsDir = path.join(dir,'plugins');
    const fileList:{type:'mod' | 'plugin',file: Dirent}[] = [];
    if (existsSync(modsDir)) {
        readdirSync(modsDir,{'withFileTypes': true}).forEach(dir => {fileList.push({type: 'mod',file: dir});});
    }
    if (existsSync(pluginsDir)){
        readdirSync(pluginsDir,{'withFileTypes': true}).forEach(dir => {fileList.push({type: 'plugin',file: dir});});
        //
    }
    fileList.forEach(item => {
        if (!item.file.isFile()) return;
        const fileExt = path.extname(item.file.name);
        if (enabledFileTypes.includes(fileExt)) {
            console.log(`${item.file.name} is enabled`);
            // console.log(item.type == 'mod' ? 'mod' : 'plugin');
            list.loaded.push(item.file.name);
        }
        if (disabledFileTypes.includes(fileExt)) {
            console.log(`${item.file.name} is disabled`);
            list.disabled.push(item.file.name);
            // console.log(item.type == 'mod' ? 'mod' : 'plugin');
        }
    });
    return list;
}

export function getMemoryUsage(pid){}

export function getInfoByPID(pid: number){
    const memory = execSync(`Get-Process -Id ${pid} | ConvertTo-Json`,{shell: 'powershell.exe'});
    const memJson: GetProcess = JSON.parse(memory.toString());
    // run test.ps1 to get cpu usage

    // const cpu = execSync(path.join(__dirname,'../src/',`test.ps1 ${pid}`),{shell: 'powershell.exe'});
    // console.log(cpu);

    return {ram: memJson.WorkingSet64};
}

export function formatLog(id,level,text){
    const date = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-US',{dateStyle: 'short','timeStyle': 'short','hourCycle':'h24'}).format;
    const string = `[${timeFormatter(date)}] [${id}/${level}]: ${text}`;
    return string;
}