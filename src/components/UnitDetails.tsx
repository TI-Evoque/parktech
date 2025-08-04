import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, Phone, User, UserCheck, Clock, Zap, AlertTriangle, Wrench, Plus, Wifi, Trash2, Edit3, MoreVertical } from 'lucide-react';
import Chart from 'chart.js/auto';
import { AcademyUnit, Equipment } from '../types/academy';
import { AddEquipmentModal } from './AddEquipmentModal';
import { EditEquipmentModal } from './EditEquipmentModal';
import { ConfirmDialog } from './ConfirmDialog';

interface UnitDetailsProps {
  unit: AcademyUnit;
  onBack: () => void;
  onUpdateUnit: (updatedUnit: AcademyUnit) => void;
}

export function UnitDetails({ unit, onBack, onUpdateUnit }: UnitDetailsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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

  const handleAddEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
    const newEquipment: Equipment = {
      ...equipmentData,
      id: `eq-${Date.now()}`
    };

    const updatedUnit = {
      ...unit,
      equipment: [...unit.equipment, newEquipment]
    };

    onUpdateUnit(updatedUnit);
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    setEquipmentToDelete(equipmentId);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const confirmDeleteEquipment = () => {
    if (equipmentToDelete) {
      const updatedUnit = {
        ...unit,
        equipment: unit.equipment.filter(eq => eq.id !== equipmentToDelete)
      };
      onUpdateUnit(updatedUnit);
      setEquipmentToDelete(null);
    }
  };

  const handleEditEquipment = (equipmentId: string) => {
    const equipment = unit.equipment.find(eq => eq.id === equipmentId);
    if (equipment) {
      setEquipmentToEdit(equipment);
      setShowEditModal(true);
    }
    setOpenMenuId(null);
  };

  const handleUpdateEquipment = (updatedEquipment: Equipment) => {
    const updatedUnit = {
      ...unit,
      equipment: unit.equipment.map(eq =>
        eq.id === updatedEquipment.id ? updatedEquipment : eq
      )
    };
    onUpdateUnit(updatedUnit);
    setEquipmentToEdit(null);
  };

  const toggleMenu = (equipmentId: string) => {
    setOpenMenuId(openMenuId === equipmentId ? null : equipmentId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.equipment-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    // Cleanup previous charts
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    // Category Chart
    if (categoryChart.current && Object.keys(categoryData).length > 0) {
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
                'rgba(236, 72, 153, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(168, 85, 247, 0.8)'
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
            <p className="text-slate-600">{unit.email}</p>
          </div>
        </div>
      </div>

      {/* Informações da unidade */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Informações da Unidade</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            unit.status === 'online' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {unit.status === 'online' ? 'Online' : 'Offline'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Email:</span>
              <span>{unit.email}</span>
            </div>
            {unit.internetPlan && (
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4" />
                <span className="font-medium">Plano de Internet:</span>
                <span>{unit.internetPlan}</span>
              </div>
            )}
            {unit.manager && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Gerente:</span>
                <span>{unit.manager}</span>
              </div>
            )}
            {unit.managerPhone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="font-medium">Tel. Gerente:</span>
                <span>{unit.managerPhone}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {unit.coordinator && (
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span className="font-medium">Coordenador:</span>
                <span>{unit.coordinator}</span>
              </div>
            )}
            {unit.coordinatorPhone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="font-medium">Tel. Coordenador:</span>
                <span>{unit.coordinatorPhone}</span>
              </div>
            )}
            {unit.regional && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Regional:</span>
                <span>{unit.regional}</span>
              </div>
            )}
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
      {unit.equipment.length > 0 && (
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
      )}

      {/* Lista de equipamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Lista de Equipamentos</h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                Total: {unit.equipment.length} equipamentos
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Equipamento</span>
              </button>
            </div>
          </div>
        </div>
        
        {unit.equipment.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h4 className="text-xl font-semibold text-slate-700 mb-2">Nenhum equipamento cadastrado</h4>
            <p className="text-slate-500 mb-4">Esta unidade ainda não possui equipamentos registrados no sistema.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Primeiro Equipamento</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {unit.equipment.map((equipment) => (
              <div key={equipment.id} className="p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      equipment.status === 'working' ? 'bg-green-400' :
                      equipment.status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-slate-900">{equipment.name}</h4>
                      <p className="text-sm text-slate-500">{equipment.category}</p>
                      {equipment.model && (
                        <p className="text-xs text-slate-400">Modelo: {equipment.model}</p>
                      )}
                      {equipment.serialNumber && (
                        <p className="text-xs text-slate-400">S/N: {equipment.serialNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {equipment.status === 'working' ? 'Funcionando' :
                         equipment.status === 'maintenance' ? 'Em Manutenção' : 'Fora de Serviço'}
                      </p>
                      {equipment.lastMaintenance && (
                        <p className="text-xs text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Última verificação: {equipment.lastMaintenance}</span>
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(equipment.id)}
                        className="opacity-60 group-hover:opacity-100 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all duration-200 md:opacity-0 md:group-hover:opacity-100"
                        title="Ações do equipamento"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === equipment.id && (
                        <div className="equipment-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                          <div className="p-1">
                            <button
                              onClick={() => handleEditEquipment(equipment.id)}
                              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Editar Equipamento</span>
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(equipment.id)}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Excluir Equipamento</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEquipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEquipment}
      />

      <EditEquipmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEquipmentToEdit(null);
        }}
        onUpdate={handleUpdateEquipment}
        equipment={equipmentToEdit}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setEquipmentToDelete(null);
        }}
        onConfirm={confirmDeleteEquipment}
        title="Excluir Equipamento"
        message="Tem certeza de que deseja excluir este equipamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
