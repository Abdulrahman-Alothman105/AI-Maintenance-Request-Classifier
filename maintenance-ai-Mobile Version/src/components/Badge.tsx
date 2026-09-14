import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

interface Props {
  label: string;
  variant?: "neutral" | "urgent" | "normal" | "amber";
}

export default function Badge({ label, variant = "neutral" }: Props) {
  const palette = {
    neutral: { bg: colors.white, border: colors.line, text: colors.ink },
    urgent: { bg: colors.urgentLight, border: colors.urgentLight, text: colors.urgent },
    normal: { bg: colors.normalLight, border: colors.normalLight, text: colors.normal },
    amber: { bg: colors.amberLight + "66", border: colors.amberLight + "66", text: colors.amber },
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    textAlign: "center",
  },
});
