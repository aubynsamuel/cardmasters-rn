import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { migrateLegacyGameRecords } from "../data/gameRecordRepository";
import { syncPendingGameRecords } from "../services/gameRecordSync";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function GameRecordSyncCoordinator() {
  const { userId } = useAuth();
  const { isConnected, socket } = useSocket();

  useEffect(() => {
    void migrateLegacyGameRecords(userId).then(() =>
      syncPendingGameRecords(socket, userId)
    );
  }, [isConnected, socket, userId]);

  useEffect(
    () =>
      NetInfo.addEventListener((network) => {
        if (network.isConnected && network.isInternetReachable !== false) {
          void syncPendingGameRecords(socket, userId);
        }
      }),
    [socket, userId]
  );

  return null;
}
