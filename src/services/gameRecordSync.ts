import NetInfo from "@react-native-community/netinfo";
import { Socket } from "socket.io-client";
import {
  getPendingGameRecords,
  markGameRecordSynced,
} from "../data/gameRecordRepository";
import { GameRecord } from "../types/gamePlayTypes";

type SyncAcknowledgement = {
  ok: boolean;
  gameId?: string;
  error?: string;
};

function uploadRecord(socket: Socket, record: GameRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Sync timed out")), 8000);

    socket.emit(
      "sync_single_player_record",
      { record },
      (response: SyncAcknowledgement) => {
        clearTimeout(timeout);
        if (response?.ok) resolve();
        else reject(new Error(response?.error ?? "Record sync failed"));
      }
    );
  });
}

let activeSync: Promise<void> | null = null;

export function syncPendingGameRecords(
  socket: Socket | null,
  userId: string | null
): Promise<void> {
  if (!socket?.connected || !userId) return Promise.resolve();
  if (activeSync) return activeSync;

  activeSync = (async () => {
    const network = await NetInfo.fetch();
    if (!network.isConnected || network.isInternetReachable === false) return;

    const records = await getPendingGameRecords(userId);
    for (const record of records) {
      if (record.mode !== "single-player") continue;
      try {
        await uploadRecord(socket, record);
        await markGameRecordSynced(record.gameId, userId);
      } catch (error) {
        console.warn(`[GameRecordSync] ${record.gameId} remains pending`, error);
        break;
      }
    }
  })().finally(() => {
    activeSync = null;
  });

  return activeSync;
}
