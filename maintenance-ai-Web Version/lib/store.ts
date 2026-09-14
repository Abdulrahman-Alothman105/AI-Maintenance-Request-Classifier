import fs from "fs";
import path from "path";
import { MaintenanceRequest } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "requests.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

export function getAllRequests(): MaintenanceRequest[] {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    const list = JSON.parse(raw) as MaintenanceRequest[];
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

export function addRequests(newOnes: MaintenanceRequest[]): MaintenanceRequest[] {
  ensureFile();
  const current = getAllRequests();
  const updated = [...newOnes, ...current];
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
