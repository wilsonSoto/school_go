// src/app/interfaces/driver.interface.ts (create this file)
export interface Driver {
  id: number;
  name: string;
  mobile: string;
  phone: string;
  address: string;
  vat: string;
  email: string;
  company: {
    id: number;
    name: string;
  };
  driver_license: string;
  home_latitude: number;
  home_longitude: number;
  profile: string; // URL
  driver_license_image: string; // URL
  vehicles: any[]; // You might want to define a Vehicle interface too
}

