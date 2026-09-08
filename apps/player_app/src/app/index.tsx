import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { apiPost,apiGet } from "../../services/api";

const SPORTS = [
  { label: "Cầu lông", value: "badminton" },
  { label: "Pickleball", value: "pickleball" },
];

const DISTRICTS = [
  "Quận 1",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 6",
  "Quận 7",
  "Quận 8",
  "Quận 10",
  "Quận 11",
  "Quận 12",
  "Quận Bình Thạnh",
  "Quận Tân Bình",
  "Quận Tân Phú",
  "Quận Phú Nhuận",
  "Quận Gò Vấp",
  "Quận Bình Tân",
  "Thành phố Thủ Đức",
];

interface MatchResult {
  matchRequest: {
    id: string;
    playerId: string;
    sport: string;
    desiredTime: string;
    location?: string;
    status: string;
  };

  match: {
    id: string;
    sport: string;
    startTime: string;
    status: string;
    playerIds: string[];
  } | null;
}

export default function HomeScreen() {
  // Tạm thời giữ playerId để tương thích với backend
  const [playerId] = useState(
  () => `P_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
);

  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

useEffect(() => {
  if (!loading || !requestId) {
    return;
  }

  const interval = setInterval(async () => {
    try {
      const request = await apiGet<{
        id: string;
        playerId: string;
        sport: string;
        desiredTime: string;
        location?: string;
        status: string;
        matchId?: string;
        match?: {
          id: string;
          sport: string;
          startTime: string;
          status: string;
          playerIds: string[];
        } | null;
      }>(`/match-requests/${requestId}`);

      console.log("Polling:", request);

      if (request.status === "matched" && request.match) {
        clearInterval(interval);

        setMatchResult({
          matchRequest: {
            id: request.id,
            playerId: request.playerId,
            sport: request.sport,
            desiredTime: request.desiredTime,
            location: request.location,
            status: request.status,
          },
          match: request.match,
        });

        setLoading(false);
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  }, 2000);

  return () => clearInterval(interval);
}, [loading, requestId]);
  async function handleCreateMatchRequest() {
  if (!sport || !location) {
    Alert.alert(
      "Thiếu thông tin",
      "Vui lòng chọn môn thể thao và vị trí."
    );
    return;
  }

  try {
    setLoading(true);

    const result = await apiPost<MatchResult>(
      "/match-requests",
      {
        playerId,
        sport,
        desiredTime: "19:00",
        location,
      }
    );

    console.log("Match Request:", result);

    setRequestId(result.matchRequest.id);

    // Nếu vừa tạo request mà đã đủ 4 người
    if (result.match) {
      setMatchResult(result);
      setLoading(false);
    }
  } catch (error) {
    console.error(error);

    setLoading(false);

    Alert.alert(
      "Lỗi",
      "Không thể gửi yêu cầu. Vui lòng thử lại."
    );
  }
}

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>SportLink</Text>

        {/* MÔN THỂ THAO */}
        <Text style={styles.label}>Môn thể thao</Text>

        <View style={styles.options}>
          {SPORTS.map((item) => (
            <Pressable
              key={item.value}
              style={[
                styles.option,
                sport === item.value && styles.selectedOption,
              ]}
              onPress={() => {
                setSport(item.value);
                setMatchResult(null);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  sport === item.value && styles.selectedText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* VỊ TRÍ */}
        <Text style={styles.label}>Vị trí</Text>

        <View style={styles.options}>
          {DISTRICTS.map((district) => (
            <Pressable
              key={district}
              style={[
                styles.option,
                location === district && styles.selectedOption,
              ]}
              onPress={() => {
                setLocation(district);
                setMatchResult(null);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  location === district && styles.selectedText,
                ]}
              >
                {district}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* BUTTON */}
        <Pressable
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleCreateMatchRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Đang tìm người chơi..."
              : "Tìm người chơi"}
          </Text>
        </Pressable>

        {/* KẾT QUẢ */}
        {matchResult && (
          <View style={styles.resultContainer}>
            {matchResult.match === null ? (
              <>
                <Text style={styles.resultTitle}>
                  ⏳ Đang tìm người chơi
                </Text>

                <Text style={styles.resultText}>
                  Yêu cầu đã được đưa vào hàng chờ.
                </Text>

                <Text style={styles.waitingText}>
                  Đang chờ đủ 4 người chơi
                </Text>

                <Text style={styles.resultText}>
                  Môn:{" "}
                  {matchResult.matchRequest.sport === "badminton"
                    ? "Cầu lông"
                    : "Pickleball"}
                </Text>

                <Text style={styles.resultText}>
                  Vị trí: {matchResult.matchRequest.location}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.resultTitle}>
                  🎉 Đã tìm đủ người!
                </Text>

                <View style={styles.matchInfo}>
                  <Text style={styles.matchInfoTitle}>
                    Thông tin trận đấu
                  </Text>

                  <Text style={styles.resultText}>
                    Môn thể thao:{" "}
                    {matchResult.match.sport === "badminton"
                      ? "Cầu lông"
                      : "Pickleball"}
                  </Text>

                  <Text style={styles.resultText}>
                    Khu vực: {location}
                  </Text>

                  <Text style={styles.resultText}>
                    Match ID: {matchResult.match.id}
                  </Text>

                  <Text style={styles.resultText}>
                    Trạng thái:{" "}
                    {matchResult.match.status === "confirmed"
                      ? "Đã xác nhận"
                      : matchResult.match.status}
                  </Text>
                </View>

                <Text style={styles.playersTitle}>
                  Danh sách người chơi
                </Text>

                {matchResult.match.playerIds.map(
                  (id, index) => (
                    <View
                      key={`${id}-${index}`}
                      style={styles.playerItem}
                    >
                      <Text style={styles.playerNumber}>
                        {index + 1}
                      </Text>

                      <Text style={styles.playerText}>
                        {id}
                      </Text>
                    </View>
                  )
                )}

                <Text style={styles.confirmedText}>
                  ✓ Trận đấu đã được tạo thành công
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* LOADING OVERLAY */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingTitle}>
              Đang tìm người chơi...
            </Text>

            <Text style={styles.loadingTimer}>
              {waitSeconds}s
            </Text>

            <Text style={styles.loadingSubtitle}>
              Vui lòng chờ trong giây lát
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },

  label: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
  },

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  option: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  selectedOption: {
    backgroundColor: "#222",
    borderColor: "#222",
  },

  optionText: {
    fontSize: 15,
  },

  selectedText: {
    color: "#fff",
  },

  button: {
    marginTop: 35,
    backgroundColor: "#222",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  resultContainer: {
    marginTop: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
  },

  resultTitle: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 15,
  },

  resultText: {
    fontSize: 16,
    marginBottom: 8,
  },

  waitingText: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },

  matchInfo: {
    marginBottom: 10,
  },

  matchInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  playersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },

  playerNumber: {
    fontSize: 16,
    fontWeight: "bold",
    width: 30,
  },

  playerText: {
    fontSize: 16,
  },

  confirmedText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  loadingContent: {
    alignItems: "center",
  },

  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },

  loadingTimer: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },

  loadingSubtitle: {
    fontSize: 15,
    color: "#fff",
    marginTop: 8,
  },
});