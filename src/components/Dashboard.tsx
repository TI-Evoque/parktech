import React, { useEffect, useRef } from 'react';
import { Users, Zap, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Chart from 'chart.js/auto';
import { AcademyUnit } from '../types/academy';

interface DashboardProps {
  units: AcademyUnit[];
  onSelectUnit: (unitId: string) => void;
}

export function Dashboard({ units, onSelectUnit }: DashboardProps) {
  const overviewChart = useRef<HTMLCanvasElement>(null);
  const statusChart = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  const totalEquipments = units.reduce((sum, unit) => sum + unit.equipment.length, 0);
  const onlineUnits = units.filter(unit => unit.status === 'online').length;
  const workingEquipments = units.reduce((sum, unit) => 
    sum + unit.equipment.filter(eq => eq.status === 'working').length, 0
  );
  const maintenanceEquipments = units.reduce((sum, unit) => 
    sum + unit.equipment.filter(eq => eq.status === 'maintenance').length, 0
  );

  useEffect(() => {
    // Cleanup previous charts
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    // Overview Chart
    if (overviewChart.current) {
      const ctx = overviewChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: units.map(unit => unit.name),
            datasets: [{
              label: 'Total de Equipamentos',
              data: units.map(unit => unit.equipment.length),
              backgroundColor: 'rgba(255, 103, 0, 0.8)',
              borderColor: 'rgba(255, 103, 0, 1)',
              borderWidth: 2,
              borderRadius: 6,
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(148, 163, 184, 0.1)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // Status Chart
    if (statusChart.current) {
      const ctx = statusChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Funcionando', 'Manutenção', 'Fora de Serviço'],
            datasets: [{
              data: [
                workingEquipments,
                maintenanceEquipments,
                totalEquipments - workingEquipments - maintenanceEquipments
              ],
              backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)', 
                'rgba(239, 68, 68, 0.8)'
              ],
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
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
  }, [units, totalEquipments, workingEquipments, maintenanceEquipments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Geral</h2>
          <p className="text-slate-600">Visão geral do parque tecnológico</p>
        </div>
        <div className="text-sm text-slate-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total de Unidades</p>
              <p className="text-3xl font-bold text-slate-900">{units.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">{onlineUnits} online</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total de Equipamentos de TI</p>
              <p className="text-3xl font-bold text-slate-900">{totalEquipments}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">{workingEquipments} funcionando</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Em Manutenção</p>
              <p className="text-3xl font-bold text-slate-900">{maintenanceEquipments}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-yellow-600 text-sm font-medium">
              {((maintenanceEquipments / totalEquipments) * 100).toFixed(1)}% do total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Taxa de Funcionamento</p>
              <p className="text-3xl font-bold text-slate-900">
                {((workingEquipments / totalEquipments) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">Acima da meta</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Equipamentos por Unidade
          </h3>
          <canvas ref={overviewChart} className="w-full h-64"></canvas>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status dos Equipamentos
          </h3>
          <canvas ref={statusChart} className="w-full h-64"></canvas>
        </div>
      </div>

      {/* Lista de unidades */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Unidades</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {units.map((unit) => (
            <div key={unit.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    unit.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-slate-900">{unit.name}</h4>
                    <p className="text-sm text-slate-500">{unit.location}</p>
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
      </div>
    </div>
  );
}