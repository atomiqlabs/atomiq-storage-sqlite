/**
 * # @atomiqlabs/storage-sqlite
 *
 * `@atomiqlabs/storage-sqlite` is the SQLite-backed storage adapter for the Atomiq SDK in Node.js. The SDK uses browser IndexedDB by default. Backends do not have IndexedDB, so they need to provide storage implementations explicitly. This package provides those implementations on top of SQLite files.
 *
 * ## What this package provides
 *
 * - `SqliteUnifiedStorage`: persistent unified swap storage used by the SDK for swap records and indexed queries.
 * - `SqliteStorageManager`: persistent key-value storage manager used for chain-specific SDK stores.
 *
 * Each instance writes to the SQLite file path you pass to its constructor.
 *
 * ## When to use it
 *
 * Use this package when you run the Atomiq SDK in:
 *
 * - Node.js backend services
 * - backend workers
 * - Electron main-process style environments with local filesystem access
 *
 * If you are running the SDK in the browser, you usually do not need this package because the SDK already uses IndexedDB there.
 *
 * ## Installation
 *
 * ```bash
 * npm install @atomiqlabs/sdk @atomiqlabs/storage-sqlite
 * ```
 *
 * ## SDK Usage
 *
 * Pass `SqliteUnifiedStorage` as `swapStorage` and `SqliteStorageManager` as `chainStorageCtor` when creating the swapper.
 *
 * ```typescript
 * import {BitcoinNetwork, SwapperFactory, TypedSwapper} from "@atomiqlabs/sdk";
 * import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";
 *
 * const swapper: TypedSwapper<SupportedChains> = Factory.newSwapper({
 *     chains: {
 *         ...
 *     },
 *     bitcoinNetwork: BitcoinNetwork.MAINNET,
 *     // In Node.js, provide persistent storage because the SDK's default
 *     // browser storage implementation is IndexedDB.
 *     swapStorage: chainId => new SqliteUnifiedStorage(`CHAIN_${chainId}.sqlite3`),
 *     chainStorageCtor: name => new SqliteStorageManager(`STORE_${name}.sqlite3`)
 * });
 * ```
 *
 * ## Notes
 *
 * - The adapter creates the required SQLite tables and indexes during SDK initialization.
 * - Storage is local and file-based, so persistence depends on the durability of the disk path you choose.
 * - `SqliteUnifiedStorage` uses SQLite indexes generated from the SDK-provided storage schema so swap queries remain efficient on the backend.
 *
 * @packageDocumentation
 */
export * from "./SqliteUnifiedStorage";
export * from "./SqliteStorageManager";
