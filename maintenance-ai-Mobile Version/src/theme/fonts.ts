/**
 * نفس الخطوط المستخدمة في النسخة الأصلية (ويب):
 * - Cairo  -> يُستخدم للعناوين (font-display)
 * - IBM Plex Sans Arabic -> يُستخدم للنص العام (font-body)
 */
export const fonts = {
  displaySemiBold: "Cairo_600SemiBold",
  displayBold: "Cairo_700Bold",
  displayExtraBold: "Cairo_800ExtraBold",

  bodyRegular: "IBMPlexSansArabic_400Regular",
  bodyMedium: "IBMPlexSansArabic_500Medium",
  bodySemiBold: "IBMPlexSansArabic_600SemiBold",
} as const;
