import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

const NAV_ITEMS = [
  { route: "NewRequest", label: "بلاغ جديد" },
  { route: "Requests", label: "كل البلاغات" },
] as const;

export default function AppHeader() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => navigation.navigate("NewRequest")}>
          <Text style={styles.title}>بلاغات الصيانة</Text>
        </Pressable>

        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = route.name === item.route;
            return (
              <Pressable
                key={item.route}
                onPress={() => navigation.navigate(item.route)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <Text style={styles.navText}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.blueprint,
  },
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.white,
  },
  nav: {
    flexDirection: "row-reverse",
    gap: 4,
  },
  navItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  navItemActive: {
    backgroundColor: colors.blueprintLight,
  },
  navText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
  },
});
