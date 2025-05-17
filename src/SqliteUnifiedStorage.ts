import {IUnifiedStorage, QueryParams, UnifiedStoredObject} from "@atomiqlabs/sdk-lib";
import {open, Database} from "sqlite";
import {Database as sqlite3Database} from "sqlite3";

export class SqliteUnifiedStorage implements IUnifiedStorage {

    readonly filename: string;
    db: Database;

    constructor(filename: string) {
        this.filename = filename;
    }

    async init(): Promise<void> {
        this.db = await open({
            filename: this.filename,
            driver: sqlite3Database
        })
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS swaps (
                id VARCHAR(255) PRIMARY KEY,
                type INTEGER UNSIGNED NOT NULL,
                escrowHash VARCHAR(255) NULL,
                paymentHash VARCHAR(255) NULL,
                initiator VARCHAR(255) NOT NULL,
                state INTEGER NOT NULL,
                data TEXT NOT NULL
            );
            
            CREATE INDEX IF NOT EXISTS idx_type ON swaps(type);
            CREATE INDEX IF NOT EXISTS idx_escrowHash ON swaps(escrowHash);
            CREATE INDEX IF NOT EXISTS idx_paymentHash ON swaps(paymentHash);
            CREATE INDEX IF NOT EXISTS idx_initiator ON swaps(initiator);
            CREATE INDEX IF NOT EXISTS idx_state ON swaps(state);
        `);
    }

    async query(params: Array<Array<QueryParams>>): Promise<Array<UnifiedStoredObject>> {
        const orQuery: string[] = [];
        const values: {[name: string]: any} = {};

        let counter = 0;
        for(let orParams of params) {
            const andQuery: string[] = [];
            for(let andParam of orParams) {
                if(Array.isArray(andParam.value)) {
                    const tags = andParam.value.map(value => {
                        const tag = "@"+andParam.key+counter.toString(10).padStart(8, "0");
                        values[tag] = value;
                        counter++;
                        return tag;
                    });
                    andQuery.push(andParam.key+" IN ("+tags.join(", ")+")");
                } else {
                    const tag = "@"+andParam.key+counter.toString(10).padStart(8, "0");
                    andQuery.push(andParam.key+" = "+tag);
                    values[tag] = andParam.value;
                    counter++;
                }
            }
            orQuery.push("("+andQuery.join(" AND ")+")");
        }

        const queryToSend = "SELECT * FROM swaps WHERE "+orQuery.join(" OR ");

        const stmt = await this.db.prepare(queryToSend);
        const resources = (await stmt.all(values)).map(val => JSON.parse(val.data));

        return resources;
    }

    async remove(value: UnifiedStoredObject): Promise<void> {
        const stmt = await this.db.prepare(`
            DELETE FROM swaps WHERE id = @id;
        `);
        await stmt.run({
            "@id": value.id
        });
    }

    async removeAll(values: UnifiedStoredObject[]): Promise<void> {
        for(let value of values) {
            await this.remove(value);
        }
    }

    async save(value: UnifiedStoredObject): Promise<void> {
        const stmt = await this.db.prepare(`
            INSERT INTO swaps (id, type, escrowHash, paymentHash, initiator, state, data)
            VALUES (@id, @type, @escrowHash, @paymentHash, @initiator, @state, @data)
            ON CONFLICT(id) DO UPDATE SET 
                type = @type,
                escrowHash = @escrowHash,
                paymentHash = @paymentHash,
                initiator = @initiator,
                state = @state,
                data = @data;
        `);
        await stmt.run({
            "@id": value.id,
            "@type": value.type,
            "@escrowHash": value.escrowHash,
            "@paymentHash": value.paymentHash,
            "@initiator": value.initiator,
            "@state": value.state,
            "@data": JSON.stringify(value),
        });
    }

    async saveAll(values: UnifiedStoredObject[]): Promise<void> {
        for(let val of values) {
            await this.save(val);
        }
    }



}
