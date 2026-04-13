import {open, Database} from "sqlite";
import {Database as sqlite3Database} from "sqlite3";
import {IStorageManager, StorageObject} from "@atomiqlabs/base";

/**
 * SQLite-based storage manager for persisting StorageObject instances to a local database file.
 * Suitable for Node.js/Electron environments where SQLite is available.
 *
 * @typeParam T - Type of StorageObject to manage
 */
export class SqliteStorageManager<T extends StorageObject = StorageObject> implements IStorageManager<T> {

    /** Path to the SQLite database file */
    readonly filename: string;
    /** SQLite database instance (available after init) */
    db?: Database;

    /**
     * Creates a new SqliteStorageManager instance
     * @param filename - Path to the SQLite database file
     */
    constructor(filename: string) {
        this.filename = filename;
    }

    /** @inheritDoc */
    async init(): Promise<void> {
        this.db = await open({
            filename: this.filename,
            driver: sqlite3Database
        })
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS store (
                id VARCHAR(255) PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);
    }

    /** @inheritDoc */
    data: { [p: string]: T } = {};

    /** @inheritDoc */
    async loadData(type: { new(data: any): T }): Promise<T[]> {
        if(this.db==null) throw new Error("Database not initialized!");
        const resources = await this.db.all(`SELECT * FROM store`);
        this.data = {};
        const allData: T[] = [];
        resources.forEach(({id, value}) => {
            const obj = new type(value);
            this.data[id] = obj;
            allData.push(obj);
        });
        return allData;
    }

    /** @inheritDoc */
    async removeData(hash: string): Promise<void> {
        if(this.db==null) throw new Error("Database not initialized!");
        const stmt = await this.db.prepare(`
            DELETE FROM store WHERE id = @id;
        `);
        await stmt.run({
            "@id": hash
        });
    }

    /** @inheritDoc */
    async removeDataArr(keys: string[]): Promise<void> {
        if(this.db==null) throw new Error("Database not initialized!");
        if(keys.length===0) return;
        const values: {[name: string]: string} = {};
        const tags = keys.map((value, index) => {
            const tag = "@id"+index.toString(10).padStart(8, "0");
            values[tag] = value;
            return tag;
        });
        const stmt = await this.db.prepare(`
            DELETE FROM store WHERE id IN (${tags.join(", ")});
        `);
        await stmt.run(values);
    }

    /** @inheritDoc */
    async saveData(hash: string, object: T): Promise<void> {
        if(this.db==null) throw new Error("Database not initialized!");
        const stmt = await this.db.prepare(`
            INSERT INTO store (id, value)
            VALUES (@id, @value)
            ON CONFLICT(id) DO UPDATE SET 
                value = @value;
        `);
        await stmt.run({
            "@id": hash,
            "@value": JSON.stringify(object.serialize()),
        });
    }

    /** @inheritDoc */
    async saveDataArr(values: { id: string; object: T }[]): Promise<void> {
        for(let val of values) {
            await this.saveData(val.id, val.object);
        }
    }

}
