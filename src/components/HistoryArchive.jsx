import React from 'react';
import { Award, Calendar, DollarSign, Utensils, Flame } from 'lucide-react';

export default function HistoryArchive({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-2">
          <Award size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Hall of Fame & Archiwum</h3>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Brak archiwizowanych sesji. Po zakończeniu pierwszej sesji przyciskiem rozliczenia, pojawi się tutaj pełna historia i statystyki.
        </p>
      </div>
    );
  }

  const grandTotalSpent = history.reduce((acc, h) => acc + h.grandTotal, 0);
  const totalOrdersCount = history.reduce((acc, h) => acc + h.ordersCount, 0);

  // Agregacja popularności dań ze wszystkich zarchiwizowanych sesji
  const dishCounts = {};
  history.forEach(session => {
    if (session.ordersSnapshot) {
      session.ordersSnapshot.forEach(ord => {
        const key = `#${ord.itemNum} - ${ord.itemName}`;
        if (!dishCounts[key]) {
          dishCounts[key] = { num: ord.itemNum, name: ord.itemName, count: 0, price: ord.price };
        }
        dishCounts[key].count += (ord.quantity || 1);
      });
    }
  });

  const popularDishes = Object.values(dishCounts).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* STATYSTYKI SUMARYCZNE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Łącznie wydano</div>
            <div className="text-xl font-bold text-slate-100">{grandTotalSpent.toFixed(2)} zł</div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Utensils size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Zamówionych dań</div>
            <div className="text-xl font-bold text-slate-100">{totalOrdersCount} szt.</div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Zakończone zamówienia</div>
            <div className="text-xl font-bold text-slate-100">{history.length} sesji</div>
          </div>
        </div>
      </div>

      {/* RANKING POPULARNOŚCI DAŃ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <Flame size={20} /> Ranking popularności dań (Hall of Fame)
        </h3>
        
        {popularDishes.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Brak danych o potrawach.</p>
        ) : (
          <div className="space-y-2">
            {popularDishes.map((dish, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-amber-500 font-bold w-6">#{idx + 1}</span>
                  <div>
                    <span className="bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded mr-2">Poz. {dish.num}</span>
                    <span className="font-semibold text-slate-200">{dish.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-slate-900 text-amber-400 font-bold px-2.5 py-1 rounded-lg border border-slate-800">
                    {dish.count} szt. zamawianych
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HISTORIA ZAKOŃCZONYCH SESJI */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <Award size={20} /> Zakończone Sesje Zamówień
        </h3>

        <div className="space-y-3">
          {history.map(session => (
            <div key={session.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-200 text-sm">Odbiór: {session.deliveryDate} ({session.deliveryTime})</span>
                <p className="text-slate-400 mt-0.5">Zakończono: {new Date(session.timestamp).toLocaleString('pl-PL')}</p>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {session.activeUsers.map(u => (
                    <span key={u} className={`px-2 py-0.5 rounded text-[10px] font-bold ${session.paidUsers?.[u] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {u} {session.paidUsers?.[u] ? '✓' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base font-bold text-amber-400">{session.grandTotal.toFixed(2)} zł</div>
                <div className="text-slate-500 text-[11px]">{session.ordersCount} pozycji</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
