import {
  doc,
  collection,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { GameRecord } from "@/src/types/gamePlayTypes";

type LegacyGameRecordsDoc = {
  gameRecords?: unknown;
};

const saveGameRecord = async (userId: string, gameRecord: GameRecord) => {
  try {
    if (!userId) {
      console.error("Error storing game record to Firestore: missing userId");
      return;
    }

    const gameRecordDocRef = doc(
      db,
      "users",
      userId,
      "game_records",
      gameRecord.gameId
    );

    await setDoc(gameRecordDocRef, gameRecord, { merge: true });

    console.log("Game record successfully stored in Firestore!");
  } catch (error) {
    console.error("Error storing game record to Firestore:", error);
  }
};

const fetchGameRecords = async (
  userId: string
): Promise<GameRecord[] | null> => {
  try {
    if (!userId) {
      console.error("Error fetching game records from Firestore: missing userId");
      return null;
    }

    const newRecordsRef = collection(db, "users", userId, "game_records");
    const newSnapshot = await getDocs(newRecordsRef);

    const newRecords: GameRecord[] = newSnapshot.docs.map(
      (d) => d.data() as GameRecord
    );

    const legacyRecordsRef = collection(db, "users", userId, "game_record");
    const legacySnapshot = await getDocs(legacyRecordsRef);
    const legacyRecords: GameRecord[] = [];

    for (const d of legacySnapshot.docs) {
      const data = d.data() as unknown;
      const legacyContainer = data as LegacyGameRecordsDoc;

      if (Array.isArray(legacyContainer.gameRecords)) {
        for (const r of legacyContainer.gameRecords) {
          legacyRecords.push(r as GameRecord);
        }
      } else {
        legacyRecords.push(data as GameRecord);
      }
    }

    const byId = new Map<string, GameRecord>();
    for (const r of [...legacyRecords, ...newRecords]) {
      if (r?.gameId) byId.set(r.gameId, r);
    }

    return Array.from(byId.values());
  } catch (error) {
    console.error("Error fetching game records from Firestore:", error);
    return null;
  }
};

export { saveGameRecord, fetchGameRecords };
