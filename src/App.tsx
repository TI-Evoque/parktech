import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UnitDetails } from './components/UnitDetails';
import { academyData } from './data/academyData';

function App() {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento inicial dos dados
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="flex">
        <Sidebar 
          units={academyData.units}
          selectedUnit={selectedUnit}
          onSelectUnit={setSelectedUnit}
        />
        <main className="flex-1 p-6 ml-64">
          {selectedUnit ? (
            <UnitDetails 
              unit={academyData.units.find(u => u.id === selectedUnit)!}
              onBack={() => setSelectedUnit(null)}
            />
          ) : (
            <Dashboard units={academyData.units} onSelectUnit={setSelectedUnit} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;