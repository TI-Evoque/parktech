import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UnitSelector } from './components/UnitSelector';
import { Dashboard } from './components/Dashboard';
import { UnitDetails } from './components/UnitDetails';
import { AdminPanel } from './components/AdminPanel';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { academyData } from './data/academyData';
import { AcademyUnit } from './types/academy';

function App() {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showExecutive, setShowExecutive] = useState(false);
  const [units, setUnits] = useState(academyData.units);

  const handleUpdateUnit = (updatedUnit: AcademyUnit) => {
    setUnits(prevUnits =>
      prevUnits.map(unit =>
        unit.id === updatedUnit.id ? updatedUnit : unit
      )
    );
  };

  const handleUpdateUnits = (newUnits: AcademyUnit[]) => {
    setUnits(newUnits);
  };

  const handleOpenAdmin = () => {
    setShowAdmin(true);
    setShowExecutive(false);
    setSelectedUnit(null);
  };

  const handleCloseAdmin = () => {
    setShowAdmin(false);
  };

  const handleOpenExecutive = () => {
    setShowExecutive(true);
    setShowAdmin(false);
    setSelectedUnit(null);
  };

  const handleCloseExecutive = () => {
    setShowExecutive(false);
  };

  useEffect(() => {
    // Simula carregamento inicial dos dados
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full mx-auto mb-6"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Carregando Sistema</h2>
          <p className="text-slate-600">Preparando dados das unidades Academia Evoque...</p>
          <div className="flex items-center justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header onOpenAdmin={handleOpenAdmin} onOpenExecutive={handleOpenExecutive} />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Sistema de Gestão Evoque Academias</h1>
          <div className="max-w-md">
            <UnitSelector
              units={units}
              selectedUnit={selectedUnit}
              onSelectUnit={setSelectedUnit}
            />
          </div>
        </div>

        <main>
          {showExecutive ? (
            <ExecutiveDashboard
              units={units}
              onBack={handleCloseExecutive}
            />
          ) : showAdmin ? (
            <AdminPanel
              units={units}
              onBack={handleCloseAdmin}
              onUpdateUnits={handleUpdateUnits}
            />
          ) : selectedUnit ? (
            <UnitDetails
              unit={units.find(u => u.id === selectedUnit)!}
              onBack={() => setSelectedUnit(null)}
              onUpdateUnit={handleUpdateUnit}
            />
          ) : (
            <Dashboard units={units} onSelectUnit={setSelectedUnit} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
