import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { checkBackend } from "../../services/api";

export default function HomeScreen() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    checkBackend()
      .then(() => setStatus("Backend: Connected"))
      .catch(() => setStatus("Backend: Disconnected"));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SportLink</Text>
      <Text>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
});