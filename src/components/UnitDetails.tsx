import React, { useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Clock, Zap, AlertTriangle, Wrench } from 'lucide-react';
import Chart from 'chart.js/auto';
import { AcademyUnit } from '../types/academy';

interface UnitDetailsProps {
  unit: AcademyUnit;
  onBack: () => void;
}

export function UnitDetails({ unit, onBack }: UnitDetailsProps) {
  const categoryChart = useRef<HTMLCanvasElement>(null);
  const statusChart = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  const workingEquipments = unit.equipment.filter(eq => eq.status === 'working').length;
  const maintenanceEquipments = unit.equipment.filter(eq => eq.status === 'maintenance').length;
  const brokenEquipments = unit.equipment.filter(eq => eq.status === 'broken').length;

  // Agrupar equipamentos por categoria
  const categoryData = unit.equipment.reduce((acc, eq) => {
    acc[eq.category] = (acc[eq.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    // Cleanup previous charts
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    // Category Chart
    if (categoryChart.current) {
      const ctx = categoryChart.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: Object.keys(categoryData),
            datasets: [{
              data: Object.values(categoryData),
              backgroundColor: [
                'rgba(255, 103, 0, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)'
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
                  padding: 15,
                  usePointStyle: true
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
          type: 'bar',
          data: {
            labels: ['Funcionando', 'Manutenção', 'Quebrado'],
            datasets: [{
              label: 'Quantidade',
              data: [workingEquipments, maintenanceEquipments, brokenEquipments],
              backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)', 
                'rgba(239, 68, 68, 0.8)'
              ],
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

    return () => {
      chartInstances.current.forEach(chart => chart.destroy());
    };
  }, [unit, categoryData, workingEquipments, maintenanceEquipments, brokenEquipments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${
            unit.status === 'online' ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{unit.name}</h2>
            <p className="text-slate-600 flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{unit.location}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Métricas da unidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Funcionando</p>
              <p className="text-3xl font-bold text-green-600">{workingEquipments}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Em Manutenção</p>
              <p className="text-3xl font-bold text-yellow-600">{maintenanceEquipments}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Fora de Serviço</p>
              <p className="text-3xl font-bold text-red-600">{brokenEquipments}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Equipamentos por Categoria
          </h3>
          <canvas ref={categoryChart} className="w-full h-64"></canvas>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status dos Equipamentos
          </h3>
          <canvas ref={statusChart} className="w-full h-64"></canvas>
        </div>
      </div>

      {/* Lista de equipamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Lista de Equipamentos</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {unit.equipment.map((equipment) => (
            <div key={equipment.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    equipment.status === 'working' ? 'bg-green-400' : 
                    equipment.status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-slate-900">{equipment.name}</h4>
                    <p className="text-sm text-slate-500">{equipment.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {equipment.status === 'working' ? 'Funcionando' :
                       equipment.status === 'maintenance' ? 'Em Manutenção' : 'Fora de Serviço'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Última verificação: {equipment.lastMaintenance}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}