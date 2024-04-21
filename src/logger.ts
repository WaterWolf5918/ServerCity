import chalk from 'chalk';

export function info(id,text) {
    internalLog(id,chalk.green('INFO'),text);
}

export function debug(id,text) {
    internalLog(id,chalk.magenta('DEBUG'),text);
}

export function warn(id,text) {

    internalLog(id,chalk.yellow('WARN'),text);
}

export function error(id,text) {
    internalLog(id,chalk.red('ERROR'),text);
}

export function fatal(id,text) {
    internalLog(id,chalk.redBright('FATAL'),text);
}

function internalLog(id: string, level: string, text: string){
    const date = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-US',{dateStyle: 'short','timeStyle': 'short','hourCycle':'h24'}).format;
    const string = `[${timeFormatter(date)}] [${id}/${level}]: ${text}`;
    console.log(string);
}