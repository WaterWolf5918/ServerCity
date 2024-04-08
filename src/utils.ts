/* eslint-disable no-irregular-whitespace */
import { exec, execSync } from 'child_process';
import { Dirent, existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import path from 'path';

export class ConfigHelper {
    configFile: string;
    constructor(configFile: string) {
        this.configFile = configFile;
    }
    len(): number {
        return (this.getFull().length as number);
    }

    getFull(): Record<string, unknown> {
        return JSON.parse(readFileSync(this.configFile, 'utf-8'));
    }
    setFull(json) {
        writeFileSync(
            path.join(this.configFile),
            JSON.stringify(json, null, 4),
        );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(key: string): any {
        if (this.getFull()[key] !== null) {
            return this.getFull()[key];
        } else {
            return 'ERROR';
        }
    }
    set(key: string | number, value: unknown): string {
        if (this.getFull()[key] !== null) {
            const full = this.getFull();
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