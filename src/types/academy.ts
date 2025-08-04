export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: 'working' | 'maintenance' | 'broken';
  lastMaintenance: string;
  model?: string;
  serialNumber?: string;
}

export interface AcademyUnit {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  equipment: Equipment[];
  manager?: string;
  phone?: string;
}