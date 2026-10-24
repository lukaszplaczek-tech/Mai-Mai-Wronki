import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Check, 
  Copy, 
  Settings, 
  Search, 
  ChefHat, 
  Lock, 
  FileText,
  Utensils,
  User,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';

// --- FIREBASE CONFIGURATION & INITIALIZATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      // Domyślna bezpieczna konfiguracja zapasowa (dla lokalnego/Vercel uruchomienia bez wstrzykiwania)
      apiKey: "AIzaSyDLomcJGJnq5ippXymyCT1aRDdAD8gbXA8",
  authDomain: "zamowienia-mai-mai.firebaseapp.com",
  projectId: "zamowienia-mai-mai",
  storageBucket: "zamowienia-mai-mai.firebasestorage.app",
  messagingSenderId: "796445926554",
  appId: "1:796445926554:web:ceb19ee2b9941ed0c66b23",
  measurementId: "G-Q3J35PB1QQ"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'bar-mai-mai-wronki';

// --- PEŁNE MENU BAR MAI MAI (WRONKI) ZDJĘĆ ---
const MENU_DATA = [
  {
    category: "Zupy",
    icon: "🍲",
    items: [
      { id: "101", name: "Zupa Wonton", weight: "300 ml", price: 13.00, requiresBox: true },
      { id: "102", name: "Zupa Wietnamska", weight: "300 ml", price: 13.00, requiresBox: true },
      { id: "103", name: "Zupa Krabowa", weight: "300 ml", price: 13.00, requiresBox: true },
      { id: "104", name: "Zupa Pekińska Pikantna", weight: "300 ml", price: 13.00, requiresBox: true },
      { id: "105", name: "Zupa Rybna Ostra", weight: "300 ml", price: 10.00, requiresBox: true },
      { id: "106", name: "Zupa z Makaronem Chińskim", weight: "500 ml", price: 17.00, requiresBox: true },
      { id: "107", name: "Tajska Zupa z Kurczakiem", weight: "300 ml", price: 17.00, requiresBox: true },
      { id: "108", name: "Tajska Zupa z Krewetkami", weight: "300 ml", price: 15.00, requiresBox: true },
      { id: "109", name: "Zupa Curry z Tofu na Ostro", weight: "800 ml", price: 13.00, requiresBox: true },
      { id: "110", name: "Zupa Pho z Kurczakiem", weight: "800 ml", price: 25.00, requiresBox: true },
      { id: "111", name: "Zupa Pho z Wołowiną", weight: "800 ml", price: 28.00, requiresBox: true },
    ]
  },
  {
    category: "Przekąski",
    icon: "🥟",
    items: [
      { id: "207", name: "Nem - Sajgonki z krewetkami", weight: "5 szt", price: 18.00, requiresBox: true },
      { id: "208", name: "Nem - Sajgonki wegetariańskie", weight: "8 szt", price: 16.00, requiresBox: true },
      { id: "209", name: "Nem - Sajgonki", weight: "3 szt", price: 15.00, requiresBox: true },
      { id: "210", name: "Paluszki o smaku krabowym Surimi", weight: "8 szt", price: 14.00, requiresBox: true },
      { id: "211", name: "Pierogi Hacao", weight: "5 szt", price: 17.00, requiresBox: true },
      { id: "212", name: "Pierogi Xiao Mai", weight: "5 szt", price: 17.00, requiresBox: true },
      { id: "213", name: "Krewetki w cieście chrupiącym", weight: "2 szt", price: 16.00, requiresBox: true },
    ]
  },
  {
    category: "Dania z Kurczaka (ryż i surówka)",
    icon: "🍗",
    items: [
      { id: "311", name: "Kurczak z brokułami i czosnkiem", weight: "400 gr", price: 27.00, requiresBox: true },
      { id: "314", name: "Kurczak po wietnamsku na gorącym płomieniu", weight: "400 gr", price: 29.00, requiresBox: true },
      { id: "315", name: "Kurczak z warzywami", weight: "400 gr", price: 26.00, requiresBox: true },
      { id: "316", name: "Kurczak w cieście", weight: "350 gr", price: 25.00, requiresBox: true },
      { id: "317", name: "Kurczak Gong Bao", weight: "400 gr", price: 25.00, requiresBox: true },
      { id: "318", name: "Kurczak z pieczarkami", weight: "400 gr", price: 26.00, requiresBox: true },
      { id: "319", name: "Kurczak z bambusem i grzybami Mun", weight: "350 gr", price: 26.00, requiresBox: true },
      { id: "320", name: "Kurczak w sosie curry", weight: "400 gr", price: 25.00, requiresBox: true },
      { id: "321", name: "Kurczak w sosie słodko-kwaśnym", weight: "400 gr", price: 25.00, requiresBox: true },
      { id: "322", name: "Kurczak na ostro", weight: "400 gr", price: 25.00, requiresBox: true },
      { id: "323", name: "Kurczak Hong Ha na gorącym płomieniu", weight: "350 gr", price: 28.00, requiresBox: true },
      { id: "324", name: "Udko z kurczaka chrupiące (na gorąco)", weight: "350 gr", price: 28.00, requiresBox: true },
      { id: "325", name: "Kurczak w sosie pięciu smaków", weight: "400 gr", price: 25.00, requiresBox: true },
      { id: "326", name: "Kurczak w sosie curry czerwonym", weight: "400 gr", price: 28.00, requiresBox: true },
      { id: "327", name: "Filet chrupiący po tajsku", weight: "400 gr", price: 27.00, requiresBox: true },
      { id: "328", name: "Kurczak z trawą cytrynową na ostro", weight: "350 gr", price: 25.00, requiresBox: true },
      { id: "329", name: "Kurczak z cytryną na maśle", weight: "350 gr", price: 26.00, requiresBox: true },
      { id: "330", name: "Kurczak w sosie Sate na gorącym płomieniu", weight: "350 gr", price: 27.00, requiresBox: true },
      { id: "331", name: "Kurczak Luc Lac na gorącym płomieniu", weight: "350 gr", price: 29.00, requiresBox: true },
    ]
  },
  {
    category: "Dania z Kaczki (ryż i surówka)",
    icon: "🦆",
    items: [
      { id: "426", name: "Kaczka po chińsku na gorącym płomieniu", weight: "350 gr", price: 35.00, requiresBox: true },
      { id: "427", name: "Kaczka w sosie curry", weight: "350 gr", price: 35.00, requiresBox: true },
      { id: "428", name: "Kaczka w sosie słodko-kwaśnym", weight: "350 gr", price: 35.00, requiresBox: true },
      { id: "431", name: "Kaczka Shanghai na gorącym płomieniu", weight: "350 gr", price: 35.00, requiresBox: true },
    ]
  },
  {
    category: "Dania z Wieprzowiny (ryż i surówka)",
    icon: "🥩",
    items: [
      { id: "530", name: "Wieprzowina po wietnamsku", weight: "350 gr", price: 29.00, requiresBox: true },
      { id: "531", name: "Wieprzowina z warzywami", weight: "400 gr", price: 26.00, requiresBox: true },
      { id: "532", name: "Wieprzowina na ostro", weight: "400 gr", price: 26.00, requiresBox: true },
      { id: "533", name: "Wieprzowina w sosie słodko-kwaśnym", weight: "400 gr", price: 27.00, requiresBox: true },
      { id: "534", name: "Wieprzowina z ananasem", weight: "400 gr", price: 27.00, requiresBox: true },
      { id: "540", name: "Wieprzowina w sosie Sate na ostro", weight: "350 gr", price: 29.00, requiresBox: true },
    ]
  },
  {
    category: "Dania z Wołowiny (ryż i surówka)",
    icon: "🥩",
    items: [
      { id: "642", name: "Wołowina w sosie pikantnym", weight: "350 gr", price: 32.00, requiresBox: true },
      { id: "643", name: "Wołowina w sosie curry", weight: "400 gr", price: 32.00, requiresBox: true },
      { id: "644", name: "Wołowina w sosie słodko-kwaśnym", weight: "400 gr", price: 32.00, requiresBox: true },
      { id: "645", name: "Wołowina z warzywami", weight: "350 gr", price: 32.00, requiresBox: true },
      { id: "646", name: "Wołowina z brokułami i czosnkiem", weight: "400 gr", price: 33.00, requiresBox: true },
      { id: "648", name: "Wołowina po kantońsku", weight: "400 gr", price: 35.00, requiresBox: true },
      { id: "649", name: "Wołowina w sosie Sate na gorącym płomieniu", weight: "350 gr", price: 35.00, requiresBox: true },
      { id: "650", name: "Wołowina Luc Lac na gorącym płomieniu", weight: "350 gr", price: 37.00, requiresBox: true },
      { id: "651", name: "Wołowina z czarnym pieprzem", weight: "350 gr", price: 35.00, requiresBox: true },
      { id: "652", name: "Wołowina w sosie curry czerwonym", weight: "400 gr", price: 33.00, requiresBox: true },
    ]
  },
  {
    category: "Dania z Ryb i Owoców Morza",
    icon: "🐟",
    items: [
      { id: "855", name: "Ryba po chińsku na gorącym płomieniu", weight: "350 gr", price: 30.00, requiresBox: true },
      { id: "857", name: "Ryba w sosie pikantnym", weight: "400 gr", price: 28.00, requiresBox: true },
      { id: "858", name: "Ryba w sosie słodko-kwaśnym", weight: "400 gr", price: 28.00, requiresBox: true },
      { id: "859", name: "Ryba w sosie curry", weight: "400 gr", price: 28.00, requiresBox: true },
      { id: "860", name: "Ryba z cytryną na maśle", weight: "350 gr", price: 29.00, requiresBox: true },
      { id: "868", name: "Ryba chrupiąca na gorącym płomieniu", weight: "350 gr", price: 30.00, requiresBox: true },
      { id: "871", name: "Krewetki koktajlowe w sosie słodko-kwaśnym", weight: "350 gr", price: 35.00, requiresBox: true },
      { id: "872", name: "Krewetki pikantne z trawą cytrynową", weight: "8 szt", price: 35.00, requiresBox: true },
      { id: "873", name: "Krewetki koktajlowe w sosie pikantnym", weight: "400 gr", price: 35.00, requiresBox: true },
      { id: "874", name: "Krewetki w sosie curry", weight: "8 szt", price: 50.00, requiresBox: true },
      { id: "875", name: "Krewetki w sosie tamaryndowym", weight: "8 szt", price: 50.00, requiresBox: true },
      { id: "864", name: "Kalmary w cieście chrupiącym", weight: "8 szt", price: 32.00, requiresBox: true },
      { id: "865", name: "Kalmary w sosie pikantnym", weight: "350 gr", price: 32.00, requiresBox: true },
      { id: "866", name: "Kalmary w sosie słodko-kwaśnym", weight: "400 gr", price: 32.00, requiresBox: true },
      { id: "873B", name: "Kalmary z cytryną na maśle", weight: "400 gr", price: 33.00, requiresBox: true },
    ]
  },
  {
    category: "Ryż i Makaron Smażony (surówka)",
    icon: "🍜",
    items: [
      { id: "1075", name: "Makaron chiński z mięsem", weight: "400 gr", price: 23.00, requiresBox: true },
      { id: "1076", name: "Makaron sojowy z mięsem", weight: "400 gr", price: 23.00, requiresBox: true },
      { id: "1077", name: "Ryż smażony z mięsem", weight: "400 gr", price: 23.00, requiresBox: true },
      { id: "1078", name: "Ryż smażony z krewetkami", weight: "400 gr", price: 25.00, requiresBox: true },
      { id: "1079", name: "Pad Thai z Tofu", weight: "400 gr", price: 26.00, requiresBox: true },
      { id: "1080", name: "Pad Thai z kurczakiem", weight: "400 gr", price: 26.00, requiresBox: true },
      { id: "1078B", name: "Pad Thai z wołowiną", weight: "400 gr", price: 26.00, requiresBox: true },
      { id: "1078C", name: "Pad Thai z krewetkami", weight: "400 gr", price: 26.00, requiresBox: true },
    ]
  },
  {
    category: "Dodatki i Opakowania",
    icon: "🍟",
    items: [
      { id: "1180", name: "Frytki", weight: "200 gr", price: 8.00, requiresBox: false },
      { id: "1182", name: "Surówka", weight: "150 gr", price: 4.00, requiresBox: false },
      { id: "1183", name: "Ryż biały", weight: "200 gr", price: 4.00, requiresBox: false },
      { id: "1186", name: "Ryż smażony", weight: "200 gr", price: 6.00, requiresBox: false },
      { id: "1187", name: "Makaron sojowy", weight: "200 gr", price: 6.00, requiresBox: false },
      { id: "1016", name: "Reklamówka", weight: "1 szt", price: 0.20, requiresBox: false },
    ]
  },
  {
    category: "Deser",
    icon: "🍌",
    items: [
      { id: "1286", name: "Banan w cieście", weight: "2 szt", price: 10.00, requiresBox: true },
      { id: "1287", name: "Ananas w cieście", weight: "2 szt", price: 10.00, requiresBox: true },
    ]
  },
  {
    category: "Napoje",
    icon: "🥤",
    items: [
      { id: "1410", name: "Pepsi / Mirinda / 7Up (200ml)", weight: "200 ml", price: 6.00, requiresBox: false },
      { id: "1411", name: "Pepsi / Mirinda / 7Up (500ml)", weight: "500 ml", price: 8.00, requiresBox: false },
      { id: "1412", name: "Lipton", weight: "500 ml", price: 8.00, requiresBox: false },
      { id: "1402", name: "Woda mineralna", weight: "500 ml", price: 5.00, requiresBox: false },
      { id: "1406", name: "Napoje Tymbark", weight: "330 ml", price: 6.00, requiresBox: false },
      { id: "1407", name: "Sok Tarczyń", weight: "300 ml", price: 7.00, requiresBox: false },
      { id: "1409", name: "Sok Orientalny", weight: "300 ml", price: 8.00, requiresBox: false },
    ]
  }
];

export default function App() {
  const [user, setUser] = useState(null);

  // Config state (Session synced via Firestore)
  const [session, setSession] = useState({
    status: 'open', // 'open', 'closed', 'add_on'
    date: 'Piątek',
    deliveryTime: '12:30',
    blikPhone: '790 389 092',
    revolutTag: '@mai_mai_order',
    organizerName: 'Marek',
    note: 'Zamówienia zbieramy do godziny 11:30.',
    allowNotes: false
  });

  // Flat list of order items synced via Firestore
  const [orderItems, setOrderItems] = useState([]);

  // Local form state
  const [userName, setUserName] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('BLIK');
  const [selectedCategory, setSelectedCategory] = useState(MENU_DATA[0].category);
  const [searchQuery, setSearchQuery] = useState('');
  const [customNote, setCustomNote] = useState('');

  // UI state
  const [copiedBlik, setCopiedBlik] = useState(false);
  const [activeTab, setActiveTab] = useState('order_view');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const canvasRef = useRef(null);

  // --- FIREBASE AUTHENTICATION (RULE 3) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Firebase auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- REALTIME FIRESTORE LISTENERS (RULE 1 & RULE 2) ---
  useEffect(() => {
    if (!user) return;

    // 1. Session Config Listener (Public path)
    const sessionDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'session');
    const unsubSession = onSnapshot(sessionDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setSession(snapshot.data());
      } else {
        // Initialize default session config if none exists
        setDoc(sessionDocRef, {
          status: 'open',
          date: 'Piątek',
          deliveryTime: '12:30',
          blikPhone: '790 389 092',
          revolutTag: '@mai_mai_order',
          organizerName: 'Marek',
          note: 'Zamówienia zbieramy do godziny 11:30.',
          allowNotes: false
        }).catch(console.error);
      }
    }, (error) => console.error("Session sync error:", error));

    // 2. Orders Listener (Public path)
    const ordersColRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubOrders = onSnapshot(ordersColRef, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setOrderItems(items);
    }, (error) => console.error("Orders sync error:", error));

    return () => {
      unsubSession();
      unsubOrders();
    };
  }, [user]);

  // Update session config in Firestore
  const handleUpdateSession = async (newSession) => {
    setSession(newSession);
    if (!user) return;
    try {
      const sessionDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'session');
      await setDoc(sessionDocRef, newSession, { merge: true });
    } catch (e) {
      console.error("Error updating session:", e);
    }
  };

  // Add dish for user in Firestore
  const handleAddItem = async (menuItem) => {
    if (!userName.trim()) {
      alert("Proszę najpierw podać swoje Imię i Nazwisko w polu zamawiającego!");
      return;
    }

    const boxFee = menuItem.requiresBox ? 1.50 : 0.00;
    const finalItemPrice = menuItem.price + boxFee;
    const itemId = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

    const newEntry = {
      code: menuItem.id,
      name: menuItem.name,
      person: userName.trim(),
      dishPrice: menuItem.price,
      boxPrice: boxFee,
      totalPrice: finalItemPrice,
      note: session.allowNotes ? customNote.trim() : '',
      paymentMethod: selectedPayment,
      isAddOn: session.status === 'add_on',
      timestamp: new Date().toISOString()
    };

    // Optimistic UI update
    setOrderItems(prev => [...prev, { id: itemId, ...newEntry }]);
    setCustomNote('');

    if (user) {
      try {
        const orderDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', itemId);
        await setDoc(orderDocRef, newEntry);
      } catch (err) {
        console.error("Error adding order:", err);
      }
    }
  };

  // Remove dish from Firestore
  const handleRemoveItem = async (id) => {
    setOrderItems(prev => prev.filter(item => item.id !== id));
    if (user) {
      try {
        const orderDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', id);
        await deleteDoc(orderDocRef);
      } catch (err) {
        console.error("Error deleting order:", err);
      }
    }
  };

  // Grouped breakdown by person
  const personBreakdown = orderItems.reduce((acc, item) => {
    if (!acc[item.person]) {
      acc[item.person] = {
        total: 0,
        itemsCount: 0,
        paymentMethod: item.paymentMethod || 'BLIK',
        dishList: []
      };
    }
    acc[item.person].total += item.totalPrice;
    acc[item.person].itemsCount += 1;
    acc[item.person].paymentMethod = item.paymentMethod;
    acc[item.person].dishList.push(item);
    return acc;
  }, {});

  // Grand total for restaurant
  const grandTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Aggregated breakdown for restaurant
  const aggregatedForRestaurant = orderItems.reduce((acc, item) => {
    const noteKey = session.allowNotes ? (item.note || '') : '';
    const key = `${item.code}_${item.name}_${noteKey}`;
    if (!acc[key]) {
      acc[key] = {
        code: item.code,
        name: item.name,
        note: noteKey,
        unitPrice: item.dishPrice,
        quantity: 0,
        totalPrice: 0
      };
    }
    acc[key].quantity += 1;
    acc[key].totalPrice += item.totalPrice;
    return acc;
  }, {});

  const restaurantSummaryList = Object.values(aggregatedForRestaurant);

  // Copy helpers
  const copyBlik = () => {
    navigator.clipboard.writeText(session.blikPhone);
    setCopiedBlik(true);
    setTimeout(() => setCopiedBlik(false), 2000);
  };

  // GENERATOR ZDJĘCIA MMS NA CANVAS
  const generateMmsImage = () => {
    setIsGeneratingImage(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Canvas dimensions
    const width = 800;
    const padding = 40;
    const rowHeight = 44;
    const headerHeight = 160;
    const footerHeight = 100;
    const totalRows = restaurantSummaryList.length;
    const height = headerHeight + (totalRows * rowHeight) + footerHeight + 40;

    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Outer Border
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Header Banner
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(padding, 30, width - (padding * 2), 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BAR MAI MAI (WRONKI) - ZAMÓWIENIE', width / 2, 68);

    // Subheader details
    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📅 Data/Godzina: ${session.date}, godz. ${session.deliveryTime}`, padding, 125);
    ctx.fillText(`📦 Łączna ilość pozycji: ${orderItems.length} szt.`, padding + 400, 125);

    // Table Header Background
    const tableTop = 150;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(padding, tableTop, width - (padding * 2), 36);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('ILOŚĆ', padding + 15, tableTop + 23);
    ctx.fillText('KOD', padding + 90, tableTop + 23);
    ctx.fillText('NAZWA DANIA', padding + 160, tableTop + 23);
    if (session.allowNotes) {
      ctx.fillText('UWAGI', padding + 520, tableTop + 23);
    }
    ctx.textAlign = 'right';
    ctx.fillText('KWOTA', width - padding - 15, tableTop + 23);

    // Table Rows
    let currentY = tableTop + 36;
    restaurantSummaryList.forEach((item, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#0f172a' : '#1e293b';
      ctx.fillRect(padding, currentY, width - (padding * 2), rowHeight);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, currentY + rowHeight);
      ctx.lineTo(width - padding, currentY + rowHeight);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.quantity}x`, padding + 15, currentY + 27);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`#${item.code}`, padding + 90, currentY + 27);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px sans-serif';
      let nameText = item.name;
      const maxNameLen = session.allowNotes ? 35 : 55;
      if (nameText.length > maxNameLen) nameText = nameText.substring(0, maxNameLen - 3) + '...';
      ctx.fillText(nameText, padding + 160, currentY + 27);

      if (session.allowNotes) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 12px sans-serif';
        let noteText = item.note || '-';
        if (noteText.length > 20) noteText = noteText.substring(0, 18) + '...';
        ctx.fillText(noteText, padding + 520, currentY + 27);
      }

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${item.totalPrice.toFixed(2)} zł`, width - padding - 15, currentY + 27);

      currentY += rowHeight;
    });

    currentY += 15;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(padding, currentY, width - (padding * 2), 60);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, currentY, width - (padding * 2), 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SUMA CAŁKOWITA ZAMÓWIENIA:', padding + 20, currentY + 36);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${grandTotal.toFixed(2)} PLN`, width - padding - 20, currentY + 38);

    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Zamowienie_MaiMai_${session.date.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      setIsGeneratingImage(false);
    }, 150);
  };

  // Menu Search Filter
  const filteredCategories = MENU_DATA.map(cat => {
    const items = cat.items.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, items };
  }).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <canvas ref={canvasRef} className="hidden" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-red-600 to-amber-500 p-2.5 rounded-2xl shadow-lg text-white">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Bar Mai Mai <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 font-semibold">Wronki</span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {session.date}, godz. {session.deliveryTime}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Smartphone className="w-3.5 h-3.5" /> BLIK: {session.blikPhone}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.status === 'open' && (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Otwarte
              </span>
            )}
            {session.status === 'add_on' && (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Domawianie
              </span>
            )}
            {session.status === 'closed' && (
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Zamknięte
              </span>
            )}

            <button
              onClick={() => setActiveTab(activeTab === 'order_view' ? 'admin_config' : 'order_view')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              {activeTab === 'order_view' ? 'Zarządzaj sesją' : 'Wróć do listy'}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-8">

        {/* ADMIN CONFIGURATION TAB */}
        {activeTab === 'admin_config' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" /> Konfiguracja Sesji (Organizator)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status Zamówienia</label>
                <select
                  value={session.status}
                  onChange={(e) => handleUpdateSession({ ...session, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="open">🟢 Otwarte na zamówienia</option>
                  <option value="add_on">🟡 Domawianie (Dodatkowa dogrywka)</option>
                  <option value="closed">🔴 Zamknięte (Brak zmian)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Dzień i Godzina Dostawy</label>
                <input
                  type="text"
                  value={session.deliveryTime}
                  onChange={(e) => handleUpdateSession({ ...session, deliveryTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Numer do BLIK</label>
                <input
                  type="text"
                  value={session.blikPhone}
                  onChange={(e) => handleUpdateSession({ ...session, blikPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Pozwalaj na Uwagi</label>
                <button
                  type="button"
                  onClick={() => handleUpdateSession({ ...session, allowNotes: !session.allowNotes })}
                  className={`w-full font-bold text-xs px-3 py-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    session.allowNotes 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  <span>{session.allowNotes ? '🟢 Uwagi WŁĄCZONE' : '🔴 Uwagi WYŁĄCZONE'}</span>
                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Przełącz</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('order_view')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Zapisz i zamknij
              </button>
            </div>
          </div>
        )}

        {/* --- DANE ZAMAWIAJĄCEGO I PŁATNOŚĆ --- */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Twoje Dane i Metoda Płatności</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Imię i Nazwisko zamawiającego *</label>
              <input
                type="text"
                placeholder="np. Jan Kowalski"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Forma Rozliczenia z Organizatorem</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPayment('BLIK')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                    selectedPayment === 'BLIK' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> BLIK
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayment('Revolut')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                    selectedPayment === 'Revolut' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Revolut
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayment('Gotówka')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                    selectedPayment === 'Gotówka' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" /> Gotówka
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Suma Twoich dań do przelewu:</span>
                <span className="text-xl font-black text-amber-400">
                  {userName.trim() && personBreakdown[userName.trim()]
                    ? `${personBreakdown[userName.trim()].total.toFixed(2)} PLN`
                    : '0.00 PLN'}
                </span>
              </div>

              {selectedPayment === 'BLIK' && (
                <button
                  onClick={copyBlik}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  {copiedBlik ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBlik ? 'Skopiowano' : `BLIK: ${session.blikPhone}`}
                </button>
              )}
            </div>
          </div>

          {session.allowNotes ? (
            <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Uwaga do kolejnego dania:</span>
              <input
                type="text"
                placeholder="np. bardzo pikantne, bez cebuli..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center gap-2 text-xs text-amber-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Organizator wyłączył możliwość dodawania uwag do dań dla tej sesji.</span>
            </div>
          )}
        </section>

        {/* --- MENU WYBORU DAŃ --- */}
        {session.status !== 'closed' ? (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Menu Bar Mai Mai</h2>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Szukaj po nazwie lub kodzie (np. 311)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {MENU_DATA.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.category
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.category}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCategories
                .filter(cat => searchQuery ? true : cat.category === selectedCategory)
                .map(cat => cat.items.map(item => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-xl flex flex-col justify-between space-y-2 group transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 border border-red-900/50 px-2 py-0.5 rounded">
                          #{item.id}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.weight}</span>
                      </div>
                      <h3 className="font-semibold text-sm text-slate-100 mt-1.5 group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                      <div>
                        <span className="text-base font-bold text-emerald-400">
                          {(item.price + (item.requiresBox ? 1.50 : 0)).toFixed(2)} zł
                        </span>
                        {item.requiresBox && (
                          <span className="block text-[10px] text-amber-500/80 font-medium">
                            (w tym +1,50 zł opakowanie)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddItem(item)}
                        className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" /> Dodaj
                      </button>
                    </div>
                  </div>
                )))}
            </div>
          </section>
        ) : (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-lg">Sesja zamawiania jest obecnie zamknięta</h3>
            <p className="text-xs text-rose-300 mt-1">Organizator zamknął opcję dodawania nowych pozycji do listy.</p>
          </div>
        )}

        {/* --- TABELA 1: SZCZEGÓŁOWA LISTA ZAMÓWIENIA --- */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" /> Tabela 1: Szczegółowa Lista Zamówień
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Widok z podziałem na osoby (Układ: Numer / Danie / Osoba / Kwota z opłatą 1,50 zł za opakowanie)
              </p>
            </div>
            <div className="text-xs text-slate-300 font-semibold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Suma wszystkich dań: <span className="text-emerald-400 font-bold">{grandTotal.toFixed(2)} zł</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-24">Numer</th>
                  <th className="py-3 px-4">Danie / Pozycja</th>
                  <th className="py-3 px-4">Osoba / Płatność</th>
                  <th className="py-3 px-4 text-right">Kwota</th>
                  <th className="py-3 px-4 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orderItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500 italic">
                      Brak pozycji w zamówieniu. Dodaj pierwsze danie z menu powyżej.
                    </td>
                  </tr>
                ) : (
                  orderItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        item.person === userName.trim() ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-red-400 whitespace-nowrap">
                        #{item.code}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        {session.allowNotes && item.note && (
                          <div className="text-[11px] text-amber-400 italic mt-0.5">
                            Uwaga: {item.note}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Danie: {item.dishPrice.toFixed(2)} zł</span>
                          {item.boxPrice > 0 && (
                            <span className="text-amber-500/90 font-medium">+ 1,50 zł opakowanie</span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-medium text-slate-300 whitespace-nowrap">
                        <div>{item.person}</div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">
                          [{item.paymentMethod}]
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-bold text-emerald-400 text-right whitespace-nowrap">
                        {item.totalPrice.toFixed(2)} zł
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded"
                          title="Usuń pozycję"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- TABELA 2: PODSUMOWANIE DLA RESTAURACJI + GENERATOR ZDJĘCIA MMS --- */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-red-500" /> Tabela 2: Podsumowanie dla Restauracji (MMS)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Zagregowana lista dań z ilościami gotowa do wygenerowania obrazka MMS
              </p>
            </div>

            <button
              onClick={generateMmsImage}
              disabled={orderItems.length === 0 || isGeneratingImage}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              {isGeneratingImage ? 'Generowanie zdjęcia...' : 'Pobierz zdjęcie MMS (PNG)'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16 text-center">Ilość</th>
                  <th className="py-3 px-4 w-24">Kod</th>
                  <th className="py-3 px-4">Nazwa Dania</th>
                  {session.allowNotes && <th className="py-3 px-4">Uwagi / Wytyczne</th>}
                  <th className="py-3 px-4 text-right">Suma kwota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {restaurantSummaryList.length === 0 ? (
                  <tr>
                    <td colSpan={session.allowNotes ? 5 : 4} className="text-center py-8 text-slate-500 italic">
                      Brak pozycji do wyświetlenia w tabeli restauracyjnej.
                    </td>
                  </tr>
                ) : (
                  restaurantSummaryList.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-center text-amber-400 text-sm">
                        {item.quantity}x
                      </td>

                      <td className="py-2.5 px-4 font-mono font-bold text-red-400 whitespace-nowrap">
                        #{item.code}
                      </td>

                      <td className="py-2.5 px-4 font-semibold text-slate-200">
                        {item.name}
                      </td>

                      {session.allowNotes && (
                        <td className="py-2.5 px-4 text-slate-400 italic">
                          {item.note || '-'}
                        </td>
                      )}

                      <td className="py-2.5 px-4 font-bold text-emerald-400 text-right whitespace-nowrap">
                        {item.totalPrice.toFixed(2)} zł
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950/90 font-bold border-t-2 border-slate-700 text-sm">
                  <td colSpan={session.allowNotes ? 4 : 3} className="py-3 px-4 text-right text-slate-300">
                    ŁĄCZNA KWOTA DLA BAR MAI MAI:
                  </td>
                  <td className="py-3 px-4 text-right text-amber-400 text-base">
                    {grandTotal.toFixed(2)} zł
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
