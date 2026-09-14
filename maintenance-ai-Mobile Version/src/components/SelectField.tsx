import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  tone?: "neutral" | "urgent" | "normal";
}

export default function SelectField({ value, options, onChange, tone = "neutral" }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  const toneStyle = {
    neutral: { borderColor: colors.line, bg: colors.white, text: colors.ink },
    urgent: { borderColor: colors.urgent, bg: colors.urgentLight, text: colors.urgent },
    normal: { borderColor: colors.normal, bg: colors.normalLight, text: colors.normal },
  }[tone];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { borderColor: toneStyle.borderColor, backgroundColor: toneStyle.bg }]}
      >
        <Text style={[styles.fieldText, { color: toneStyle.text }]} numberOfLines={1}>
          {current?.label ?? value}
        </Text>
        <Text style={[styles.chevron, { color: toneStyle.text }]}>˅</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && { fontFamily: fonts.bodySemiBold, color: colors.blueprint },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 100,
  },
  fieldText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    flexShrink: 1,
    textAlign: "right",
  },
  chevron: {
    fontSize: 11,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23, 33, 43, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "60%",
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.ink,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: 12,
  },
});
