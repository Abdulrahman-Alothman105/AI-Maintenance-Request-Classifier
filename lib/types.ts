import { Category, Priority } from "./constants";

export interface ClassificationResult {
  description: string;
  suggested_category: Category;
  suggested_priority: Priority;
}

export interface MaintenanceRequest {
  id: string;
  description: string;
  category: Category;
  priority: Priority;
  createdAt: string;
}
