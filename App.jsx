import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, doc, setDoc, query, updateDoc, increment } from 'firebase/firestore';
import { 
  BarChart3, Zap, FileSpreadsheet, Database, ArrowRight, CheckCircle2, 
  Mail, Linkedin, Menu, X, PieChart, TrendingUp, Activity, Sparkles, 
  Loader2, ShoppingBag, UserCheck, ArrowLeft, Settings, ShieldCheck, 
  Layers, Layout, AlertCircle, Timer, Send, Lock, Trash2, Calendar, Info, Gift, Star, Quote, ChevronDown, ChevronUp, MessageSquare, Target, Shield, Clock, Rocket, Flame, Minus, Plus, Wifi, WifiOff
} from 'lucide-react';

// --- 1. DONNÉES STATIQUES (DÉFINIES EN PREMIER POUR ÉVITER LES ERREURS DE RÉFÉRENCE) ---
const standardServices = [
  { id: 'r', title: "Rapprochement", description: "Identification automatique des écarts entre deux sources de données.", price: "16,20 €", delay: "5j max", icon: Layers, url: "https://comeup.com/fr/service/513295/comparer-vos-fichiers-ecarts-rapprochement" },
  { id: 'f', title: "Réparation", description: "Correction des erreurs structurelles et restauration de fichiers corrompus.", price: "16,20 €", delay: "5j max", icon: ShieldCheck, url: "https://comeup.com/fr/service/512808/corriger-vos-erreurs-et-reparer-vos-fichiers-excel" },
  { id: 'c', title: "Conversion PDF", description: "Extraction de données structurées depuis des documents PDF vers Excel.", price: "16,20 €", delay: "4j max", icon: FileSpreadsheet, url: "https://comeup.com/fr/service/512859/convertir-vos-fichiers-pdf-en-excel-et-automatiser-la-saisie-de-vos-donnees" },
  { id: 'd', title: "Dashboards", description: "Conception de tableaux de bord interactifs pour le pilotage d'activité.", price: "16,20 €", delay: "6j max", icon: PieChart, url: "https://comeup.com/fr/service/512699/creer-votre-dashboard-excel-automatise-et-sur-mesure" },
  { id: 'n', title: "Nettoyage", description: "Normalisation, dédoublonnage et fiabilisation de bases de données.", price: "16,20 €", delay: "4j max", icon: Database, url: "https://comeup.com/fr/service/512752/nettoyer-vos-bases-de-donnees-excel-suppression-doublons-normalisation" }
];

const expertiseCases = [
  { title: "Automatisation de Reporting", impact: "Gain de temps : 90%", description: "Transformation d'une saisie manuelle quotidienne pénible en un import automatisé via script VBA." },
  { title: "Consolidation Multibases", impact: "Erreur humaine : 0%", description: "Fusion intelligente de plusieurs fichiers hétérogènes en une base de données propre et structurée." },
  { title: "Interface de Saisie (ERP)", impact: "Confort utilisateur", description: "Création de formulaires personnalisés (UserForms) pour sécuriser et guider la saisie des collaborateurs." }
];

const methodology = [
  { title: "Analyse", content: "Étude approfondie de votre structure de données actuelle.", icon: Target },
  { title: "Sécurité", content: "Codes optimisés, sans virus, respectant la stricte confidentialité.", icon: Shield },
  { title: "Accompagnement", content: "Explications fournies pour une prise en main immédiate et autonome.", icon: UserCheck }
];

// --- 2. CONFIGURATION FIREBASE ---
// ÉTAPE CRUCIALE : Vous devez remplir ces valeurs avec vos vraies clés Firebase 
// pour que les boutons Admin fonctionnent sur votre site en ligne.
const firebaseConfig = {
  apiKey: "AIzaSyDCWwRpxGR5QqK-vjT-DzJavFoyJBJ7J8M",
  authDomain: "jcdatasolutions-745d2.firebaseapp.com",
  projectId: "jcdatasolutions-745d2",
  storageBucket: "jcdatasolutions-745d2.firebasestorage.app",
  messagingSenderId: "65737454350",
  appId: "1:65737454350:web:0364b0282b2579792e1d5f",
  measurementId: "G-KQM1VHWG84"
};


const app = (firebaseConfig.apiKey) ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'jc-data-solutions';

// --- 3. COMPOSANTS DE STRUCTURE ---

const ServiceCard = ({ icon: Icon, title, desc, onClick, color }) => (
  <div className={`p-8 rounded-3xl border border-${color}-100 bg-${color}-50/30 hover:bg-white hover:shadow-xl transition-all group text-left h-full flex flex-col`}>
    <div className={`mb-6 group-hover:scale-110 transition-transform text-${color}-500`}><Icon size={32} /></div>
    <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight uppercase italic">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow italic">{desc}</p>
    <button onClick={onClick} className={`flex items-center gap-2 text-${color}-600 font-bold text-xs uppercase tracking-widest`}>Découvrir <ArrowRight size={16} /></button>
  </div>
);

const DetailsTemplate = ({ title, subtitle, description, icon: Icon, examples, colorClass, goBack }) => (
  <div className="pt-48 pb-24 animate-in fade-in duration-700 bg-white min-h-screen text-slate-900 text-left italic">
    <div className="max-w-4xl mx-auto px-6">
      <button onClick={goBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm mb-12 group transition-all text-left">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
      </button>
      <div className="mb-16 text-left">
        <div className={`inline-flex items-center gap-2 px-3 py-3 rounded-2xl bg-${colorClass}-100 text-${colorClass}-700 mb-6`}><Icon size={40} /></div>
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight uppercase italic text-left">{String(title)} : <br/><span className={`text-${colorClass}-600`}>{String(subtitle)}</span></h1>
        <p className="text-xl text-slate-600 leading-relaxed italic text-left">{String(description)}</p>
      </div>
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white mb-12 shadow-2xl border border-white/5 text-left">
        <h2 className="text-3xl font-bold mb-12 text-center underline decoration-emerald-500 underline-offset-8 uppercase tracking-widest leading-loose italic text-white text-center">Cas d'Expertise</h2>
        <div className="space-y-16">
          {examples.map((ex, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-start text-left">
              <div className={`w-12 h-12 bg-${colorClass}-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-${colorClass}-900/20`}><Layout size={24} className="text-white" /></div>
              <div className="flex-1 text-left text-white text-left">
                <h4 className={`text-xl font-bold mb-3 text-${colorClass}-400 uppercase tracking-tighter italic text-left`}>{i + 1}. {String(ex.title)}</h4>
                <p className="text-slate-400 leading-relaxed mb-4 italic text-left text-slate-400">"{String(ex.context)}"</p>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-white text-left">
                  <span className={`text-${colorClass}-500 font-black block mb-2 uppercase text-xs tracking-widest italic`}>Approche Technique :</span>
                  <span className="text-slate-200 block leading-relaxed italic text-left">{String(ex.solution)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- 4. COMPOSANT PRINCIPAL ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('home'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiUsageCount, setAiUsageCount] = useState(0); 
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leads, setLeads] = useState([]);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentGiftCount, setCurrentGiftCount] = useState(3);
  const [dbStatus, setDbStatus] = useState('offline'); // 'offline', 'connected', 'error'

  const apiKey = ""; 

  // --- EFFETS ---

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  // Auth & Init
  useEffect(() => {
    if (!auth) return;
    const startAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {}
    };
    startAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setDbStatus('connected');
    });
    return () => unsub();
  }, []);

  // Sync Données (Bloqué par user pour éviter l'erreur 9)
  useEffect(() => {
    if (!user || !db) return;

    // Compteur Cadeau
    const settingsRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'site_stats', 'gift_counter');
    const unsubGift = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) setCurrentGiftCount(snap.data().count || 0);
      else setDoc(settingsRef, { count: 3 }, { merge: true }).catch(() => {});
    }, (err) => {
        setDbStatus('error');
        console.error("Firebase Error 9: Permissions or Config missing.");
    });

    // IA Usage
    const usageRef = doc(db, 'artifacts', currentAppId, 'users', user.uid, 'ai_stats', 'usage');
    const unsubAi = onSnapshot(usageRef, (snap) => {
      if (snap.exists()) setAiUsageCount(snap.data().count || 0);
      else setDoc(usageRef, { count: 0 }, { merge: true }).catch(() => {});
    }, (err) => {});

    return () => { unsubGift(); unsubAi(); };
  }, [user]);

  // Leads Admin
  useEffect(() => {
    if (!user || !db || currentPage !== 'admin' || !isAdminAuthenticated) return;
    const leadsRef = collection(db, 'artifacts', currentAppId, 'public', 'data', 'contact_requests');
    const unsubLeads = onSnapshot(query(leadsRef), (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLeads(data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    }, (err) => {});
    return () => unsubLeads();
  }, [user, currentPage, isAdminAuthenticated]);

  // --- ACTIONS ---

  const updateCounter = async (newVal) => {
    if (!isAdminAuthenticated || !db || !user) return;
    try {
        const giftRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'site_stats', 'gift_counter');
        await setDoc(giftRef, { count: newVal }, { merge: true });
    } catch (e) {
        console.error("Update failed", e);
    }
  };

  const navigateToSection = (sectionId) => {
    setIsMenuOpen(false);
    setIsSubmitted(false);
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150); 
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAiAction = async () => {
    if (!userInput.trim() || aiUsageCount >= 3) return;
    setIsLoading(true);
    setAiResult("");
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyse technique besoin Excel : ${userInput}` }] }],
          systemInstruction: { parts: [{ text: "Assistant expert VBA. Analyse pro du besoin. Explique que seul un audit humain de 15min peut valider le coût final." }] }
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur de réponse IA.";
      setAiResult(String(text));
      if (db && user) {
        const usageRef = doc(db, 'artifacts', currentAppId, 'users', user.uid, 'ai_stats', 'usage');
        await setDoc(usageRef, { count: increment(1), lastUsed: serverTimestamp() }, { merge: true });
      }
    } catch (err) { setAiResult("Une erreur est survenue."); }
    finally { setIsLoading(false); }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'artifacts', currentAppId, 'public', 'data', 'contact_requests'), { 
        ...contactForm, 
        timestamp: serverTimestamp(), 
        source: 'portfolio',
        isOfferEligible: currentGiftCount < 10 
      });
      const subject = encodeURIComponent(`[OFFRE 50 TEMPLATES] Projet de ${contactForm.name}`);
      const body = encodeURIComponent(`Message de ${contactForm.name} : \n\n${contactForm.message}`);
      window.location.href = `mailto:jc.data.solutions@outlook.fr?subject=${subject}&body=${body}`;
      setIsSubmitted(true);
    } catch (err) {}
    finally { setIsSending(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 text-left scroll-smooth">
      
      {/* 1. BANDEAU OFFRE FLASH (FIXED TOP-0) */}
      <div className="bg-emerald-600 text-white h-10 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] fixed top-0 w-full z-[100] flex items-center justify-center gap-3 shadow-lg">
        <Rocket size={14} className="animate-bounce" />
        <span>Offre de lancement : 50 templates VBA offerts aux 10 premiers clients !</span>
        <Flame size={14} className="text-amber-300 animate-pulse" />
      </div>

      {/* 2. NAVIGATION (FIXED TOP-10 = 40PX, RESTE SOUS LE BANDEAU) */}
      <nav className={`fixed w-full z-50 transition-all duration-300 top-10 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-slate-100' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-left">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <Database className="text-emerald-600 w-6 h-6" />
            <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">JC.DATA<span className="text-emerald-600">.SOLUTIONS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-bold">
            {['Services', 'Offres Express', 'Cas d\'Usage', 'Engagement', 'Contact'].map((n, i) => {
              const ids = ['services', 'express', 'expertise', 'methodology', 'contact'];
              return (
                <button key={i} onClick={() => navigateToSection(ids[i])} 
                  className={`${scrolled ? 'text-slate-900' : 'text-slate-600'} hover:text-emerald-600 transition-colors uppercase font-bold`}>
                  {n}
                </button>
              );
            })}
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 font-black uppercase text-xs tracking-widest">Audit IA ✨</button>
          </div>
          <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[110] bg-white p-8 flex flex-col gap-6 text-xl font-black uppercase italic">
            <button onClick={() => setIsMenuOpen(false)} className="self-end p-4 text-slate-900"><X size={32}/></button>
            {['Services', 'Offres Express', 'Cas d\'Usage', 'Engagement', 'Contact'].map((n, i) => (
                <button key={i} onClick={() => navigateToSection(['services', 'express', 'expertise', 'methodology', 'contact'][i])} className="text-left border-b border-slate-100 pb-4 text-slate-900">{n}</button>
            ))}
            <button onClick={() => { setIsMenuOpen(false); setIsModalOpen(true); }} className="bg-emerald-600 text-white p-6 rounded-2xl text-center shadow-xl">Audit IA ✨</button>
        </div>
      )}

      {currentPage === 'admin' ? (
        <div className="pt-48 pb-24 min-h-screen max-w-6xl mx-auto px-6 text-left">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs text-left"><ArrowLeft size={16} /> Retour site</button>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                Base Cloud : {dbStatus === 'connected' ? <span className="text-emerald-500 flex items-center gap-1 font-black"><Wifi size={14}/> Connectée</span> : <span className="text-red-500 flex items-center gap-1 font-black"><WifiOff size={14}/> En attente</span>}
            </div>
          </div>
          <h1 className="text-4xl font-black mb-8 italic uppercase text-slate-900 tracking-tighter text-left">Espace Admin</h1>
          {!isAdminAuthenticated ? (
            <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
              <Lock className="mx-auto mb-6 text-emerald-600" size={48} />
              <h2 className="text-2xl font-bold mb-6 italic uppercase text-slate-900 text-center">Accès Sécurisé</h2>
              <form onSubmit={(e) => { e.preventDefault(); if(adminPassword === "ADMIN123") setIsAdminAuthenticated(true); else alert("Code incorrect"); }} className="space-y-4 text-left">
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Code secret" className="w-full p-4 bg-slate-100 rounded-xl outline-none font-black italic text-slate-900" />
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase italic shadow-lg">Déverrouiller</button>
              </form>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl border border-white/5 text-left">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div>
                    <h3 className="text-emerald-400 font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2 text-left"><Gift size={16}/> Contrôle de l'Offre</h3>
                    <p className="text-slate-400 italic text-sm text-left">Ajustez le nombre de bénéficiaires manuellement.</p>
                  </div>
                  <div className="flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/10">
                    <button onClick={() => updateCounter(Math.max(0, currentGiftCount - 1))} className="w-12 h-12 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-all text-white"><Minus size={20}/></button>
                    <div className="text-4xl font-black italic w-20 text-center text-white">{currentGiftCount}<span className="text-slate-600 text-xl">/10</span></div>
                    <button onClick={() => updateCounter(Math.min(10, currentGiftCount + 1))} className="w-12 h-12 bg-white/10 hover:bg-emerald-500/20 rounded-full flex items-center justify-center transition-all text-white"><Plus size={20}/></button>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <h2 className="text-2xl font-bold uppercase italic text-left text-slate-900 flex items-center gap-3">Demandes Prospects <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs not-italic">{leads.length}</span></h2>
                <div className="grid gap-6 text-left">
                  {leads.map((l) => (
                    <div key={l.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left relative overflow-hidden">
                      {l.isOfferEligible && <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest text-white">Éligible Cadeau 🎁</div>}
                      <h3 className="text-xl font-bold italic text-slate-900">{String(l.name)}</h3>
                      <div className="text-emerald-600 text-sm mb-4 font-bold">{String(l.email)}</div>
                      <p className="text-slate-600 bg-slate-50 p-4 rounded-xl italic leading-relaxed text-left text-slate-600">"{String(l.message)}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        currentPage === 'home' ? (
          <>
            {/* HERO */}
            <section className="relative pt-64 pb-20 lg:pt-80 lg:pb-32 overflow-hidden bg-white text-left">
              <div className="absolute top-0 right-0 -z-10 opacity-5 translate-x-1/4 -translate-y-1/4 text-emerald-600"><FileSpreadsheet size={600} /></div>
              <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center text-left text-slate-900">
                <div className="text-left text-slate-900">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-200 italic shadow-sm text-left">
                    <Gift size={12} /> Pack Cadeau Dispo ({currentGiftCount}/10)
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8 font-black uppercase tracking-tight italic text-slate-900 text-left">Libérez la puissance de vos données <span className="text-emerald-600">Excel</span></h1>
                  <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl italic text-left">Expert en automatisation VBA & IA. Je transforme vos classeurs rigides en outils métier intelligents et automatisés.</p>
                  <div className="flex flex-col gap-4 items-start text-left">
                    <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg inline-flex items-center gap-2 uppercase tracking-tight italic text-lg tracking-widest text-left font-black">Analyser mon projet (IA) ✨</button>
                    <p className="text-slate-400 text-xs italic ml-2 max-w-md text-left leading-relaxed">Obtenez instantanément une stratégie technique et une estimation de faisabilité pour vos besoins d'automatisation.</p>
                  </div>
                </div>
                <div className="hidden lg:block text-center text-slate-900">
                   <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 transform rotate-2 inline-block">
                    <div className="grid grid-cols-2 gap-4 text-slate-900">
                      <div className="bg-emerald-50 rounded-2xl p-6 text-center text-slate-900">
                        <Clock className="text-emerald-600 w-6 h-6 mb-2 mx-auto" />
                        <div className="text-2xl font-black italic text-emerald-900">-95%</div>
                        <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-tighter">Temps manuel</div>
                      </div>
                      <div className="bg-slate-900 rounded-2xl p-6 text-white text-center text-white">
                        <ShieldCheck className="text-emerald-400 w-6 h-6 mb-2 mx-auto" />
                        <div className="text-2xl font-black italic text-emerald-400 text-center">100%</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic text-center text-white text-center font-black">Données Fiables</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="py-24 bg-slate-50 scroll-mt-20 text-left text-slate-900">
              <div className="max-w-7xl mx-auto px-6 text-left text-slate-900">
                <div className="max-w-2xl mb-16 border-l-4 border-emerald-600 pl-8 text-left text-slate-900">
                  <h2 className="text-base font-bold text-emerald-600 uppercase tracking-widest mb-3 italic text-left text-emerald-600">Domaines d'Intervention</h2>
                  <p className="text-3xl lg:text-4xl font-bold italic text-slate-900 text-left text-left text-slate-900">Solutions d'ingénierie Excel <span className="whitespace-nowrap italic text-slate-900 font-black">sur-mesure.</span></p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-slate-900">
                  <ServiceCard icon={Zap} title="VBA & Macros" desc="Suppression complète des tâches répétitives et manuelles via programmation." onClick={() => setCurrentPage('details-automation')} color="emerald" />
                  <ServiceCard icon={BarChart3} title="Dashboards" desc="Conception de tableaux de bord dynamiques et visuels pour vos KPI." onClick={() => setCurrentPage('details-dashboards')} color="blue" />
                  <ServiceCard icon={Database} title="Data Management" desc="Power Query, structuration et nettoyage rigoureux de bases complexes." onClick={() => setCurrentPage('details-data')} color="indigo" />
                  <ServiceCard icon={Settings} title="Outils Métier" desc="Applications Excel personnalisées avec interfaces de saisie dédiées." onClick={() => setCurrentPage('details-tools')} color="amber" />
                </div>
              </div>
            </section>

            {/* EXPRESS */}
            <section id="express" className="py-24 bg-slate-900 overflow-hidden relative scroll-mt-20 text-white text-left text-white">
              <div className="max-w-7xl mx-auto px-6 relative z-10 text-left text-white text-left text-white">
                <div className="mb-16 text-white text-left text-white">
                  <div className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-6 animate-pulse italic text-left text-slate-900"><Timer size={14} /> Livraison express disponible</div>
                  <h2 className="text-base font-bold text-amber-400 uppercase tracking-widest mb-3 italic text-left text-amber-400 text-left text-amber-400 font-black">Forfaits d'Intervention</h2>
                  <p className="text-3xl lg:text-5xl font-black mb-6 uppercase tracking-tighter italic text-left text-white text-left text-white">Solutions Prêtes à l'Emploi</p>
                  <p className="text-slate-400 max-w-2xl border-l-4 border-amber-400 pl-6 text-left italic leading-relaxed text-white text-left font-bold text-white">Pour des besoins ciblés et urgents, j'ai standardisé ces prestations sur la plateforme de confiance ComeUp.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 text-slate-900">
                  {standardServices.map((s) => (
                    <div key={s.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col hover:bg-white/10 transition-all group text-left text-white text-left text-white">
                      <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-500 text-[10px] px-3 py-1 rounded-bl-2xl font-black italic">{s.delay}</div>
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform"><s.icon size={24} /></div>
                      <h3 className="text-lg font-bold text-white mb-3 leading-tight uppercase italic text-left text-white font-black">{String(s.title)}</h3>
                      <p className="text-slate-400 text-xs mb-6 leading-relaxed italic text-left text-white/70">{String(s.description)}</p>
                      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-white">
                        <div className="text-xs text-white/50 italic text-left text-white">Forfait dès <span className="block text-lg font-black text-amber-400 uppercase tracking-tighter text-left text-white font-black">{String(s.price)}</span></div>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 shadow-lg hover:scale-110 transition-all text-slate-900 text-white"><ShoppingBag size={20} /></a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* EXPERTISE */}
            <section id="expertise" className="py-24 bg-white scroll-mt-20 text-left text-slate-900 text-left">
              <div className="max-w-7xl mx-auto px-6 text-left text-slate-900 text-left text-slate-900 text-left text-slate-900">
                <div className="mb-16 border-l-4 border-emerald-600 pl-8 text-left text-slate-900 text-left text-slate-900 text-left text-slate-900">
                  <h2 className="text-base font-bold text-emerald-600 uppercase tracking-widest mb-3 italic text-left text-emerald-600 text-left text-left text-left text-emerald-600 text-left text-emerald-600 font-black">Cas d'Usage</h2>
                  <p className="text-3xl lg:text-4xl font-bold italic text-slate-900 text-left text-left text-left text-slate-900 text-left text-slate-900 font-black">Démonstration d'Expertise</p>
                  <p className="text-slate-500 mt-4 italic max-w-2xl text-left text-slate-600 leading-relaxed italic text-left text-left text-left text-left font-black text-slate-500 text-left text-slate-500 font-black">Scénarios types de transformation de problématiques métier en solutions techniques performantes.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-left text-white text-left">
                  {expertiseCases.map((p, i) => (
                    <div key={i} className="bg-slate-50 rounded-[2.5rem] shadow-sm border border-slate-100 p-10 hover:shadow-xl transition-all group text-left text-slate-900 text-left text-slate-900">
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase mb-4 tracking-tighter italic text-left text-emerald-600 text-left text-emerald-600 font-black"><CheckCircle2 size={16} /> {String(p.impact)}</div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-600 transition-colors uppercase italic tracking-tighter text-left text-slate-900 text-left text-slate-900 font-black">{String(p.title)}</h3>
                      <p className="text-slate-600 leading-relaxed italic text-sm text-left text-slate-600 text-left text-slate-600 font-black">"{String(p.description)}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ENGAGEMENT */}
            <section id="methodology" className="py-24 bg-emerald-600 text-white relative italic text-center scroll-mt-20 text-white text-center">
               <div className="absolute top-0 left-0 p-12 opacity-10 text-white text-left text-white text-left text-white"><Quote size={120} /></div>
               <div className="max-w-7xl mx-auto px-6 relative z-10 text-center text-white text-center text-center text-white text-center text-white text-center text-white">
                 <div className="mb-16 text-center text-white text-center text-center text-white text-center text-white text-center text-white text-center text-white">
                    <h2 className="text-base font-bold text-emerald-100 uppercase tracking-widest mb-3 italic text-center text-emerald-100 text-center font-black text-emerald-100 text-center">Valeurs</h2>
                    <p className="text-3xl lg:text-5xl font-black italic tracking-tight uppercase text-center text-white text-center text-white text-center text-white font-black">Engagement & Qualité</p>
                 </div>
                 <div className="grid md:grid-cols-3 gap-8 text-white text-left text-white text-left text-white">
                    {methodology.map((m, i) => (
                      <div key={i} className="bg-white rounded-[2.5rem] p-10 shadow-2xl transform hover:-translate-y-2 transition-all text-slate-900 text-center flex flex-col items-center justify-center text-left text-slate-900 text-left text-slate-900">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm text-emerald-600 text-center text-emerald-600"><m.icon size={32} /></div>
                        <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter mb-4 italic text-center text-slate-900 text-center font-black">{String(m.title)}</h3>
                        <p className="text-slate-600 italic text-sm leading-relaxed text-center text-slate-600 text-center text-slate-600 font-black">"{String(m.content)}"</p>
                      </div>
                    ))}
                 </div>
               </div>
            </section>
          </>
        ) : (
          currentPage.startsWith('details') && (
            <DetailsTemplate 
                title={currentPage === 'details-automation' ? "Expertise VBA" : currentPage === 'details-dashboards' ? "Dashboards" : currentPage === 'details-data' ? "Gestion Data" : "Logiciels Dédiés"}
                subtitle="Ingénierie de données."
                description="Analyse et automatisation algorithmique pour vos flux de données Excel complexes."
                icon={currentPage === 'details-automation' ? Zap : currentPage === 'details-dashboards' ? BarChart3 : currentPage === 'details-data' ? Database : Settings}
                colorClass={currentPage === 'details-automation' ? "emerald" : currentPage === 'details-dashboards' ? "blue" : currentPage === 'details-data' ? "indigo" : "amber"}
                examples={[{ title: "Cas n°1", context: "Processus manuel répétitif de 4h/jour.", solution: "Automatisation via script VBA réduisant le temps à 2 minutes." }, { title: "Cas n°2", context: "Données corrompues ou mal formatées.", solution: "Mise en place d'un tunnel de nettoyage via Power Query." }]}
                goBack={() => setCurrentPage('home')}
            />
          )
        )
      )}

      {/* FOOTER */}
      <footer id="contact" className="py-24 bg-slate-900 text-white text-left italic text-white text-left text-white">
        <div className="max-w-7xl mx-auto px-6 text-left text-white text-left text-white">
          <div className="grid md:grid-cols-2 gap-16 mb-20 text-left text-white text-left text-white text-left text-white">
            <div className="text-left text-white text-left text-left text-white text-left text-white">
              <h2 className="text-4xl font-bold mb-6 tracking-tight font-black uppercase leading-tight italic text-left text-white text-left text-white font-black text-white">Optimisez votre gestion. <br/><span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8 italic text-left text-emerald-500 text-left text-emerald-500 text-left text-emerald-500 font-black">Commencez dès aujourd'hui.</span></h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-12 text-white italic text-left text-left text-left text-white text-left text-white">
                <a href="mailto:jc.data.solutions@outlook.fr" className="bg-white/5 p-6 rounded-2xl hover:bg-emerald-600 transition-all border border-white/5 group shadow-xl text-left text-white text-left text-white text-left text-white text-white">
                    <Mail className="mb-4 text-emerald-400 group-hover:text-white text-emerald-400" />
                    <div className="truncate text-xs font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 text-white font-black text-left text-white text-left text-white font-black text-white">Email</div>
                    <div className="truncate text-sm font-black text-white font-black text-left text-white font-black text-white text-white font-black">jc.data.solutions@outlook.fr</div>
                </a>
                <a href="https://www.linkedin.com/in/j%C3%A9r%C3%B4me-cassier-511601324/" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-blue-700 transition-all border border-white/5 group shadow-xl text-left text-white text-left text-white text-left text-white font-black text-white">
                    <Linkedin className="mb-4 text-blue-400 group-hover:text-white text-blue-400 text-blue-400" />
                    <div className="text-xs font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 text-white font-black text-left text-white font-black text-left text-white text-white font-black">LinkedIn</div>
                    <div className="text-sm font-black uppercase tracking-tighter italic text-white font-black text-left text-white font-black text-left text-white text-white font-black">Profil Pro</div>
                </a>
                <a href="https://comeup.com/fr/@jerome-cassier" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-amber-500 transition-all border border-white/5 group shadow-lg text-left text-white text-left text-white text-left text-white text-white">
                    <ShoppingBag className="mb-4 text-amber-500 group-hover:text-white text-amber-500 text-amber-500" />
                    <div className="text-xs font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 text-white uppercase font-black text-left text-white font-black text-left text-white text-white font-black">Prestations</div>
                    <div className="text-sm font-black italic uppercase text-white font-black text-white text-left font-black text-left text-white text-white text-white font-black">Profil ComeUp</div>
                </a>
                <a href="https://www.malt.fr/profile/jeromecassier" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-red-600 transition-all border border-white/5 group shadow-lg text-left text-white text-left text-white text-left text-white text-left text-white text-white">
                    <UserCheck className="mb-4 text-red-500 group-hover:text-white text-red-500 text-red-500" />
                    <div className="text-xs font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 text-white uppercase font-black text-left text-white font-black text-left text-left text-white text-left text-white text-white font-black">Indépendant</div>
                    <div className="text-sm font-black uppercase tracking-tighter text-white font-black text-white text-left font-black text-left text-white text-white text-white font-black">Profil Malt</div>
                </a>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-slate-900 text-left italic text-slate-900 text-left text-left text-slate-900 text-left text-left font-black text-slate-900 text-left text-slate-900">
              {isSubmitted ? (
                <div className="text-center py-8 text-slate-900 text-center text-left text-center text-center text-slate-900 text-center text-slate-900 text-center text-slate-900">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-center text-emerald-600 text-left text-left text-center text-emerald-600 text-center text-emerald-600"><CheckCircle2 size={40} /></div>
                  <h3 className="text-2xl font-bold mb-4 font-black uppercase tracking-tight italic text-slate-900 text-center text-slate-900 text-center text-left text-slate-900 text-center text-left font-black text-slate-900 text-center text-slate-900 font-black">Demande reçue !</h3>
                  <p className="text-slate-500 text-sm text-center italic text-center text-slate-500 text-center text-center text-center font-black text-slate-500 text-center text-slate-500 font-black text-slate-500">Réponse sous 24h maximum.</p>
                  <button onClick={() => setIsSubmitted(false)} className="mt-8 text-emerald-600 font-bold hover:underline italic uppercase tracking-widest text-xs italic text-center block w-full text-center font-black text-emerald-600 text-center text-emerald-600 font-black text-emerald-600">Envoyer un autre message</button>
                </div>
              ) : (
                <form className="space-y-4 text-left text-slate-900 text-left text-left text-left text-left text-left text-left text-left text-left text-slate-900 font-black text-slate-900 text-left text-slate-900 font-black" onSubmit={handleContactSubmit}>
                  <h3 className="text-2xl font-bold mb-8 font-black tracking-tight text-left uppercase italic text-slate-900 italic underline decoration-emerald-500/20 text-left text-left text-left text-left text-left text-left font-black text-slate-900 text-left text-slate-900 font-black text-slate-900">Demander un audit gratuit</h3>
                  <input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 font-bold italic text-left text-slate-900 text-left font-black text-slate-900 text-left text-slate-900 font-black text-slate-900" placeholder="Nom complet" />
                  <input required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 font-bold italic text-left text-slate-900 text-left font-black text-slate-900 text-left text-slate-900 font-black text-slate-900" placeholder="Email professionnel" />
                  <textarea required value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} rows="4" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 font-bold italic text-left text-slate-900 text-left font-black text-slate-900 text-left text-slate-900 font-black text-slate-900" placeholder="Décrivez votre besoin métier..."></textarea>
                  <button type="submit" disabled={isSending} className="w-full bg-emerald-600 text-white font-black py-5 rounded-xl hover:bg-emerald-700 shadow-xl transition-all flex items-center justify-center gap-3 italic uppercase tracking-tighter text-white text-left text-white font-black text-white text-white font-black text-white">
                    {isSending ? <Loader2 className="animate-spin text-white text-white text-white font-black" /> : <><Send size={20} /> Valider ma demande</>}
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex items-center justify-between text-white text-xs text-left text-white text-left text-left text-left text-left text-white font-black text-white text-left text-white font-black">
            <div className="flex items-center gap-2 text-left text-white text-white text-left text-white">
              <Database className="text-emerald-500 w-5 h-5 text-left text-emerald-500 text-left text-left text-emerald-500 text-left text-emerald-500 text-left text-emerald-500" />
              <span className="font-black text-white uppercase italic tracking-tighter text-left text-white text-left text-white text-left text-white text-left text-white text-left text-white font-black text-white">JC.DATA<span className="text-emerald-600">.SOLUTIONS</span></span>
              
              {/* BOUTON ADMIN AMBER (JAUNE) */}
              <button onClick={() => setCurrentPage('admin')} 
                className="ml-4 p-2 bg-white/5 border border-amber-400/30 rounded-lg text-amber-400 hover:bg-amber-400 hover:text-slate-900 transition-all shadow-lg text-amber-400 text-left text-amber-400 font-black">
                <Lock size={16} />
              </button>
            </div>
            <p className="italic uppercase tracking-widest text-[9px] italic font-bold text-left text-white font-black text-left text-white text-white text-left text-white text-left text-white text-left text-white font-black text-white">© {new Date().getFullYear()} - Expert Automation & Intelligence de Données.</p>
          </div>
        </div>
      </footer>

      {/* IA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-900 italic text-left text-left text-slate-900 text-slate-900 text-left text-slate-900 text-slate-900">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 text-slate-900 text-slate-900 text-left text-slate-900 text-slate-900">
              <div className="text-left text-slate-900 text-left text-left text-left font-black text-slate-900 text-left text-slate-900">
                <h3 className="text-2xl font-bold flex items-center gap-2 font-black tracking-tight uppercase italic text-left text-slate-900 text-left text-left text-left text-slate-900 text-left text-left text-left text-slate-900 text-left text-slate-900 text-left text-slate-900 font-black text-slate-900"><Sparkles className="text-emerald-600 text-left text-emerald-600 text-left text-left font-black text-emerald-600 text-left text-emerald-600 font-black" /> Pré-Diagnostic IA ✨</h3>
                <div className="flex items-center gap-2 mt-1 text-left text-left text-slate-200 text-left text-left text-slate-200 text-left text-slate-200 text-left text-slate-200">
                  <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden text-left text-left text-slate-200 text-left text-slate-200 text-left text-slate-200">
                    <div className="h-full bg-emerald-500 transition-all duration-700 text-left text-left text-emerald-500 text-left text-emerald-500 font-black" style={{ width: `${(Number(aiUsageCount)/3)*100}%` }}></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left italic text-left text-left text-left text-slate-400 text-slate-400 text-left text-slate-400 font-black">{aiUsageCount}/3 diagnostics gratuits</span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors text-left text-left text-left text-left font-black text-slate-400 text-slate-400 text-left text-slate-400 font-black"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto text-left italic text-slate-900 text-left text-left text-left text-left text-left text-left text-slate-900 font-black text-slate-900 text-left text-slate-900 font-black">
              {!aiResult ? (
                aiUsageCount >= 3 ? (
                  <div className="text-center py-6 animate-in zoom-in duration-500 text-slate-900 text-center text-left text-left text-slate-900 text-left text-left font-black text-center flex flex-col items-center text-slate-900 text-center text-slate-900 text-center text-slate-900">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner text-amber-600 text-center flex items-center justify-center text-center text-left text-left font-black text-amber-600 text-center text-amber-600 font-black"><Gift size={40} /></div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight text-center italic uppercase text-center text-slate-900 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-slate-900 text-center text-slate-900 font-black text-slate-900">L'IA a ses limites 🚀</h3>
                    <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg leading-relaxed text-center italic font-bold text-center text-slate-600 text-left text-left text-left text-left text-left font-black text-slate-600 text-center text-slate-600 font-black leading-relaxed text-slate-600">Votre projet mérite une expertise humaine directe.</p>
                    <button onClick={() => { setIsModalOpen(false); navigateToSection('contact'); }} className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 w-full uppercase tracking-tighter text-white text-left text-left font-black text-center text-white text-center text-white font-black text-center font-black text-white">Réserver mon audit gratuit <ArrowRight /></button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left text-slate-900 text-left text-left text-slate-900 text-left text-left text-left text-left text-left text-slate-900 text-left font-black text-slate-900 text-slate-900 text-left text-slate-900 font-black text-slate-900 text-slate-900 text-left text-slate-900">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 italic text-emerald-600 text-left text-left text-left text-left text-left font-black text-emerald-600 text-emerald-600 text-left text-emerald-600 font-black text-emerald-600 text-emerald-600"><Info size={14}/> Décrivez votre flux de travail actuel</div>
                    <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-lg min-h-[160px] text-left italic text-slate-900 text-left text-left text-left text-left text-left font-black text-slate-900 text-slate-900 text-left text-slate-900 font-black text-slate-900 leading-relaxed font-black text-slate-900" placeholder="Ex: Chaque lundi, je fusionne 10 fichiers..."></textarea>
                    <button onClick={handleAiAction} disabled={isLoading || !userInput.trim()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-lg uppercase tracking-tighter italic text-white text-white text-left font-black text-center text-white text-center text-white font-black text-center font-black text-white">
                      {isLoading ? <Loader2 className="animate-spin text-white text-white text-white font-black text-white" /> : <><Sparkles size={20} /> Analyser mon besoin</>}
                    </button>
                  </div>
                )
              ) : (
                <div className="space-y-6 text-left text-slate-900 text-left text-left text-slate-900 text-left text-left text-left text-left text-left text-slate-900 text-left font-black text-slate-900 text-slate-900 text-left text-slate-900 font-black text-slate-900 text-slate-900">
                  <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 whitespace-pre-wrap leading-relaxed text-left shadow-sm text-sm italic text-slate-800 text-left text-left text-left text-left text-emerald-700 text-left text-left text-left text-left text-emerald-700 text-left text-left text-left text-left text-emerald-700 text-left text-left text-left text-left text-left text-left text-left font-black text-emerald-700 text-left text-emerald-700 font-black leading-relaxed text-emerald-600 font-black">
                    <div className="text-emerald-700 font-bold mb-4 flex items-center gap-2 border-b border-emerald-100 pb-2 uppercase text-xs tracking-widest not-italic italic underline decoration-emerald-200 italic font-black text-left text-emerald-700 text-left text-left text-left text-left text-emerald-700 text-left text-left text-left text-left text-emerald-700 text-left text-left text-left text-left text-left text-left text-left font-black text-emerald-700 text-left text-emerald-700 font-black font-black text-emerald-700"><Sparkles size={14}/> Analyse Préliminaire</div>
                    {String(aiResult)}
                  </div>
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl text-left text-white text-left text-left text-left text-left text-left text-left text-left text-left text-white text-left text-left text-left text-left text-left text-left text-left font-black text-white text-white text-left text-white font-black text-white font-black text-white">
                    <div className="flex-1 text-left text-white text-left text-left text-left text-left text-white text-left text-left text-left text-left text-white text-left text-left text-left text-left text-white text-left text-white text-left text-left font-black text-white text-left text-white font-black leading-tight text-white text-white text-left text-white">
                        <div className="text-emerald-400 font-black uppercase text-xs tracking-widest mb-1 italic text-left text-emerald-400 font-black text-left text-left text-left text-left text-emerald-400 text-left text-left text-left text-left font-black text-emerald-400 text-left text-emerald-400 font-black font-black text-emerald-400">Valider cette analyse ?</div>
                        <p className="text-xs text-slate-400 italic leading-relaxed text-left text-slate-400 text-left text-left text-left text-left text-left text-left text-left text-slate-400 text-left text-left text-left text-left text-left text-left text-left text-slate-400 text-left text-left text-left text-left text-left text-left text-left text-slate-400 font-black text-slate-400 text-left text-slate-400 font-black text-white text-slate-400">Échangeons 15 minutes pour confirmer le budget et la faisabilité.</p>
                    </div>
                    <button onClick={() => { setIsModalOpen(false); navigateToSection('contact'); }} className="bg-emerald-600 text-white px-6 py-4 rounded-xl font-black text-sm uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all whitespace-nowrap italic text-white text-left text-left text-left text-left text-left text-left text-left text-left font-black text-center text-white text-center text-white font-black text-center font-black text-white"><MessageSquare size={16}/> Demander mon audit <ArrowRight size={16}/></button>
                  </div>
                  <button onClick={() => setAiResult("")} className="w-full py-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors italic underline italic text-center block w-full text-slate-400 text-left text-left text-left text-left text-left text-slate-400 text-left text-left text-left text-left text-left font-black text-center text-slate-400 text-center text-slate-400 font-black font-black text-slate-400">Autre analyse ({3 - aiUsageCount} restantes)</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
