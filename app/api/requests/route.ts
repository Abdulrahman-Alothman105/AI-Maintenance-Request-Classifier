import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { CATEGORIES, PRIORITIES, Category, Priority } from "@/lib/constants";
import { getAllRequests, addRequests } from "@/lib/store";
import { MaintenanceRequest } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ requests: getAllRequests() });
}

interface IncomingItem {
  description?: unknown;
  category?: unknown;
  priority?: unknown;
}

export async function POST(req: Request) {
  let items: IncomingItem[] = [];
  try {
    const body = await req.json();
    items = Array.isArray(body?.items) ? body.items : [];
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "لا توجد طلبات لحفظها" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const toSave: MaintenanceRequest[] = [];

  for (const item of items) {
    const description = typeof item.description === "string" ? item.description.trim() : "";
    if (!description) {
      return NextResponse.json({ error: "كل طلب يجب أن يحتوي على وصف" }, { status: 400 });
    }
    const category = CATEGORIES.includes(item.category as Category) ? (item.category as Category) : "أخرى";
    const priority = PRIORITIES.includes(item.priority as Priority) ? (item.priority as Priority) : "عادي";

    toSave.push({
      id: uuidv4(),
      description,
      category,
      priority,
      createdAt: now,
    });
  }

  const updated = addRequests(toSave);
  return NextResponse.json({ requests: updated }, { status: 201 });
}
