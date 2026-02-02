import { IUnifiedStorage, QueryParams, UnifiedStoredObject, UnifiedSwapStorageCompositeIndexes, UnifiedSwapStorageIndexes } from "@atomiqlabs/sdk";
import { Database } from "sqlite";
/**
 * SQLite-based unified storage with indexed query support.
 * Uses native SQLite indexes for efficient queries on swap data.
 */
export declare class SqliteUnifiedStorage implements IUnifiedStorage<UnifiedSwapStorageIndexes, UnifiedSwapStorageCompositeIndexes> {
    /** Path to the SQLite database file */
    readonly filename: string;
    /** SQLite database instance (available after init) */
    db?: Database;
    /** List of indexed column names */
    indexedColumns?: string[];
    /**
     * Creates a new SqliteUnifiedStorage instance
     * @param filename - Path to the SQLite database file
     */
    constructor(filename: string);
    /** @inheritDoc */
    init(indexes: UnifiedSwapStorageIndexes, compositeIndexes: UnifiedSwapStorageCompositeIndexes): Promise<void>;
    /** @inheritDoc */
    query(params: Array<Array<QueryParams>>): Promise<Array<UnifiedStoredObject>>;
    /** @inheritDoc */
    remove(value: UnifiedStoredObject): Promise<void>;
    /** @inheritDoc */
    removeAll(values: UnifiedStoredObject[]): Promise<void>;
    /** @inheritDoc */
    save(value: UnifiedStoredObject): Promise<void>;
    /** @inheritDoc */
    saveAll(values: UnifiedStoredObject[]): Promise<void>;
}
