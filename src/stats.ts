
import { io } from './index.js';
import * as si from 'systeminformation';


// eslint-disable-next-line prefer-const
export let cpuData = [];

async function getAvgCPU(callback) {
    const dataArray = [];

    const timer = setInterval(() => {
        if (dataArray.length == 10){
            clearInterval(timer);
            let total = 0;
            for(let i=0;i<dataArray.length;i++){
                total += dataArray[i];
            }
            const avg = total / dataArray.length;
            callback(avg,dataArray);
            return;
        }
        si.currentLoad()
            .then(data => {
                dataArray.push(Math.round(data.currentLoad * 1000) / 1000);
            });
    },50);


}

export async function getUsageByPID(pid) {
    const processes = await si.processes();
    for(const process of processes.list) {
        if(process.pid == pid) {
            return {cpu: process.cpu, ramPercent: process.mem, ramUsed: process.memRss};
        }
    }
}



export async function startCPUStats() {
    setInterval(async () => {
        si.currentLoad()
            .then(data => {
                // console.log(Math.round(data.currentLoad * 1000) / 1000);
                // console.log(data);
            });
    },1000);

}