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
  Download
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
const APP_VERSION = "v1.6.1";

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
    userPin: '5678'
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
        const defaultSession = { isOpen: true, isExtraSession: false, deliveryDate: dateStr, deliveryTime: '12:00', userPin: '5678' };
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

    const unsubHistory = onSnapshot(collection(db, "
                                               
