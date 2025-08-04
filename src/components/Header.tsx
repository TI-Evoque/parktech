import React from 'react';
import { Activity, Settings, User, BarChart3 } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenExecutive: () => void;
}

export function Header({ onOpenAdmin, onOpenExecutive }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Evoque Tech</h1>
                <p className="text-sm text-slate-500">Dashboard de Equipamentos de TI</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenExecutive}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard Executivo</span>
            </button>
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Painel Administrativo</span>
            </button>
            <div className="flex items-center space-x-2 bg-slate-50 rounded-lg px-3 py-2">
              <User className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
