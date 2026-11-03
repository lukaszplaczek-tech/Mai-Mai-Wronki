// Canvas dla rozliczenia grupodo-finansowego
  const createGroupPaymentCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    const totalLines = 6 + (activeUsers.length * 3);
    canvas.height = Math.max(400, totalLines * 28 + 80);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('BAR MAI MAI - ROZLICZENIE KOSZTÓW', 25, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Data Odbioru: ${session.deliveryDate} o godz. ${session.deliveryTime}`, 25, 68);

    let y = 105;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('--- PODSUMOWANIE DLA UCZESTNIKÓW ---', 25, y);
    y += 28;

    activeUsers.forEach((uName, index) => {
      const userOrders = orders.filter(o => o.userName === uName);
      const foodSum = userOrders.reduce((acc, o) => acc + o.price, 0);
      const userTotal = foodSum + (userOrders.length * packagingFee);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`${index + 1}. ${uName}: ${userTotal.toFixed(2)} zł`, 25, y);
      y += 22;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      const itemsList = userOrders.map(uo => `#${uo.itemNum} ${uo.itemName}`).join(', ');
      ctx.fillText(`   Pozycje: ${itemsList} (+ opakowania)`, 25, y);
      y += 24;
    });

    y += 10;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(625, y);
    ctx.stroke();
    y += 28;

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`RAZEM DO ZAPŁATY (CAŁA GRUPA): ${grandTotalAmount.toFixed(2)} zł`, 25, y);

    return canvas;
  };

  const copyGroupPaymentImage = async () => {
    const canvas = createGroupPaymentCanvas();
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast("Obraz rozliczenia grupowe skopiowany do schowka! 📸");
      } catch (err) {
        console.error(err);
        showToast("Nie udało się skopiować obrazu. Użyj zapisu PNG.");
      }
    });
  };

  const downloadGroupPaymentImage = () => {
    const canvas = createGroupPaymentCanvas();
    const link = document.createElement('a');
    link.download = `rozliczenie-grupy-mai-mai-${session.deliveryDate}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Zapisano plik PNG z rozliczeniem grupy!");
  };
// Canvas dla rozliczenia grupodo-finansowego
  const createGroupPaymentCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    const totalLines = 6 + (activeUsers.length * 3);
    canvas.height = Math.max(400, totalLines * 28 + 80);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('BAR MAI MAI - ROZLICZENIE KOSZTÓW', 25, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Data Odbioru: ${session.deliveryDate} o godz. ${session.deliveryTime}`, 25, 68);

    let y = 105;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('--- PODSUMOWANIE DLA UCZESTNIKÓW ---', 25, y);
    y += 28;

    activeUsers.forEach((uName, index) => {
      const userOrders = orders.filter(o => o.userName === uName);
      const foodSum = userOrders.reduce((acc, o) => acc + o.price, 0);
      const userTotal = foodSum + (userOrders.length * packagingFee);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`${index + 1}. ${uName}: ${userTotal.toFixed(2)} zł`, 25, y);
      y += 22;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      const itemsList = userOrders.map(uo => `#${uo.itemNum} ${uo.itemName}`).join(', ');
      ctx.fillText(`   Pozycje: ${itemsList} (+ opakowania)`, 25, y);
      y += 24;
    });

    y += 10;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(625, y);
    ctx.stroke();
    y += 28;

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`RAZEM DO ZAPŁATY (CAŁA GRUPA): ${grandTotalAmount.toFixed(2)} zł`, 25, y);

    return canvas;
  };

  const copyGroupPaymentImage = async () => {
    const canvas = createGroupPaymentCanvas();
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast("Obraz rozliczenia grupowe skopiowany do schowka! 📸");
      } catch (err) {
        console.error(err);
        showToast("Nie udało się skopiować obrazu. Użyj zapisu PNG.");
      }
    });
  };

  const downloadGroupPaymentImage = () => {
    const canvas = createGroupPaymentCanvas();
    const link = document.createElement('a');
    link.download = `rozliczenie-grupy-mai-mai-${session.deliveryDate}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Zapisano plik PNG z rozliczeniem grupy!");
  };
{/* ROZLICZENIE FINANSOWE Z PRZYCISKAMI */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <TrendingUp size={20} /> Rozliczenie kosztów (dla grupy)
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={copyGroupPaymentImage}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <ImageIcon size={14} /> Skopiuj obraz rozliczenia
                  </button>
                  <button 
                    onClick={downloadGroupPaymentImage}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-amber-500/30"
                  >
                    <Download size={14} /> Zapisz PNG
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeUsers.map(uName => {
                  const userOrders = orders.filter(o => o.userName === uName);
                  const foodSum = userOrders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
                  const userPackagingTotal = userOrders.length * packagingFee;
                  const userTotal = foodSum + userPackagingTotal;

                  return (
                    <div key={uName} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                      <h4 className="font-bold text-slate-200 text-sm mb-2 pb-2 border-b border-slate-800 flex items-center justify-between">
                        <span>{uName}</span>
                        <span className="text-amber-400 text-xs">{userTotal.toFixed(2)} zł</span>
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-400 mb-3">
                        {userOrders.map(uo => (
                          <li key={uo.id} className="flex justify-between">
                            <span className="truncate pr-2">
                              #{uo.itemNum} {uo.itemName}
                              {uo.isExtra && <span className="text-amber-400 text-[10px] ml-1">(domówienie)</span>}
                            </span>
                            <span className="shrink-0">{uo.price} zł</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                        <span>Opakowania ({userOrders.length} x {packagingFee} zł): {userPackagingTotal.toFixed(2)} zł</span>
                        <span className="font-bold text-slate-300">Razem: {userTotal.toFixed(2)} zł</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
