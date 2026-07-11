import {
  Href,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useMemo } from "react";
import { useNavigationStore } from "../store/navigationStore";
import { Room } from "../types/serverPayloadTypes";

type LegacyRouteName =
  | "Splash"
  | "Auth"
  | "MainMenu"
  | "Game"
  | "MultiplayerLobby"
  | "RoomScreen"
  | "MultiPlayerGameScreen"
  | "RulesScreen"
  | "StatsScreen"
  | "Settings"
  | "ProfileScreen"
  | "GameOver";

type LegacyParams = Record<string, unknown> | undefined;

const staticRoutes: Partial<Record<LegacyRouteName, Href>> = {
  Splash: "/",
  Auth: "/(auth)/sign-in",
  MainMenu: "/(app)/menu",
  Game: "/(app)/single-player",
  MultiplayerLobby: "/(app)/multiplayer/lobby",
  RulesScreen: "/(app)/rules",
  StatsScreen: "/(app)/stats",
  Settings: "/(app)/settings",
  ProfileScreen: "/(app)/profile",
  GameOver: "/(app)/game-over",
};

const saveRouteState = (name: LegacyRouteName, params?: LegacyParams) => {
  if (!params) return;

  const store = useNavigationStore.getState();
  const roomId = typeof params.roomId === "string" ? params.roomId : null;
  const roomData = (params.initialRoomData ?? params.roomData) as
    | Room
    | undefined;

  if (roomId) {
    store.setRoom(roomId, roomData);
  }

  if (name === "GameOver") {
    store.setGameOverData(params as never);
  }
};

const resolveRoute = (name: LegacyRouteName, params?: LegacyParams): Href => {
  if (name === "RoomScreen" || name === "MultiPlayerGameScreen") {
    const roomId =
      typeof params?.roomId === "string"
        ? params.roomId
        : useNavigationStore.getState().roomId;

    if (!roomId) return "/(app)/multiplayer/lobby";

    return (
      name === "RoomScreen"
        ? `/(app)/multiplayer/room/${roomId}`
        : `/(app)/multiplayer/game/${roomId}`
    ) as Href;
  }

  return staticRoutes[name] ?? "/(app)/menu";
};

const parseNavigationTarget = (
  target: LegacyRouteName | { name: LegacyRouteName; params?: LegacyParams },
  params?: LegacyParams
) => {
  if (typeof target === "string") return { name: target, params };
  return target;
};

export const useLegacyNavigation = <T = unknown>() => {
  const router = useRouter();

  return useMemo(
    () => ({
      navigate: (
        target:
          | LegacyRouteName
          | { name: LegacyRouteName; params?: LegacyParams },
        params?: LegacyParams
      ) => {
        const destination = parseNavigationTarget(target, params);
        saveRouteState(destination.name, destination.params);
        router.push(resolveRoute(destination.name, destination.params));
      },
      reset: ({
        routes,
      }: {
        routes: { name: LegacyRouteName; params?: LegacyParams }[];
      }) => {
        const destination = routes[routes.length - 1];
        if (!destination) return;
        saveRouteState(destination.name, destination.params);
        router.replace(resolveRoute(destination.name, destination.params));
      },
      goBack: () => {
        if (router.canGoBack()) router.back();
        else router.replace("/(app)/menu");
      },
      setOptions: (_options: Record<string, unknown>) => undefined,
    }),
    [router]
  ) as T & {
    navigate: (...args: any[]) => void;
    reset: (...args: any[]) => void;
    goBack: () => void;
    setOptions: (options: Record<string, unknown>) => void;
  };
};

export const useLegacyRoute = () => {
  const params = useLocalSearchParams<{ roomId?: string }>();
  const storedRoomId = useNavigationStore((state) => state.roomId);
  const roomId = params.roomId ?? storedRoomId;
  const roomData = useNavigationStore((state) => state.roomData);

  return {
    params: {
      roomId,
      initialRoomData: roomData,
      roomData,
    },
  };
};

export { useFocusEffect };
