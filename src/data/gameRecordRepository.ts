import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import { GameRecord } from "../types/gamePlayTypes";

export type GameRecordSyncStatus = "pending" | "synced" | "local_only";

type GameRecordRow = {
  payload: string;
};

const GUEST_OWNER = "guest";
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const ownerKey = (userId?: string | null) => userId ?? GUEST_OWNER;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("cardmasters.db").then(
      async (database) => {
        await database.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS game_records (
            game_id TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            mode TEXT NOT NULL,
            payload TEXT NOT NULL,
            sync_status TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            PRIMARY KEY (game_id, owner_id)
          );
          CREATE INDEX IF NOT EXISTS game_records_owner_created_idx
            ON game_records(owner_id, created_at DESC);
          CREATE INDEX IF NOT EXISTS game_records_pending_idx
            ON game_records(owner_id, sync_status);
        `);
        return database;
      }
    );
  }

  return databasePromise;
}

export async function saveLocalGameRecord(
  record: GameRecord,
  userId?: string | null,
  syncStatus: GameRecordSyncStatus = userId ? "pending" : "local_only"
): Promise<void> {
  const database = await getDatabase();
  const now = Date.now();

  await database.runAsync(
    `INSERT INTO game_records
      (game_id, owner_id, mode, payload, sync_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(game_id, owner_id) DO UPDATE SET
       owner_id = excluded.owner_id,
       mode = excluded.mode,
       payload = excluded.payload,
       sync_status = CASE
         WHEN game_records.sync_status = 'synced' THEN 'synced'
         ELSE excluded.sync_status
       END,
       updated_at = excluded.updated_at`,
    record.gameId,
    ownerKey(userId),
    record.mode,
    JSON.stringify(record),
    syncStatus,
    now,
    now
  );
}

export async function cacheRemoteGameRecords(
  records: GameRecord[],
  userId: string
): Promise<void> {
  const database = await getDatabase();
  const now = Date.now();

  await database.withTransactionAsync(async () => {
    for (const record of records) {
      await database.runAsync(
        `INSERT INTO game_records
          (game_id, owner_id, mode, payload, sync_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'synced', ?, ?)
         ON CONFLICT(game_id, owner_id) DO UPDATE SET
           owner_id = excluded.owner_id,
           mode = excluded.mode,
           payload = excluded.payload,
           sync_status = 'synced',
           updated_at = excluded.updated_at`,
        record.gameId,
        ownerKey(userId),
        record.mode,
        JSON.stringify(record),
        Number.isNaN(Date.parse(record.dateString))
          ? now
          : Date.parse(record.dateString),
        now
      );
    }
  });
}

export async function getLocalGameRecords(
  userId?: string | null
): Promise<GameRecord[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<GameRecordRow>(
    `SELECT payload FROM game_records
     WHERE owner_id = ?
     ORDER BY created_at DESC`,
    ownerKey(userId)
  );

  return rows.flatMap((row) => {
    try {
      return [JSON.parse(row.payload) as GameRecord];
    } catch {
      return [];
    }
  });
}

export async function getPendingGameRecords(
  userId: string
): Promise<GameRecord[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<GameRecordRow>(
    `SELECT payload FROM game_records
     WHERE owner_id = ? AND sync_status = 'pending'
     ORDER BY created_at ASC`,
    ownerKey(userId)
  );

  return rows.flatMap((row) => {
    try {
      return [JSON.parse(row.payload) as GameRecord];
    } catch {
      return [];
    }
  });
}

export async function markGameRecordSynced(
  gameId: string,
  userId: string
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE game_records
     SET sync_status = 'synced', updated_at = ?
     WHERE game_id = ? AND owner_id = ?`,
    Date.now(),
    gameId,
    ownerKey(userId)
  );
}

export async function migrateLegacyGameRecords(
  userId?: string | null
): Promise<void> {
  const migrationKey = `game_records_sqlite_migrated:${ownerKey(userId)}`;
  if ((await AsyncStorage.getItem(migrationKey)) === "true") return;

  const storedRecords = await AsyncStorage.getItem("gameRecord");
  if (storedRecords) {
    try {
      const records = JSON.parse(storedRecords) as GameRecord[];
      if (Array.isArray(records)) {
        const ownedRecords = records.filter((record) =>
          record.players.some((player) =>
            userId ? player.id === userId : player.id === "1234"
          )
        );

        for (const record of ownedRecords) {
          await saveLocalGameRecord(
            record,
            userId,
            record.mode === "single-player" && userId
              ? "pending"
              : userId
                ? "synced"
                : "local_only"
          );
        }
      }
    } catch (error) {
      console.error("Failed to migrate legacy game records", error);
    }
  }

  await AsyncStorage.removeItem("gameRecord");
  await AsyncStorage.setItem(migrationKey, "true");
}
