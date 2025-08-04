import React from 'react';
import { Activity, Settings, User, BarChart3 } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenExecutive: () => void;
}

export function Header({ onOpenAdmin, onOpenExecutive }: HeaderProps) {
  return (
    <header className="bg-white shadow-lg border-b border-slate-200 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Evoque Academias</h1>
                <p className="text-sm text-slate-500">Sistema de Gestão de Equipamentos</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenExecutive}
              className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-md transform hover:-translate-y-0.5"
            >
              <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">Dashboard Executivo</span>
            </button>
            <button
              onClick={onOpenAdmin}
              className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 rounded-lg transition-all duration-200 border border-slate-200 hover:border-slate-300 hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span className="text-sm font-medium">Painel Administrativo</span>
            </button>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg px-4 py-2.5 border border-slate-200 shadow-sm">
              <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">Administrador</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
