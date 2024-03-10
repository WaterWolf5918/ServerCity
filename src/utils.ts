/* eslint-disable no-irregular-whitespace */
import { readFileSync, writeFileSync } from 'fs';
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
