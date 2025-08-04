import React from 'react';
import { Activity, Bell, Settings, User } from 'lucide-react';

export function Header() {
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
            <div className="relative">
              <Bell className="w-6 h-6 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <Settings className="w-6 h-6 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
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