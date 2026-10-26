import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDoc 
} from 'firebase/firestore';
import { 
  Utensils, 
  Clock, 
  Calendar, 
  Lock, 
  Unlock, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  Share2, 
  User, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Award, 
  Users,
  PlusCircle
} from 'lucide-react';

// ==========================================
// KONFIGURACJA FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "TUTAJ_SWOJ_API_KEY",
  authDomain: "TUTAJ_SWOJ_AUTH_DOMAIN",
  projectId: "TUTAJ_SWOJ_PROJECT_ID",
  storageBucket: "TUTAJ_SWOJ_STORAGE_BUCKET",
  messagingSenderId: "TUTAJ_SWOJ_MESSAGING_SENDER_ID",
  appId: "TUTAJ_SWOJ_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PIN = "1234";

const MENU_CATEGORIES = [
  { id: 'zupy', name: 'Zupy' },
  { id: 'drób', name: 'Dania z drobiu' },
  { id: 'wieprzowina', name: 'Wieprzowina' },
  { id: 'wołowina', name: 'Wołowina' },
  { id: 'kaczka', name: 'Kaczka' },
  { id: 'ryby_krewetki', name: 'Ryby i Krewetki' },
  { id: 'makaron_ryz', name: 'Makaron i Ryż' },
  { id: 'dodatki', name: 'Dodatki i Inne' }
];

const MENU_ITEMS = [
  { id: '1', cat: 'zupy', num: '1', name: 'Zupa ostro-kwaśna', price: 12 },
  { id: '2', cat: 'zupy', num: '2', name: 'Zupa wan-tan', price: 13 },
  { id: '3', cat: 'zupy', num: '3', name: 'Zupa pho z kurczakiem', price: 22 },
  
  { id: '10', cat: 'drób', num: '10', name: 'Kurczak w sosie curry', price: 26 },
  { id: '11', cat: 'drób', num: '11', name: 'Kurczak pięciu smaków', price: 26 },
  { id: '12', cat: 'drób', num: '12', name: 'Kurczak w cieście (chrupiący)', price: 27 },
  { id: '13', cat: 'drób', num: '13', name: 'Kurczak z orzechami nerkowca', price: 28 },

  { id: '20', cat: 'wieprzowina', num: '20', name: 'Wieprzowina w sosie czosnkowym', price: 26 },
  { id: '21', cat: 'wieprzowina', num: '21', name: 'Wieprzowina z warzywami na ostro', price: 26 },
  { id: '22', cat: 'wieprzowina', num: '22', name: 'Wieprzowina po secsyńsku', price: 27 },

  { id: '30', cat: 'wołowina', num: '30', name: 'Wołowina z cebulą', price: 31 },
  { id: '31', cat: 'wołowina', num: '31', name: 'Wołowina w sosie pieprzowym', price: 32 },
  { id: '32', cat: 'wołowina', num: '32', name: 'Wołowina pięciu smaków', price: 31 },

  { id: '40', cat: 'kaczka', num: '40', name: 'Kaczka chrupiąca z warzywami', price: 35 },
  { id: '41', cat: 'kaczka', num: '41', name: 'Kaczka w sosie słodko-kwaśnym', price: 35 },

  { id: '50', cat: 'ryby_krewetki', num: '50', name: 'Krewetki w cieście', price: 34 },
  { id: '51', cat: 'ryby_krewetki', num: '51', name: 'Ryba w sosie słodko-kwaśnym', price: 29 },

  { id: '60', cat: 'makaron_ryz', num: '60', name: 'Smażony makaron z kurczakiem', price: 26 },
  { id: '61', cat: 'makaron_ryz', num: '61', name: 'Smażony ryż po wietnamsku', price: 25 },
  { id: '62', cat: 'makaron_ryz', num: '62', name: 'Pad Thai z kurczakiem', price: 28 },

  { id: '70', cat: 'dodatki', num: '70', name: 'Sajgonki wieprzowe (3 szt.)', price: 18 },
  { id: '71', cat: 'dodatki', num: '71', name: 'Sajgonki wieprzowe - PODWÓJNA PORCJA (6 szt. w 1 opakowaniu)', price: 36, isDoublePack: true },
  { id: '72', cat: 'dodatki', num: '72', name: 'Dodatkowy ryż', price: 7 },
  { id: '73', cat: 'dodatki', num: '73', name: 'Dodatkowy sos słodko-kwaśny', price: 5 }
];

export default function App() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [session, setSession] = useState({
    isOpen: true,
    deliveryDate: '',
    deliveryTime: '12:00'
  });
  const [orders, setOrders] = useState([]);
  const [activeCategory, setActiveCategory] = useState('zupy');

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('order');

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
      setIsLoggedIn(true);
    }

    const unsubSession = onSnapshot(doc(db, "config", "session"), (docSnap) => {
      if (docSnap.exists()) {
        setSession(docSnap.data());
      } else {
        const defaultSession = { isOpen: true, deliveryDate: dateStr, deliveryTime: '12:00' };
        setDoc(doc(db, "config", "session"), defaultSession);
        setSession(defaultSession);
      }
    });

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ords);
    });

    return () => {
      unsubSession();
      unsubOrders();
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;
    localStorage.setItem('mai_mai_user_name', userName.trim());
    setIsLoggedIn(true);
  };

  // Dodawanie zamówienia z flagą isExtra (domówienie)
  const handleAddItem = async (menuItem, isExtra = false) => {
    if (!session.isOpen) {
      alert("Sesja jest zamknięta! Nie można dodawać zamówień.");
      return;
    }

    const existingOrder = orders.find(o => o.userId === userId && o.menuItemId === menuItem.id && o.isExtra === isExtra);

    if (existingOrder) {
      await updateDoc(doc(db, "orders", existingOrder.id), {
        quantity: existingOrder.quantity + 1
      });
    } else {
      const newOrderRef = doc(collection(db, "orders"));
      await setDoc(newOrderRef, {
        userId: userId,
        userName: userName.trim(),
        menuItemId: menuItem.id,
        itemNum: menuItem.num,
        itemName: menuItem.name,
        price: menuItem.price,
        isDoublePack: menuItem.isDoublePack || false,
        quantity: 1,
        isExtra: isExtra,
        timestamp: Date.now()
      });
    }
  };

  const handleUpdateQty = async (orderId, currentQty, change) => {
    if (!session.isOpen) {
      alert("Sesja jest zamknięta!");
      return;
    }

    const newQty = currentQty + change;
    if (newQty <= 0) {
      await deleteDoc(doc(db, "orders", orderId));
    } else {
      await updateDoc(doc(db, "orders", orderId), {
        quantity: newQty
      });
    }
  };

  const toggleExtraItem = async (orderId, currentExtraStatus) => {
    await updateDoc(doc(db, "orders", orderId), {
      isExtra: !currentExtraStatus
    });
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setIsAdminModalOpen(false);
      setAdminPinInput('');
    } else {
      alert("Nieprawidłowy PIN!");
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

  const handleUpdateSessionMeta = async (field, value) => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    await updateDoc(doc(db, "config", "session"), {
      [field]: value
    });
  };

  const handleResetSession = async () => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    if (window.confirm("Czy na pewno chcesz zresetować wszystkie zamówienia i otworzyć nową sesję?")) {
      for (const ord of orders) {
        await deleteDoc(doc(db, "orders", ord.id));
      }
    }
  };

  const packagingFee = 1.50;
  const activeUsers = [...new Set(orders.map(o => o.userName))];

  const regularOrders = orders.filter(o => !o.isExtra);
  const extraOrders = orders.filter(o => o.isExtra);

  const generateMmsText = () => {
    let text = `BAR MAI MAI - ZAMÓWIENIE\n`;
    text += `Dostawa: ${session.deliveryDate} o godz. ${session.deliveryTime}\n\n`;
    
    text += `--- GŁÓWNA LISTA ---\n`;
    regularOrders.forEach((ord, index) => {
      const opakowaniaInfo = ord.isDoublePack ? ` (2 porcje w 1 opak.)` : ``;
      text += `${index + 1}. Poz. ${ord.itemNum} - ${ord.itemName} x${ord.quantity}${opakowaniaInfo} [${ord.userName}]\n`;
    });

    if (extraOrders.length > 0) {
      text += `\n--- POSIŁKI DOMAWIANE (PROSZĘ NIE MYLIĆ) ---\n`;
      extraOrders.forEach((ord, index) => {
        text += `${index + 1}. Poz. ${ord.itemNum} - ${ord.itemName} x${ord.quantity} [DOMÓWIENIE - ${ord.userName}]\n`;
      });
    }

    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMmsText());
    alert("Podsumowanie skopiowane do schowka!");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex items-center justify-center mb-6 text-amber-400">
            <Utensils size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Bar Mai Mai - Zamówienia</h1>
          <p className="text-slate-400 text-center text-sm mb-6">Podaj swoje imię, aby dołączyć do wspólnego zamawiania.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${session.isOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {session.isOpen ? 'Sesja Otwarta' : 'Sesja Zamknięta'}
                </span>
              </h1>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1"><Calendar size={12}/> {session.deliveryDate}</span>
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
                  {orders.reduce((acc, o) => acc + o.quantity, 0)}
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
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Tryb Administratora:
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={toggleSessionStatus}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${session.isOpen ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                {session.isOpen ? 'Zamknij sesję zamówień'  : 'Otwórz sesję zamówień'}
              </button>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400">Dostawa:</span>
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
                onClick={handleResetSession}
                className="bg-slate-800 hover:bg-rose-950 text-rose-400 border border-rose-800/50 px-3 py-1.5 rounded-lg font-medium"
              >
                Resetuj całą sesję
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GŁÓWNY WIDOK */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {activeTab === 'order' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* KATEGORIE PO LEWEJ STRONIE */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-3">Kategorie menu</h3>
              <div className="flex flex-col gap-1.5">
                {MENU_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${activeCategory === cat.id ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300'}`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {MENU_ITEMS.filter(i => i.cat === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* MOJE KOSZYKI WIDŻET */}
              <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Utensils size={14} className="text-amber-400" /> Twoje dania w sesji
                </h4>
                {orders.filter(o => o.userId === userId).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Brak pozycji w koszyku.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {orders.filter(o => o.userId === userId).map(item => (
                      <div key={item.id} className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-amber-400 mr-1">#{item.itemNum}</span>
                          <span className="text-slate-200">{item.itemName}</span>
                          {item.isExtra && <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1 rounded ml-1 font-bold">DOMÓWIENIE</span>}
                          <div className="text-[10px] text-slate-400">{item.price} zł x {item.quantity} = {item.price * item.quantity} zł</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300"
                            disabled={!session.isOpen}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center font-bold text-slate-200">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300"
                            disabled={!session.isOpen}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* LISTA DAŃ Z MENU */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 capitalize text-amber-400">
                  {MENU_CATEGORIES.find(c => c.id === activeCategory)?.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MENU_ITEMS.filter(item => item.cat === activeCategory).map(item => {
                    return (
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
                          {item.isDoublePack && (
                            <span className="inline-block bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] px-2 py-0.5 rounded mt-1">
                              Specjalne: 2 porcje w 1 opakowaniu (+1,50 zł)
                            </span>
                          )}
                        </div>

                        {/* DWUTRYBOWY PRZYCISK DODAWANIA (ZWYKŁE VS DOMÓWIENIE) */}
                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAddItem(item, false)}
                            className={`px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-all ${session.isOpen ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            disabled={!session.isOpen}
                          >
                            <Plus size={14} /> Dodaj
                          </button>
                          
                          <button 
                            onClick={() => handleAddItem(item, true)}
                            className={`px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-all ${session.isOpen ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            disabled={!session.isOpen}
                            title="Dodaj jako poranne domówienie"
                          >
                            <PlusCircle size={14} /> + Domówienie
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

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
                  <p className="text-xs text-slate-400 mt-1">Główna lista i poranne domówienia rozdzielone automatycznie.</p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
                >
                  <Share2 size={14} /> Skopiuj tekst do MMS / SMS
                </button>
              </div>

              {/* LISTA GŁÓWNA */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  Główna lista dań ({regularOrders.reduce((acc, o) => acc + o.quantity, 0)} poz.)
                </h4>
                
                {regularOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">Brak głównych pozycji.</p>
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
                            <span className="text-slate-400 ml-2">x{ord.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 italic">[{ord.userName}]</span>
                          {(isAdmin || ord.userId === userId) && (
                            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                              <button 
                                onClick={() => toggleExtraItem(ord.id, ord.isExtra)}
                                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                              >
                                Na domówienia
                              </button>
                              <button 
                                onClick={() => deleteDoc(doc(db, "orders", ord.id))}
                                className="text-rose-400 hover:text-rose-300 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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
                  <span>Poranne domówienia pod oryginalną listą ({extraOrders.reduce((acc, o) => acc + o.quantity, 0)} poz.)</span>
                </h4>
                
                {extraOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Brak porannych domówień.</p>
                ) : (
                  <div className="space-y-2">
                    {extraOrders.map((ord, idx) => (
                      <div key={ord.id} className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-amber-500 font-bold w-6">{idx + 1}.</span>
                          <div>
                            <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded mr-2">Poz. {ord.itemNum}</span>
                            <span className="font-semibold text-slate-200">{ord.itemName}</span>
                            <span className="text-slate-400 ml-2">x{ord.quantity}</span>
                            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded ml-2">DOMÓWIENIE</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 italic">[{ord.userName}]</span>
                          {(isAdmin || ord.userId === userId) && (
                            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                              <button 
                                onClick={() => toggleExtraItem(ord.id, ord.isExtra)}
                                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                              >
                                Na główną
                              </button>
                              <button 
                                onClick={() => deleteDoc(doc(db, "orders", ord.id))}
                                className="text-rose-400 hover:text-rose-300 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ROZLICZENIE FINANSOWE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 text-amber-400 flex items-center gap-2">
                <TrendingUp size={20} /> Rozliczenie kosztów (dla grupy)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {activeUsers.map(uName => {
                  const userOrders = orders.filter(o => o.userName === uName);
                  const foodSum = userOrders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
                  const userTotal = foodSum + packagingFee;

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
                              #{uo.itemNum} {uo.itemName} x{uo.quantity}
                              {uo.isExtra && <span className="text-amber-400 text-[10px] ml-1">(domówienie)</span>}
                            </span>
                            <span className="shrink-0">{uo.price * uo.quantity} zł</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                        <span>Opakowanie: {packagingFee} zł</span>
                        <span className="font-bold text-slate-300">Razem: {userTotal.toFixed(2)} zł</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* STATYSTYKI */}
        {activeTab === 'stats' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="inline-flex p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-2">
                <Award size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Hall of Fame - Bar Mai Mai</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Miejsce na dane z Twojego Excela – dodamy je przy kolejnym kroku!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL ADMINA */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <Lock size={24} />
              <h3 className="text-lg font-bold text-slate-100">PIN Administratora</h3>
            </div>
            <p className="text-xs text-slate-400">Podaj PIN (domyślnie: <strong className="text-amber-400">1234</strong>):</p>
            
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

    </div>
  );
}
