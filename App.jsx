import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, doc, setDoc, query, updateDoc, increment } from 'firebase/firestore';
import { 
  BarChart3, Zap, FileSpreadsheet, Database, ArrowRight, CheckCircle2, 
  Mail, Linkedin, Menu, X, PieChart, TrendingUp, Activity, Sparkles, 
  Loader2, ShoppingBag, UserCheck, ArrowLeft, Settings, ShieldCheck, 
  Layers, Layout, AlertCircle, Timer, Send, Lock, Trash2, Calendar, Info, Gift
} from 'lucide-react';

// --- CONFIGURATION FIREBASE ---
const getFirebaseServices = () => {
  try {
    const configRaw = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
    if (!configRaw) return { app: null, auth: null, db: null };
    const firebaseConfig = JSON.parse(configRaw);
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  } catch (e) {
    return { app: null, auth: null, db: null };
  }
};

const { auth, db } = getFirebaseServices();
const appId = typeof __app_id !== 'undefined' ? __app_id : 'jc-data-solutions';

// --- DONNÉES DES SERVICES ET PORTFOLIO ---
const comeupServices = [
  { id: 'r', title: "Rapprochement", description: "Identifier les écarts entre fichiers automatiquement.", price: "16,20 €", icon: Layers, url: "https://comeup.com/fr/service/513295/comparer-vos-fichiers-excel-et-identifier-les-ecarts-rapprochement" },
  { id: 'f', title: "Réparation", description: "Corriger les erreurs et restaurer vos fichiers corrompus.", price: "16,20 €", icon: ShieldCheck, url: "https://comeup.com/fr/service/512808/corriger-vos-erreurs-et-reparer-vos-fichiers-excel" },
  { id: 'c', title: "Conversion PDF", description: "Convertir vos PDF complexes en données Excel structurées.", price: "16,20 €", icon: FileSpreadsheet, url: "https://comeup.com/fr/service/512859/convertir-vos-fichiers-pdf-en-excel-et-automatiser-la-saisie-de-vos-donnees" },
  { id: 'd', title: "Dashboards", description: "Conception de tableaux de bord visuels et automatisés.", price: "16,20 €", icon: PieChart, url: "https://comeup.com/fr/service/512699/creer-votre-dashboard-excel-automatise-et-sur-mesure" },
  { id: 'n', title: "Nettoyage", description: "Suppression de doublons et normalisation de bases de données.", price: "16,20 €", icon: Database, url: "https://comeup.com/fr/service/512752/nettoyer-vos-bases-de-donnees-excel-suppression-doublons-normalisation" }
];

const projects = [
  { title: "Automatisation RH", impact: "Gain de 12h/semaine", description: "Suivi des congés et rapports PDF automatiques via macros VBA." },
  { title: "Dashboard Financier", impact: "Précision de 100%", description: "Consolidation de 5 filiales internationales avec mise à jour en temps réel." },
  { title: "Outil de Pricing", impact: "+15% de réactivité", description: "Calculateur de devis intelligent avec interface de saisie sécurisée." }
];

const App = () => {
  const [currentPage, setCurrentPage] = useState('home'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState('audit');
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

  const apiKey = ""; 

  // Authentification
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {}
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Compteur IA Cloud
  useEffect(() => {
    if (!user || !db) return;
    const usageDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'stats', 'ai_usage');
    const unsubscribe = onSnapshot(usageDocRef, (docSnap) => {
      if (docSnap.exists()) setAiUsageCount(docSnap.data().count || 0);
      else setDoc(usageDocRef, { count: 0 }, { merge: true });
    });
    return () => unsubscribe();
  }, [user]);

  // Récupération Admin
  useEffect(() => {
    if (!user || !db || currentPage !== 'admin') return;
    const contactsRef = collection(db, 'artifacts', appId, 'public', 'data', 'contact_requests');
    const unsubscribe = onSnapshot(query(contactsRef), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    });
    return () => unsubscribe();
  }, [user, currentPage]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          contents: [{ parts: [{ text: `Analyse technique pour : ${userInput}` }] }],
          systemInstruction: { parts: [{ text: "Expert Excel VBA senior. Stratégie d'automatisation. Français." }] }
        })
      });
      const data = await response.json();
      setAiResult(data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur");
      if (db && user) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'stats', 'ai_usage'), { count: increment(1), lastUsed: serverTimestamp() });
      }
    } catch (err) { setAiResult("Une erreur est survenue."); }
    finally { setIsLoading(false); }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'contact_requests'), { ...contactForm, timestamp: serverTimestamp(), source: 'portfolio' });
      const subject = encodeURIComponent(`[Audit] Projet de ${contactForm.name}`);
      const body = encodeURIComponent(`Nouveau message :\n\n${contactForm.message}`);
      window.location.href = `mailto:jc.data.solutions@outlook.fr?subject=${subject}&body=${body}`;
      setIsSubmitted(true);
    } catch (err) {}
    finally { setIsSending(false); }
  };

  const ServiceCard = ({ icon: Icon, title, desc, onClick, color }) => (
    <div className={`p-8 rounded-3xl border border-${color}-100 bg-${color}-50/30 hover:bg-white hover:shadow-xl transition-all group text-left flex flex-col h-full`}>
      <div className={`mb-6 group-hover:scale-110 transition-transform text-${color}-500`}><Icon size={32} /></div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">{desc}</p>
      <button onClick={onClick} className={`flex items-center gap-2 text-${color}-600 font-bold text-xs uppercase tracking-widest`}>Découvrir <ArrowRight size={16} /></button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <Database className="text-emerald-600 w-6 h-6" />
            <span className="text-xl font-black tracking-tighter uppercase italic">JC.DATA<span className="text-emerald-600">.SOLUTIONS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            {['Services', 'Micro-Services', 'Réalisations', 'Contact'].map((n, i) => (
              <button key={i} onClick={() => navigateToSection(['services', 'comeup', 'portfolio', 'contact'][i])} className="text-slate-600 hover:text-emerald-600 transition-colors font-bold uppercase tracking-tight">{n}</button>
            ))}
            <button onClick={() => { setAiMode('audit'); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 font-black">Audit IA ✨</button>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t p-6 flex flex-col gap-4 shadow-xl">
             {['Services', 'Micro-Services', 'Réalisations', 'Contact'].map((n, i) => (
              <button key={i} onClick={() => navigateToSection(['services', 'comeup', 'portfolio', 'contact'][i])} className="text-left py-2 font-bold border-b border-slate-50">{n}</button>
            ))}
            <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="bg-emerald-600 text-white py-4 rounded-xl font-black mt-2">Audit IA ✨</button>
          </div>
        )}
      </nav>

      {currentPage === 'admin' ? (
        <div className="pt-32 pb-24 min-h-screen max-w-6xl mx-auto px-6 text-left">
          <button onClick={() => setCurrentPage('home')} className="mb-8 flex items-center gap-2 text-slate-500 font-bold"><ArrowLeft size={16} /> Retour site</button>
          <h1 className="text-4xl font-black mb-8 italic uppercase">Tableau de Bord Admin</h1>
          {!isAdminAuthenticated ? (
            <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
              <Lock className="mx-auto mb-6 text-emerald-600" size={48} />
              <h2 className="text-2xl font-bold mb-6">Accès Sécurisé</h2>
              <form onSubmit={(e) => { e.preventDefault(); if(adminPassword === "ADMIN123") setIsAdminAuthenticated(true); else alert("Code incorrect"); }} className="space-y-4">
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Code secret" className="w-full p-4 bg-slate-100 rounded-xl outline-none" />
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Déverrouiller</button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Prospects ({leads.length})</h2><span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">Live Database</span></div>
              <div className="grid gap-6">
                {leads.map((l) => (
                  <div key={l.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group">
                    <h3 className="text-xl font-bold text-slate-900">{l.name}</h3>
                    <div className="text-emerald-600 text-sm mb-4 font-bold">{l.email}</div>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl italic">"{l.message}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        currentPage === 'home' ? (
          <>
            {/* HERO */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
              <div className="absolute top-0 right-0 -z-10 opacity-5 translate-x-1/4 -translate-y-1/4 text-emerald-600"><FileSpreadsheet size={600} /></div>
              <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-center lg:text-left">
                  <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 font-black uppercase tracking-tight">Optimisez vos données avec <span className="text-emerald-600">JC.DATA.SOLUTIONS</span></h1>
                  <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">Expert Excel VBA & IA. Automatisez vos tâches pour gagner des heures chaque semaine.</p>
                  <button onClick={() => { setAiMode('audit'); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg inline-flex items-center gap-2">Audit IA Gratuit ✨ <ArrowRight size={20} /></button>
                </div>
                <div className="hidden lg:block text-center">
                  <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 transform rotate-2 inline-block">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-2xl p-6 text-center">
                        <TrendingUp className="text-emerald-600 w-6 h-6 mb-2 mx-auto" />
                        <div className="text-2xl font-black text-slate-900">+65%</div>
                        <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-tighter">Gain de temps</div>
                      </div>
                      <div className="bg-slate-900 rounded-2xl p-6 text-white text-center">
                        <Activity className="text-emerald-400 w-6 h-6 mb-2 mx-auto" />
                        <div className="text-2xl font-black">12.2k</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Flux Gérés</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="py-24 bg-slate-50 scroll-mt-20">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="max-w-2xl mx-auto mb-16">
                  <h2 className="text-base font-bold text-emerald-600 uppercase tracking-widest mb-3 italic">Expertises & Services</h2>
                  <p className="text-3xl lg:text-4xl font-bold italic text-slate-900 text-center">Des solutions sur mesure pour votre performance.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <ServiceCard icon={Zap} title="Automatisation" desc="Éliminez les tâches répétitives via VBA." onClick={() => setCurrentPage('details-automation')} color="emerald" />
                  <ServiceCard icon={BarChart3} title="Dashboards" desc="Tableaux de bord visuels interactifs." onClick={() => setCurrentPage('details-dashboards')} color="blue" />
                  <ServiceCard icon={Database} title="Data Management" desc="Nettoyage et structuration Power Query." onClick={() => setCurrentPage('details-data')} color="indigo" />
                  <ServiceCard icon={Settings} title="Outils Dédiés" desc="Logiciels Excel UserForms sur-mesure." onClick={() => setCurrentPage('details-tools')} color="amber" />
                </div>
              </div>
            </section>

            {/* MICRO-SERVICES (COMEUP) */}
            <section id="comeup" className="py-24 bg-slate-900 overflow-hidden relative scroll-mt-20 text-white text-center">
              <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-16">
                  <div className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-6 animate-pulse"><Timer size={14} /> Livraison sous 6 jours max</div>
                  <h2 className="text-base font-bold text-amber-400 uppercase tracking-widest mb-3 italic">Offres Packagées</h2>
                  <p className="text-3xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">Micro-Services ComeUp</p>
                  <p className="text-slate-400 max-w-2xl mx-auto border-l-4 border-amber-400 pl-6 text-left italic">Prestations standardisées accessibles directement sur la plateforme ComeUp.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 text-left text-slate-900">
                  {comeupServices.map((s) => (
                    <div key={s.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col hover:bg-white/10 transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-500 text-[10px] px-3 py-1 rounded-bl-xl font-bold">6j max</div>
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform"><s.icon size={24} /></div>
                      <h3 className="text-lg font-bold text-white mb-3 leading-tight flex-grow">{s.title}</h3>
                      <p className="text-slate-400 text-xs mb-6 leading-relaxed italic">{s.description}</p>
                      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="text-xs text-white/50">À partir de <span className="block text-lg font-black text-amber-400 uppercase tracking-tighter">{s.price}</span></div>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 hover:scale-110 transition-transform shadow-lg"><ShoppingBag size={20} /></a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* RÉALISATIONS (PORTFOLIO) */}
            <section id="portfolio" className="py-24 bg-white scroll-mt-20 text-center">
              <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-2xl mx-auto mb-16 text-center">
                  <h2 className="text-base font-bold text-emerald-600 uppercase tracking-widest mb-3 italic">Portefeuille Client</h2>
                  <p className="text-3xl lg:text-4xl font-bold text-slate-900 italic">Mes Réalisations Professionnelles</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {projects.map((p, i) => (
                    <div key={i} className="bg-slate-50 rounded-[2rem] shadow-sm border border-slate-100 p-10 hover:shadow-xl transition-all group text-left">
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase mb-4 tracking-tighter"><CheckCircle2 size={16} /> {p.impact}</div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors uppercase italic tracking-tighter">{p.title}</h3>
                      <p className="text-slate-600 leading-relaxed italic">"{p.description}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
            <DetailsTemplate 
                title={currentPage === 'details-automation' ? "Automatisation" : currentPage === 'details-dashboards' ? "Dashboards" : currentPage === 'details-data' ? "Gestion Data" : "Outils Métiers"}
                subtitle="Expertise pro."
                description="Analyse et automatisation logicielle pour vos fichiers Excel complexes."
                icon={currentPage === 'details-automation' ? Zap : currentPage === 'details-dashboards' ? BarChart3 : currentPage === 'details-data' ? Database : Settings}
                colorClass={currentPage === 'details-automation' ? "emerald" : currentPage === 'details-dashboards' ? "blue" : currentPage === 'details-data' ? "indigo" : "amber"}
                examples={[{ title: "Processus n°1", context: "Processus manuel répétitif.", solution: "Automatisation totale via VBA." }, { title: "Processus n°2", context: "Erreurs de saisie fréquentes.", solution: "Contrôle dynamique et sécurisation." }]}
                goBack={() => setCurrentPage('home')}
            />
        )
      )}

      {/* IA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="text-left">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-900 font-black tracking-tight"><Sparkles className="text-emerald-600" /> Assistant Intelligent ✨</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(aiUsageCount/3)*100}%` }}></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{aiUsageCount}/3 essais gratuits</span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto text-left text-slate-900">
              {!aiResult ? (
                aiUsageCount >= 3 ? (
                  <div className="text-center py-6 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner"><Gift size={40} /></div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight text-center italic">Passez à la vitesse supérieure 🚀</h3>
                    <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg leading-relaxed text-center italic">L'IA a ses limites, mais mon expertise n'en a pas. <br/><br/><strong>Offre Spéciale :</strong> Discutons de vive voix de votre projet lors d'un audit complet.</p>
                    <button onClick={() => { setIsModalOpen(false); navigateToSection('contact'); }} className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 w-full">Réserver mon audit gratuit <ArrowRight /></button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2"><Info size={14}/> Décrivez un processus à automatiser</div>
                    <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-lg min-h-[160px]" placeholder="Ex: Chaque lundi, je fusionne 10 fichiers..."></textarea>
                    <button onClick={handleAiAction} disabled={isLoading || !userInput.trim()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">{isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Analyser mon besoin</>}</button>
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 whitespace-pre-wrap leading-relaxed text-left text-slate-800 shadow-sm text-sm">
                    <div className="text-emerald-700 font-bold mb-4 flex items-center gap-2 border-b border-emerald-100 pb-2 uppercase text-xs tracking-widest italic"><Sparkles size={14}/> Stratégie suggérée par l'IA</div>
                    {aiResult}
                  </div>
                  <div className="flex gap-4"><button onClick={() => setAiResult("")} className="flex-1 py-4 border-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-tighter text-xs">Nouveau besoin</button><button onClick={() => { setIsModalOpen(false); navigateToSection('contact'); }} className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-black shadow-lg">Lancer le projet</button></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & CONTACT */}
      <footer id="contact" className="py-24 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 mb-20 text-left">
            <div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight font-black uppercase italic">Prêt à automatiser ?</h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-12 text-white">
                <a href="mailto:jc.data.solutions@outlook.fr" className="bg-white/5 p-6 rounded-2xl hover:bg-emerald-600 transition-all border border-white/5 group shadow-xl"><Mail className="mb-4 text-emerald-400 group-hover:text-white" /><div className="truncate text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100">Email</div><div className="truncate text-sm font-medium">jc.data.solutions@outlook.fr</div></a>
                <a href="https://www.linkedin.com/in/j%C3%A9r%C3%B4me-cassier-511601324/" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-blue-700 transition-all border border-white/5 group shadow-xl"><Linkedin className="mb-4 text-blue-400 group-hover:text-white" /><div className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100">LinkedIn</div><div className="text-sm font-medium uppercase tracking-tighter">Profil Pro</div></a>
                <a href="https://comeup.com/fr/@jerome-cassier" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-amber-500 transition-all border border-white/5 group shadow-lg"><ShoppingBag className="mb-4 text-amber-500 group-hover:text-white" /><div className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100">Plateforme</div><div className="text-sm font-black italic uppercase tracking-tighter">Profil ComeUp</div></a>
                <a href="https://www.malt.fr/profile/jeromecassier" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-red-600 transition-all border border-white/5 group shadow-lg"><UserCheck className="mb-4 text-red-500 group-hover:text-white" /><div className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100">Indépendant</div><div className="text-sm font-black uppercase tracking-tighter">Profil Malt</div></a>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-slate-900">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                  <h3 className="text-2xl font-bold mb-4 font-black uppercase tracking-tight">Demande reçue !</h3>
                  <p className="text-slate-500 text-sm text-center italic">Sauvegardée dans ma base Cloud. Réponse sous 24h maximum.</p>
                  <button onClick={() => setIsSubmitted(false)} className="mt-8 text-emerald-600 font-bold hover:underline">Envoyer un autre message</button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <h3 className="text-2xl font-bold mb-8 font-black tracking-tight text-left uppercase italic">Demander un audit gratuit</h3>
                  <input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500" placeholder="Nom complet" />
                  <input required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500" placeholder="Email professionnel" />
                  <textarea required value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} rows="4" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500" placeholder="Description de votre besoin..."></textarea>
                  <button type="submit" disabled={isSending} className="w-full bg-emerald-600 text-white font-black py-5 rounded-xl hover:bg-emerald-700 shadow-xl transition-all flex items-center justify-center gap-3">
                    {isSending ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Envoyer ma demande</>}
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex items-center justify-between text-slate-500 text-xs">
            <div className="flex items-center gap-2">
              <Database className="text-emerald-500 w-5 h-5" />
              <span className="font-black text-white uppercase italic tracking-tighter">JC.DATA<span className="text-emerald-600">.SOLUTIONS</span></span>
              <button onClick={() => setCurrentPage('admin')} className="ml-4 opacity-10 hover:opacity-100 text-white transition-opacity"><Lock size={12} /></button>
            </div>
            <p>© {new Date().getFullYear()} - Expert Solutions Excel & VBA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DetailsTemplate = ({ title, subtitle, description, icon: Icon, examples, colorClass, goBack }) => (
  <div className="pt-32 pb-24 animate-in fade-in duration-700 bg-white min-h-screen text-slate-900">
    <div className="max-w-4xl mx-auto px-6 text-left">
      <button onClick={goBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm mb-12 group transition-all">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
      </button>
      <div className="mb-16 text-left">
        <div className={`inline-flex items-center gap-2 px-3 py-3 rounded-2xl bg-${colorClass}-100 text-${colorClass}-700 mb-6`}><Icon size={40} /></div>
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight text-left uppercase italic">{title} : <br/><span className={`text-${colorClass}-600`}>{subtitle}</span></h1>
        <p className="text-xl text-slate-600 leading-relaxed text-left italic">{description}</p>
      </div>
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white mb-12 shadow-2xl border border-white/5">
        <h2 className="text-3xl font-bold mb-12 text-center underline decoration-emerald-500 underline-offset-8 italic">Cas Pratiques</h2>
        <div className="space-y-16">
          {examples.map((ex, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-start text-left">
              <div className={`w-12 h-12 bg-${colorClass}-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}><Layout size={24} className="text-white" /></div>
              <div className="flex-1">
                <h4 className={`text-xl font-bold mb-3 text-${colorClass}-400 uppercase tracking-tighter italic`}>{i + 1}. {ex.title}</h4>
                <p className="text-slate-400 leading-relaxed mb-4 italic text-left">"{ex.context}"</p>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <span className={`text-${colorClass}-500 font-bold block mb-2 uppercase text-xs tracking-widest`}>Solution JC.DATA :</span>
                  <span className="text-slate-200 text-left block leading-relaxed italic">{ex.solution}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default App;
