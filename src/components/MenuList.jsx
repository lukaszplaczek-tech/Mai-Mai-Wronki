import React from 'react';
import { Plus } from 'lucide-react';

export default function MenuList({ 
  categories, 
  menuItems, 
  activeCategory, 
  setActiveCategory, 
  meatSelections, 
  setMeatSelections, 
  onAddItem, 
  session 
}) {
  return (
    <div className="space-y-6">
      {/* WIELOLINIOWY UKŁAD KATEGORII */}
      <div className="sticky top-[65px] bg-slate-950/95 backdrop-blur-md py-3 z-20 border-b border-slate-800/60">
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeCategory === cat.id ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300'}`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === cat.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {menuItems.filter(i => i.cat === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DAŃ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold capitalize text-amber-400">
            {categories.find(c => c.id === activeCategory)?.name}
          </h3>
          {session.isExtraSession && (
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl font-bold animate-pulse">
              ⚠️ Tryb Domówień aktywny
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.filter(item => item.cat === activeCategory).map(item => (
            <div key={item.id} className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-2 py-0.5 rounded-lg">
                    Poz. {item.num}
                  </span>
                  <span className="text-base font-bold text-slate-100">
                    {item.price} zł
                  </span>
                </div>
                <h4 className="font-semibold text-slate-200 text-sm mt-1">{item.name}</h4>
                
                {/* Wybór mięsa dla dań z mięsem */}
                {item.hasMeatChoice && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60">
                    <label className="block text-[11px] text-slate-400 mb-1">Wybierz mięso:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {['kurczak', 'wieprzowina', 'wołowina'].map(meat => {
                        const current = meatSelections[item.id] || 'kurczak';
                        const isSelected = current === meat;
                        return (
                          <button
                            key={meat}
                            type="button"
                            onClick={() => setMeatSelections(prev => ({ ...prev, [item.id]: meat }))}
                            className={`py-1 px-1 text-[10px] rounded-lg font-medium capitalize transition-all border ${isSelected ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'}`}
                          >
                            {meat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {item.isDoublePack && (
                  <span className="inline-block bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] px-2 py-0.5 rounded mt-1">
                    Specjalne: 2 porcje w 1 opakowaniu (+1,50 zł)
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-end">
                <button 
                  onClick={() => onAddItem(item)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-md active:scale-95 ${session.isOpen ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                  disabled={!session.isOpen}
                >
                  <Plus size={14} /> {session.isExtraSession ? 'Domów' : 'Dodaj'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
