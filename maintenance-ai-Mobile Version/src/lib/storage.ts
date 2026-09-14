import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaintenanceRequest } from "./types";

const STORAGE_KEY = "maintenance_requests";

export async function getAllRequests(): Promise<MaintenanceRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as MaintenanceRequest[];
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

export async function addRequests(newOnes: MaintenanceRequest[]): Promise<MaintenanceRequest[]> {
  const current = await getAllRequests();
  const updated = [...newOnes, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
