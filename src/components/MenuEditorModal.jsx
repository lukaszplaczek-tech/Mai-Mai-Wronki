import React, { useState } from 'react';
import { Edit3, Save, Plus, X } from 'lucide-react';

export default function MenuEditorModal({ isOpen, onClose, menuItems, categories, onSaveMenu }) {
  const [items, setItems] = useState(menuItems);
  const [selectedCat, setSelectedCat] = useState('drob');
  const [newItem, setNewItem] = useState({ num: '', name: '', price: '' });

  if (!isOpen) return null;

  const handlePriceChange = (id, newPrice) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, price: Number(newPrice) || 0 } : item));
  };

  const handleNameChange = (id, newName) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, name: newName } : item));
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newItem.num || !newItem.name || !newItem.price) return;

    const itemToAdd = {
      id: 'custom_' + Date.now(),
      cat: selectedCat,
      num: newItem.num.trim(),
      name: newItem.name.trim(),
      price: Number(newItem.price) || 0
    };

    setItems(prev => [...prev, itemToAdd]);
    setNewItem({ num: '', name: '', price: '' });
  };

  const handleSave = () => {
    onSaveMenu(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-3xl w-full space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <Edit3 size={24} />
            <h3 className="text-lg font-bold text-slate-100">Edytor Menu i Cen (W chmurze)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* DODAWANIE NOWEGO DANIA */}
        <form onSubmit={handleAddNewItem} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-amber-400 uppercase">Dodaj nowe danie do kategorii:</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <select 
              value={selectedCat} 
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input 
              type="text" 
              placeholder="Numer (np. 327)" 
              value={newItem.num} 
              onChange={e => setNewItem({ ...newItem, num: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
            />
            <input 
              type="text" 
              placeholder="Nazwa potrawy" 
              value={newItem.name} 
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
            />
            <input 
              type="number" 
              placeholder="Cena (zł)" 
              value={newItem.price} 
              onChange={e => setNewItem({ ...newItem, price: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
            />
          </div>
          <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1">
            <Plus size={14} /> Dodaj pozycję do podglądu
          </button>
        </form>

        {/* LISTA DAŃ DO EDYCJI */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-2">
          {items.map(item => (
            <div key={item.id} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-amber-400 w-16">Poz. {item.num}</span>
              <input 
                type="text" 
                value={item.name} 
                onChange={(e) => handleNameChange(item.id, e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 flex-1"
              />
              <div className="flex items-center gap-1 w-28">
                <input 
                  type="number" 
                  value={item.price} 
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-400 font-bold w-16 text-right"
                />
                <span className="text-slate-400">zł</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs">
            Anuluj
          </button>
          <button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5">
            <Save size={14} /> Zapisz zmiany w Firebase
          </button>
        </div>
      </div>
    </div>
  );
}
