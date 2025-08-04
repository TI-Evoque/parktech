import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Download, Upload, FileText, Database, Shield, Cloud, BarChart3, Archive } from 'lucide-react';
import { AcademyUnit } from '../types/academy';
import { ReportService } from '../services/reportService';
import { SupabaseService } from '../services/supabase';
import { useToast, ToastContainer } from './Toast';

interface AdminPanelProps {
  units: AcademyUnit[];
  onBack: () => void;
  onUpdateUnits: (units: AcademyUnit[]) => void;
}

export function AdminPanel({ units, onBack, onUpdateUnits }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('units');
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AcademyUnit>>({});
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  
  const [newUnitForm, setNewUnitForm] = useState({
    name: '',
    email: '',
    manager: '',
    managerPhone: '',
    coordinator: '',
    coordinatorPhone: '',
    regional: '',
    internetPlan: ''
  });

  const handleEditUnit = (unit: AcademyUnit) => {
    setEditingUnit(unit.id);
    setEditForm(unit);
  };

  const handleSaveEdit = async () => {
    if (editingUnit && editForm) {
      const updatedUnits = units.map(unit => 
        unit.id === editingUnit ? { ...unit, ...editForm } : unit
      );
      onUpdateUnits(updatedUnits);
      
      // Salvar no Supabase
      try {
        await SupabaseService.updateUnit({ ...units.find(u => u.id === editingUnit)!, ...editForm });
      } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
      }
      
      setEditingUnit(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingUnit(null);
    setEditForm({});
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (confirm('Tem certeza que deseja excluir esta unidade?')) {
      const updatedUnits = units.filter(unit => unit.id !== unitId);
      onUpdateUnits(updatedUnits);
      
      // Deletar do Supabase
      try {
        await SupabaseService.deleteUnit(unitId);
      } catch (error) {
        console.error('Erro ao deletar do Supabase:', error);
      }
    }
  };

  const handleAddUnit = async () => {
    if (newUnitForm.name && newUnitForm.email) {
      const newUnit: AcademyUnit = {
        id: `unit-${Date.now()}`,
        name: newUnitForm.name,
        email: newUnitForm.email,
        manufacturer: 'HIKVISION',
        status: 'online',
        manager: newUnitForm.manager,
        managerPhone: newUnitForm.managerPhone,
        coordinator: newUnitForm.coordinator,
        coordinatorPhone: newUnitForm.coordinatorPhone,
        regional: newUnitForm.regional,
        internetPlan: newUnitForm.internetPlan,
        equipment: []
      };
      
      const updatedUnits = [...units, newUnit];
      onUpdateUnits(updatedUnits);
      
      // Salvar no Supabase
      try {
        await SupabaseService.updateUnit(newUnit);
      } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
      }
      
      setNewUnitForm({
        name: '',
        email: '',
        manager: '',
        managerPhone: '',
        coordinator: '',
        coordinatorPhone: '',
        regional: '',
        internetPlan: ''
      });
      setShowAddModal(false);
    }
  };

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
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      // Backup local
      ReportService.exportBackupJSON(units);
      
      // Backup no Supabase
      await SupabaseService.createBackup();
      toast.success('Backup criado com sucesso!', 'O backup foi salvo no Supabase');
      
      // Atualizar lista de backups
      await loadBackups();
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup', 'Verifique a conexão com o Supabase');
    }
    setIsLoading(false);
  };

  const loadBackups = async () => {
    try {
      const backupList = await SupabaseService.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (confirm('Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.')) {
      setIsLoading(true);
      try {
        const restoredData = await SupabaseService.restoreBackup(backupId);
        onUpdateUnits(restoredData);
        toast.success('Backup restaurado com sucesso!', 'Todos os dados foram atualizados');
      } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        alert('Erro ao restaurar backup.');
      }
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedData = await ReportService.importBackupJSON(file);
        onUpdateUnits(importedData);
        toast.success('Backup importado com sucesso!', 'Dados carregados do arquivo');
      } catch (error) {
        console.error('Erro ao importar backup:', error);
        alert('Erro ao importar backup. Verifique o formato do arquivo.');
      }
    }
  };

  const handleSyncToSupabase = async () => {
    if (!SupabaseService.isConfigured()) {
      alert('⚠️ Supabase não configurado. Adicione as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
      return;
    }

    setIsLoading(true);
    try {
      await SupabaseService.saveUnits(units);
      alert('Dados sincronizados com o Supabase com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar com Supabase. Verifique a configuração.');
    }
    setIsLoading(false);
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const isConnected = await SupabaseService.testConnection();
      if (isConnected) {
        alert('✓ Conexão com Supabase estabelecida com sucesso!');
      } else {
        alert('⚠️ Tabelas não encontradas. Execute o SQL de configuração no Supabase.');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      alert('❌ Erro de conexão. Verifique as credenciais do Supabase.');
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (activeTab === 'backup') {
      loadBackups();
    }
  }, [activeTab]);

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
            <h2 className="text-2xl font-bold text-slate-900">Painel Administrativo</h2>
            <p className="text-slate-600">Gerencie unidades, relatórios e backups do sistema</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>Testar Conexão</span>
          </button>
          <button
            onClick={handleSyncToSupabase}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Cloud className="w-4 h-4" />
            <span>Sincronizar Supabase</span>
          </button>
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('units')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'units'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Gerenciar Unidades</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backup'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Archive className="w-4 h-4" />
              <span>Backup & Restore</span>
            </span>
          </button>
        </nav>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'units' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Gerenciar Unidades ({units.length})</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Nova Unidade</span>
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-slate-200">
            {units.map((unit) => (
              <div key={unit.id} className="p-6">
                {editingUnit === unit.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Unidade</label>
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gerente</label>
                        <input
                          type="text"
                          value={editForm.manager || ''}
                          onChange={(e) => setEditForm({...editForm, manager: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone do Gerente</label>
                        <input
                          type="text"
                          value={editForm.managerPhone || ''}
                          onChange={(e) => setEditForm({...editForm, managerPhone: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Coordenador</label>
                        <input
                          type="text"
                          value={editForm.coordinator || ''}
                          onChange={(e) => setEditForm({...editForm, coordinator: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone do Coordenador</label>
                        <input
                          type="text"
                          value={editForm.coordinatorPhone || ''}
                          onChange={(e) => setEditForm({...editForm, coordinatorPhone: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Regional</label>
                        <input
                          type="text"
                          value={editForm.regional || ''}
                          onChange={(e) => setEditForm({...editForm, regional: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Plano de Internet</label>
                        <input
                          type="text"
                          value={editForm.internetPlan || ''}
                          onChange={(e) => setEditForm({...editForm, internetPlan: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Ex: 500 Mbps Fibra"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Salvar</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">{unit.name}</h4>
                      <p className="text-sm text-slate-500">{unit.email}</p>
                      <p className="text-xs text-slate-400">
                        Gerente: {unit.manager || 'Não informado'} | Regional: {unit.regional || 'Não informado'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Plano: {unit.internetPlan || 'Não informado'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUnit(unit)}
                        className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Relatórios PDF
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleGenerateReport('units')}
                className="w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Relatório Geral de Unidades</span>
              </button>
              <button
                onClick={() => handleGenerateReport('equipment')}
                className="w-full bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Relatório de Equipamentos</span>
              </button>
              <button
                onClick={() => handleGenerateReport('regional')}
                className="w-full bg-purple-50 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-100 flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Relatório por Regional</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-orange-600" />
              Exportação de Dados
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleGenerateReport('csv')}
                className="w-full bg-orange-50 text-orange-700 px-4 py-3 rounded-lg hover:bg-orange-100 flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar para CSV</span>
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="w-full bg-slate-50 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Archive className="w-4 h-4" />
                <span>Backup Completo (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Criar Backup
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Crie um backup completo dos dados do sistema incluindo todas as unidades e equipamentos.
              </p>
              <button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Archive className="w-5 h-5" />
                <span>{isLoading ? 'Criando Backup...' : 'Criar Backup Completo'}</span>
              </button>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-slate-900 mb-2">Restaurar de Arquivo</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Restaure dados de um arquivo de backup local (.json)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Selecionar Arquivo de Backup</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              Backups no Supabase
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {backups.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum backup encontrado no Supabase
                </p>
              ) : (
                backups.map((backup) => (
                  <div key={backup.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(backup.timestamp).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {backup.data?.length || 0} unidades
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Restaurar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para adicionar nova unidade */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-slate-900">Adicionar Nova Unidade</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Unidade *</label>
                  <input
                    type="text"
                    value={newUnitForm.name}
                    onChange={(e) => setNewUnitForm({...newUnitForm, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Centro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newUnitForm.email}
                    onChange={(e) => setNewUnitForm({...newUnitForm, email: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="centro@academiaevoque.com.br"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gerente</label>
                  <input
                    type="text"
                    value={newUnitForm.manager}
                    onChange={(e) => setNewUnitForm({...newUnitForm, manager: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nome do gerente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone do Gerente</label>
                  <input
                    type="text"
                    value={newUnitForm.managerPhone}
                    onChange={(e) => setNewUnitForm({...newUnitForm, managerPhone: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="11 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Coordenador</label>
                  <input
                    type="text"
                    value={newUnitForm.coordinator}
                    onChange={(e) => setNewUnitForm({...newUnitForm, coordinator: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nome do coordenador"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone do Coordenador</label>
                  <input
                    type="text"
                    value={newUnitForm.coordinatorPhone}
                    onChange={(e) => setNewUnitForm({...newUnitForm, coordinatorPhone: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="11 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Regional</label>
                  <input
                    type="text"
                    value={newUnitForm.regional}
                    onChange={(e) => setNewUnitForm({...newUnitForm, regional: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nome do regional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plano de Internet</label>
                  <input
                    type="text"
                    value={newUnitForm.internetPlan}
                    onChange={(e) => setNewUnitForm({...newUnitForm, internetPlan: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: 500 Mbps Fibra"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddUnit}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Adicionar Unidade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
