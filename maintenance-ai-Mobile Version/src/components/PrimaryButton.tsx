import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

interface Props {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export default function PrimaryButton({ label, loadingLabel, loading, disabled, onPress, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
    >
      {loading && <ActivityIndicator color={colors.white} size="small" style={styles.spinner} />}
      <Text style={styles.label}>{loading ? loadingLabel ?? label : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.blueprint,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    backgroundColor: colors.blueprintDark,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  spinner: {
    marginStart: 8,
  },
  label: {
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    textAlign: "center",
  },
});
