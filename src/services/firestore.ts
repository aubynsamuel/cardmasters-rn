import {
  doc,
  arrayUnion,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { GameRecord } from "../types/types";

const storeGameRecordToFirestore = async (
  userId: string,
  gameRecord: GameRecord
) => {
  try {
    const gameRecordRef = collection(doc(db, "users", userId), "game_record");

    await addDoc(gameRecordRef, {
      gameRecords: arrayUnion(gameRecord),
    });

    console.log("Game record successfully stored in Firestore!");
  } catch (error) {
    console.error("Error storing game record to Firestore:", error);
  }
};

const fetchGameRecordsFromFirestore = async (
  userId: string
): Promise<GameRecord[] | null> => {
  try {
    const gameRecordsRef = collection(doc(db, "users", userId), "game_record");
    const querySnapshot = await getDocs(gameRecordsRef);

    const gameRecords: GameRecord[] = querySnapshot.docs.map(
      (doc) => doc.data() as GameRecord
    );

    return gameRecords;
  } catch (error) {
    console.error("Error fetching game records from Firestore:", error);
    return null;
  }
};

export { storeGameRecordToFirestore, fetchGameRecordsFromFirestore };
