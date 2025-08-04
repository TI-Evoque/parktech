import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AcademyUnit } from '../types/academy';
import { saveAs } from 'file-saver';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class ReportService {
  // Relatório geral das unidades em PDF
  static generateUnitsReportPDF(units: AcademyUnit[]): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório Geral - Academia Evoque', 20, 20);
    
    // Data
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    
    // Resumo
    const totalUnits = units.length;
    const onlineUnits = units.filter(u => u.status === 'online').length;
    const totalEquipments = units.reduce((sum, unit) => sum + unit.equipment.length, 0);
    
    doc.text(`Total de Unidades: ${totalUnits}`, 20, 45);
    doc.text(`Unidades Online: ${onlineUnits}`, 20, 55);
    doc.text(`Total de Equipamentos: ${totalEquipments}`, 20, 65);
    
    // Tabela de unidades
    const tableData = units.map(unit => [
      unit.name,
      unit.email,
      unit.manager || 'N/A',
      unit.internetPlan || 'N/A',
      unit.equipment.length.toString(),
      unit.status === 'online' ? 'Online' : 'Offline'
    ]);
    
    doc.autoTable({
      head: [['Unidade', 'Email', 'Gerente', 'Plano Internet', 'Equipamentos', 'Status']],
      body: tableData,
      startY: 80,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [255, 103, 0],
        textColor: [255, 255, 255]
      }
    });
    
    doc.save('relatorio-unidades-evoque.pdf');
  }

  // Relatório de equipamentos em PDF
  static generateEquipmentReportPDF(units: AcademyUnit[]): void {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório de Equipamentos - Academia Evoque', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    
    // Dados dos equipamentos
    const equipmentData: any[] = [];
    units.forEach(unit => {
      unit.equipment.forEach(eq => {
        equipmentData.push([
          unit.name,
          eq.name,
          eq.category,
          eq.model || 'N/A',
          eq.serialNumber || 'N/A',
          eq.status === 'working' ? 'Funcionando' : 
          eq.status === 'maintenance' ? 'Manutenção' : 'Quebrado',
          eq.lastMaintenance || 'N/A'
        ]);
      });
    });
    
    if (equipmentData.length === 0) {
      doc.text('Nenhum equipamento cadastrado', 20, 50);
    } else {
      doc.autoTable({
        head: [['Unidade', 'Equipamento', 'Categoria', 'Modelo', 'Série', 'Status', 'Última Manutenção']],
        body: equipmentData,
        startY: 50,
        styles: {
          fontSize: 7,
          cellPadding: 1
        },
        headStyles: {
          fillColor: [255, 103, 0],
          textColor: [255, 255, 255]
        }
      });
    }
    
    doc.save('relatorio-equipamentos-evoque.pdf');
  }

  // Relatório por regional em PDF
  static generateRegionalReportPDF(units: AcademyUnit[]): void {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório por Regional - Academia Evoque', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    
    // Agrupar por regional
    const regionalData = units.reduce((acc, unit) => {
      if (unit.regional) {
        if (!acc[unit.regional]) {
          acc[unit.regional] = [];
        }
        acc[unit.regional].push(unit);
      }
      return acc;
    }, {} as Record<string, AcademyUnit[]>);
    
    let yPosition = 50;
    
    Object.keys(regionalData).forEach(regional => {
      const regionalUnits = regionalData[regional];
      
      doc.setFontSize(14);
      doc.text(`Regional: ${regional}`, 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Total de Unidades: ${regionalUnits.length}`, 20, yPosition);
      yPosition += 5;
      
      const totalEquipments = regionalUnits.reduce((sum, unit) => sum + unit.equipment.length, 0);
      doc.text(`Total de Equipamentos: ${totalEquipments}`, 20, yPosition);
      yPosition += 15;
      
      const tableData = regionalUnits.map(unit => [
        unit.name,
        unit.manager || 'N/A',
        unit.internetPlan || 'N/A',
        unit.equipment.length.toString()
      ]);
      
      doc.autoTable({
        head: [['Unidade', 'Gerente', 'Plano Internet', 'Equipamentos']],
        body: tableData,
        startY: yPosition,
        styles: {
          fontSize: 9,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [70, 130, 255],
          textColor: [255, 255, 255]
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    doc.save('relatorio-regional-evoque.pdf');
  }

  // Exportar dados em CSV
  static exportToCSV(units: AcademyUnit[]): void {
    const headers = [
      'Unidade',
      'Email', 
      'Gerente',
      'Telefone Gerente',
      'Coordenador',
      'Telefone Coordenador',
      'Regional',
      'Plano Internet',
      'Total Equipamentos',
      'Equipamentos Funcionando',
      'Equipamentos Manutenção',
      'Status'
    ];
    
    const csvData = units.map(unit => [
      unit.name,
      unit.email,
      unit.manager || '',
      unit.managerPhone || '',
      unit.coordinator || '',
      unit.coordinatorPhone || '',
      unit.regional || '',
      unit.internetPlan || '',
      unit.equipment.length.toString(),
      unit.equipment.filter(eq => eq.status === 'working').length.toString(),
      unit.equipment.filter(eq => eq.status === 'maintenance').length.toString(),
      unit.status === 'online' ? 'Online' : 'Offline'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'dados-unidades-evoque.csv');
  }

  // Exportar backup em JSON
  static exportBackupJSON(units: AcademyUnit[]): void {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: units
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
    saveAs(blob, `backup-evoque-${new Date().toISOString().split('T')[0]}.json`);
  }

  // Importar backup de JSON
  static importBackupJSON(file: File): Promise<AcademyUnit[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const backup = JSON.parse(content);
          
          if (!backup.data || !Array.isArray(backup.data)) {
            throw new Error('Formato de backup inválido');
          }
          
          resolve(backup.data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }
}
