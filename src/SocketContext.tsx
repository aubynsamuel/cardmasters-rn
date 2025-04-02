import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

// Replace with your server's actual IP/domain and port
// Use your local IP address for testing on physical devices, not 'localhost'
// const SERVER_URL = "http://192.168.126.88:3000";
const SERVER_URL = "http://192.168.58.88:3000";

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
  // You might need user info here from Auth context to send when creating/joining rooms
  // const { userData } = useAuth();

  useEffect(() => {
    // Connect on mount
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

    newSocket.on("connect_error", (err) => {
      console.error("[SocketContext] Socket connection error:", err.message);
      // Handle connection errors (e.g., server down)
    });

    setSocket(newSocket);

    // Disconnect on cleanup
    return () => {
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};
