import { IUnifiedStorage, QueryParams, UnifiedStoredObject } from "@atomiqlabs/sdk-lib";
import { Database } from "sqlite";
export declare class SqliteUnifiedStorage implements IUnifiedStorage {
    readonly filename: string;
    db: Database;
    constructor(filename: string);
    init(): Promise<void>;
    query(params: Array<Array<QueryParams>>): Promise<Array<UnifiedStoredObject>>;
    remove(value: UnifiedStoredObject): Promise<void>;
    removeAll(values: UnifiedStoredObject[]): Promise<void>;
    save(value: UnifiedStoredObject): Promise<void>;
    saveAll(values: UnifiedStoredObject[]): Promise<void>;
}
