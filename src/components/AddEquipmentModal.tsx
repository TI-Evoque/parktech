import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Equipment } from '../types/academy';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (equipment: Omit<Equipment, 'id'>) => void;
}

export function AddEquipmentModal({ isOpen, onClose, onAdd }: AddEquipmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'working' as Equipment['status'],
    lastMaintenance: '',
    model: '',
    serialNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Câmeras de Segurança',
    'Equipamentos de Rede',
    'Servidores',
    'Computadores',
    'Audio/Visual',
    'Segurança',
    'Armazenamento',
    'Energia',
    'Periféricos',
    'Software',
    'Outros'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do equipamento é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (formData.serialNumber && formData.serialNumber.length < 3) {
      newErrors.serialNumber = 'Número de série deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    onAdd({
      ...formData,
      name: formData.name.trim(),
      model: formData.model.trim(),
      serialNumber: formData.serialNumber.trim()
    });

    setFormData({
      name: '',
      category: '',
      status: 'working',
      lastMaintenance: '',
      model: '',
      serialNumber: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Adicionar Equipamento
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Equipamento *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: Câmera IP Hikvision"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Selecionar categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as Equipment['status']})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="working">Funcionando</option>
              <option value="maintenance">Manutenção</option>
              <option value="broken">Com Defeito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: DS-2CD2143G0-I"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Série
            </label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: HK003344"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Última Manutenção
            </label>
            <input
              type="date"
              value={formData.lastMaintenance}
              onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
