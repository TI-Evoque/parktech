import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, TrendingUp, Shield, Users, Target, BarChart3, PieChart, Download, FileText } from 'lucide-react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AcademyUnit } from '../types/academy';
import { ExecutiveReportService } from '../services/executiveReportService';

Chart.register(ChartDataLabels);

interface ExecutiveDashboardProps {
  units: AcademyUnit[];
  onBack: () => void;
}

export function ExecutiveDashboard({ units, onBack }: ExecutiveDashboardProps) {
  const equipmentTypeChart = useRef<HTMLCanvasElement>(null);
  const catracasChart = useRef<HTMLCanvasElement>(null);
  const securityChart = useRef<HTMLCanvasElement>(null);
  const regionalEquipmentChart = useRef<HTMLCanvasElement>(null);
  const equipmentStatusChart = useRef<HTMLCanvasElement>(null);
  const manufacturerChart = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  // Análise de dados para executivos
  const allEquipments = units.flatMap(unit => unit.equipment);
  
  const equipmentByType = allEquipments.reduce((acc, eq) => {
    acc[eq.category] = (acc[eq.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const catracasData = allEquipments.filter(eq => eq.category === 'Catracas');
  const catracasByModel = catracasData.reduce((acc, eq) => {
    acc[eq.model || 'Não especificado'] = (acc[eq.model || 'Não especificado'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const securityEquipments = allEquipments.filter(eq => 
    eq.category.includes('Câmeras') || 
    eq.category.includes('Segurança') ||
    eq.category.includes('Controle de Acesso') ||
    eq.category.includes('Catracas')
  );

  const securityByType = securityEquipments.reduce((acc, eq) => {
    acc[eq.category] = (acc[eq.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const equipmentByRegional = units.reduce((acc, unit) => {
    if (unit.regional) {
      acc[unit.regional] = (acc[unit.regional] || 0) + unit.equipment.length;
    }
    return acc;
  }, {} as Record<string, number>);

  const statusData = {
    working: allEquipments.filter(eq => eq.status === 'working').length,
    maintenance: allEquipments.filter(eq => eq.status === 'maintenance').length,
    broken: allEquipments.filter(eq => eq.status === 'broken').length
  };

  const manufacturerData = units.reduce((acc, unit) => {
    acc[unit.manufacturer] = (acc[unit.manufacturer] || 0) + unit.equipment.length;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    // Cleanup previous charts
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    // 1. Gráfico de Tipos de Equipamentos
    if (equipmentTypeChart.current) {
      const ctx = equipmentTypeChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(equipmentByType),
            datasets: [{
              label: 'Quantidade de Equipamentos',
              data: Object.values(equipmentByType),
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',    // Azul
                'rgba(16, 185, 129, 0.8)',    // Verde
                'rgba(245, 158, 11, 0.8)',    // Amarelo
                'rgba(239, 68, 68, 0.8)',     // Vermelho
                'rgba(139, 92, 246, 0.8)',    // Roxo
                'rgba(236, 72, 153, 0.8)',    // Rosa
                'rgba(34, 197, 94, 0.8)',     // Verde claro
                'rgba(168, 85, 247, 0.8)'     // Violeta
              ],
              borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(168, 85, 247, 1)'
              ],
              borderWidth: 2,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Inventário de Equipamentos por Categoria',
                font: { size: 16, weight: 'bold' },
                color: '#1f2937'
              },
              legend: { display: false },
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#374151',
                font: { weight: 'bold', size: 12 },
                formatter: (value) => value
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(156, 163, 175, 0.1)' },
                ticks: { color: '#6b7280', font: { size: 11 } }
              },
              x: {
                grid: { display: false },
                ticks: { 
                  color: '#6b7280', 
                  font: { size: 11 },
                  maxRotation: 45
                }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // 2. Gráfico específico de Catracas
    if (catracasChart.current && Object.keys(catracasByModel).length > 0) {
      const ctx = catracasChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(catracasByModel),
            datasets: [{
              data: Object.values(catracasByModel),
              backgroundColor: [
                'rgba(239, 68, 68, 0.9)',
                'rgba(245, 158, 11, 0.9)',
                'rgba(34, 197, 94, 0.9)',
                'rgba(59, 130, 246, 0.9)',
                'rgba(139, 92, 246, 0.9)'
              ],
              borderColor: '#ffffff',
              borderWidth: 3,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `Catracas Instaladas na Rede (${catracasData.length} unidades)`,
                font: { size: 16, weight: 'bold' },
                color: '#1f2937'
              },
              legend: {
                position: 'bottom',
                labels: {
                  padding: 15,
                  usePointStyle: true,
                  font: { size: 12 },
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
                          hidden: false,
                          index: i
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              datalabels: {
                color: '#ffffff',
                font: { weight: 'bold', size: 14 },
                formatter: (value, context) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(0);
                  return `${percentage}%`;
                }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // 3. Gráfico de Equipamentos de Segurança
    if (securityChart.current) {
      const ctx = securityChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(securityByType),
            datasets: [{
              label: 'Equipamentos de Segurança',
              data: Object.values(securityByType),
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 2,
              borderRadius: 6
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Equipamentos de Segurança por Categoria',
                font: { size: 16, weight: 'bold' },
                color: '#1f2937'
              },
              legend: { display: false },
              datalabels: {
                anchor: 'end',
                align: 'right',
                color: '#374151',
                font: { weight: 'bold', size: 12 },
                formatter: (value) => value
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: { color: 'rgba(156, 163, 175, 0.1)' },
                ticks: { color: '#6b7280' }
              },
              y: {
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 11 } }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // 4. Gráfico de Equipamentos por Regional
    if (regionalEquipmentChart.current) {
      const ctx = regionalEquipmentChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: Object.keys(equipmentByRegional),
            datasets: [{
              data: Object.values(equipmentByRegional),
              backgroundColor: [
                'rgba(34, 197, 94, 0.9)',
                'rgba(59, 130, 246, 0.9)',
                'rgba(245, 158, 11, 0.9)',
                'rgba(139, 92, 246, 0.9)',
                'rgba(236, 72, 153, 0.9)'
              ],
              borderColor: '#ffffff',
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Distribuição de Equipamentos por Regional',
                font: { size: 16, weight: 'bold' },
                color: '#1f2937'
              },
              legend: {
                position: 'right',
                labels: {
                  padding: 15,
                  usePointStyle: true,
                  font: { size: 12 }
                }
              },
              datalabels: {
                color: '#ffffff',
                font: { weight: 'bold', size: 12 },
                formatter: (value, context) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${value}\n(${percentage}%)`;
                }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // 5. Status dos Equipamentos
    if (equipmentStatusChart.current) {
      const ctx = equipmentStatusChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Funcionando', 'Em Manutenção', 'Com Defeito'],
            datasets: [{
              label: 'Quantidade',
              data: [statusData.working, statusData.maintenance, statusData.broken],
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
              ],
              borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)'
              ],
              borderWidth: 2,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Status Operacional dos Equipamentos',
                font: { size: 16, weight: 'bold' },
                color: '#1f2937'
              },
              legend: { display: false },
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#374151',
                font: { weight: 'bold', size: 14 },
                formatter: (value, context) => {
                  const total = statusData.working + statusData.maintenance + statusData.broken;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${value}\n(${percentage}%)`;
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(156, 163, 175, 0.1)' },
                ticks: { color: '#6b7280' }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 12 } }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // 6. Equipamentos por Fabricante
    if (manufacturerChart.current) {
      const ctx = manufacturerChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(manufacturerData),
            datasets: [{
              data: Object.values(manufacturerData),
              backgroundColor: [
                'rgba(255, 103, 0, 0.9)',
                'rgba(139, 92, 246, 0.9)'
              ],
              borderColor: '#ffffff',
              borderWidth: 4,
              cutout: '50%'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Equipamentos por Fabricante de Sistema',
                font: { size: 16, weight: 'bold' },
                color: '#1f2937'
              },
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  font: { size: 14, weight: '600' }
                }
              },
              datalabels: {
                color: '#ffffff',
                font: { weight: 'bold', size: 16 },
                formatter: (value, context) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${value}\n${percentage}%`;
                }
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
  }, [units]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Dashboard Executivo</h2>
            <p className="text-slate-600">Análise completa dos equipamentos da rede Academia Evoque</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => ExecutiveReportService.generateCatracaReportPDF(units)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center space-x-2 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Relatório de Catracas</span>
          </button>
          <button
            onClick={() => ExecutiveReportService.generateExecutiveReportPDF(units)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Relatório Executivo</span>
          </button>
        </div>
      </div>

      {/* Métricas Executivas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total de Equipamentos</p>
              <p className="text-3xl font-bold text-blue-900">{allEquipments.length}</p>
              <p className="text-xs text-blue-600 mt-1">Em {units.length} unidades</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Catracas Instaladas</p>
              <p className="text-3xl font-bold text-red-900">{catracasData.length}</p>
              <p className="text-xs text-red-600 mt-1">Controle de acesso</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg border border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Equipamentos Segurança</p>
              <p className="text-3xl font-bold text-emerald-900">{securityEquipments.length}</p>
              <p className="text-xs text-emerald-600 mt-1">Câmeras e controle</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Taxa Operacional</p>
              <p className="text-3xl font-bold text-purple-900">
                {((statusData.working / allEquipments.length) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600 mt-1">Equipamentos funcionais</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Executivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventário de Equipamentos */}
        <div className="bg-white rounded-xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <h3 className="text-white font-semibold">Inventário por Categoria</h3>
          </div>
          <div className="p-4">
            <div className="h-80">
              <canvas ref={equipmentTypeChart} className="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        {/* Catracas na Rede */}
        <div className="bg-white rounded-xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
            <h3 className="text-white font-semibold">Catracas na Rede</h3>
          </div>
          <div className="p-4">
            <div className="h-80">
              {catracasData.length > 0 ? (
                <canvas ref={catracasChart} className="w-full h-full"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p>Nenhuma catraca cadastrada</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Equipamentos de Segurança */}
        <div className="bg-white rounded-xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4">
            <h3 className="text-white font-semibold">Equipamentos de Segurança</h3>
          </div>
          <div className="p-4">
            <div className="h-80">
              <canvas ref={securityChart} className="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        {/* Status Operacional */}
        <div className="bg-white rounded-xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
            <h3 className="text-white font-semibold">Status Operacional</h3>
          </div>
          <div className="p-4">
            <div className="h-80">
              <canvas ref={equipmentStatusChart} className="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        {/* Equipamentos por Regional */}
        <div className="bg-white rounded-xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4">
            <h3 className="text-white font-semibold">Distribuição por Regional</h3>
          </div>
          <div className="p-4">
            <div className="h-80">
              <canvas ref={regionalEquipmentChart} className="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        {/* Fabricantes */}
        <div className="bg-white rounded-xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4">
            <h3 className="text-white font-semibold">Equipamentos por Fabricante</h3>
          </div>
          <div className="p-4">
            <div className="h-80">
              <canvas ref={manufacturerChart} className="w-full h-full"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
