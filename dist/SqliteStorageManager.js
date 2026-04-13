"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteStorageManager = void 0;
const sqlite_1 = require("sqlite");
const sqlite3_1 = require("sqlite3");
/**
 * SQLite-based storage manager for persisting StorageObject instances to a local database file.
 * Suitable for Node.js/Electron environments where SQLite is available.
 *
 * @typeParam T - Type of StorageObject to manage
 */
class SqliteStorageManager {
    /**
     * Creates a new SqliteStorageManager instance
     * @param filename - Path to the SQLite database file
     */
    constructor(filename) {
        /** @inheritDoc */
        this.data = {};
        this.filename = filename;
    }
    /** @inheritDoc */
    async init() {
        this.db = await (0, sqlite_1.open)({
            filename: this.filename,
            driver: sqlite3_1.Database
        });
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS store (
                id VARCHAR(255) PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);
    }
    /** @inheritDoc */
    async loadData(type) {
        if (this.db == null)
            throw new Error("Database not initialized!");
        const resources = await this.db.all(`SELECT * FROM store`);
        this.data = {};
        const allData = [];
        resources.forEach(({ id, value }) => {
            const obj = new type(value);
            this.data[id] = obj;
            allData.push(obj);
        });
        return allData;
    }
    /** @inheritDoc */
    async removeData(hash) {
        if (this.db == null)
            throw new Error("Database not initialized!");
        const stmt = await this.db.prepare(`
            DELETE FROM store WHERE id = @id;
        `);
        await stmt.run({
            "@id": hash
        });
    }
    /** @inheritDoc */
    async removeDataArr(keys) {
        if (this.db == null)
            throw new Error("Database not initialized!");
        if (keys.length === 0)
            return;
        const values = {};
        const tags = keys.map((value, index) => {
            const tag = "@id" + index.toString(10).padStart(8, "0");
            values[tag] = value;
            return tag;
        });
        const stmt = await this.db.prepare(`
            DELETE FROM store WHERE id IN (${tags.join(", ")});
        `);
        await stmt.run(values);
    }
    /** @inheritDoc */
    async saveData(hash, object) {
        if (this.db == null)
            throw new Error("Database not initialized!");
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
    async saveDataArr(values) {
        for (let val of values) {
            await this.saveData(val.id, val.object);
        }
    }
}
exports.SqliteStorageManager = SqliteStorageManager;
