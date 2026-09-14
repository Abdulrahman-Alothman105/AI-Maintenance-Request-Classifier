import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { CATEGORIES, CATEGORY_ICON, PRIORITIES, Category, Priority } from "../lib/constants";
import { ClassificationResult } from "../lib/types";
import { classify } from "../lib/gemini";
import { addRequests } from "../lib/storage";
import { generateId } from "../lib/id";
import PrimaryButton from "../components/PrimaryButton";
import SelectField from "../components/SelectField";
import Badge from "../components/Badge";

type DraftItem = ClassificationResult & { id: string };

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: `${CATEGORY_ICON[c]} ${c}` }));
const PRIORITY_OPTIONS = PRIORITIES.map((p) => ({ value: p, label: p }));

export default function NewRequestScreen() {
  const navigation = useNavigation<any>();
  const [description, setDescription] = useState("");
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);
  const [mocked, setMocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClassify() {
    if (!description.trim()) {
      setError("الرجاء كتابة وصف المشكلة أولاً");
      return;
    }
    setError(null);
    setLoading(true);
    setDrafts(null);
    try {
      const { results, mocked: wasMocked } = await classify(description);
      const withIds: DraftItem[] = results.map((r, i) => ({
        ...r,
        id: `${Date.now()}-${i}`,
      }));
      setDrafts(withIds);
      setMocked(wasMocked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(id: string, patch: Partial<DraftItem>) {
    setDrafts((prev) => prev?.map((d) => (d.id === id ? { ...d, ...patch } : d)) ?? null);
  }

  async function handleSave() {
    if (!drafts || drafts.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const toSave = drafts.map((d) => ({
        id: generateId(),
        description: d.description,
        category: d.suggested_category,
        priority: d.suggested_priority,
        createdAt: now,
      }));
      await addRequests(toSave);
      setDescription("");
      setDrafts(null);
      navigation.navigate("Requests");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={styles.h1}>بلاغ صيانة جديد</Text>
          <Text style={styles.subtitle}>
            صف المشكلة بكلماتك، وسيقترح المساعد الذكي التخصص وأولوية التنفيذ تلقائياً.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>وصف المشكلة</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            placeholder="مثال: يوجد تسريب مياه تحت حوض المطبخ، وأيضاً الإضاءة في غرفة النوم لا تعمل"
            placeholderTextColor={colors.ink + "80"}
            textAlign="right"
            style={styles.textarea}
          />
          <View style={styles.formFooter}>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <PrimaryButton
              label="إرسال"
              loadingLabel="جاري التحليل..."
              loading={loading}
              onPress={handleClassify}
              style={styles.submitButton}
            />
          </View>
        </View>

        {drafts && (
          <View style={styles.resultsBlock}>
            <View style={styles.resultsHeader}>
              <Text style={styles.h2}>
                {drafts.length > 1 ? `تم رصد ${drafts.length} مشاكل منفصلة` : "نتيجة التحليل"}
              </Text>
              {mocked && <Badge label="وضع تجريبي (Mock)" variant="amber" />}
            </View>

            <View style={styles.draftList}>
              {drafts.map((d) => (
                <View
                  key={d.id}
                  style={[
                    styles.draftCard,
                    { borderRightColor: d.suggested_priority === "عاجل" ? colors.urgent : colors.normal },
                  ]}
                >
                  <Text style={styles.draftDescription}>{d.description}</Text>
                  <View style={styles.draftControls}>
                    <SelectField
                      value={d.suggested_category}
                      options={CATEGORY_OPTIONS}
                      onChange={(v) => updateDraft(d.id, { suggested_category: v as Category })}
                    />
                    <SelectField
                      value={d.suggested_priority}
                      options={PRIORITY_OPTIONS}
                      onChange={(v) => updateDraft(d.id, { suggested_priority: v as Priority })}
                      tone={d.suggested_priority === "عاجل" ? "urgent" : "normal"}
                    />
                  </View>
                </View>
              ))}
            </View>

            <PrimaryButton
              label="حفظ البلاغ"
              loadingLabel="جاري الحفظ..."
              loading={saving}
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, gap: 24, paddingBottom: 40 },
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
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    textAlign: "right",
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    padding: 12,
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    minHeight: 110,
    textAlignVertical: "top",
  },
  formFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  errorText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.urgent,
    flexShrink: 1,
    textAlign: "right",
  },
  submitButton: {
    marginStart: "auto",
  },
  resultsBlock: { gap: 16 },
  resultsHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  h2: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.blueprint,
  },
  draftList: { gap: 12 },
  draftCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    gap: 12,
    borderRightWidth: 4,
  },
  draftDescription: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
    textAlign: "right",
  },
  draftControls: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  saveButton: {
    alignSelf: "stretch",
  },
});
