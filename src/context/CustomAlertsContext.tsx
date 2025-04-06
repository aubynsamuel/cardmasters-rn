/* eslint-disable react-compiler/react-compiler */
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  ReactNode,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Type definitions
type AlertType = "info" | "success" | "warning" | "error";

interface AlertButton {
  text: string;
  onPress?: () => void;
  negative?: boolean;
  preventDismiss?: boolean;
  style?: object;
}

interface AlertConfig {
  title: string;
  message: string;
  buttons: AlertButton[];
  type: AlertType;
}

interface ToastConfig {
  message: string;
  duration: number;
  type: AlertType;
}

interface CustomAlertsContextType {
  showAlert: (
    config: Omit<AlertConfig, "buttons"> & { buttons?: AlertButton[] }
  ) => void;
  hideAlert: () => void;
  showToast: (config: Partial<ToastConfig> & { message: string }) => void;
}

const CustomAlertsContext = createContext<CustomAlertsContextType>({
  showAlert: () => {},
  hideAlert: () => {},
  showToast: () => {},
});

interface CustomAlertsProviderProps {
  children: ReactNode;
}

const { width } = Dimensions.get("window");

export const CustomAlertsProvider: React.FC<CustomAlertsProviderProps> = ({
  children,
}) => {
  // Alert State
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: "",
    message: "",
    buttons: [],
    type: "info",
  });

  // Alert animations
  const alertAnimation = useRef(new Animated.Value(0)).current;
  const alertBackdropAnimation = useRef(new Animated.Value(0)).current;

  // Toast State
  const [toastQueue, setToastQueue] = useState<ToastConfig[]>([]);
  const toastAnimation = useRef(new Animated.Value(0)).current;
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Icons mapped to type
  const getIconName = (type: AlertType): string => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "error":
        return "alert-circle";
      case "info":
      default:
        return "information-circle";
    }
  };

  // Colors mapped to type
  const getGradientColors = (type: AlertType): string[] => {
    switch (type) {
      case "success":
        return ["#10B981", "#059669"];
      case "warning":
        return ["#F59E0B", "#D97706"];
      case "error":
        return ["#EF4444", "#B91C1C"];
      case "info":
      default:
        return ["#0a8132", "#076324"]; // Using your game's primary color
    }
  };

  // Show Alert Function
  const showAlert = (
    config: Omit<AlertConfig, "buttons"> & { buttons?: AlertButton[] }
  ): void => {
    const buttons = config.buttons || [{ text: "OK" }];
    setAlertConfig({ ...config, buttons } as AlertConfig);
    setAlertVisible(true);

    // Animate alert in
    Animated.parallel([
      Animated.timing(alertBackdropAnimation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(alertAnimation, {
        toValue: 1,
        velocity: 3,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Hide Alert Function
  const hideAlert = (): void => {
    Animated.parallel([
      Animated.timing(alertBackdropAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(alertAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAlertVisible(false);
    });
  };

  // Process toast queue
  const processToastQueue = (): void => {
    if (toastQueue.length > 0) {
      // Clear any existing timeout
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      // Show the toast
      Animated.timing(toastAnimation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();

      // Set timeout to hide toast
      const duration = toastQueue[0].duration;
      toastTimeoutRef.current = setTimeout(() => {
        Animated.timing(toastAnimation, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          // Remove the toast from queue and check if there are more
          setToastQueue((prev) => {
            const newQueue = [...prev];
            newQueue.shift();
            return newQueue;
          });
          toastAnimation.setValue(0);

          // Process next toast after a small delay
          setTimeout(() => {
            if (toastQueue.length > 1) {
              processToastQueue();
            }
          }, 300);
        });
      }, duration);
    }
  };

  // Show Toast Function
  const showToast = ({
    message,
    duration = 2000,
    type = "info",
  }: Partial<ToastConfig> & { message: string }): void => {
    const newToast: ToastConfig = { message, duration, type };

    setToastQueue((prev) => {
      const isFirstToast = prev.length === 0;
      const newQueue = [...prev, newToast];

      // If this is the first toast, process immediately
      if (isFirstToast) {
        setTimeout(processToastQueue, 50);
      }

      return newQueue;
    });
  };

  // Update effect for toast queue
  React.useEffect(() => {
    if (toastQueue.length === 1) {
      processToastQueue();
    }
  }, [toastQueue.length]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const alertAnimatedStyle = {
    opacity: alertBackdropAnimation,
    transform: [
      {
        scale: alertAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  };

  const toastAnimatedStyle = {
    opacity: toastAnimation,
    transform: [
      {
        translateY: toastAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <CustomAlertsContext.Provider
      value={{
        showAlert,
        hideAlert,
        showToast,
      }}
    >
      {children}

      {/* Alert Overlay */}
      {alertVisible && (
        <View style={styles.overlayContainer} pointerEvents="box-none">
          <Animated.View
            style={[styles.backdrop, { opacity: alertBackdropAnimation }]}
            pointerEvents={alertVisible ? "auto" : "none"}
          />

          <Animated.View style={[styles.alertContainer, alertAnimatedStyle]}>
            <LinearGradient
              colors={getGradientColors(alertConfig.type)}
              style={styles.alertHeader}
            >
              <Ionicons
                name={getIconName(alertConfig.type)}
                size={24}
                color="#fff"
              />
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            </LinearGradient>

            <View style={styles.alertContent}>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            </View>

            <View style={styles.alertButtonContainer}>
              {alertConfig.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertButton,
                    index > 0 && { marginLeft: 10 },
                    button.style,
                  ]}
                  onPress={() => {
                    if (button.onPress) button.onPress();
                    if (!button.preventDismiss) hideAlert();
                  }}
                >
                  <LinearGradient
                    colors={
                      button.negative
                        ? ["#6B7280", "#4B5563"]
                        : getGradientColors(alertConfig.type)
                    }
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>{button.text}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      )}

      {/* Toast Container */}
      <View style={styles.toastOverlayContainer} pointerEvents="none">
        {toastQueue.length > 0 && (
          <Animated.View style={[styles.toastContainer, toastAnimatedStyle]}>
            <LinearGradient
              colors={getGradientColors(toastQueue[0].type)}
              style={styles.toastGradient}
            >
              <Ionicons
                name={getIconName(toastQueue[0].type)}
                size={20}
                color="#fff"
                style={styles.toastIcon}
              />
              <Text style={styles.toastMessage}>{toastQueue[0].message}</Text>
            </LinearGradient>
          </Animated.View>
        )}
      </View>
    </CustomAlertsContext.Provider>
  );
};

export const useCustomAlerts = (): CustomAlertsContextType =>
  useContext(CustomAlertsContext);

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "box-none",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 2000,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  alertTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  alertContent: {
    padding: 20,
  },
  alertMessage: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  alertButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  alertButton: {
    borderRadius: 8,
    overflow: "hidden",
    minWidth: 80,
  },
  buttonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  toastOverlayContainer: {
    position: "absolute",
    width: "100%",
    bottom: 60,
    alignItems: "center",
    zIndex: 1000,
    pointerEvents: "none",
  },
  toastContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toastGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toastIcon: {
    marginRight: 10,
  },
  toastMessage: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
