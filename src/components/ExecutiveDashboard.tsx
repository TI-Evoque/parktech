import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, TrendingUp, Shield, Users, Target, BarChart3, PieChart, Download, FileText, Monitor, Laptop, Camera, Lock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [showReportMenu, setShowReportMenu] = useState(false);
  
  const catracasChart = useRef<HTMLCanvasElement>(null);
  const securityChart = useRef<HTMLCanvasElement>(null);
  const equipmentByUnitChart = useRef<HTMLCanvasElement>(null);
  const statusDistributionChart = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  // Filtrar unidades baseado na seleção
  const filteredUnits = selectedUnit === 'all' ? units : units.filter(u => u.id === selectedUnit);
  const allEquipments = filteredUnits.flatMap(unit => unit.equipment);

  // Análise específica de equipamentos importantes para academias
  const catracas = allEquipments.filter(eq => eq.category === 'Catracas');
  const cameras = allEquipments.filter(eq => eq.category.includes('Câmeras'));
  const controleAcesso = allEquipments.filter(eq => eq.category === 'Controle de Acesso');
  const computadores = allEquipments.filter(eq => eq.category === 'Computadores');
  const notebooks = allEquipments.filter(eq => eq.name.toLowerCase().includes('notebook') || eq.name.toLowerCase().includes('laptop'));
  
  // Equipamentos de segurança (críticos para academias)
  const equipamentosSeguranca = [...catracas, ...cameras, ...controleAcesso];
  
  // Status dos equipamentos
  const equipmentosAtivos = allEquipments.filter(eq => eq.status === 'working');
  const equipamentosManutencao = allEquipments.filter(eq => eq.status === 'maintenance');
  const equipamentosQuebrados = allEquipments.filter(eq => eq.status === 'broken');

  // Análise por unidade (top 10 unidades com mais equipamentos)
  const equipmentsByUnit = units.map(unit => ({
    name: unit.name,
    total: unit.equipment.length,
    catracas: unit.equipment.filter(eq => eq.category === 'Catracas').length,
    cameras: unit.equipment.filter(eq => eq.category.includes('Câmeras')).length,
    seguranca: unit.equipment.filter(eq => 
      eq.category === 'Catracas' || 
      eq.category.includes('Câmeras') || 
      eq.category === 'Controle de Acesso'
    ).length,
    notebooks: unit.equipment.filter(eq => 
      eq.name.toLowerCase().includes('notebook') || 
      eq.name.toLowerCase().includes('laptop')
    ).length,
    status: {
      working: unit.equipment.filter(eq => eq.status === 'working').length,
      maintenance: unit.equipment.filter(eq => eq.status === 'maintenance').length,
      broken: unit.equipment.filter(eq => eq.status === 'broken').length
    }
  })).sort((a, b) => b.total - a.total);

  // Análise de criticidade de segurança
  const unidadesCriticas = units.filter(unit => {
    const equipamentosSegurancaUnit = unit.equipment.filter(eq => 
      eq.category === 'Catracas' || 
      eq.category.includes('Câmeras') || 
      eq.category === 'Controle de Acesso'
    );
    const equipamentosQuebradosSeguranca = equipamentosSegurancaUnit.filter(eq => eq.status === 'broken');
    return equipamentosQuebradosSeguranca.length > 0;
  });

  // Dados para gráficos
  const catracasData = catracas.reduce((acc, eq) => {
    const model = eq.model || 'Modelo não especificado';
    acc[model] = (acc[model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const securityData = {
    'Catracas': catracas.length,
    'Câmeras de Segurança': cameras.length,
    'Controle de Acesso': controleAcesso.length
  };

  useEffect(() => {
    // Cleanup previous charts
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    // Gráfico de Catracas por Modelo
    if (catracasChart.current && Object.keys(catracasData).length > 0) {
      const ctx = catracasChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(catracasData),
            datasets: [{
              data: Object.values(catracasData),
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(147, 51, 234, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(16, 185, 129, 0.8)'
              ],
              borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(147, 51, 234, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(16, 185, 129, 1)'
              ],
              borderWidth: 2,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              },
              datalabels: {
                color: '#fff',
                font: { weight: 'bold' },
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

    // Gráfico de Equipamentos de Segurança
    if (securityChart.current) {
      const ctx = securityChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(securityData),
            datasets: [{
              label: 'Quantidade',
              data: Object.values(securityData),
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)'
              ],
              borderColor: [
                'rgba(239, 68, 68, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)'
              ],
              borderWidth: 2,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#374151',
                font: { weight: 'bold' }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              },
              x: {
                grid: { display: false }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // Gráfico de Equipamentos por Unidade (Top 10)
    if (equipmentByUnitChart.current) {
      const ctx = equipmentByUnitChart.current.getContext('2d');
      if (ctx) {
        const top10Units = equipmentsByUnit.slice(0, 10);
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: top10Units.map(u => u.name),
            datasets: [
              {
                label: 'Total de Equipamentos',
                data: top10Units.map(u => u.total),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#374151',
                font: { weight: 'bold' }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              },
              x: {
                grid: { display: false },
                ticks: { maxRotation: 45 }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // Gráfico de Status dos Equipamentos
    if (statusDistributionChart.current) {
      const ctx = statusDistributionChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Funcionando', 'Manutenção', 'Quebrado'],
            datasets: [{
              data: [equipmentosAtivos.length, equipamentosManutencao.length, equipamentosQuebrados.length],
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(239, 68, 68, 0.8)'
              ],
              borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(251, 191, 36, 1)',
                'rgba(239, 68, 68, 1)'
              ],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { padding: 20, usePointStyle: true }
              },
              datalabels: {
                color: '#fff',
                font: { weight: 'bold' },
                formatter: (value, context) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${percentage}%`;
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
  }, [filteredUnits, catracasData, securityData, equipmentsByUnit, equipmentosAtivos, equipamentosManutencao, equipmentosQuebrados]);

  const handleGenerateReport = (type: string) => {
    switch (type) {
      case 'executive':
        ExecutiveReportService.generateExecutiveReportPDF(units);
        break;
      case 'security':
        ExecutiveReportService.generateSecurityReportPDF(units);
        break;
      case 'catracas':
        ExecutiveReportService.generateCatracaReportPDF(units);
        break;
    }
    setShowReportMenu(false);
  };

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
            <p className="text-slate-600">Análise estratégica dos equipamentos da rede Evoque Academias</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as Unidades</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
          
          <div className="relative">
            <button
              onClick={() => setShowReportMenu(!showReportMenu)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Relatórios Executivos</span>
            </button>
            
            {showReportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                <div className="p-2">
                  <button
                    onClick={() => handleGenerateReport('executive')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Relatório Executivo Completo</span>
                  </button>
                  <button
                    onClick={() => handleGenerateReport('security')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Relatório de Segurança</span>
                  </button>
                  <button
                    onClick={() => handleGenerateReport('catracas')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Relatório de Catracas</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total de Equipamentos</p>
              <p className="text-3xl font-bold text-blue-900">{allEquipments.length}</p>
              <p className="text-xs text-blue-600">
                {equipmentosAtivos.length} ativos ({((equipmentosAtivos.length / allEquipments.length) * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Equipamentos de Segurança</p>
              <p className="text-3xl font-bold text-red-900">{equipamentosSeguranca.length}</p>
              <p className="text-xs text-red-600">
                {catracas.length} catracas, {cameras.length} câmeras
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Notebooks/Laptops</p>
              <p className="text-3xl font-bold text-green-900">{notebooks.length}</p>
              <p className="text-xs text-green-600">
                Equipamentos administrativos
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Laptop className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Unidades com Problemas</p>
              <p className="text-3xl font-bold text-amber-900">{unidadesCriticas.length}</p>
              <p className="text-xs text-amber-600">
                Equipamentos de segurança com falhas
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-red-600" />
            Distribuição de Catracas por Modelo
          </h3>
          <div className="h-80">
            <canvas ref={catracasChart} className="w-full h-full"></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Equipamentos de Segurança
          </h3>
          <div className="h-80">
            <canvas ref={securityChart} className="w-full h-full"></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Top 10 Unidades por Equipamentos
          </h3>
          <div className="h-80">
            <canvas ref={equipmentByUnitChart} className="w-full h-full"></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Status Geral dos Equipamentos
          </h3>
          <div className="h-80">
            <canvas ref={statusDistributionChart} className="w-full h-full"></canvas>
          </div>
        </div>
      </div>

      {/* Tabela Detalhada por Unidade */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Análise Detalhada por Unidade</h3>
          <p className="text-sm text-slate-600">Equipamentos estratégicos por unidade</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-900">Unidade</th>
                <th className="px-6 py-3 text-center font-medium text-slate-900">Total</th>
                <th className="px-6 py-3 text-center font-medium text-slate-900">Catracas</th>
                <th className="px-6 py-3 text-center font-medium text-slate-900">Câmeras</th>
                <th className="px-6 py-3 text-center font-medium text-slate-900">Notebooks</th>
                <th className="px-6 py-3 text-center font-medium text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {equipmentsByUnit.slice(0, 15).map((unit, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{unit.name}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{unit.total}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{unit.catracas}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{unit.cameras}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{unit.notebooks}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {unit.status.working}
                      </span>
                      {unit.status.maintenance > 0 && (
                        <span className="flex items-center text-yellow-600">
                          <Activity className="w-3 h-3 mr-1" />
                          {unit.status.maintenance}
                        </span>
                      )}
                      {unit.status.broken > 0 && (
                        <span className="flex items-center text-red-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {unit.status.broken}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas de Segurança */}
      {unidadesCriticas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-900">Alertas de Segurança</h3>
          </div>
          <p className="text-red-700 mb-4">
            As seguintes unidades possuem equipamentos de segurança com problemas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unidadesCriticas.map(unit => {
              const equipamentosProblema = unit.equipment.filter(eq => 
                (eq.category === 'Catracas' || 
                 eq.category.includes('Câmeras') || 
                 eq.category === 'Controle de Acesso') &&
                eq.status === 'broken'
              );
              
              return (
                <div key={unit.id} className="bg-white border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900">{unit.name}</h4>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    {equipamentosProblema.map(eq => (
                      <li key={eq.id}>• {eq.name} ({eq.category})</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
