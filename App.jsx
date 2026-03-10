import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, doc, setDoc, query, updateDoc, increment } from 'firebase/firestore';
import { 
  BarChart3, Zap, FileSpreadsheet, Database, ArrowRight, CheckCircle2, 
  Mail, Linkedin, Menu, X, PieChart, TrendingUp, Activity, Sparkles, 
  Loader2, ShoppingBag, UserCheck, ArrowLeft, Settings, ShieldCheck, 
  Layers, Layout, AlertCircle, Timer, Send, Lock, Trash2, Calendar, Info, Gift, Star, Quote, ChevronDown, ChevronUp, MessageSquare, Target, Shield
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

// --- DONNÉES STATIQUES ---
const standardServices = [
  { id: 'r', title: "Rapprochement", description: "Identification automatique des écarts entre deux sources de données.", price: "16,20 €", delay: "5j max", icon: Layers, url: "https://comeup.com/fr/service/513295/comparer-vos-fichiers-ecarts-rapprochement" },
  { id: 'f', title: "Réparation", description: "Correction des erreurs structurelles et restauration de fichiers corrompus.", price: "16,20 €", delay: "5j max", icon: ShieldCheck, url: "https://comeup.com/fr/service/512808/corriger-vos-erreurs-et-reparer-vos-fichiers-excel" },
  { id: 'c', title: "Conversion PDF", description: "Extraction de données structurées depuis des documents PDF vers Excel.", price: "16,20 €", delay: "4j max", icon: FileSpreadsheet, url: "https://comeup.com/fr/service/512859/convertir-vos-fichiers-pdf-en-excel-et-automatiser-la-saisie-de-vos-donnees" },
  { id: 'd', title: "Dashboards", description: "Conception de tableaux de bord interactifs pour le pilotage d'activité.", price: "16,20 €", delay: "6j max", icon: PieChart, url: "https://comeup.com/fr/service/512699/creer-votre-dashboard-excel-automatise-et-sur-mesure" },
  { id: 'n', title: "Nettoyage", description: "Normalisation, dédoublonnage et fiabilisation de bases de données.", price: "16,20 €", delay: "4j max", icon: Database, url: "https://comeup.com/fr/service/512752/nettoyer-vos-bases-de-donnees-excel-suppression-doublons-normalisation" }
];

const expertiseCases = [
  { title: "Automatisation de Reporting", impact: "Gain de temps : 90%", description: "Scénario type : Transformation d'une saisie manuelle quotidienne en un import automatisé via VBA." },
  { title: "Consolidation Multibases", impact: "Erreur humaine : 0%", description: "Scénario type : Fusion intelligente de plusieurs fichiers hétérogènes en une base de données propre." },
  { title: "Interface de Saisie (ERP)", impact: "Confort utilisateur", description: "Scénario type : Création de formulaires (UserForms) pour sécuriser et guider la saisie des collaborateurs." }
];

const methodology = [
  { title: "Analyse", content: "Étude approfondie de votre structure de données actuelle.", icon: Target },
  { title: "Sécurité", content: "Codes optimisés, sans virus, respectant la confidentialité.", icon: Shield },
  { title: "Accompagnement", content: "Explications fournies pour une prise en main immédiate.", icon: UserCheck }
];

// --- COMPOSANT PRINCIPAL ---
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

  const apiKey = ""; 

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

  useEffect(() => {
    if (!user || !db) return;
    const usageDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'stats', 'ai_usage');
    const unsubscribe = onSnapshot(usageDocRef, (docSnap) => {
      if (docSnap.exists()) setAiUsageCount(docSnap.data().count || 0);
      else setDoc(usageDocRef, { count: 0 }, { merge: true });
    });
    return () => unsubscribe();
  }, [user]);

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
          contents: [{ parts: [{ text: `Analyse technique besoin Excel : ${userInput}` }] }],
          systemInstruction: { parts: [{ text: "Assistant de Jérôme, expert VBA. Analyse pro du besoin. Explique que seul un audit humain de 15min peut valider le coût final." }] }
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, une erreur est survenue.";
      setAiResult(text.toString());
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
      const body = encodeURIComponent(`Message de ${contactForm.name} : \n\n${contactForm.message}`);
      window.location.href = `mailto:jc.data.solutions@outlook.fr?subject=${subject}&body=${body}`;
      setIsSubmitted(true);
    } catch (err) {}
    finally { setIsSending(false); }
  };

  const ServiceCard = ({ icon: Icon, title, desc, onClick, color }) => (
    <div className={`p-8 rounded-3xl border border-${color}-100 bg-${color}-50/30 hover:bg-white hover:shadow-xl transition-all group text-left h-full flex flex-col`}>
      <div className={`mb-6 group-hover:scale-110 transition-transform text-${color}-500`}><Icon size={32} /></div>
      <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight uppercase italic">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow italic">{desc}</p>
      <button onClick={onClick} className={`flex items-center gap-2 text-${color}-600 font-bold text-xs uppercase tracking-widest`}>Découvrir <ArrowRight size={16} /></button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth selection:bg-emerald-100">
      {/* NAVIGATION */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <Database className="text-emerald-600 w-6 h-6" />
            <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">JC.DATA<span className="text-emerald-600">.SOLUTIONS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-bold">
            {['Services', 'Prestations Express', 'Expertise', 'Engagement', 'Contact'].map((n, i) => (
              <button key={i} onClick={() => navigateToSection(['services', 'express', 'expertise', 'methodology', 'contact'][i])} className="text-slate-600 hover:text-emerald-600 transition-colors uppercase">{n}</button>
            ))}
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 font-black uppercase text-xs">Audit IA ✨</button>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>

      {currentPage === 'admin' ? (
        <div className="pt-32 pb-24 min-h-screen max-w-6xl mx-auto px-6 text-left text-slate-900">
          <button onClick={() => setCurrentPage('home')} className="mb-8 flex items-center gap-2 text-slate-500 font-bold uppercase text-xs"><ArrowLeft size={16} /> Retour site</button>
          <h1 className="text-4xl font-black mb-8 italic uppercase tracking-tight">Espace Admin</h1>
          {!isAdminAuthenticated ? (
            <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
              <Lock className="mx-auto mb-6 text-emerald-600" size={48} />
              <h2 className="text-2xl font-bold mb-6 italic uppercase">Accès Sécurisé</h2>
              <form onSubmit={(e) => { e.preventDefault(); if(adminPassword === "ADMIN123") setIsAdminAuthenticated(true); else alert("Code incorrect"); }} className="space-y-4">
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Code secret" className="w-full p-4 bg-slate-100 rounded-xl outline-none" />
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest italic">Déverrouiller</button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold uppercase italic">Demandes Prospects ({leads.length})</h2>
              <div className="grid gap-6">
                {leads.map((l) => (
                  <div key={l.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left">
                    <h3 className="text-xl font-bold italic">{l.name}</h3>
                    <div className="text-emerald-600 text-sm mb-4 font-bold">{l.email}</div>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl italic leading-relaxed">"{l.message}"</p>
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
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white text-left">
              <div className="absolute top-0 right-0 -z-10 opacity-5 translate-x-1/4 -translate-y-1/4 text-emerald-600"><FileSpreadsheet size={600} /></div>
              <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 font-black uppercase tracking-tight italic">Libérez la puissance de vos données <span className="text-emerald-600">Excel</span></h1>
                  <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl italic">Expert en automatisation VBA & IA. Je transforme vos classeurs rigides en outils métier intelligents et automatisés.</p>
                  <div className="flex flex-col gap-4 items-start">
                    <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg inline-flex items-center gap-2 uppercase tracking-tight italic text-lg">Analyser mon projet (IA) ✨</button>
                    <p className="text-slate-400 text-xs italic ml-2 max-w-sm">Obtenez instantanément une stratégie technique et une estimation de faisabilité pour vos besoins d'automatisation.</p>
                  </div>
                </div>
                <div className="hidden lg:block text-center">
                   <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 transform rotate-2 inline-block">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-2xl p-6 text-center text-slate-900">
                        <TrendingUp className="text-emerald-600 w-6 h-6 mb-2 mx-auto" />
                        <div className="text-2xl font-black italic">+65%</div>
                        <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-tighter">Gain de temps</div>
                      </div>
                      <div className="bg-slate-900 rounded-2xl p-6 text-white text-center">
                        <Activity className="text-emerald-400 w-6 h-6 mb-2 mx-auto" />
                        <div className="text-2xl font-black italic">12.2k</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Flux Gérés</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="py-24 bg-slate-50 scroll-mt-20">
              <div className="max-w-7xl mx-auto px-6 text-left text-slate-900 text-left">
                <div className="max-w-2xl mb-16 border-l-4 border-emerald-600 pl-8">
                  <h2 className="text-base font-bold text-emerald-600 uppercase tracking-widest mb-3 italic text-left">Domaines d'Intervention</h2>
                  <p className="text-3xl lg:text-4xl font-bold italic text-left">
                    Solutions d'ingénierie Excel <span className="whitespace-nowrap italic">sur-mesure.</span>
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <ServiceCard icon={Zap} title="VBA & Macros" desc="Suppression complète des tâches répétitives et manuelles." onClick={() => setCurrentPage('details-automation')} color="emerald" />
                  <ServiceCard icon={BarChart3} title="Data Visualisation" desc="Conception de tableaux de bord dynamiques pour vos KPI." onClick={() => setCurrentPage('details-dashboards')} color="blue" />
                  <ServiceCard icon={Database} title="Data Management" desc="Power Query, structuration et nettoyage de bases complexes." onClick={() => setCurrentPage('details-data')} color="indigo" />
                  <ServiceCard icon={Settings} title="Outils Métier" desc="Applications Excel personnalisées avec interfaces dédiées." onClick={() => setCurrentPage('details-tools')} color="amber" />
                </div>
              </div>
            </section>

            {/* PRESTATIONS EXPRESS (AMBER) */}
            <section id="express" className="py-24 bg-slate-900 overflow-hidden relative scroll-mt-20 text-white">
              <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
                <div className="mb-16 text-left">
                  <div className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-6 animate-pulse italic"><Timer size={14} /> Livraison express disponible</div>
                  <h2 className="text-base font-bold text-amber-400 uppercase tracking-widest mb-3 italic text-left">Forfaits d'Intervention</h2>
                  <p className="text-3xl lg:text-5xl font-black mb-6 uppercase tracking-tighter italic text-left">Solutions Prêtes à l'Emploi</p>
                  <p className="text-slate-400 max-w-2xl border-l-4 border-amber-400 pl-6 text-left italic leading-relaxed">Pour des besoins ciblés, j'ai standardisé ces prestations sur la plateforme de confiance ComeUp.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 text-left text-slate-900 text-left">
                  {standardServices.map((s) => (
                    <div key={s.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col hover:bg-white/10 transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-500 text-[10px] px-3 py-1 rounded-bl-2xl font-black italic">{s.delay}</div>
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform"><s.icon size={24} /></div>
                      <h3 className="text-lg font-bold text-white mb-3 leading-tight flex-grow uppercase tracking-tight italic">{s.title}</h3>
                      <p className="text-slate-400 text-xs mb-6 leading-relaxed italic">{s.description}</p>
                      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="text-xs text-white/50 italic">Forfait dès <span className="block text-lg font-black text-amber-400 uppercase tracking-tighter">{s.price}</span></div>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 hover:scale-110 transition-transform shadow-lg"><ShoppingBag size={20} /></a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* EXPERTISE */}
            <section id="expertise" className="py-24 bg-white scroll-mt-20">
              <div className="max-w-7xl mx-auto px-6 text-center text-slate-900 text-left">
                <div className="mb-16 text-left border-l-4 border-emerald-600 pl-8">
                  <h2 className="text-base font-bold text-emerald-600 uppercase tracking-widest mb-3 italic">Cas d'Usage</h2>
                  <p className="text-3xl lg:text-4xl font-bold italic text-left">Démonstration d'Expertise</p>
                  <p className="text-slate-500 mt-4 italic max-w-2xl italic leading-relaxed text-left">Voici comment je transforme vos problématiques en solutions techniques performantes.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-left">
                  {expertiseCases.map((p, i) => (
                    <div key={i} className="bg-slate-50 rounded-[2.5rem] shadow-sm border border-slate-100 p-10 hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase mb-4 tracking-tighter italic text-left"><CheckCircle2 size={16} /> {p.impact}</div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-600 transition-colors uppercase italic tracking-tighter text-left">{p.title}</h3>
                      <p className="text-slate-600 leading-relaxed italic text-sm text-left">"{p.description}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ENGAGEMENT */}
            <section id="methodology" className="py-24 bg-emerald-600 scroll-mt-20 text-white relative italic">
               <div className="absolute top-0 left-0 p-12 opacity-10"><Quote size={120} /></div>
               <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                 <div className="mb-16 text-center">
                    <h2 className="text-base font-bold text-emerald-100 uppercase tracking-widest mb-3 italic text-center">Valeurs</h2>
                    <p className="text-3xl lg:text-5xl font-black italic tracking-tight uppercase text-center">Engagement & Qualité</p>
                 </div>
                 <div className="grid md:grid-cols-3 gap-8">
                    {methodology.map((m, i) => (
                      <div key={i} className="bg-white rounded-[2.5rem] p-10 shadow-2xl transform hover:-translate-y-2 transition-all text-slate-900 text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"><m.icon size={32} /></div>
                        <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter mb-4">{m.title}</h3>
                        <p className="text-slate-600 italic text-sm leading-relaxed text-center">"{m.content}"</p>
                      </div>
                    ))}
                 </div>
               </div>
            </section>
          </>
        ) : (
            <DetailsTemplate 
                title={currentPage === 'details-automation' ? "Expertise VBA" : currentPage === 'details-dashboards' ? "Dashboards" : currentPage === 'details-data' ? "Data Management" : "Logiciels Dédiés"}
                subtitle="Ingénierie de données."
                description="Analyse et automatisation algorithmique pour vos flux de données Excel complexes."
                icon={currentPage === 'details-automation' ? Zap : currentPage === 'details-dashboards' ? BarChart3 : currentPage === 'details-data' ? Database : Settings}
                colorClass={currentPage === 'details-automation' ? "emerald" : currentPage === 'details-dashboards' ? "blue" : currentPage === 'details-data' ? "indigo" : "amber"}
                examples={[{ title: "Cas n°1", context: "Processus manuel répétitif de 4h/jour.", solution: "Automatisation via script VBA réduisant le temps à 2 minutes." }, { title: "Cas n°2", context: "Données corrompues ou mal formatées.", solution: "Mise en place d'un tunnel de nettoyage via Power Query." }]}
                goBack={() => setCurrentPage('home')}
            />
        )
      )}

      {/* IA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-900 italic">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="text-left">
                <h3 className="text-2xl font-bold flex items-center gap-2 font-black tracking-tight uppercase italic"><Sparkles className="text-emerald-600" /> Pré-Diagnostic IA ✨</h3>
                <div className="flex items-center gap-2 mt-1 text-left">
                  <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden text-left">
                    <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(Number(aiUsageCount)/3)*100}%` }}></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left italic">{aiUsageCount}/3 diagnostics gratuits</span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto text-left italic">
              {!aiResult ? (
                aiUsageCount >= 3 ? (
                  <div className="text-center py-6 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner"><Gift size={40} /></div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight text-center italic uppercase italic">Passons à l'expertise humaine 🚀</h3>
                    <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg leading-relaxed text-center italic font-bold">Votre projet nécessite une étude approfondie.</p>
                    <button onClick={() => { setIsModalOpen(false); navigateToSection('contact'); }} className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 w-full uppercase tracking-tighter italic">Réserver mon audit gratuit <ArrowRight /></button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 italic text-left"><Info size={14}/> Décrivez votre flux de travail</div>
                    <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-lg min-h-[160px] text-left italic" placeholder="Ex: Chaque matin, je dois consolider 10 fichiers..."></textarea>
                    <button onClick={handleAiAction} disabled={isLoading || !userInput.trim()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-lg uppercase tracking-tighter italic">{isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Analyser mon besoin</>}</button>
                  </div>
                )
              ) : (
                <div className="space-y-6 text-left">
                  <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 whitespace-pre-wrap leading-relaxed text-left text-slate-800 shadow-sm text-sm italic text-left">
                    <div className="text-emerald-700 font-bold mb-4 flex items-center gap-2 border-b border-emerald-100 pb-2 uppercase text-xs tracking-widest not-italic italic underline decoration-emerald-200 italic font-black text-left"><Sparkles size={14}/> Stratégie Suggérée</div>
                    {aiResult}
                  </div>
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl text-left">
                    <div className="flex-1 text-left">
                        <div className="text-emerald-400 font-black uppercase text-xs tracking-widest mb-1 italic text-left">Valider cette analyse ?</div>
                        <p className="text-xs text-slate-400 italic leading-relaxed text-left">Échangeons 15 minutes pour confirmer le budget et la faisabilité.</p>
                    </div>
                    <button onClick={() => { setIsModalOpen(false); navigateToSection('contact'); }} className="bg-emerald-600 text-white px-6 py-4 rounded-xl font-black text-sm uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all whitespace-nowrap italic"><MessageSquare size={16}/> Demander mon audit <ArrowRight size={16}/></button>
                  </div>
                  <button onClick={() => setAiResult("")} className="w-full py-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors italic underline italic">Autre analyse ({3 - aiUsageCount} restantes)</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & CONTACT */}
      <footer id="contact" className="py-24 bg-slate-900 text-white scroll-mt-20 text-left italic">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="grid md:grid-cols-2 gap-16 mb-20 text-left italic">
            <div className="text-left">
              <h2 className="text-4xl font-bold mb-6 tracking-tight font-black uppercase leading-tight italic text-left">Optimisez votre gestion. <br/><span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8 italic">Commencez dès aujourd'hui.</span></h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-12 text-white italic text-left">
                <a href="mailto:jc.data.solutions@outlook.fr" className="bg-white/5 p-6 rounded-2xl hover:bg-emerald-600 transition-all border border-white/5 group shadow-xl"><Mail className="mb-4 text-emerald-400 group-hover:text-white" /><div className="truncate text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 text-white uppercase italic">Email</div><div className="truncate text-sm font-medium">jc.data.solutions@outlook.fr</div></a>
                <a href="https://www.linkedin.com/in/j%C3%A9r%C3%B4me-cassier-511601324/" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-blue-700 transition-all border border-white/5 group shadow-xl"><Linkedin className="mb-4 text-blue-400 group-hover:text-white" /><div className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 text-white uppercase italic">LinkedIn</div><div className="text-sm font-medium uppercase tracking-tighter italic text-white italic">Profil Pro</div></a>
                <a href="https://comeup.com/fr/@jerome-cassier" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-amber-500 transition-all border border-white/5 group shadow-lg"><ShoppingBag className="mb-4 text-amber-500 group-hover:text-white" /><div className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 text-white uppercase italic">Prestations</div><div className="text-sm font-black italic uppercase text-white italic">Profil ComeUp</div></a>
                <a href="https://www.malt.fr/profile/jeromecassier" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-6 rounded-2xl hover:bg-red-600 transition-all border border-white/5 group shadow-lg"><UserCheck className="mb-4 text-red-500 group-hover:text-white" /><div className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 text-white uppercase italic">Indépendant</div><div className="text-sm font-black uppercase tracking-tighter text-white italic">Profil Malt</div></a>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-slate-900 text-left italic">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                  <h3 className="text-2xl font-bold mb-4 font-black uppercase tracking-tight italic">Demande reçue !</h3>
                  <p className="text-slate-500 text-sm text-center italic">Réponse sous 24h maximum.</p>
                  <button onClick={() => setIsSubmitted(false)} className="mt-8 text-emerald-600 font-bold hover:underline italic uppercase tracking-widest text-xs italic">Envoyer un autre message</button>
                </div>
              ) : (
                <form className="space-y-4 text-left" onSubmit={handleContactSubmit}>
                  <h3 className="text-2xl font-bold mb-8 font-black tracking-tight text-left uppercase italic text-slate-900 italic underline decoration-emerald-500/20 text-left">Demander un audit gratuit</h3>
                  <input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 font-bold italic" placeholder="Nom complet" />
                  <input required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 font-bold italic" placeholder="Email professionnel" />
                  <textarea required value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} rows="4" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 font-bold italic" placeholder="Décrivez votre besoin métier..."></textarea>
                  <button type="submit" disabled={isSending} className="w-full bg-emerald-600 text-white font-black py-5 rounded-xl hover:bg-emerald-700 shadow-xl transition-all flex items-center justify-center gap-3 italic uppercase tracking-tighter italic">
                    {isSending ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Valider ma demande</>}
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex items-center justify-between text-slate-500 text-xs">
            <div className="flex items-center gap-2">
              <Database className="text-emerald-500 w-5 h-5" />
              <span className="font-black text-white uppercase italic tracking-tighter italic">JC.DATA<span className="text-emerald-600">.SOLUTIONS</span></span>
              <button onClick={() => setCurrentPage('admin')} className="ml-4 opacity-10 hover:opacity-100 text-white transition-opacity italic"><Lock size={12} /></button>
            </div>
            <p className="italic uppercase tracking-widest text-[9px] italic font-bold">© {new Date().getFullYear()} - Expert Intelligence de Données & VBA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DetailsTemplate = ({ title, subtitle, description, icon: Icon, examples, colorClass, goBack }) => (
  <div className="pt-32 pb-24 animate-in fade-in duration-700 bg-white min-h-screen text-slate-900 text-left italic text-left">
    <div className="max-w-4xl mx-auto px-6 text-left">
      <button onClick={goBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm mb-12 group transition-all italic text-left">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
      </button>
      <div className="mb-16 text-left">
        <div className={`inline-flex items-center gap-2 px-3 py-3 rounded-2xl bg-${colorClass}-100 text-${colorClass}-700 mb-6 text-left`}><Icon size={40} /></div>
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight text-left uppercase italic text-left">{title} : <br/><span className={`text-${colorClass}-600`}>{subtitle}</span></h1>
        <p className="text-xl text-slate-600 leading-relaxed text-left italic leading-relaxed text-left">{description}</p>
      </div>
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white mb-12 shadow-2xl border border-white/5 text-left italic text-left">
        <h2 className="text-3xl font-bold mb-12 text-center underline decoration-emerald-500 underline-offset-8 uppercase tracking-widest leading-loose text-white italic text-center">Cas d'Expertise</h2>
        <div className="space-y-16 text-left">
          {examples.map((ex, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-start text-left text-left">
              <div className={`w-12 h-12 bg-${colorClass}-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-${colorClass}-900/20 text-left`}><Layout size={24} className="text-white text-left" /></div>
              <div className="flex-1 text-left">
                <h4 className={`text-xl font-bold mb-3 text-${colorClass}-400 uppercase tracking-tighter italic text-left`}>{i + 1}. {ex.title}</h4>
                <p className="text-slate-400 leading-relaxed mb-4 text-left italic text-left">"{ex.context}"</p>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left">
                  <span className={`text-${colorClass}-500 font-black block mb-2 uppercase text-xs tracking-widest italic text-left`}>Approche Technique :</span>
                  <span className="text-slate-200 text-left block leading-relaxed italic text-left">{ex.solution}</span>
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
