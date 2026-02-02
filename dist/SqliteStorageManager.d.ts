import { Database } from "sqlite";
import { IStorageManager, StorageObject } from "@atomiqlabs/base";
/**
 * SQLite-based storage manager for persisting StorageObject instances to a local database file.
 * Suitable for Node.js/Electron environments where SQLite is available.
 *
 * @typeParam T - Type of StorageObject to manage
 */
export declare class SqliteStorageManager<T extends StorageObject> implements IStorageManager<T> {
    /** Path to the SQLite database file */
    readonly filename: string;
    /** SQLite database instance (available after init) */
    db?: Database;
    /**
     * Creates a new SqliteStorageManager instance
     * @param filename - Path to the SQLite database file
     */
    constructor(filename: string);
    /** @inheritDoc */
    init(): Promise<void>;
    /** @inheritDoc */
    data: {
        [p: string]: T;
    };
    /** @inheritDoc */
    loadData(type: {
        new (data: any): T;
    }): Promise<T[]>;
    /** @inheritDoc */
    removeData(hash: string): Promise<void>;
    /** @inheritDoc */
    removeDataArr(keys: string[]): Promise<void>;
    /** @inheritDoc */
    saveData(hash: string, object: T): Promise<void>;
    /** @inheritDoc */
    saveDataArr(values: {
        id: string;
        object: T;
    }[]): Promise<void>;
}
