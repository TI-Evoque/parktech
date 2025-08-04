import React, { useEffect, useRef, useState } from 'react';
import { Shield, MapPin, Users, UserCheck, Zap, AlertTriangle, Wrench, ArrowRight, Download, BarChart3 } from 'lucide-react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AcademyUnit } from '../types/academy';
import { ReportService } from '../services/reportService';

// Registrar plugin
Chart.register(ChartDataLabels);

interface DashboardProps {
  units: AcademyUnit[];
  onSelectUnit: (unitId: string) => void;
}

export function Dashboard({ units, onSelectUnit }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const unitsPerPage = 5;
  
  const overviewChart = useRef<HTMLCanvasElement>(null);
  const statusChart = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  const totalEquipments = units.reduce((sum, unit) => sum + unit.equipment.length, 0);
  const workingEquipments = units.reduce((sum, unit) => 
    sum + unit.equipment.filter(eq => eq.status === 'working').length, 0
  );
  const maintenanceEquipments = units.reduce((sum, unit) => 
    sum + unit.equipment.filter(eq => eq.status === 'maintenance').length, 0
  );
  const brokenEquipments = units.reduce((sum, unit) => 
    sum + unit.equipment.filter(eq => eq.status === 'broken').length, 0
  );

  // Paginação
  const totalPages = Math.ceil(units.length / unitsPerPage);
  const startIndex = (currentPage - 1) * unitsPerPage;
  const endIndex = startIndex + unitsPerPage;
  const currentUnits = units.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    // Cleanup previous charts
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    // Overview Chart - Regional distribution with advanced interactivity
    if (overviewChart.current) {
      const ctx = overviewChart.current.getContext('2d');
      if (ctx) {
        const regionalData = units.reduce((acc, unit) => {
          if (unit.regional) {
            acc[unit.regional] = (acc[unit.regional] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(regionalData),
            datasets: [{
              label: 'Unidades por Regional',
              data: Object.values(regionalData),
              backgroundColor: [
                'rgba(70, 130, 255, 0.8)',
                'rgba(255, 99, 132, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
              ],
              borderColor: [
                'rgba(70, 130, 255, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
              hoverBackgroundColor: [
                'rgba(70, 130, 255, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              hoverBorderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(70, 130, 255, 1)',
                borderWidth: 2,
                cornerRadius: 12,
                displayColors: false,
                padding: 12,
                titleFont: {
                  size: 14,
                  weight: 'bold'
                },
                bodyFont: {
                  size: 12
                },
                callbacks: {
                  title: function(context) {
                    return `Regional: ${context[0].label}`;
                  },
                  label: function(context) {
                    const value = context.parsed.y;
                    const percentage = ((value / units.length) * 100).toFixed(1);
                    return [
                      `${value} unidades`,
                      `${percentage}% do total`,
                      `Clique para ver detalhes`
                    ];
                  }
                }
              },
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#374151',
                font: {
                  weight: 'bold',
                  size: 12
                },
                formatter: (value) => value
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(148, 163, 184, 0.1)',
                  drawBorder: false
                },
                ticks: {
                  color: '#64748b',
                  font: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 12
                  },
                  stepSize: 1
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#64748b',
                  font: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 12
                  },
                  maxRotation: 45
                }
              }
            },
            animation: {
              duration: 1200,
              easing: 'easeInOutQuart',
              delay: (context) => context.dataIndex * 100
            },
            onHover: (event, activeElements) => {
              event.native!.target!.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            },
            onClick: (event, activeElements) => {
              if (activeElements.length > 0) {
                const dataIndex = activeElements[0].index;
                const regional = Object.keys(regionalData)[dataIndex];
                console.log(`Clicked on regional: ${regional}`);
                // Aqui você pode implementar navegação para detalhes do regional
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // Status Chart - Equipment status with advanced styling
    if (statusChart.current) {
      const ctx = statusChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Funcionando', 'Manutenção', 'Fora de Serviço'],
            datasets: [{
              data: [workingEquipments, maintenanceEquipments, brokenEquipments],
              backgroundColor: [
                'rgba(34, 197, 94, 0.9)',
                'rgba(251, 191, 36, 0.9)',
                'rgba(239, 68, 68, 0.9)'
              ],
              borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(251, 191, 36, 1)',
                'rgba(239, 68, 68, 1)'
              ],
              borderWidth: 3,
              hoverOffset: 12,
              cutout: '60%',
              hoverBackgroundColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(251, 191, 36, 1)',
                'rgba(239, 68, 68, 1)'
              ],
              hoverBorderWidth: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 25,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  font: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 14,
                    weight: '600'
                  },
                  color: '#374151',
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels && data.datasets.length) {
                      const dataset = data.datasets[0];
                      return data.labels.map((label, i) => {
                        const value = dataset.data[i] as number;
                        const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return {
                          text: `${label}: ${value} (${percentage}%)`,
                          fillStyle: dataset.backgroundColor![i] as string,
                          strokeStyle: dataset.borderColor![i] as string,
                          lineWidth: dataset.borderWidth as number,
                          hidden: false,
                          index: i
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderWidth: 2,
                cornerRadius: 12,
                displayColors: true,
                padding: 15,
                titleFont: {
                  size: 14,
                  weight: 'bold'
                },
                bodyFont: {
                  size: 13
                },
                callbacks: {
                  title: function(context) {
                    return `Status: ${context[0].label}`;
                  },
                  label: function(context) {
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return [
                      `${value} equipamentos`,
                      `${percentage}% do total`,
                      'Clique para filtrar'
                    ];
                  }
                }
              },
              datalabels: {
                color: '#fff',
                font: {
                  weight: 'bold',
                  size: 14
                },
                formatter: (value, context) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${percentage}%`;
                },
                textStrokeColor: 'rgba(0, 0, 0, 0.8)',
                textStrokeWidth: 2
              }
            },
            animation: {
              animateRotate: true,
              duration: 1500,
              easing: 'easeInOutQuart',
              delay: (context) => context.dataIndex * 200
            },
            onHover: (event, activeElements) => {
              event.native!.target!.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            },
            onClick: (event, activeElements) => {
              if (activeElements.length > 0) {
                const dataIndex = activeElements[0].index;
                const statuses = ['working', 'maintenance', 'broken'];
                const selectedStatus = statuses[dataIndex];
                console.log(`Clicked on status: ${selectedStatus}`);
                // Aqui você pode implementar filtro por status
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    return () => {
      chartInstances.current.forEach(chart => chart.destroy());
    };
  }, [units, workingEquipments, maintenanceEquipments, brokenEquipments]);

  const handleGenerateReport = (type: string) => {
    switch (type) {
      case 'units':
        ReportService.generateUnitsReportPDF(units);
        break;
      case 'equipment':
        ReportService.generateEquipmentReportPDF(units);
        break;
      case 'regional':
        ReportService.generateRegionalReportPDF(units);
        break;
      case 'csv':
        ReportService.exportToCSV(units);
        break;
    }
    setShowReportMenu(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Geral</h2>
          <p className="text-slate-600">Visão geral das unidades Evoque Academias</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowReportMenu(!showReportMenu)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios</span>
            </button>
            
            {showReportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                <div className="p-2">
                  <button
                    onClick={() => handleGenerateReport('units')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Relatório de Unidades (PDF)</span>
                  </button>
                  <button
                    onClick={() => handleGenerateReport('equipment')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Relatório de Equipamentos (PDF)</span>
                  </button>
                  <button
                    onClick={() => handleGenerateReport('regional')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Relatório por Regional (PDF)</span>
                  </button>
                  <button
                    onClick={() => handleGenerateReport('csv')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar dados (CSV)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="text-sm text-slate-500">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total de Unidades</p>
              <p className="text-3xl font-bold text-blue-900">{units.length}</p>
              <p className="text-xs text-blue-600 mt-1">Unidades ativas</p>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg border border-emerald-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Total Equipamentos</p>
              <p className="text-3xl font-bold text-emerald-900">{totalEquipments}</p>
              <p className="text-xs text-emerald-600 mt-1">{workingEquipments} funcionando</p>
            </div>
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Em Manutenção</p>
              <p className="text-3xl font-bold text-amber-900">{maintenanceEquipments}</p>
              <p className="text-xs text-amber-600 mt-1">{totalEquipments > 0 ? ((maintenanceEquipments / totalEquipments) * 100).toFixed(1) : 0}% do total</p>
            </div>
            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg border border-red-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Fora de Serviço</p>
              <p className="text-3xl font-bold text-red-900">{brokenEquipments}</p>
              <p className="text-xs text-red-600 mt-1">{totalEquipments > 0 ? ((brokenEquipments / totalEquipments) * 100).toFixed(1) : 0}% do total</p>
            </div>
            <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos interativos estilo Power BI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-2 h-6 bg-white rounded-full mr-3"></div>
              Unidades por Regional
            </h3>
            <p className="text-blue-100 text-sm mt-1">Distribuição das {units.length} unidades • Clique nas barras para mais detalhes</p>
          </div>
          <div className="p-6">
            <div className="h-80">
              <canvas ref={overviewChart} className="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-2 h-6 bg-white rounded-full mr-3"></div>
              Status dos Equipamentos
            </h3>
            <p className="text-emerald-100 text-sm mt-1">Total de {totalEquipments} equipamentos • Clique nos segmentos para filtrar</p>
          </div>
          <div className="p-6">
            <div className="h-80">
              <canvas ref={statusChart} className="w-full h-full"></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de unidades */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Unidades Evoque Academias</h3>
            <div className="text-sm text-slate-500">
              Mostrando {startIndex + 1}-{Math.min(endIndex, units.length)} de {units.length} unidades
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {currentUnits.map((unit) => (
            <div key={unit.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    unit.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-slate-900">{unit.name}</h4>
                    <p className="text-sm text-slate-500">{unit.email}</p>
                    <p className="text-xs text-slate-400">Plano: {unit.internetPlan || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {unit.equipment.length} equipamentos
                    </p>
                    <p className="text-xs text-slate-500">
                      {unit.equipment.filter(eq => eq.status === 'working').length} funcionando
                    </p>
                    {unit.manager && (
                      <p className="text-xs text-slate-400">
                        Gerente: {unit.manager}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectUnit(unit.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <span className="text-sm font-medium">Ver detalhes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Controles de paginação */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Página {currentPage} de {totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Anterior
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let page;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                          currentPage === page
                            ? 'bg-orange-600 text-white shadow-lg'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 7 && currentPage < totalPages - 3 && (
                    <>
                      <span className="px-2 text-slate-400">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 transform hover:scale-105"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
