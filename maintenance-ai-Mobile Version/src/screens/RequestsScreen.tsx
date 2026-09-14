import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { CATEGORY_ICON } from "../lib/constants";
import { MaintenanceRequest } from "../lib/types";
import { getAllRequests } from "../lib/storage";
import Badge from "../components/Badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RequestsScreen() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getAllRequests();
    setRequests(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <FlatList
      style={styles.flex}
      contentContainerStyle={styles.content}
      data={requests}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.h1}>كل البلاغات</Text>
          <Text style={styles.subtitle}>
            {requests.length > 0 ? `إجمالي البلاغات: ${requests.length}` : "لا توجد بلاغات محفوظة بعد."}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>ابدأ بإنشاء بلاغ جديد من صفحة "بلاغ جديد".</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            { borderRightColor: item.priority === "عاجل" ? colors.urgent : colors.normal },
          ]}
        >
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          <View style={styles.badgeRow}>
            <Badge label={`${CATEGORY_ICON[item.category]} ${item.category}`} variant="neutral" />
            <Badge
              label={item.priority}
              variant={item.priority === "عاجل" ? "urgent" : "normal"}
            />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  h1: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.blueprint,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.ink + "B3",
    textAlign: "right",
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.ink + "99",
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRightWidth: 4,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  description: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
    textAlign: "right",
  },
  date: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.ink + "80",
    textAlign: "right",
  },
  badgeRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 4,
  },
});
