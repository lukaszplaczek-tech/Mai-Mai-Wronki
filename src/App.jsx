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
  Plus, 
  Minus, 
  Share2, 
  User, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Award,
  ShoppingCart
} from 'lucide-react';

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

const ADMIN_PIN = "4271";

// ==========================================
// KATEGORIE I PEŁNE MENU
// ==========================================
const MENU_CATEGORIES = [
  { id: 'zupy', name: 'Zupy' },
  { id: 'przekaski', name: 'Przekąski (Nem/Sajgonki)' },
  { id: 'drob', name: 'Dania z Kurczaka' },
  { id: 'wieprzowina', name: 'Wieprzowina' },
  { id: 'wolowina', name: 'Wołowina' },
  { id: 'kaczka', name: 'Kaczka' },
  { id: 'ryby', name: 'Ryby i Owoce Morza' },
  { id: 'makaron_ryz', name: 'Ryż i Makaron Smażony' },
  { id: 'male_dania', name: 'Małe Dania - Box' },
  { id: 'dodatki', name: 'Dodatki i Inne' },
  { id: 'napoje', name: 'Napoje i Desery' }
];

const MENU_ITEMS = [
  // --- ZUPY ---
  { id: '101', cat: 'zupy', num: '101', name: 'Zupa wonton', price: 13 },
  { id: '102', cat: 'zupy', num: '102', name: 'Zupa wietnamska', price: 13 },
  { id: '103', cat: 'zupy', num: '103', name: 'Zupa krabowa', price: 13 },
  { id: '104', cat: 'zupy', num: '104', name: 'Zupa pekińska pikantna', price: 13 },
  { id: '105', cat: 'zupy', num: '105', name: 'Zupa rybna ostra', price: 17 },
  { id: '106', cat: 'zupy', num: '106', name: 'Zupa z makaronem chińskim', price: 17 },
  { id: '107', cat: 'zupy', num: '107', name: 'Tajska zupa z kurczakiem', price: 17 },
  { id: '108', cat: 'zupy', num: '108', name: 'Tajska zupa z krewetkami', price: 21 },
  { id: '109', cat: 'zupy', num: '109', name: 'Zupa curry z tofu na ostro', price: 13 },
  { id: '110', cat: 'zupy', num: '110', name: 'Zupa pho z kurczakiem', price: 25 },
  { id: '111', cat: 'zupy', num: '111', name: 'Zupa pho z wołowiną', price: 28 },

  // --- PRZEKĄSKI (w tym podwójne sajgonki) ---
  { id: '71', cat: 'przekaski', num: '209', name: 'NEM sajgonki - podwójna porcja w jednym opakowaniu (6 szt.)', price: 30, isDoublePack: true },
  { id: '207', cat: 'przekaski', num: '207', name: 'Nem - sajgonki z krewetkami (5 szt.)', price: 18 },
  { id: '208', cat: 'przekaski', num: '208', name: 'Nem - sajgonki wegetariańskie (8 szt.)', price: 16 },
  { id: '209', cat: 'przekaski', num: '209', name: 'Nem - sajgonki (3 szt.)', price: 15 },
  { id: '210', cat: 'przekaski', num: '210', name: 'Paluszki o smaku krabowym surimi (3 szt.)', price: 14 },
  { id: '211', cat: 'przekaski', num: '211', name: 'Pierogi hacao (5 szt.)', price: 17 },
  { id: '212', cat: 'przekaski', num: '212', name: 'Pierogi xiao mai (5 szt.)', price: 17 },
  { id: '213', cat: 'przekaski', num: '213', name: 'Krewetki w cieście chrupiącym (2 szt.)', price: 16 },

  // --- DANIA Z KURCZAKA ---
  { id: '311', cat: 'drob', num: '311', name: 'Kurczak z brokułami i czosnkiem', price: 27 },
  { id: '314', cat: 'drob', num: '314', name: 'Kurczak po wietnamsku na gorącym płomieniu', price: 29 },
  { id: '315', cat: 'drob', num: '315', name: 'Kurczak z warzywami', price: 26 },
  { id: '316', cat: 'drob', num: '316', name: 'Kurczak w cieście', price: 25 },
  { id: '317', cat: 'drob', num: '317', name: 'Kurczak gong bao', price: 26 },
  { id: '318', cat: 'drob', num: '318', name: 'Kurczak z pieczarkami i grzybami mun', price: 26 },
  { id: '319', cat: 'drob', num: '319', name: 'Kurczak z bambusem', price: 26 },
  { id: '320', cat: 'drob', num: '320', name: 'Kurczak w sosie curry', price: 25 },
  { id: '321', cat: 'drob', num: '321', name: 'Kurczak w sosie słodko-kwaśnym', price: 25 },
  { id: '322', cat: 'drob', num: '322', name: 'Kurczak na ostro', price: 25 },
  { id: '323', cat: 'drob', num: '323', name: 'Kurczak hong ha na gorącym płomieniu', price: 28 },
  { id: '324', cat: 'drob', num: '324', name: 'Udko z kurczaka chrupiące (na gorąco)', price: 28 },
  { id: '325', cat: 'drob', num: '325', name: 'Kurczak w sosie pięciu smaków', price: 25 },
  { id: '326', cat: 'drob', num: '326', name: 'Kurczak w sosie curry czerwonym', price: 27 },
  { id: '327', cat: 'drob', num: '327', name: 'Filet chrupiący po tajsku', price: 28 },
  { id: '328', cat: 'drob', num: '328', name: 'Kurczak z trawą cytrynową na ostro', price: 27 },
  { id: '329', cat: 'drob', num: '329', name: 'Kurczak z cytryna na maśle', price: 26 },
  { id: '330', cat: 'drob', num: '330', name: 'Kurczak w sosie sate na gorącym płomieniu', price: 27 },
  { id: '331', cat: 'drob', num: '331', name: 'Kurczak luc lac na gorącym płomieniu', price: 29 },

  // --- WIEPRZOWINA ---
  { id: '530', cat: 'wieprzowina', num: '530', name: 'Wieprzowina po wietnamsku', price: 29 },
  { id: '531', cat: 'wieprzowina', num: '531', name: 'Wieprzowina z warzywami', price: 26 },
  { id: '532', cat: 'wieprzowina', num: '532', name: 'Wieprzowina na ostro', price: 26 },
  { id: '533', cat: 'wieprzowina', num: '533', name: 'Wieprzowina w sosie słodko-kwaśnym', price: 27 },
  { id: '534', cat: 'wieprzowina', num: '534', name: 'Wieprzowina z ananasem', price: 27 },
  { id: '540', cat: 'wieprzowina', num: '540', name: 'Wieprzowina w sosie sate na ostro', price: 29 },

  // --- WOŁOWINA ---
  { id: '642', cat: 'wolowina', num: '642', name: 'Wołowina w sosie pikantnym', price: 32 },
  { id: '643', cat: 'wolowina', num: '643', name: 'Wołowina w sosie curry', price: 32 },
  { id: '644', cat: 'wolowina', num: '644', name: 'Wołowina w sosie słodko-kwaśnym', price: 32 },
  { id: '645', cat: 'wolowina', num: '645', name: 'Wołowina z warzywami', price: 32 },
  { id: '646', cat: 'wolowina', num: '646', name: 'Wołowina z brokułami i czosnkiem', price: 32 },
  { id: '648', cat: 'wolowina', num: '648', name: 'Wołowina po kantońsku', price: 33 },
  { id: '649', cat: 'wolowina', num: '649', name: 'Wołowina w sosie sate', price: 35 },
  { id: '650', cat: 'wolowina', num: '650', name: 'Wołowina luc lac na gorącym płomieniu', price: 35 },
  { id: '651', cat: 'wolowina', num: '651', name: 'Wołowina z czarnym pieprzem', price: 37 },
  { id: '652', cat: 'wolowina', num: '652', name: 'Wołowina w sosie curry czerwonym', price: 33 },

  // --- KACZKA ---
  { id: '426', cat: 'kaczka', num: '426', name: 'Kaczka po chińsku na gorącym płomieniu', price: 35 },
  { id: '427', cat: 'kaczka', num: '427', name: 'Kaczka w sosie curry', price: 35 },
  { id: '428', cat: 'kaczka', num: '428', name: 'Kaczka w sosie słodko-kwaśnym', price: 35 },
  { id: '431', cat: 'kaczka', num: '431', name: 'Kaczka shanghai na gorącym płomieniu', price: 35 },

  // --- RYBY I OWOCE MORZA ---
  { id: '855', cat: 'ryby', num: '855', name: 'Ryba po chińsku na gorącym płomieniu', price: 30 },
  { id: '857', cat: 'ryby', num: '857', name: 'Ryba w sosie pikantnym', price: 28 },
  { id: '858', cat: 'ryby', num: '858', name: 'Ryba w sosie słodko-kwaśnym', price: 28 },
  { id: '859', cat: 'ryby', num: '859', name: 'Ryba w sosie curry', price: 28 },
  { id: '869', cat: 'ryby', num: '869', name: 'Ryba z cytryna na maśle', price: 29 },
  { id: '870', cat: 'ryby', num: '870', name: 'Ryba chrupiąca na gorącym płomieniu', price: 30 },
  { id: '863', cat: 'ryby', num: '863', name: 'Krewetki koktajlowe w sosie słodko-kwaśnym', price: 35 },
  { id: '871', cat: 'ryby', num: '871', name: 'Krewetki koktajlowe na gorącym płomieniu', price: 35 },
  { id: '860', cat: 'ryby', num: '860', name: 'Krewetki na maśle pikantnym', price: 50 },
  { id: '872', cat: 'ryby', num: '872', name: 'Krewetki pikantne z trawą cytrynową', price: 50 },
  { id: '874', cat: 'ryby', num: '874', name: 'Krewetki w sosie curry', price: 50 },
  { id: '875', cat: 'ryby', num: '875', name: 'Krewetki w sosie tamaryndowym', price: 50 },
  { id: '864', cat: 'ryby', num: '864', name: 'Krewetki w cieście chrupiącym', price: 32 },
  { id: '865', cat: 'ryby', num: '865', name: 'Kalmary w sosie pikantnym', price: 32 },
  { id: '866', cat: 'ryby', num: '866', name: 'Kalmary w sosie słodko-kwaśnym', price: 32 },
  { id: '873', cat: 'ryby', num: '873', name: 'Kalmary z cytryna na maśle', price: 33 },

  // --- RYŻ I MAKARON SMAŻONY (z wyborem mięsa) ---
  { id: '1075', cat: 'makaron_ryz', num: '1075', name: 'Makaron chiński', price: 23, hasMeatChoice: true },
  { id: '1076', cat: 'makaron_ryz', num: '1076', name: 'Makaron sojowy', price: 23, hasMeatChoice: true },
  { id: '1077', cat: 'makaron_ryz', num: '1077', name: 'Ryż smażony', price: 23, hasMeatChoice: true },
  { id: '1078', cat: 'makaron_ryz', num: '1078', name: 'Ryż smażony z krewetkami', price: 25 },
  { id: '1079', cat: 'makaron_ryz', num: '1079', name: 'Pad thai z tofu', price: 26 },
  { id: '1080', cat: 'makaron_ryz', num: '1080', name: 'Pad thai z kurczakiem', price: 26 },
  { id: '1078_w', cat: 'makaron_ryz', num: '1078', name: 'Pad thai z wołowiną', price: 26 },
  { id: '1078_kr', cat: 'makaron_ryz', num: '1078', name: 'Pad thai z krewetkami', price: 26 },

  // --- MAŁE DANIA - BOX ---
  { id: 'box_1', cat: 'male_dania', num: 'BOX', name: 'Makaron z kurczakiem', price: 20 },
  { id: 'box_2', cat: 'male_dania', num: 'BOX', name: 'Makaron z warzywami', price: 18 },
  { id: 'box_3', cat: 'male_dania', num: 'BOX', name: 'Ryż z kurczakiem', price: 20 },
  { id: 'box_4', cat: 'male_dania', num: 'BOX', name: 'Ryż z warzywami', price: 18 },
  { id: 'box_5', cat: 'male_dania', num: 'BOX', name: 'Ryż z chrupiącym kurczakiem', price: 20 },

  // --- DODATKI ---
  { id: '1180', cat: 'dodatki', num: '1180', name: 'Frytki', price: 8 },
  { id: '1182', cat: 'dodatki', num: '1182', name: 'Surówka', price: 4 },
  { id: '1183', cat: 'dodatki', num: '1183', name: 'Ryż biały', price: 4 },
  { id: '1186', cat: 'dodatki', num: '1186', name: 'Ryż smażony', price: 6 },
  { id: '1187', cat: 'dodatki', num: '1187', name: 'Makaron sojowy', price: 6 },

  // --- NAPOJE I DESERY ---
  { id: '1410', cat: 'napoje', num: '1410', name: 'Pepsi / Miranda / 7up (500 ml)', price: 8 },
  { id: '1412', cat: 'napoje', num: '1412', name: 'Lipton (500 ml)', price: 8 },
  { id: '1402', cat: 'napoje', num: '1402', name: 'Woda mineralna (500 ml)', price: 5 },
  { id: '1286', cat: 'napoje', num: '1286', name: 'Banan w cieście (2 szt.)', price: 10 },
  { id: '1287', cat: 'napoje', num: '1287', name: 'Ananas w cieście (2 szt.)', price: 10 }
];

export default function App() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [session, setSession] = useState({
    isOpen: true,
    isExtraSession: false,
    deliveryDate: '',
    deliveryTime: '12:00'
  });
  const [orders, setOrders] = useState([]);
  const [activeCategory, setActiveCategory] = useState('zupy');
  const [meatSelections, setMeatSelections] = useState({}); // Wybór mięsa dla dań z mięsem

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
        const defaultSession = { isOpen: true, isExtraSession: false, deliveryDate: dateStr, deliveryTime: '12:00' };
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

  // Dodawanie pojedynczej pozycji (każde kliknięcie dodaje osobną pozycję do bazy)
  const handleAddItem = async (menuItem) => {
    if (!session.isOpen) {
      alert("Sesja jest zamknięta! Nie można dodawać zamówień.");
      return;
    }

    const isExtra = session.isExtraSession || false;
    let finalItemName = menuItem.name;

    if (menuItem.hasMeatChoice) {
      const selectedMeat = meatSelections[menuItem.id] || 'kurczak';
      finalItemName = `${menuItem.name} z mięsem (${selectedMeat})`;
    }

    const newOrderRef = doc(collection(db, "orders"));
    await setDoc(newOrderRef, {
      userId: userId,
      userName: userName.trim(),
      menuItemId: menuItem.id,
      itemNum: menuItem.num,
      itemName: finalItemName,
      price: menuItem.price,
      isDoublePack: menuItem.isDoublePack || false,
      quantity: 1, // zawsze 1 sztuka jako osobna pozycja
      isExtra: isExtra,
      timestamp: Date.now()
    });
  };

  // Usunięcie konkretnej pozycji z bazy
  const handleDeleteOrder = async (orderId) => {
    if (!session.isOpen) {
      alert("Sesja jest zamknięta!");
      return;
    }
    await deleteDoc(doc(db, "orders", orderId));
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
  const myOrders = orders.filter(o => o.userId === userId);
  const myTotalCost = myOrders.reduce((acc, o) => acc + (o.price * o.quantity), 0) + (myOrders.length > 0 ? packagingFee : 0);

  const generateMmsText = () => {
    let text = `BAR MAI MAI - ZAMÓWIENIE\n`;
    text += `Dostawa: ${session.deliveryDate} o godz. ${session.deliveryTime}\n\n`;
    
    text += `--- GŁÓWNA LISTA ---\n`;
    regularOrders.forEach((ord, index) => {
      const opakowaniaInfo = ord.isDoublePack ? ` (2 porcje w 1 opak.)` : ``;
      text += `${index + 1}. Poz. ${ord.itemNum} - ${ord.itemName}${opakowaniaInfo} [${ord.userName}]\n`;
    });

    if (extraOrders.length > 0) {
      text += `\n--- POSIŁKI DOMAWIANE (PROSZĘ NIE MYLIĆ) ---\n`;
      extraOrders.forEach((ord, index) => {
        text += `${index + 1}. Poz. ${ord.itemNum} - ${ord.itemName} [DOMÓWIENIE - ${ord.userName}]\n`;
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
                {session.isExtraSession && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    Sesja Domówień (2. tura)
                  </span>
                )}
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
                {session.isOpen ? 'Zamknij sesję główną'  : 'Otwórz sesję główną'}
              </button>

              <button 
                onClick={toggleExtraSessionStatus}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${session.isExtraSession ? 'bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'}`}
              >
                {session.isExtraSession ? '🔴 Wyłącz sesję domówień' : '🟢 Otwórz sesję domówień (2. tura)'}
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
          <div className="space-y-6">
            
            {/* DUŻE PODSUMOWANIE ZAMÓWIENIA UŻYTKOWNIKA NA GÓRZE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <ShoppingCart size={20} /> Twoje zamówienie w tej sesji ({userName})
                </h3>
                <div className="text-sm font-bold text-slate-200 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  Do zapłaty: <span className="text-amber-400">{myTotalCost.toFixed(2)} zł</span> (w tym opakowanie {myOrders.length > 0 ? packagingFee.toFixed(2) : '0.00'} zł)
                </div>
              </div>

              {myOrders.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Nie masz jeszcze żadnych dań w koszyku. Wybierz coś z menu poniżej!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {myOrders.map(item => (
                    <div key={item.id} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="font-semibold text-amber-400 mr-1.5">#{item.itemNum}</span>
                        <span className="text-slate-200 font-medium">{item.itemName}</span>
                        {item.isExtra && <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded ml-1 font-bold">DOMÓWIENIE</span>}
                        <div className="text-[11px] text-slate-400 mt-0.5"><strong className="text-slate-200">{item.price} zł</strong></div>
                      </div>
                      <button 
                        onClick={() => handleDeleteOrder(item.id)}
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

            {/* UKŁAD MENU I KATEGORII */}
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
              </div>

              {/* LISTA DAŃ Z MENU */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold capitalize text-amber-400">
                      {MENU_CATEGORIES.find(c => c.id === activeCategory)?.name}
                    </h3>
                    {session.isExtraSession && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl font-bold">
                        ⚠️ Tryb Domówień aktywny (wszystkie dodania trafią do domówień)
                      </span>
                    )}
                  </div>
                  
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
                              onClick={() => handleAddItem(item)}
                              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-md ${session.isOpen ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                              disabled={!session.isOpen}
                            >
                              <Plus size={14} /> {session.isExtraSession ? 'Domów' : 'Dodaj'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ZAKŁADKA PODSUMOWANIA (KAŻDA SZTUKA OSOBNO) */}
        {activeTab === 'summary' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <FileText size={20} /> Podsumowanie dla restauracji
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Każda sztuka dania w osobnym wierszu. Główna lista i domówienia rozdzielone automatycznie.</p>
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
                  Główna lista dań ({regularOrders.length} poz.)
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
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 italic">[{ord.userName}]</span>
                          {(isAdmin || ord.userId === userId) && (
                            <button 
                              onClick={() => handleDeleteOrder(ord.id)}
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
                  <span>Poranne domówienia pod oryginalną listą ({extraOrders.length} poz.)</span>
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
                            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded ml-2">DOMÓWIENIE</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 italic">[{ord.userName}]</span>
                          {(isAdmin || ord.userId === userId) && (
                            <button 
                              onClick={() => handleDeleteOrder(ord.id)}
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
                  const userTotal = foodSum + (userOrders.length > 0 ? packagingFee : 0);

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
                        <span>Opakowanie: {userOrders.length > 0 ? packagingFee : 0} zł</span>
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
