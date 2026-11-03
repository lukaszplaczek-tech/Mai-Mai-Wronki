import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Utensils, 
  Clock, 
  Calendar, 
  Lock, 
  Trash2, 
  Share2, 
  User, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  ShoppingCart,
  CheckCircle2,
  KeyRound,
  Image as ImageIcon,
  Edit3,
  DollarSign,
  Download,
  Copy,
  Phone
} from 'lucide-react';

import { MENU_CATEGORIES, DEFAULT_MENU_ITEMS } from './data/menu';
import MenuList from './components/MenuList';
import MenuEditorModal from './components/MenuEditorModal';
import PaymentModal from './components/PaymentModal';
import HistoryArchive from './components/HistoryArchive';

// ==========================================
// KONFIGURACJA FIREBASE
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyDLomcJGJnq5ippXymyCT1aRDdAD8gbXA8",
      authDomain: "zamowienia-mai-mai.firebaseapp.com",
      projectId: "zamowienia-mai-mai",
      storageBucket: "zamowienia-mai-mai.firebasestorage.app",
      messagingSenderId: "796445926554",
      appId: "1:796445926554:web:ceb19ee2b9941ed0c66b23",
      measurementId: "G-Q3J35PB1QQ"
    };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PIN = "1234";
const APP_VERSION = "v1.6.3";

export default function App() {
  const [userName, setUserName] = useState('');
  const [userPinInput, setUserPinInput] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [session, setSession] = useState({
    isOpen: true,
    isExtraSession: false,
    deliveryDate: '',
    deliveryTime: '12:00',
    userPin: '5678',
    adminPhone: ''
  });
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);
  const [history, setHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('zupy');
  const [meatSelections, setMeatSelections] = useState({});
  const [orderForName, setOrderForName] = useState('');

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isMenuEditorOpen, setIsMenuEditorOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('order');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    let storedId = localStorage.getItem('mai_mai_user_id');
    if (!storedId) {
      storedId = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('mai_mai_user_id', storedId);
    }
    setUserId(storedId);

    const storedName = localStorage.getItem('mai_mai_user_name');
    if (storedName) {
      setUserName(storedName);
      setOrderForName(storedName);
      setIsLoggedIn(true);
    }

    const unsubSession = onSnapshot(doc(db, "config", "session"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSession(prev => ({ ...prev, ...data }));
      } else {
        const defaultSession = { isOpen: true, isExtraSession: false, deliveryDate: dateStr, deliveryTime: '12:00', userPin: '5678', adminPhone: '' };
        setDoc(doc(db, "config", "session"), defaultSession);
        setSession(defaultSession);
      }
    });

    const unsubMenu = onSnapshot(doc(db, "config", "menu"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        setMenuItems(docSnap.data().items);
      }
    });

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ords);
    });

    const unsubHistory = onSnapshot(collection(db, "archived_sessions"), (snapshot) => {
      const hist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      hist.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(hist);
    });

    return () => {
      unsubSession();
      unsubOrders();
      unsubHistory();
      unsubMenu();
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!userName.trim()) return;
    
    if (userPinInput !== session.userPin) {
      setLoginError("Nieprawidłowy PIN użytkownika!");
      return;
    }

    localStorage.setItem('mai_mai_user_name', userName.trim());
    setOrderForName(userName.trim());
    setIsLoggedIn(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddItem = async (menuItem) => {
    if (!session.isOpen) {
      alert("Sesja jest zamknięta! Nie można dodawać zamówień.");
      return;
    }

    const targetUser = isAdmin ? (orderForName.trim() || userName.trim()) : userName.trim();
    const isExtra = session.isExtraSession || false;
    let finalItemName = menuItem.name;

    if (menuItem.hasMeatChoice) {
      const selectedMeat = meatSelections[menuItem.id] || 'kurczak';
      finalItemName = `${menuItem.name} z mięsem (${selectedMeat})`;
    }

    const newOrderRef = doc(collection(db, "orders"));
    await setDoc(newOrderRef, {
      userId: userId,
      userName: targetUser,
      menuItemId: menuItem.id,
      itemNum: menuItem.num,
      itemName: finalItemName,
      price: menuItem.price,
      isDoublePack: menuItem.isDoublePack || false,
      quantity: 1,
      isExtra: isExtra,
      timestamp: Date.now()
    });

    showToast(`Dodano: #${menuItem.num} ${finalItemName} dla ${targetUser}! ✓`);
  };

  const handleDeleteOrder = async (orderItem) => {
    if (!session.isOpen) {
      alert("Sesja jest zamknięta!");
      return;
    }
    if (!isAdmin && orderItem.userId !== userId) {
      alert("Możesz usuwać tylko własne pozycje zamówienia!");
      return;
    }

    await deleteDoc(doc(db, "orders", orderItem.id));
    showToast("Usunięto pozycję z zamówienia.");
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setIsAdminModalOpen(false);
      setAdminPinInput('');
      showToast("Zalogowano pomyślnie jako Administrator!");
    } else {
      alert("Nieprawidłowy PIN administratora!");
    }
  };

  const toggleSessionStatus = async () => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    await updateDoc(doc(db, "config", "session"), {
      isOpen: !session.isOpen
    });
  };

  const toggleExtraSessionStatus = async () => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    await updateDoc(doc(db, "config", "session"), {
      isExtraSession: !session.isExtraSession
    });
  };

  const handleUpdateSessionMeta = async (field, value) => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    await updateDoc(doc(db, "config", "session"), {
      [field]: value
    });
  };

  const handleSaveMenuCloud = async (updatedItems) => {
    await setDoc(doc(db, "config", "menu"), { items: updatedItems });
    showToast("Zapisano zaktualizowane menu w chmurze!");
  };

  const handleConfirmArchive = async (paidUsers) => {
    const packagingFee = 1.50;
    const activeUsers = [...new Set(orders.map(o => o.userName))];
    const totalFoodAmount = orders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
    const totalPackagingAmount = orders.length * packagingFee;
    const grandTotal = totalFoodAmount + totalPackagingAmount;

    const archiveDocRef = doc(collection(db, "archived_sessions"));
    await setDoc(archiveDocRef, {
      deliveryDate: session.deliveryDate,
      deliveryTime: session.deliveryTime,
      timestamp: Date.now(),
      activeUsers: activeUsers,
      paidUsers: paidUsers,
      ordersCount: orders.length,
      grandTotal: grandTotal,
      ordersSnapshot: orders
    });

    for (const ord of orders) {
      await deleteDoc(doc(db, "orders", ord.id));
    }

    showToast("Sesja została pomyślnie przeniesiona do historii!");
  };

  const packagingFee = 1.50;
  const activeUsers = [...new Set(orders.map(o => o.userName))];
  const allKnownUsers = [userName, ...activeUsers.filter(u => u !== userName)];

  const regularOrders = orders.filter(o => !o.isExtra);
  const extraOrders = orders.filter(o => o.isExtra);
  const viewingUser = isAdmin ? (orderForName.trim() || userName) : userName;
  const myOrders = orders.filter(o => o.userName === viewingUser);
  
  const myFoodSum = myOrders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
  const myPackagingTotal = myOrders.length * packagingFee;
  const myTotalCost = myFoodSum + myPackagingTotal;

  const totalFoodAmount = orders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
  const totalPackagingAmount = orders.length * packagingFee;
  const grandTotalAmount = totalFoodAmount + totalPackagingAmount;

  const generateMmsText = () => {
    let text = `BAR MAI MAI - ZAMÓWIENIE\n`;
    text += `Data Odbioru: ${session.deliveryDate} o godz. ${session.deliveryTime}\n\n`;
    
    text += `--- DANIA ---\n`;
    regularOrders.forEach((ord, index) => {
      const opakowaniaInfo = ord.isDoublePack ? ` (2 porcje w 1 opak.)` : ``;
      text += `${index + 1}. Poz. ${ord.itemNum} - ${ord.itemName}${opakowaniaInfo} [${ord.userName}] - ${ord.price} zł\n`;
    });

    if (extraOrders.length > 0) {
      text += `\n--- DANIA DOMÓWIONE ---\n`;
      extraOrders.forEach((ord, index) => {
        text += `${index + 1}. Poz. ${ord.itemNum} - ${ord.itemName} [DOMÓWIENIE - ${ord.userName}] - ${ord.price} zł\n`;
      });
    }

    text += `\n------------------------\n`;
    text += `Suma za dania: ${totalFoodAmount.toFixed(2)} zł\n`;
    text += `Suma za opakowania: ${totalPackagingAmount.toFixed(2)} zł (${orders.length} poz.)\n`;
    text += `RAZEM DO ZAPŁATY: ${grandTotalAmount.toFixed(2)} zł\n`;

    return text;
  };

  const createOrderCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    const totalLines = 8 + regularOrders.length + (extraOrders.length > 0 ? extraOrders.length + 3 : 0);
    canvas.height = Math.max(450, totalLines * 26 + 80);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('BAR MAI MAI - ZAMÓWIENIE', 25, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Data Odbioru: ${session.deliveryDate} o godz. ${session.deliveryTime}`, 25, 68);

    let y = 105;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('--- DANIA ---', 25, y);
    y += 28;

    ctx.font = '13px sans-serif';
    regularOrders.forEach((ord, index) => {
      ctx.fillStyle = '#e2e8f0';
      const opakowaniaInfo = ord.isDoublePack ? ` (2 porcje w 1 opak.)` : ``;
      const line = `${index + 1}. Poz. ${ord.itemNum} - ${ord.itemName}${opakowaniaInfo} [${ord.userName}] - ${ord.price} zł`;
      ctx.fillText(line, 25, y);
      y += 24;
    });

    if (extraOrders.length > 0) {
      y += 10;
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('--- DANIA DOMÓWIONE ---', 25, y);
      y += 28;
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px sans-serif';
      extraOrders.forEach((ord, index) => {
        const line = `${index + 1}. Poz. ${ord.itemNum} - ${ord.itemName} [DOMÓWIENIE - ${ord.userName}] - ${ord.price} zł`;
        ctx.fillText(line, 25, y);
        y += 24;
      });
    }

    y += 15;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(625, y);
    ctx.stroke();
    y += 25;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Suma za dania: ${totalFoodAmount.toFixed(2)} zł`, 25, y);
    y += 22;
    ctx.fillText(`Suma za opakowania (${orders.length} poz. x 1.50 zł): ${totalPackagingAmount.toFixed(2)} zł`, 25, y);
    y += 28;

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`RAZEM DO ZAPŁATY: ${grandTotalAmount.toFixed(2)} zł`, 25, y);

    return canvas;
  };

  const copyImageToClipboard = async () => {
    const canvas = createOrderCanvas();
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast("Obraz zamówienia skopiowany do schowka! 📸");
      } catch (err) {
        console.error(err);
        navigator.clipboard.writeText(generateMmsText());
        showToast("Skopiowano tekst z podsumowaniem kwotowym.");
      }
    });
  };

  const downloadImageFile = () => {
    const canvas = createOrderCanvas();
    const link = document.createElement('a');
    link.download = `zamowienie-mai-mai-${session.deliveryDate}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Zapisano plik graficzny PNG zamówienia!");
  };

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
        showToast("Obraz rozliczenia grupy skopiowany do schowka! 📸");
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-amber-400">
              <Utensils size={36} />
            </div>
            <span className="text-xs bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-slate-400 font-mono">
              {APP_VERSION}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Bar Mai Mai - Zamówienia</h1>
            <p className="text-slate-400 text-sm">Podaj swoje imię oraz tygodniowy PIN użytkownika, aby dołączyć.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl font-medium">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Twoje Imię</label>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                placeholder="np. Łukasz" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold flex items-center gap-1">
                <KeyRound size={14} className="text-amber-400" /> PIN Użytkownika (od administratora)
              </label>
              <input 
                type="password" 
                value={userPinInput} 
                onChange={(e) => setUserPinInput(e.target.value)} 
                placeholder="••••" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 tracking-widest text-center text-lg focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg"
            >
              Wejdź do aplikacji
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 relative">
      
      {/* PŁYWAJĄCY KOMUNIKAT (TOAST) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-400 animate-bounce">
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* NAGŁÓWEK */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-amber-400">
              <Utensils size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                Bar Mai Mai 
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-amber-400 font-mono">
                  {APP_VERSION}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${session.isOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {session.isOpen ? 'Sesja Otwarta' : 'Sesja Zamknięta'}
                </span>
                {session.isExtraSession && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    2. Tura (Domówienia)
                  </span>
                )}
              </h1>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1"><Calendar size={12}/> Odbiór: {session.deliveryDate}</span>
                <span className="flex items-center gap-1"><Clock size={12}/> {session.deliveryTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs flex items-center gap-2">
              <User size={14} className="text-amber-400" />
              <span>Zalogowany: <strong>{userName}</strong></span>
              <button 
                onClick={() => { localStorage.removeItem('mai_mai_user_name'); setIsLoggedIn(false); }} 
                className="text-slate-400 hover:text-rose-400 ml-2"
              >
                (zmiana)
              </button>
            </div>

            <button 
              onClick={() => setActiveTab('order')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'order' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            >
              Menu
            </button>
            <button 
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${activeTab === 'summary' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            >
              Podsumowanie i SMS
              {orders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {orders.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'stats' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            >
              Statystyki
            </button>

            <button 
              onClick={() => {
                if (isAdmin) {
                  setIsAdmin(false);
                } else {
                  setIsAdminModalOpen(true);
                }
              }}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 ${isAdmin ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
            >
              <ShieldCheck size={16} />
              {isAdmin ? 'Admin OK' : 'Admin'}
            </button>
          </div>
        </div>
      </header>

      {/* PANEL ADMINA */}
      {isAdmin && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Tryb Administratora:
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={toggleSessionStatus}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${session.isOpen ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                {session.isOpen ? 'Zamknij sesję główną'  : 'Otwórz sesję główną'}
              </button>

              <button 
                onClick={toggleExtraSessionStatus}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${session.isExtraSession ? 'bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'}`}
              >
                {session.isExtraSession ? '🔴 Wyłącz sesję domówień' : '🟢 Otwórz sesję domówień (2. tura)'}
              </button>

              <button 
                onClick={() => setIsMenuEditorOpen(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
              >
                <Edit3 size={14} /> Edytuj Menu / Ceny
              </button>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400">Nr BLIK:</span>
                <input 
                  type="text" 
                  value={session.adminPhone || ''} 
                  onChange={(e) => handleUpdateSessionMeta('adminPhone', e.target.value)}
                  placeholder="np. 500600700"
                  className="bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded border border-slate-700 text-xs w-28 text-center"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400">PIN Użytkowników:</span>
                <input 
                  type="text" 
                  value={session.userPin || ''} 
                  onChange={(e) => handleUpdateSessionMeta('userPin', e.target.value)}
                  className="bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded border border-slate-700 text-xs w-20 text-center"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400">Data Odbioru:</span>
                <input 
                  type="date" 
                  value={session.deliveryDate} 
                  onChange={(e) => handleUpdateSessionMeta('deliveryDate', e.target.value)}
                  className="bg-slate-800 text-slate-100 px-2 py-0.5 rounded border border-slate-700 text-xs"
                />
                <input 
                  type="time" 
                  value={session.deliveryTime} 
                  onChange={(e) => handleUpdateSessionMeta('deliveryTime', e.target.value)}
                  className="bg-slate-800 text-slate-100 px-2 py-0.5 rounded border border-slate-700 text-xs"
                />
              </div>

              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <DollarSign size={14} /> Zakończ i rozlicz płatności
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GŁÓWNY WIDOK */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {activeTab === 'order' && (
          <div className="space-y-6">
            
            {/* PODSUMOWANIE ZAMÓWIENIA UŻYTKOWNIKA NA GÓRZE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
                
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                    <ShoppingCart size={20} /> Zamówienie dla:
                  </h3>
                  {isAdmin ? (
                    <select
                      value={orderForName}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          const newName = prompt("Wpisz imię nowej osoby:");
                          if (newName && newName.trim()) {
                            setOrderForName(newName.trim());
                          }
                        } else {
                          setOrderForName(e.target.value);
                        }
                      }}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    >
                      {allKnownUsers.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                      <option value="__NEW__">➕ Dodaj inną osobę...</option>
                    </select>
                  ) : (
                    <span className="text-sm font-bold text-amber-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      {userName}
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-slate-200 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span>Do zapłaty: <span className="text-amber-400">{myTotalCost.toFixed(2)} zł</span></span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(myTotalCost.toFixed(2));
                      showToast(`Skopiowano kwotę ${myTotalCost.toFixed(2)} zł do schowka! 📋`);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    title="Skopiuj swoją kwotę do schowka"
                  >
                    <Copy size={12} /> Skopiuj kwotę
                  </button>
                  {session.adminPhone && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(session.adminPhone);
                        showToast(`Skopiowano nr telefonu: ${session.adminPhone} 📱`);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      title="Skopiuj numer telefonu do przelewu BLIK"
                    >
                      <Phone size={12} /> Nr BLIK
                    </button>
                  )}
                </div>
              </div>

              {myOrders.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Brak pozycji w koszyku dla wybranej osoby. Wybierz coś z menu poniżej!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {myOrders.map(item => (
                    <div key={item.id} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="font-semibold text-amber-400 mr-1.5">#{item.itemNum}</span>
                        <span className="text-slate-200 font-medium">{item.itemName}</span>
                        {item.isExtra && <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded ml-1 font-bold">DOMÓWIENIE</span>}
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Cena: <strong className="text-slate-200">{item.price} zł</strong> + opakowanie {packagingFee} zł
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteOrder(item)}
                        className="w-7 h-7 bg-rose-950/40 hover:bg-rose-900 text-rose-400 rounded-lg flex items-center justify-center transition-all shrink-0 border border-rose-800/40"
                        disabled={!session.isOpen}
                        title="Usuń tę pozycję"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODUŁ DAŃ (WIDOK KOMPONENTU) */}
            <MenuList 
              categories={MENU_CATEGORIES}
              menuItems={menuItems}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              meatSelections={meatSelections}
              setMeatSelections={setMeatSelections}
              onAddItem={handleAddItem}
              session={session}
            />

          </div>
        )}

        {/* ZAKŁADKA PODSUMOWANIA */}
        {activeTab === 'summary' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <FileText size={20} /> Podsumowanie dla restauracji
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Każda sztuka dania w osobnym wierszu z uwzględnieniem kwot i sumy końcowej.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={copyImageToClipboard}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
                  >
                    <ImageIcon size={14} /> Skopiuj obraz
                  </button>
                  <button 
                    onClick={downloadImageFile}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all border border-amber-500/30"
                  >
                    <Download size={14} /> Zapisz obraz PNG
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generateMmsText());
                      showToast("Tekst z podsumowaniem i kwotami skopiowany do schowka!");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all"
                  >
                    <Share2 size={14} /> Kopiuj tekst
                  </button>
                </div>
              </div>

              {/* LISTA DAŃ */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  Dania ({regularOrders.length} poz.)
                </h4>
                
                {regularOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">Brak pozycji na liście dań.</p>
                ) : (
                  <div className="space-y-2">
                    {regularOrders.map((ord, idx) => (
                      <div key={ord.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-500 font-bold w-6">{idx + 1}.</span>
                          <div>
                            <span className="bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded mr-2">Poz. {ord.itemNum}</span>
                            <span className="font-semibold text-slate-200">{ord.itemName}</span>
                            {ord.isDoublePack && <span className="text-purple-400 text-[10px] ml-2">(2 porcje w 1 opak.)</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-400 font-bold">{ord.price} zł</span>
                          <span className="text-slate-400 italic">[{ord.userName}]</span>
                          {(isAdmin || ord.userId === userId) && (
                            <button 
                              onClick={() => handleDeleteOrder(ord)}
                              className="text-rose-400 hover:text-rose-300 p-1 border-l border-slate-800 pl-2"
                              title="Usuń pozycję"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEKCJA POSIŁKÓW DOMAWIANYCH */}
              <div className="space-y-3 mt-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>Dania domówione ({extraOrders.length} poz.)</span>
                </h4>
                
                {extraOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Brak dań domówionych.</p>
                ) : (
                  <div className="space-y-2">
                    {extraOrders.map((ord, idx) => (
                      <div key={ord.id} className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-amber-500 font-bold w-6">{idx + 1}.</span>
                          <div>
                            <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded mr-2">Poz. {ord.itemNum}</span>
                            <span className="font-semibold text-slate-200">{ord.itemName}</span>
                            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded ml-2">DOMÓWIENIE</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-400 font-bold">{ord.price} zł</span>
                          <span className="text-slate-400 italic">[{ord.userName}]</span>
                          {(isAdmin || ord.userId === userId) && (
                            <button 
                              onClick={() => handleDeleteOrder(ord)}
                              className="text-rose-400 hover:text-rose-300 p-1 border-l border-slate-800 pl-2"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PODSUMOWANIE KWOTOWE W WIDOKU */}
              <div className="mt-8 pt-6 border-t border-slate-800 bg-slate-950/60 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-1 text-slate-300">
                  <div>Suma za dania: <strong className="text-white">{totalFoodAmount.toFixed(2)} zł</strong></div>
                  <div>Suma za opakowania ({orders.length} poz. x 1.50 zł): <strong className="text-white">{totalPackagingAmount.toFixed(2)} zł</strong></div>
                </div>
                <div className="text-base font-bold text-amber-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                  RAZEM DO ZAPŁATY: {grandTotalAmount.toFixed(2)} zł
                </div>
              </div>

            </div>

            {/* ROZLICZENIE FINANSOWE Z PRZYCISKAMI SZYBKIEGO KOPIOWANIA KWOTY */}
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
                    <div key={uName} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                      <div>
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
                      </div>
                      
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>Opakowania ({userOrders.length} x {packagingFee} zł): {userPackagingTotal.toFixed(2)} zł</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(userTotal.toFixed(2));
                              showToast(`Skopiowano kwotę ${userTotal.toFixed(2)} zł dla ${uName}! 📋`);
                            }}
                            className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                          >
                            <Copy size={12} /> Skopiuj {userTotal.toFixed(2)} zł
                          </button>
                          {session.adminPhone && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(session.adminPhone);
                                showToast(`Skopiowano Twój nr telefonu: ${session.adminPhone} 📱`);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                              title="Skopiuj swój nr telefonu"
                            >
                              <Phone size={12} /> BLIK
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* STATYSTYKI Z ARCHIWUM */}
        {activeTab === 'stats' && (
          <HistoryArchive history={history} />
        )}
      </main>

      {/* MODALE */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <Lock size={24} />
              <h3 className="text-lg font-bold text-slate-100">PIN Administratora</h3>
            </div>
            <p className="text-xs text-slate-400">Podaj PIN administracyjny:</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" 
                value={adminPinInput} 
                onChange={(e) => setAdminPinInput(e.target.value)} 
                placeholder="PIN" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 tracking-widest text-center text-lg focus:outline-none focus:border-amber-500"
                autoFocus
                required
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAdminModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg"
                >
                  Zaloguj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MenuEditorModal 
        isOpen={isMenuEditorOpen}
        onClose={() => setIsMenuEditorOn(false)}
        menuItems={menuItems}
        categories={MENU_CATEGORIES}
        onSaveMenu={handleSaveMenuCloud}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orders={orders}
        packagingFee={packagingFee}
        onConfirmArchive={handleConfirmArchive}
      />

    </div>
  );
}
