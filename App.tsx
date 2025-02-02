import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { ChatPage } from "./pages/chat/chat.page";
import { HomePage } from "./pages/home/home.page";

export default function App() {
  return <HomePage />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
