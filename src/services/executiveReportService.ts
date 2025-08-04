import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AcademyUnit } from '../types/academy';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class ExecutiveReportService {
  // Relat��rio Executivo para CEO
  static generateExecutiveReportPDF(units: AcademyUnit[]): void {
    const doc = new jsPDF();
    
    // Header executivo
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.text('RELATÓRIO EXECUTIVO', 20, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(102, 102, 102);
    doc.text('Evoque Academias - Análise de Equipamentos', 20, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(136, 136, 136);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 45);

    // Dados executivos
    const allEquipments = units.flatMap(unit => unit.equipment);
    const catracas = allEquipments.filter(eq => eq.category === 'Catracas');
    const cameras = allEquipments.filter(eq => eq.category.includes('Câmeras'));
    const securityEquipments = allEquipments.filter(eq => 
      eq.category.includes('Câmeras') || 
      eq.category.includes('Segurança') ||
      eq.category.includes('Controle de Acesso') ||
      eq.category.includes('Catracas')
    );

    const workingEquipments = allEquipments.filter(eq => eq.status === 'working').length;
    const operationalRate = ((workingEquipments / allEquipments.length) * 100).toFixed(1);

    // Box de métricas principais
    const startY = 60;
    
    // Background para métricas
    doc.setFillColor(245, 245, 245);
    doc.rect(20, startY, 170, 40, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('MÉTRICAS PRINCIPAIS', 25, startY + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    
    // Primeira linha de métricas
    doc.text(`Total de Unidades: ${units.length}`, 25, startY + 20);
    doc.text(`Total de Equipamentos: ${allEquipments.length}`, 75, startY + 20);
    doc.text(`Taxa Operacional: ${operationalRate}%`, 135, startY + 20);
    
    // Segunda linha de métricas
    doc.text(`Catracas Instaladas: ${catracas.length}`, 25, startY + 30);
    doc.text(`Câmeras de Segurança: ${cameras.length}`, 75, startY + 30);
    doc.text(`Equipamentos Segurança: ${securityEquipments.length}`, 135, startY + 30);

    // Análise de Catracas (destaque para CEO)
    let currentY = startY + 55;
    
    doc.setFontSize(16);
    doc.setTextColor(220, 38, 127); // Rosa executivo
    doc.text('ANÁLISE DE CATRACAS NA REDE', 20, currentY);
    
    currentY += 15;
    
    if (catracas.length > 0) {
      const catracasByModel = catracas.reduce((acc, cat) => {
        const model = cat.model || 'Modelo não especificado';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const catracaData = Object.entries(catracasByModel).map(([model, count]) => [
        model,
        count.toString(),
        ((count / catracas.length) * 100).toFixed(1) + '%'
      ]);

      doc.autoTable({
        head: [['Modelo da Catraca', 'Quantidade', 'Percentual']],
        body: catracaData,
        startY: currentY,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [220, 38, 127],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [252, 231, 243]
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 20;
    } else {
      doc.setFontSize(12);
      doc.setTextColor(239, 68, 68);
      doc.text('⚠️ ATENÇÃO: Nenhuma catraca cadastrada no sistema', 20, currentY);
      currentY += 20;
    }

    // Análise de Segurança
    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94); // Verde executivo
    doc.text('EQUIPAMENTOS DE SEGURANÇA', 20, currentY);
    
    currentY += 15;

    const securityByType = securityEquipments.reduce((acc, eq) => {
      acc[eq.category] = (acc[eq.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const securityData = Object.entries(securityByType).map(([type, count]) => [
      type,
      count.toString(),
      ((count / securityEquipments.length) * 100).toFixed(1) + '%'
    ]);

    doc.autoTable({
      head: [['Tipo de Equipamento', 'Quantidade', 'Percentual']],
      body: securityData,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [236, 253, 245]
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // Status Operacional
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246); // Azul executivo
    doc.text('STATUS OPERACIONAL', 20, currentY);
    
    currentY += 15;

    const maintenanceCount = allEquipments.filter(eq => eq.status === 'maintenance').length;
    const brokenCount = allEquipments.filter(eq => eq.status === 'broken').length;

    const statusData = [
      ['Funcionando', workingEquipments.toString(), `${operationalRate}%`],
      ['Em Manutenção', maintenanceCount.toString(), `${((maintenanceCount / allEquipments.length) * 100).toFixed(1)}%`],
      ['Com Defeito', brokenCount.toString(), `${((brokenCount / allEquipments.length) * 100).toFixed(1)}%`]
    ];

    doc.autoTable({
      head: [['Status', 'Quantidade', 'Percentual']],
      body: statusData,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [239, 246, 255]
      }
    });

    // Nova página para análise regional
    doc.addPage();
    
    doc.setFontSize(20);
    doc.setTextColor(51, 51, 51);
    doc.text('ANÁLISE POR REGIONAL', 20, 25);

    const regionalData = units.reduce((acc, unit) => {
      if (unit.regional) {
        if (!acc[unit.regional]) {
          acc[unit.regional] = {
            units: 0,
            equipments: 0,
            catracas: 0,
            cameras: 0
          };
        }
        acc[unit.regional].units += 1;
        acc[unit.regional].equipments += unit.equipment.length;
        acc[unit.regional].catracas += unit.equipment.filter(eq => eq.category === 'Catracas').length;
        acc[unit.regional].cameras += unit.equipment.filter(eq => eq.category.includes('Câmeras')).length;
      }
      return acc;
    }, {} as Record<string, any>);

    const regionalTableData = Object.entries(regionalData).map(([regional, data]) => [
      regional,
      data.units.toString(),
      data.equipments.toString(),
      data.catracas.toString(),
      data.cameras.toString()
    ]);

    doc.autoTable({
      head: [['Regional', 'Unidades', 'Equipamentos', 'Catracas', 'Câmeras']],
      body: regionalTableData,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [255, 103, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [255, 247, 237]
      }
    });

    // Recomendações executivas
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    
    doc.setFontSize(16);
    doc.setTextColor(139, 92, 246);
    doc.text('RECOMENDAÇÕES EXECUTIVAS', 20, finalY);
    
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    
    let recY = finalY + 15;
    
    if (catracas.length < units.length * 0.8) {
      doc.text('• Considerar expansão do sistema de catracas para unidades sem cobertura', 25, recY);
      recY += 10;
    }
    
    if (parseFloat(operationalRate) < 95) {
      doc.text('• Implementar plano de manutenção preventiva para melhorar taxa operacional', 25, recY);
      recY += 10;
    }
    
    if (brokenCount > 0) {
      doc.text(`• Priorizar reparo de ${brokenCount} equipamento(s) com defeito`, 25, recY);
      recY += 10;
    }
    
    doc.text('• Avaliar padronização de modelos de equipamentos por regional', 25, recY);
    recY += 10;
    doc.text('• Considerar implementação de monitoramento remoto centralizado', 25, recY);

    // Footer executivo
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Relatório confidencial - Evoque Academias', 20, 280);
    doc.text(`Página 1-2 | Gerado pelo Sistema de Gestão Evoque Academias`, 120, 280);

    doc.save('relatorio-executivo-equipamentos-evoque.pdf');
  }

  // Relatório específico de Catracas para o CEO
  static generateCatracaReportPDF(units: AcademyUnit[]): void {
    const doc = new jsPDF();
    
    // Header específico para catracas
    doc.setFontSize(24);
    doc.setTextColor(220, 38, 127);
    doc.text('RELATÓRIO DE CATRACAS', 20, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(102, 102, 102);
    doc.text('Análise Completa do Sistema de Controle de Acesso', 20, 35);
    
    const catracas = units.flatMap(unit => unit.equipment.filter(eq => eq.category === 'Catracas'));
    
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text(`Total de Catracas Instaladas: ${catracas.length}`, 20, 55);
    doc.text(`Unidades com Catracas: ${units.filter(u => u.equipment.some(eq => eq.category === 'Catracas')).length}`, 20, 65);
    
    if (catracas.length > 0) {
      // Análise por modelo
      const catracasByModel = catracas.reduce((acc, cat) => {
        const model = cat.model || 'Não especificado';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Análise por status
      const catracasByStatus = catracas.reduce((acc, cat) => {
        acc[cat.status] = (acc[cat.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Tabela de modelos
      doc.autoTable({
        head: [['Modelo', 'Quantidade', 'Percentual', 'Status Predominante']],
        body: Object.entries(catracasByModel).map(([model, count]) => {
          const modelCatracas = catracas.filter(c => (c.model || 'Não especificado') === model);
          const workingCount = modelCatracas.filter(c => c.status === 'working').length;
          const status = workingCount === count ? 'Todos funcionando' : 
                       workingCount > count / 2 ? 'Maioria funcionando' : 'Requer atenção';
          
          return [
            model,
            count.toString(),
            ((count / catracas.length) * 100).toFixed(1) + '%',
            status
          ];
        }),
        startY: 80,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [220, 38, 127],
          textColor: [255, 255, 255]
        }
      });

      // Listagem por unidade
      const currentY = (doc as any).lastAutoTable.finalY + 20;
      
      doc.setFontSize(14);
      doc.text('CATRACAS POR UNIDADE', 20, currentY);
      
      const unitsWithCatracas = units.filter(u => u.equipment.some(eq => eq.category === 'Catracas'));
      
      const unitData = unitsWithCatracas.map(unit => {
        const unitCatracas = unit.equipment.filter(eq => eq.category === 'Catracas');
        return [
          unit.name,
          unitCatracas.length.toString(),
          unitCatracas.map(c => c.model || 'N/E').join(', '),
          unitCatracas.filter(c => c.status === 'working').length + '/' + unitCatracas.length
        ];
      });

      doc.autoTable({
        head: [['Unidade', 'Qtd', 'Modelos', 'Funcionando']],
        body: unitData,
        startY: currentY + 10,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [220, 38, 127],
          textColor: [255, 255, 255]
        }
      });
    } else {
      doc.setFontSize(16);
      doc.setTextColor(239, 68, 68);
      doc.text('ATENÇÃO: Sistema sem catracas cadastradas', 20, 80);
      
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.text('Recomendações para implementação:', 20, 100);
      doc.text('• Avaliar necessidade de controle de acesso por unidade', 25, 115);
      doc.text('• Definir especificações técnicas padronizadas', 25, 125);
      doc.text('• Estabelecer cronograma de implantação por regional', 25, 135);
      doc.text('• Calcular ROI e benefícios de segurança', 25, 145);
    }

    doc.save('relatorio-catracas-evoque.pdf');
  }

  // Relatório de Segurança
  static generateSecurityReportPDF(units: AcademyUnit[]): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(239, 68, 68);
    doc.text('RELATÓRIO DE SEGURANÇA', 20, 25);

    doc.setFontSize(16);
    doc.setTextColor(102, 102, 102);
    doc.text('Evoque Academias - Análise de Equipamentos de Segurança', 20, 35);

    doc.setFontSize(12);
    doc.setTextColor(136, 136, 136);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);

    // Análise de equipamentos de segurança
    const allEquipments = units.flatMap(unit => unit.equipment);
    const securityEquipments = allEquipments.filter(eq =>
      eq.category === 'Catracas' ||
      eq.category.includes('Câmeras') ||
      eq.category === 'Controle de Acesso' ||
      eq.category === 'Segurança'
    );

    const catracas = securityEquipments.filter(eq => eq.category === 'Catracas');
    const cameras = securityEquipments.filter(eq => eq.category.includes('Câmeras'));
    const controleAcesso = securityEquipments.filter(eq => eq.category === 'Controle de Acesso');

    const securityWorking = securityEquipments.filter(eq => eq.status === 'working');
    const securityBroken = securityEquipments.filter(eq => eq.status === 'broken');

    // Métricas principais
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('RESUMO EXECUTIVO DE SEGURANÇA', 20, 65);

    doc.setFontSize(12);
    doc.text(`Total de Equipamentos de Segurança: ${securityEquipments.length}`, 20, 80);
    doc.text(`• Catracas: ${catracas.length}`, 25, 90);
    doc.text(`• Câmeras de Segurança: ${cameras.length}`, 25, 100);
    doc.text(`• Controle de Acesso: ${controleAcesso.length}`, 25, 110);

    doc.text(`Taxa de Funcionamento: ${((securityWorking.length / securityEquipments.length) * 100).toFixed(1)}%`, 20, 125);
    doc.text(`Equipamentos com Problemas: ${securityBroken.length}`, 20, 135);

    // Unidades críticas
    const criticalUnits = units.filter(unit => {
      const unitSecurity = unit.equipment.filter(eq =>
        eq.category === 'Catracas' ||
        eq.category.includes('Câmeras') ||
        eq.category === 'Controle de Acesso'
      );
      const brokenSecurity = unitSecurity.filter(eq => eq.status === 'broken');
      return brokenSecurity.length > 0;
    });

    if (criticalUnits.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(239, 68, 68);
      doc.text('ALERTAS DE SEGURANÇA CRÍTICOS', 20, 155);

      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);

      let currentY = 170;
      criticalUnits.forEach(unit => {
        const brokenEquipments = unit.equipment.filter(eq =>
          (eq.category === 'Catracas' ||
           eq.category.includes('Câmeras') ||
           eq.category === 'Controle de Acesso') &&
          eq.status === 'broken'
        );

        doc.text(`${unit.name}: ${brokenEquipments.length} equipamento(s) com problema`, 25, currentY);
        currentY += 8;

        brokenEquipments.forEach(eq => {
          doc.text(`  • ${eq.name} (${eq.category})`, 30, currentY);
          currentY += 6;
        });
        currentY += 2;
      });
    }

    // Tabela detalhada
    const tableData = units.map(unit => {
      const unitSecurity = unit.equipment.filter(eq =>
        eq.category === 'Catracas' ||
        eq.category.includes('Câmeras') ||
        eq.category === 'Controle de Acesso'
      );
      const working = unitSecurity.filter(eq => eq.status === 'working').length;
      const broken = unitSecurity.filter(eq => eq.status === 'broken').length;
      const total = unitSecurity.length;

      return [
        unit.name,
        total.toString(),
        working.toString(),
        broken.toString(),
        total > 0 ? `${((working / total) * 100).toFixed(0)}%` : 'N/A'
      ];
    });

    doc.autoTable({
      head: [['Unidade', 'Total Seg.', 'Funcionando', 'Problemas', 'Taxa']],
      body: tableData,
      startY: Math.max(currentY || 180, 180),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255]
      }
    });

    doc.save('relatorio-seguranca-evoque.pdf');
  }
}
