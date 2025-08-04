import React from 'react';
import { Home, MapPin, TrendingUp } from 'lucide-react';
import { AcademyUnit } from '../types/academy';

interface SidebarProps {
  units: AcademyUnit[];
  selectedUnit: string | null;
  onSelectUnit: (unitId: string | null) => void;
}

export function Sidebar({ units, selectedUnit, onSelectUnit }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg border-r border-slate-200 overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          <button
            onClick={() => onSelectUnit(null)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              !selectedUnit 
                ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard Geral</span>
          </button>
          
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Unidades
            </h3>
            <div className="space-y-1">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => onSelectUnit(unit.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    selectedUnit === unit.id
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4" />
                    <div>
                      <p className="font-medium">{unit.name}</p>
                      <p className="text-xs text-slate-400">{unit.location}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    unit.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-6">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Relatórios</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}