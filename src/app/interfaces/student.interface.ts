// src/app/interfaces/student.interface.ts (updated)
export interface Student {
  point_latitude: number;
  point_longitude: number;
  id: string;
  name: string;
  last_name: string;
  address?: string; // Optional, but useful for context
  home_longitude?: number; // Crucial for map display
  home_latitude?: number; // Crucial for map display
  // Add other properties
}
