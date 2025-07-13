import { Student } from "./student.interface";

// src/app/interfaces/student-group.interface.ts
export interface StudentGroup {
  point_latitude: number;
  point_longitude: number;
  id: string; // Unique ID for the group
  name: string; // Name for the group, e.g., "Group 1", "North Zone"
  students: Student[]; // Students belonging to this group
}
