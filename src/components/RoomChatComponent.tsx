import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Message } from "../types/ServerPayloadTypes";

interface ChatComponentProps {
  messages: Message[];
  currentUserId: string | undefined;
  onSendMessage: (text: string) => void;
  onDismiss: () => void;
}

const RoomChatComponent = ({
  messages,
  currentUserId,
  onSendMessage,
  onDismiss,
}: ChatComponentProps) => {
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText("");
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <Text style={styles.senderText}>{item.senderName}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>
          {new Date(item.timestamp).toTimeString().slice(0, 5)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#8a8a8a"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    backgroundColor: "#222c25",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    height: 380,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 5,
    maxWidth: "85%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4CAF50",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#333f38",
  },
  senderText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 3,
    fontWeight: "bold",
  },
  messageText: {
    color: "#ffffff",
    fontSize: 15,
  },
  timeText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: "#ffffff",
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
  },
});

export default RoomChatComponent;
