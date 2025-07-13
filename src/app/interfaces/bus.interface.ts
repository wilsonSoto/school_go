// src/app/interfaces/bus.interface.ts (create this file)
export interface Bus {
  id: number;
  name: string;
  brand: string | boolean; // Or specific type if it's not always boolean
  model: string | boolean;
  amenities: string | boolean;
  people_capacity: number;
  school_driver: any | null; // Define Driver interface if it links
  company: {
    id: number;
    name: string;
  };
  license_plate_image: string; // URL
  vehicule_image: string; // URL
  vehicle_color: string;
  capacity: string,
  plate_number: string
}
