import { environment } from "@/config/environment";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { auth } from "../config/firebase";
import { useAuth } from "./AuthContext";

// const SERVER_URL = "http://10.51.230.88:3000";
const SERVER_URL = environment.serverUrl;

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  socketId: string | undefined | null;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
  socketId: null,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isLoading, userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const newSocket = io(SERVER_URL, {
      transports: ["websocket"],
      auth: async (callback) => {
        try {
          const token = await auth.currentUser?.getIdToken();
          callback(token ? { token } : {});
        } catch (error) {
          console.error("[SocketContext] Failed to get auth token", error);
          callback({});
        }
      },
    });

    newSocket.on("connect", async () => {
      console.log("[SocketContext] Socket connected:", newSocket.id);
      setSocketId(newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("[SocketContext] Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[SocketContext] Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, [isLoading, userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};
