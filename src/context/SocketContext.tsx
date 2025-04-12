import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "../firebaseConfig";

// const SERVER_URL = "http://192.168.7.88:3000";

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ["websocket"], // Explicitly use websockets
      // autoConnect: false, // Optionally connect manually
    });

    newSocket.on("connect", () => {
      console.log("[SocketContext] Socket connected:", newSocket.id);
      setSocketId(newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("[SocketContext] Socket disconnected");
      setIsConnected(false);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newSocket.on("connect_error", (err) => {
      // console.error("[SocketContext] Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};
