import React, { useState, useEffect } from 'react';
import { X, Save, Edit2 } from 'lucide-react';

export default function MenuEditorModal({ isOpen, onClose, menuItems, categories, onSaveMenu }) {
  const [items, setItems] = useState(menuItems);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'zupy');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setItems(menuItems);
  }, [menuItems]);

  if (!isOpen) return null;

  const handlePriceChange = (id, newPrice) => {
    const parsed = parseFloat(newPrice);
    setItems(prev => prev.map(item => item.id === id ? { ...item, price: isNaN(parsed) ? 0 : parsed } : item));
  };

  const handleNameChange = (id, newName) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, name: newName } : item));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveMenu(items);
      onClose(); // Zamknij okno dopiero po udanym zapisie
    } catch (err) {
      console.error(err);
      alert("Błąd podczas zapisywania menu: " + (err.message || "Nieznany błąd"));
    } finally {
      setIsSaving(false); // ZAWSZE odblokowuj przycisk, żeby okno nie zostało zablokowane
    }
  };

  const filteredItems = items.filter(item => item.cat === selectedCategory);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* NAGŁÓWEK MODALA */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2 text-amber-400">
            <Edit2 size={20} />
            <h3 className="text-lg font-bold text-slate-100">Edytor Menu i Cen</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 bg-slate-800 p-2 rounded-xl"
          >
            <X size={18} />
          </button>
        </div>

        {/* ZAKŁADKI KATEGORII */}
        <div className="flex overflow-x-auto gap-2 p-3 bg-slate-950 border-b border-slate-800 shrink-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* LISTA POZYCJI DO EDYCJI W WYBRANEJ KATEGORII */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-slate-400 mb-2">Edytujesz pozycję w kategorii: <strong className="text-amber-400">{categories.find(c => c.id === selectedCategory)?.name}</strong></p>
          
          {filteredItems.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center">Brak pozycji w tej kategorii.</p>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-4 text-xs">
                <span className="font-mono font-bold text-amber-400 w-12 shrink-0">#{item.num}</span>
                <input 
                  type="text" 
                  value={item.name} 
                  onChange={(e) => handleNameChange(item.id, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input 
                    type="number" 
                    step="0.5"
                    value={item.price} 
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-400 font-bold text-center focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-400">zł</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* STOPKA Z PRZYCISKAMI */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3 shrink-0">
          <button 
    onClick={() => {
      setIsSaving(false);
      onClose();
    }}
    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
  >
    Anuluj
  </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save size={14} /> {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany w chmurze'}
          </button>
        </div>

      </div>
    </div>
  );
}
