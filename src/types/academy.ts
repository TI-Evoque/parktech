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
  email: string;
  manufacturer: string;
  status: 'online' | 'offline';
  equipment: Equipment[];
  manager?: string;
  managerPhone?: string;
  coordinator?: string;
  coordinatorPhone?: string;
  regional?: string;
  internetPlan?: string;
}
