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
