import { NextResponse } from "next/server";
import { classify } from "@/lib/classifier";

export async function POST(req: Request) {
  let description = "";
  try {
    const body = await req.json();
    description = typeof body?.description === "string" ? body.description.trim() : "";
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ error: "وصف المشكلة مطلوب" }, { status: 400 });
  }

  const { results, mocked } = await classify(description);
  return NextResponse.json({ results, mocked });
}
