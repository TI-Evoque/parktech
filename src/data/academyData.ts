import { AcademyUnit } from '../types/academy';

export const academyData = {
  units: [
    {
      id: 'unit-001',
      name: 'Evoque Copacabana',
      location: 'Rio de Janeiro, RJ',
      status: 'online' as const,
      manager: 'Carlos Silva',
      phone: '(21) 98765-4321',
      equipment: [
        {
          id: 'eq-001',
          name: 'Servidor Dell PowerEdge R740',
          category: 'Servidores',
          status: 'working' as const,
          lastMaintenance: '15/01/2024',
          model: 'PowerEdge R740',
          serialNumber: 'DL001234'
        },
        {
          id: 'eq-002',
          name: 'Switch Cisco Catalyst 2960',
          category: 'Rede',
          status: 'working' as const,
          lastMaintenance: '10/01/2024',
          model: 'Catalyst 2960-X',
          serialNumber: 'CS005678'
        },
        {
          id: 'eq-003',
          name: 'Firewall SonicWall TZ570',
          category: 'Segurança',
          status: 'maintenance' as const,
          lastMaintenance: '08/01/2024',
          model: 'TZ570',
          serialNumber: 'SW009012'
        },
        {
          id: 'eq-004',
          name: 'Access Point Ubiquiti UniFi',
          category: 'Rede',
          status: 'working' as const,
          lastMaintenance: '12/01/2024',
          model: 'UniFi AP AC Pro',
          serialNumber: 'UB003456'
        },
        {
          id: 'eq-005',
          name: 'NAS Synology DS920+',
          category: 'Armazenamento',
          status: 'working' as const,
          lastMaintenance: '14/01/2024',
          model: 'DiskStation DS920+',
          serialNumber: 'SY007890'
        },
        {
          id: 'eq-006',
          name: 'UPS APC Smart-UPS 3000VA',
          category: 'Energia',
          status: 'working' as const,
          lastMaintenance: '09/01/2024',
          model: 'Smart-UPS SMT3000I',
          serialNumber: 'AP001122'
        },
        {
          id: 'eq-007',
          name: 'Câmera IP Hikvision DS-2CD2143G0',
          category: 'Segurança',
          status: 'working' as const,
          lastMaintenance: '13/01/2024',
          model: 'DS-2CD2143G0-I',
          serialNumber: 'HK003344'
        }
      ]
    },
    {
      id: 'unit-002',
      name: 'Evoque Ipanema',
      location: 'Rio de Janeiro, RJ',
      status: 'online' as const,
      manager: 'Ana Santos',
      phone: '(21) 97654-3210',
      equipment: [
        {
          id: 'eq-008',
          name: 'Servidor HP ProLiant DL380',
          category: 'Servidores',
          status: 'working' as const,
          lastMaintenance: '16/01/2024',
          model: 'ProLiant DL380 Gen10',
          serialNumber: 'HP004455'
        },
        {
          id: 'eq-009',
          name: 'Router Cisco ISR 4331',
          category: 'Rede',
          status: 'broken' as const,
          lastMaintenance: '05/01/2024',
          model: 'ISR 4331',
          serialNumber: 'CS006677'
        },
        {
          id: 'eq-010',
          name: 'Workstation Dell Precision 7760',
          category: 'Computadores',
          status: 'working' as const,
          lastMaintenance: '11/01/2024',
          model: 'Precision 7760',
          serialNumber: 'DL008899'
        },
        {
          id: 'eq-011',
          name: 'Impressora HP LaserJet Pro M404',
          category: 'Periféricos',
          status: 'maintenance' as const,
          lastMaintenance: '07/01/2024',
          model: 'LaserJet Pro M404dn',
          serialNumber: 'HP000111'
        },
        {
          id: 'eq-012',
          name: 'Monitor LG UltraWide 34"',
          category: 'Periféricos',
          status: 'working' as const,
          lastMaintenance: '12/01/2024',
          model: '34WN80C-B',
          serialNumber: 'LG002233'
        },
        {
          id: 'eq-013',
          name: 'Sistema de Backup Veeam',
          category: 'Software',
          status: 'working' as const,
          lastMaintenance: '15/01/2024',
          model: 'Veeam Backup & Replication',
          serialNumber: 'VE004466'
        }
      ]
    },
    {
      id: 'unit-003',
      name: 'Evoque Barra da Tijuca',
      location: 'Rio de Janeiro, RJ',
      status: 'online' as const,
      manager: 'Roberto Lima',
      phone: '(21) 96543-2109',
      equipment: [
        {
          id: 'eq-014',
          name: 'Tablet Samsung Galaxy Tab S8',
          category: 'Dispositivos Móveis',
          status: 'working' as const,
          lastMaintenance: '14/01/2024',
          model: 'Galaxy Tab S8',
          serialNumber: 'SM005577'
        },
        {
          id: 'eq-015',
          name: 'Roteador Wi-Fi 6 ASUS AX6000',
          category: 'Rede',
          status: 'working' as const,
          lastMaintenance: '13/01/2024',
          model: 'RT-AX88U',
          serialNumber: 'AS007799'
        },
        {
          id: 'eq-016',
          name: 'Projetor Epson PowerLite',
          category: 'Audio/Visual',
          status: 'working' as const,
          lastMaintenance: '10/01/2024',
          model: 'PowerLite 2247U',
          serialNumber: 'EP009911'
        },
        {
          id: 'eq-017',
          name: 'Scanner Fujitsu ScanSnap iX1600',
          category: 'Periféricos',
          status: 'maintenance' as const,
          lastMaintenance: '06/01/2024',
          model: 'ScanSnap iX1600',
          serialNumber: 'FJ001144'
        },
        {
          id: 'eq-018',
          name: 'Sistema de Videoconferência Zoom Rooms',
          category: 'Software',
          status: 'working' as const,
          lastMaintenance: '16/01/2024',
          model: 'Zoom Rooms Pro',
          serialNumber: 'ZR003355'
        }
      ]
    },
    {
      id: 'unit-004',
      name: 'Evoque São Paulo Centro',
      location: 'São Paulo, SP',
      status: 'offline' as const,
      manager: 'Mariana Costa',
      phone: '(11) 95432-1098',
      equipment: [
        {
          id: 'eq-019',
          name: 'Notebook Lenovo ThinkPad X1',
          category: 'Computadores',
          status: 'working' as const,
          lastMaintenance: '09/01/2024',
          model: 'ThinkPad X1 Carbon Gen 10',
          serialNumber: 'LN006688'
        },
        {
          id: 'eq-020',
          name: 'Sistema de Monitoramento Zabbix',
          category: 'Software',
          status: 'broken' as const,
          lastMaintenance: '04/01/2024',
          model: 'Zabbix 6.0 LTS',
          serialNumber: 'ZB008800'
        },
        {
          id: 'eq-021',
          name: 'HD Externo WD My Passport 4TB',
          category: 'Armazenamento',
          status: 'working' as const,
          lastMaintenance: '11/01/2024',
          model: 'My Passport 4TB',
          serialNumber: 'WD000222'
        },
        {
          id: 'eq-022',
          name: 'Antivírus Kaspersky Endpoint',
          category: 'Software',
          status: 'maintenance' as const,
          lastMaintenance: '08/01/2024',
          model: 'Kaspersky Endpoint Security',
          serialNumber: 'KS002244'
        }
      ]
    },
    {
      id: 'unit-005',
      name: 'Evoque Vila Madalena',
      location: 'São Paulo, SP',
      status: 'online' as const,
      manager: 'Pedro Oliveira',
      phone: '(11) 94321-0987',
      equipment: [
        {
          id: 'eq-023',
          name: 'Smartphone iPhone 14 Pro',
          category: 'Dispositivos Móveis',
          status: 'working' as const,
          lastMaintenance: '15/01/2024',
          model: 'iPhone 14 Pro 256GB',
          serialNumber: 'AP004477'
        },
        {
          id: 'eq-024',
          name: 'Headset Logitech Zone Wireless',
          category: 'Periféricos',
          status: 'working' as const,
          lastMaintenance: '12/01/2024',
          model: 'Zone Wireless Plus',
          serialNumber: 'LG007711'
        },
        {
          id: 'eq-025',
          name: 'Webcam Logitech Brio 4K',
          category: 'Periféricos',
          status: 'working' as const,
          lastMaintenance: '13/01/2024',
          model: 'Brio Ultra HD Pro',
          serialNumber: 'LG009933'
        },
        {
          id: 'eq-026',
          name: 'Sistema ERP SAP Business One',
          category: 'Software',
          status: 'maintenance' as const,
          lastMaintenance: '07/01/2024',
          model: 'SAP Business One 10.0',
          serialNumber: 'SP001155'
        },
        {
          id: 'eq-027',
          name: 'Sistema de Controle de Acesso',
          category: 'Segurança',
          status: 'working' as const,
          lastMaintenance: '14/01/2024',
          model: 'HID VertX V1000',
          serialNumber: 'HD003377'
        },
        {
          id: 'eq-028',
          name: 'Licenças Microsoft 365',
          category: 'Software',
          status: 'working' as const,
          lastMaintenance: '16/01/2024',
          model: 'Microsoft 365 Business Premium',
          serialNumber: 'MS005599'
        }
      ]
    }
  ] as AcademyUnit[]
};