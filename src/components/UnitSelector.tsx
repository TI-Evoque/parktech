import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { AcademyUnit } from '../types/academy';

interface UnitSelectorProps {
  units: AcademyUnit[];
  selectedUnit: string | null;
  onSelectUnit: (unitId: string | null) => void;
}

export function UnitSelector({ units, selectedUnit, onSelectUnit }: UnitSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedUnitData = units.find(unit => unit.id === selectedUnit);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">
              {selectedUnitData ? selectedUnitData.name : 'Selecionar Unidade'}
            </span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            <button
              onClick={() => {
                onSelectUnit(null);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <span className="text-gray-900">Dashboard Geral</span>
            </button>
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => {
                  onSelectUnit(unit.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                  selectedUnit === unit.id ? 'bg-orange-50 text-orange-700' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4" />
                  <div>
                    <p className="font-medium">{unit.name}</p>
                    <p className="text-xs text-gray-400">{unit.manufacturer}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  unit.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
