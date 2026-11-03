import React, { useState } from 'react';
import { DollarSign, CheckSquare, Square, Archive, X } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, orders, packagingFee, onConfirmArchive }) {
  const [paidUsers, setPaidUsers] = useState({});

  if (!isOpen) return null;

  const activeUsers = [...new Set(orders.map(o => o.userName))];

  const togglePaid = (userName) => {
    setPaidUsers(prev => ({ ...prev, [userName]: !prev[userName] }));
  };

  const grandTotal = orders.reduce((acc, o) => acc + o.price, 0) + (orders.length * packagingFee);

  const handleFinish = () => {
    onConfirmArchive(paidUsers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl w-full space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <DollarSign size={24} />
            <h3 className="text-lg font-bold text-slate-100">Rozliczenie Płatności (Checkboxy)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Odznacz osoby, które uregulowały należność. Po zatwierdzeniu zamówienie zostanie zamknięte i przeniesione do historii statystyk.
        </p>

        <div className="overflow-y-auto flex-1 space-y-3 pr-2">
          {activeUsers.map(uName => {
            const userOrders = orders.filter(o => o.userName === uName);
            const foodSum = userOrders.reduce((acc, o) => acc + o.price, 0);
            const userTotal = foodSum + (userOrders.length * packagingFee);
            const isPaid = !!paidUsers[uName];

            return (
              <div 
                key={uName} 
                onClick={() => togglePaid(uName)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isPaid ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                  {isPaid ? <CheckSquare size={20} className="text-emerald-400" /> : <Square size={20} className="text-slate-500" />}
                  <div>
                    <h4 className="font-bold text-sm">{uName}</h4>
                    <p className="text-[11px] text-slate-400">{userOrders.length} poz. ({foodSum} zł + {userOrders.length * packagingFee} zł opuk.)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-sm ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {userTotal.toFixed(2)} zł
                  </span>
                  <div className="text-[10px] uppercase font-bold tracking-wider">
                    {isPaid ? 'OPŁACONE ✓' : 'OCZEKUJE'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Razem cała sesja: <strong className="text-amber-400 text-sm">{grandTotal.toFixed(2)} zł</strong>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs">
              Anuluj
            </button>
            <button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg">
              <Archive size={14} /> Zatwierdź i przenieś do historii
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
