
import React, { useState, useMemo } from 'react';
import { Player, Team, Language, GalleryImage, PlayerStats } from './types';
import { TRANSLATIONS, INITIAL_TEAMS } from './constants';
import FIFAStyledCard from './components/FIFAStyledCard';

const ADMIN_PASSWORD = "yemenistudentsunion";

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'register' | 'standings' | 'admin'>('home');
  
  // Admin State
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSubTab, setAdminSubTab] = useState<'requests' | 'teams' | 'players' | 'gallery'>('requests');

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  // Registration Form State
  const [regForm, setRegForm] = useState({ name: '', phone: '', wechatId: '' });
  const [regStats, setRegStats] = useState<PlayerStats>({
    speed: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70
  });
  const [regPhoto, setRegPhoto] = useState<string | null>(null);
  const [lastRegisteredPlayer, setLastRegisteredPlayer] = useState<Player | null>(null);

  const toggleLanguage = () => setLang(l => l === 'ar' ? 'zh' : 'ar');

  const handleRegPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRegPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: Player = {
      id: Math.random().toString(36).substr(2, 9),
      ...regForm,
      stats: regStats,
      photo: regPhoto || undefined,
      status: 'pending',
      isFeatured: false
    };
    setPlayers(prev => [...prev, newRequest]);
    setLastRegisteredPlayer(newRequest);
    setRegForm({ name: '', phone: '', wechatId: '' });
    setRegPhoto(null);
    setRegStats({ speed: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70 });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsAdminAuth(true);
      setAdminError("");
    } else {
      setAdminError(t.wrongPassword);
    }
  };

  const handleApprove = (id: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'approved' };
      }
      return p;
    }));
  };

  const toggleFeatured = (id: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isFeatured: !p.isFeatured };
      }
      return p;
    }));
  };

  const assignPlayerToTeam = (playerId: string, teamId: string | undefined) => {
    setTeams(prev => prev.map(t => ({
      ...t,
      players: t.players.filter(id => id !== playerId)
    })));

    if (teamId) {
      setTeams(prev => prev.map(t => {
        if (t.id === teamId) {
          if (t.players.length >= 7) {
             alert(lang === 'ar' ? 'هذا الفريق مكتمل (7 لاعبين)' : '该队已满（7人）');
             return t;
          }
          return { ...t, players: [...t.players, playerId] };
        }
        return t;
      }));
    }
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, teamId } : p));
  };

  const updateTeamInfo = (teamId: string, field: keyof Team, value: any) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, [field]: value } : t));
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: GalleryImage = {
          id: Date.now().toString(),
          url: reader.result as string,
          caption: "YCFL Match Moment",
          date: new Date().toLocaleDateString()
        };
        setGallery(prev => [newImg, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteGalleryItem = (id: string) => {
    setGallery(prev => prev.filter(img => img.id !== id));
  };

  const sortedTeams = useMemo(() => 
    [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      return gdB - gdA;
    })
  , [teams]);

  return (
    <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'} bg-slate-50`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="bg-red-900 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4 md:space-x-8 space-x-reverse">
            <span className="text-2xl md:text-3xl font-black italic tracking-tighter cursor-pointer select-none" onClick={() => setActiveTab('home')}>YCFL</span>
            <div className="flex space-x-3 md:space-x-8 space-x-reverse font-bold text-[10px] md:text-sm uppercase tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap">
              <button onClick={() => setActiveTab('home')} className={`hover:text-yellow-400 transition-colors duration-300 pb-1 border-b-2 ${activeTab === 'home' ? 'text-yellow-400 border-yellow-400' : 'border-transparent'}`}>{t.navHome}</button>
              <button onClick={() => setActiveTab('register')} className={`hover:text-yellow-400 transition-colors duration-300 pb-1 border-b-2 ${activeTab === 'register' ? 'text-yellow-400 border-yellow-400' : 'border-transparent'}`}>{t.navRegister}</button>
              <button onClick={() => setActiveTab('standings')} className={`hover:text-yellow-400 transition-colors duration-300 pb-1 border-b-2 ${activeTab === 'standings' ? 'text-yellow-400 border-yellow-400' : 'border-transparent'}`}>{t.navStandings}</button>
              <button onClick={() => setActiveTab('admin')} className={`hover:text-yellow-400 transition-colors duration-300 pb-1 border-b-2 ${activeTab === 'admin' ? 'text-yellow-400 border-yellow-400' : 'border-transparent'}`}>{t.navAdmin}</button>
            </div>
          </div>
          <button onClick={toggleLanguage} className="flex-shrink-0 bg-white text-red-800 px-3 md:px-5 py-1.5 md:py-2 rounded-full font-black text-[10px] md:text-xs hover:bg-yellow-400 hover:text-red-900 transition-all shadow-md transform hover:scale-105 active:scale-95 ml-2 md:ml-0">
            {lang === 'ar' ? '中文' : 'العربية'}
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Home Page */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-700">
            <div className="bg-black relative h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80" alt="Yemeni Team" className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105 hover:scale-100 transition-transform duration-[10s]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-4xl md:text-9xl font-black mb-4 md:mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tighter uppercase italic">{t.heroTitle}</h1>
                    <p className="text-base md:text-3xl font-medium opacity-90 max-w-4xl mx-auto mb-8 md:mb-12 drop-shadow-md">{t.heroSubtitle}</p>
                    <button onClick={() => setActiveTab('register')} className="bg-yellow-500 text-black px-10 md:px-16 py-4 md:py-6 rounded-full font-black text-lg md:text-2xl hover:bg-white transition-all transform hover:scale-110 shadow-[0_15px_40px_rgba(234,_179,_8,_0.5)] active:scale-95">
                        {t.registerNow}
                    </button>
                </div>
            </div>
            
            <div className="container mx-auto px-4 py-16 md:py-24">
                 {/* Featured Cards */}
                 <div className="mb-20 md:mb-32">
                    <div className="flex items-center gap-3 md:gap-4 mb-10 md:text-left rtl:md:text-right">
                        <div className="h-8 md:h-12 w-2 md:w-3 bg-red-700 rounded-full"></div>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic">League Icons</h2>
                    </div>
                    <div className="flex flex-wrap gap-8 md:gap-12 justify-center">
                        {players.filter(p => p.status === 'approved' && p.isFeatured).map(p => (
                            <FIFAStyledCard key={p.id} player={p} lang={lang} />
                        ))}
                        {players.filter(p => p.status === 'approved' && p.isFeatured).length === 0 && (
                            <div className="p-12 md:p-24 bg-white rounded-[2rem] md:rounded-[3rem] text-gray-400 italic w-full text-center border-2 md:border-4 border-dashed border-gray-100 flex flex-col items-center">
                                <span className="text-4xl md:text-6xl mb-4 opacity-20">⚽</span>
                                <p className="text-sm md:text-xl font-bold">Showcasing top performers soon.</p>
                            </div>
                        )}
                    </div>
                 </div>

                 {/* Match Moments Gallery */}
                 <div>
                    <div className="flex items-center gap-3 md:gap-4 mb-10">
                        <div className="h-8 md:h-12 w-2 md:w-3 bg-red-700 rounded-full"></div>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Atmosphere</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10">
                        {gallery.map(img => (
                            <div key={img.id} className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl md:shadow-2xl aspect-[4/5] bg-gray-200 border-2 md:border-4 border-white transform hover:scale-105 transition-all duration-500">
                                <img src={img.url} className="w-full h-full object-cover transition duration-700 group-hover:scale-115" />
                                <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col justify-end p-4 md:p-10 backdrop-blur-sm">
                                    <span className="text-yellow-400 font-black text-[8px] md:text-xs uppercase tracking-[0.2em] mb-1">{img.date}</span>
                                    <h4 className="text-white font-black text-sm md:text-xl leading-tight">{img.caption}</h4>
                                </div>
                            </div>
                        ))}
                        {gallery.length === 0 && (
                            <div className="col-span-full py-16 md:py-32 bg-white/50 rounded-[2rem] md:rounded-[4rem] text-center border-2 md:border-4 border-dashed border-gray-200 flex flex-col items-center shadow-inner">
                                <span className="text-5xl md:text-7xl mb-4 md:mb-8 grayscale">📷</span>
                                <p className="text-gray-400 italic font-black text-lg md:text-2xl tracking-tighter px-4">Photos coming soon.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
          </div>
        )}

        {/* Standings Page */}
        {activeTab === 'standings' && (
          <div className="container mx-auto px-4 py-12 md:py-20 animate-in slide-in-from-bottom duration-700 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6 md:gap-8">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black text-red-900 tracking-tighter uppercase italic leading-none mb-3 md:mb-4">{t.standings}</h2>
                    <div className="flex items-center gap-2 md:gap-4 text-gray-500 font-black uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.4em]">
                        <span>Season 24/25</span>
                        <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-red-700 rounded-full"></div>
                        <span>Chengdu Yemeni League</span>
                    </div>
                </div>
                <div className="flex gap-2 md:gap-4 w-full md:w-auto">
                    <div className="bg-white flex-1 md:flex-none px-4 md:px-8 py-3 md:py-5 rounded-[1.5rem] md:rounded-[2rem] shadow-lg border border-gray-100 flex flex-col items-center min-w-[80px] md:min-w-[120px]">
                        <span className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Teams</span>
                        <span className="text-xl md:text-3xl font-black text-red-900">06</span>
                    </div>
                    <div className="bg-red-900 flex-1 md:flex-none px-4 md:px-8 py-3 md:py-5 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col items-center min-w-[80px] md:min-w-[120px]">
                        <span className="text-red-300 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Status</span>
                        <span className="text-base md:text-xl font-black text-white italic uppercase">Active</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left rtl:text-right border-collapse min-w-[700px]">
                    <thead className="bg-red-900 text-white font-black text-[9px] md:text-xs uppercase tracking-widest italic">
                        <tr>
                            <th className="py-6 md:py-10 px-4 md:px-8 text-center w-16 md:w-24">Pos</th>
                            <th className="py-6 md:py-10 px-4 md:px-8">Club Name</th>
                            <th className="py-6 md:py-10 px-2 md:px-4 text-center">PL</th>
                            <th className="py-6 md:py-10 px-2 md:px-4 text-center">W</th>
                            <th className="py-6 md:py-10 px-2 md:px-4 text-center">D</th>
                            <th className="py-6 md:py-10 px-2 md:px-4 text-center">L</th>
                            <th className="py-6 md:py-10 px-2 md:px-4 text-center">GD</th>
                            <th className="py-6 md:py-10 px-4 md:px-10 text-center bg-red-800 shadow-inner">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedTeams.map((team, idx) => {
                            const gd = team.goalsFor - team.goalsAgainst;
                            const isChampion = idx === 0;
                            
                            return (
                                <tr key={team.id} className={`hover:bg-red-50/50 transition-all duration-300 group ${isChampion ? 'bg-yellow-50/20' : ''}`}>
                                    <td className="py-6 md:py-10 px-4 md:px-8 text-center">
                                        <div className={`inline-flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-xl font-black text-lg md:text-2xl transition-all ${
                                            isChampion ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                    </td>
                                    <td className="py-6 md:py-10 px-4 md:px-8">
                                        <div className="flex items-center gap-4 md:gap-8">
                                            <div className="hidden sm:flex w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-50 to-white rounded-[1rem] md:rounded-[1.5rem] items-center justify-center font-black text-red-900 text-lg md:text-2xl border-2 border-red-100 group-hover:bg-red-900 group-hover:text-white transition-all duration-500 shadow-sm">
                                                {team.nameAr[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-lg md:text-3xl tracking-tighter text-gray-900 group-hover:text-red-900 transition-colors mb-0.5 md:mb-1">{lang === 'ar' ? team.nameAr : team.nameZh}</span>
                                                <span className="text-[9px] md:text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">{lang === 'ar' ? team.nameZh : team.nameAr}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 md:py-10 px-2 md:px-4 text-center font-black text-base md:text-xl text-gray-800">{team.played}</td>
                                    <td className="py-6 md:py-10 px-2 md:px-4 text-center">
                                        <span className="px-2 md:px-4 py-1 md:py-2 bg-green-50 text-green-600 rounded-lg md:rounded-xl font-black text-sm md:text-lg">{team.won}</span>
                                    </td>
                                    <td className="py-6 md:py-10 px-2 md:px-4 text-center">
                                        <span className="px-2 md:px-4 py-1 md:py-2 bg-gray-50 text-gray-400 rounded-lg md:rounded-xl font-black text-sm md:text-lg">{team.drawn}</span>
                                    </td>
                                    <td className="py-6 md:py-10 px-2 md:px-4 text-center">
                                        <span className="px-2 md:px-4 py-1 md:py-2 bg-red-50 text-red-500 rounded-lg md:rounded-xl font-black text-sm md:text-lg">{team.lost}</span>
                                    </td>
                                    <td className={`py-6 md:py-10 px-2 md:px-4 text-center font-black text-lg md:text-2xl italic ${gd > 0 ? 'text-green-600' : gd < 0 ? 'text-red-600' : 'text-gray-200'}`}>
                                        {gd > 0 ? `+${gd}` : gd}
                                    </td>
                                    <td className="py-6 md:py-10 px-4 md:px-10 text-center bg-gray-50/50 group-hover:bg-red-100 transition-colors">
                                        <span className="inline-flex items-center justify-center w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[1.8rem] bg-red-900 text-white text-xl md:text-4xl font-black shadow-lg transform group-hover:scale-110 transition-all duration-500">
                                            {team.points}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                  </table>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100">
                    <h5 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Qualification
                    </h5>
                    <p className="text-gray-800 font-bold text-xs md:text-sm">Top teams proceed to Champions Finals.</p>
                </div>
                <div className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 md:col-span-2">
                    <h5 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">Glossary</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <div>PL (Matches Played)</div>
                        <div>W (Wins)</div>
                        <div>L (Losses)</div>
                        <div>GD (Goal Diff)</div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Register Page */}
        {activeTab === 'register' && (
            <div className="container mx-auto px-4 py-16 md:py-24 flex justify-center">
                <div className="w-full max-w-5xl bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border-t-[8px] md:border-t-[12px] border-red-900">
                    <h2 className="text-4xl md:text-6xl font-black mb-10 text-red-900 text-center tracking-tighter uppercase italic">{t.navRegister}</h2>
                    {lastRegisteredPlayer ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-700">
                            <div className="bg-green-50 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-green-100 text-center w-full mb-10 shadow-inner">
                                <div className="w-20 h-20 md:w-28 md:h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"><span className="text-4xl md:text-6xl">⚽</span></div>
                                <p className="text-2xl md:text-4xl font-black text-green-700 mb-2 md:mb-4">{t.successMsg}</p>
                                <p className="text-green-600/60 font-black uppercase text-[10px] tracking-widest">Profile verification pending</p>
                            </div>
                            <div className="mb-12 transform scale-90 md:scale-110">
                                <p className="text-center font-black text-gray-300 uppercase tracking-[0.3em] mb-8 text-[10px]">Preview Card</p>
                                <FIFAStyledCard player={lastRegisteredPlayer} lang={lang} />
                            </div>
                            <button onClick={() => setLastRegisteredPlayer(null)} className="bg-red-900 text-white px-12 md:px-20 py-4 md:py-6 rounded-full font-black text-xl md:text-2xl hover:bg-black transition-all shadow-xl uppercase tracking-tighter italic">
                                Register Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                            <div className="space-y-8">
                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 border-b-4 md:border-b-8 border-red-900 pb-3 uppercase tracking-tighter italic">Personal Data</h3>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.name}</label>
                                    <input required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full p-4 md:p-6 bg-gray-50 border-4 border-transparent rounded-2xl md:rounded-3xl focus:border-red-900 focus:bg-white outline-none transition font-black text-lg md:text-xl" placeholder="Full Name" />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.phone}</label>
                                    <input required value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="w-full p-4 md:p-6 bg-gray-50 border-4 border-transparent rounded-2xl md:rounded-3xl focus:border-red-900 focus:bg-white outline-none transition font-black text-lg md:text-xl" placeholder="+86 ..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.wechat}</label>
                                    <input required value={regForm.wechatId} onChange={e => setRegForm({...regForm, wechatId: e.target.value})} className="w-full p-4 md:p-6 bg-gray-50 border-4 border-transparent rounded-2xl md:rounded-3xl focus:border-red-900 focus:bg-white outline-none transition font-black text-lg md:text-xl" placeholder="WeChat ID" />
                                </div>
                                
                                <div className="pt-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 md:mb-6">Profile Image</label>
                                    <div className="flex items-center gap-6 md:gap-10">
                                        <div className="w-24 h-24 md:w-40 md:h-40 rounded-[1.5rem] md:rounded-[2.5rem] bg-gray-50 border-2 md:border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative shadow-inner">
                                            {regPhoto ? <img src={regPhoto} className="w-full h-full object-cover" /> : <span className="text-3xl md:text-5xl opacity-5">👤</span>}
                                        </div>
                                        <label className="bg-black text-white px-6 md:px-10 py-3 md:py-5 rounded-[1.2rem] md:rounded-[1.5rem] font-black text-[10px] md:text-xs cursor-pointer hover:bg-gray-800 transition shadow-lg uppercase tracking-widest text-center">
                                            UPLOAD
                                            <input type="file" hidden accept="image/*" onChange={handleRegPhotoUpload} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 border-b-4 md:border-b-8 border-red-900 pb-3 uppercase tracking-tighter italic">Self-Evaluation</h3>
                                {Object.keys(regStats).map((key) => {
                                    const statKey = key as keyof PlayerStats;
                                    const labels = lang === 'ar' ? ['سرعة', 'تسديد', 'تمرير', 'مراوغة', 'دفاع', 'بدني'] : ['速度', '射门', '传球', '盘带', '防守', '体能'];
                                    const keys: (keyof PlayerStats)[] = ['speed', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
                                    const index = keys.indexOf(statKey);
                                    
                                    return (
                                        <div key={key} className="space-y-3">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="block text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest">{labels[index]}</label>
                                                <span className="text-xl md:text-2xl font-black text-red-900">{regStats[statKey]}</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="30" 
                                                max="99" 
                                                value={regStats[statKey]} 
                                                onChange={e => setRegStats({...regStats, [statKey]: parseInt(e.target.value)})}
                                                className="w-full accent-red-900 h-2 md:h-3 bg-gray-100 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                    );
                                })}
                                
                                <div className="pt-8">
                                    <button type="submit" className="w-full bg-red-900 text-white font-black py-6 md:py-8 rounded-[1.5rem] md:rounded-[2rem] text-xl md:text-3xl hover:bg-black transition-all shadow-xl transform hover:-translate-y-2 uppercase tracking-tighter italic">
                                        SUBMIT PROFILE ⚽
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && (
            <div className="container mx-auto px-4 py-12 md:py-16">
                {!isAdminAuth ? (
                    <div className="max-w-xl mx-auto bg-white p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl mt-8 animate-in zoom-in duration-500">
                        <div className="text-center mb-10 md:mb-12">
                            <div className="w-20 h-20 md:w-28 md:h-28 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner"><span className="text-4xl md:text-5xl">🔑</span></div>
                            <h2 className="text-3xl md:text-4xl font-black text-red-900 uppercase tracking-tighter italic">{t.adminAuthTitle}</h2>
                        </div>
                        <form onSubmit={handleAdminLogin} className="space-y-8 md:space-y-10">
                            <input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} className="w-full p-6 md:p-8 bg-gray-50 border-2 md:border-4 rounded-[1.5rem] md:rounded-[2rem] focus:border-red-900 outline-none text-center text-3xl md:text-5xl tracking-[0.3em] md:tracking-[0.4em] font-black" placeholder="••••" />
                            {adminError && <p className="text-red-600 text-base md:text-lg font-black text-center animate-bounce">{adminError}</p>}
                            <button className="w-full bg-black text-white py-5 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl md:text-2xl hover:bg-gray-800 transition shadow-xl uppercase tracking-widest">Login</button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-10 md:space-y-12 animate-in fade-in duration-700">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-10 bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-gray-100">
                            <div>
                                <h2 className="text-5xl md:text-7xl font-black text-red-900 tracking-tighter italic uppercase leading-none">{t.adminPanel}</h2>
                                <p className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] mt-3 md:mt-4">Operations Interface</p>
                            </div>
                            <div className="flex flex-wrap gap-2 md:gap-4 bg-gray-50 p-2 md:p-3 rounded-[1.5rem] md:rounded-[2.5rem] w-full lg:w-auto">
                                <button onClick={() => setAdminSubTab('requests')} className={`flex-1 lg:flex-none px-4 md:px-8 py-2 md:py-4 rounded-[1rem] md:rounded-[1.5rem] font-black text-[9px] md:text-xs tracking-wider transition uppercase whitespace-nowrap ${adminSubTab === 'requests' ? 'bg-red-900 text-white shadow-xl' : 'text-gray-400 hover:text-red-900'}`}>{t.pendingRequests}</button>
                                <button onClick={() => setAdminSubTab('teams')} className={`flex-1 lg:flex-none px-4 md:px-8 py-2 md:py-4 rounded-[1rem] md:rounded-[1.5rem] font-black text-[9px] md:text-xs tracking-wider transition uppercase whitespace-nowrap ${adminSubTab === 'teams' ? 'bg-red-900 text-white shadow-xl' : 'text-gray-400 hover:text-red-900'}`}>{t.teams}</button>
                                <button onClick={() => setAdminSubTab('players')} className={`flex-1 lg:flex-none px-4 md:px-8 py-2 md:py-4 rounded-[1rem] md:rounded-[1.5rem] font-black text-[9px] md:text-xs tracking-wider transition uppercase whitespace-nowrap ${adminSubTab === 'players' ? 'bg-red-900 text-white shadow-xl' : 'text-gray-400 hover:text-red-900'}`}>Squads</button>
                                <button onClick={() => setAdminSubTab('gallery')} className={`flex-1 lg:flex-none px-4 md:px-8 py-2 md:py-4 rounded-[1rem] md:rounded-[1.5rem] font-black text-[9px] md:text-xs tracking-wider transition uppercase whitespace-nowrap ${adminSubTab === 'gallery' ? 'bg-red-900 text-white shadow-xl' : 'text-gray-400 hover:text-red-900'}`}>{t.gallery}</button>
                                <button onClick={() => setIsAdminAuth(false)} className="flex-1 lg:flex-none px-4 md:px-8 py-2 md:py-4 rounded-[1rem] md:rounded-[1.5rem] font-black text-[9px] md:text-xs text-red-600 hover:bg-red-100 transition uppercase">Exit</button>
                            </div>
                        </div>

                        {/* Requests SubTab */}
                        {adminSubTab === 'requests' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                                {players.filter(p => p.status === 'pending').map(p => (
                                    <div key={p.id} className="p-8 bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-gray-100 flex flex-col gap-6 transform hover:scale-[1.03] transition-all">
                                        <div className="flex gap-4 md:gap-8 items-center">
                                            <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-[1.2rem] md:rounded-[2rem] overflow-hidden border p-1 flex-shrink-0">
                                                {p.photo ? <img src={p.photo} className="w-full h-full object-cover rounded-[1rem] md:rounded-[1.5rem]" /> : <div className="w-full h-full flex items-center justify-center text-gray-200 text-xl">👤</div>}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-black text-xl md:text-3xl tracking-tighter text-gray-900 truncate">{p.name}</p>
                                                <p className="text-[8px] md:text-[10px] font-black text-red-900/40 mt-1 uppercase tracking-widest">{p.phone}</p>
                                            </div>
                                        </div>
                                        <div className="bg-red-50/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-red-100/30">
                                            <div className="grid grid-cols-3 gap-y-4 md:gap-y-6 text-[8px] md:text-[10px] font-black uppercase text-gray-500">
                                                <div className="flex flex-col">SPD <span className="text-red-900 text-base md:text-lg">{p.stats?.speed}</span></div>
                                                <div className="flex flex-col">SHO <span className="text-red-900 text-base md:text-lg">{p.stats?.shooting}</span></div>
                                                <div className="flex flex-col">PAS <span className="text-red-900 text-base md:text-lg">{p.stats?.passing}</span></div>
                                                <div className="flex flex-col">DRI <span className="text-red-900 text-base md:text-lg">{p.stats?.dribbling}</span></div>
                                                <div className="flex flex-col">DEF <span className="text-red-900 text-base md:text-lg">{p.stats?.defending}</span></div>
                                                <div className="flex flex-col">PHY <span className="text-red-900 text-base md:text-lg">{p.stats?.physical}</span></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 md:gap-4 mt-auto">
                                            <button onClick={() => handleApprove(p.id)} className="flex-1 bg-green-600 text-white py-3 md:py-5 rounded-xl font-black text-[10px] md:text-xs hover:bg-green-700 shadow-lg uppercase">Approve</button>
                                            <button onClick={() => setPlayers(players.filter(x => x.id !== p.id))} className="flex-1 bg-gray-100 text-gray-400 py-3 md:py-5 rounded-xl font-black text-[10px] md:text-xs hover:bg-gray-200 uppercase">Reject</button>
                                        </div>
                                    </div>
                                ))}
                                {players.filter(p => p.status === 'pending').length === 0 && <div className="col-span-full py-24 md:py-40 text-center bg-white rounded-[2.5rem] md:rounded-[4rem] text-gray-300 italic font-black text-2xl md:text-3xl border-4 md:border-8 border-dashed border-gray-50">Clear Terminal.</div>}
                            </div>
                        )}

                        {/* Other Admin Tabs optimized for scrolling */}
                        {adminSubTab === 'teams' && (
                             <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl p-8 md:p-16 border border-gray-50 overflow-x-auto no-scrollbar">
                                <h3 className="text-3xl md:text-4xl font-black mb-10 text-gray-900 italic uppercase tracking-tighter">Team Records</h3>
                                <table className="w-full text-sm text-left rtl:text-right border-collapse min-w-[800px]">
                                    <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[9px] tracking-widest">
                                        <tr><th className="p-6">Brand</th><th className="p-6 text-center">PL</th><th className="p-6 text-center">W</th><th className="p-6 text-center">D</th><th className="p-6 text-center">L</th><th className="p-6 text-center">GD</th><th className="p-6 text-center">PTS</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teams.map(team => (
                                            <tr key={team.id} className="hover:bg-red-50/20 transition-all">
                                                <td className="p-6">
                                                    <div className="flex gap-2">
                                                        <input value={team.nameAr} onChange={e => updateTeamInfo(team.id, 'nameAr', e.target.value)} className="w-1/2 p-3 bg-gray-50 border rounded-xl font-black text-red-900 text-sm" />
                                                        <input value={team.nameZh} onChange={e => updateTeamInfo(team.id, 'nameZh', e.target.value)} className="w-1/2 p-3 bg-gray-50 border rounded-xl font-black text-red-900 text-sm" />
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center"><input type="number" value={team.played} onChange={e => updateTeamInfo(team.id, 'played', parseInt(e.target.value) || 0)} className="w-14 p-2 bg-white border rounded-xl text-center font-black" /></td>
                                                <td className="p-4 text-center"><input type="number" value={team.won} onChange={e => updateTeamInfo(team.id, 'won', parseInt(e.target.value) || 0)} className="w-14 p-2 bg-white border rounded-xl text-center font-black text-green-600" /></td>
                                                <td className="p-4 text-center"><input type="number" value={team.drawn} onChange={e => updateTeamInfo(team.id, 'drawn', parseInt(e.target.value) || 0)} className="w-14 p-2 bg-white border rounded-xl text-center font-black text-gray-400" /></td>
                                                <td className="p-4 text-center"><input type="number" value={team.lost} onChange={e => updateTeamInfo(team.id, 'lost', parseInt(e.target.value) || 0)} className="w-14 p-2 bg-white border rounded-xl text-center font-black text-red-400" /></td>
                                                <td className="p-4 text-center font-black italic">{team.goalsFor - team.goalsAgainst}</td>
                                                <td className="p-4 text-center"><input type="number" value={team.points} onChange={e => updateTeamInfo(team.id, 'points', parseInt(e.target.value) || 0)} className="w-16 p-3 bg-red-900 text-white rounded-xl text-center font-black" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        )}

                        {adminSubTab === 'players' && (
                             <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl p-8 md:p-16 border border-gray-50">
                                <h3 className="text-3xl md:text-4xl font-black mb-10 text-gray-900 italic uppercase tracking-tighter">Asset Directory</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                                    {players.filter(p => p.status === 'approved').map(p => (
                                        <div key={p.id} className={`p-8 bg-white border-2 rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col gap-6 items-center text-center transition-all ${p.isFeatured ? 'border-red-900 shadow-2xl scale-105' : 'border-gray-50 shadow-lg'}`}>
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-red-900 overflow-hidden relative shadow-xl">
                                                {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-50 flex items-center justify-center text-3xl">👤</div>}
                                                {p.isFeatured && <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center backdrop-blur-[1px]"><span className="text-3xl animate-pulse">🌟</span></div>}
                                            </div>
                                            <div>
                                                <p className="font-black text-2xl uppercase leading-tight tracking-tighter text-gray-900 truncate max-w-full">{p.name}</p>
                                                <p className="text-[9px] font-black text-red-900/40 uppercase tracking-widest mt-1">{p.wechatId}</p>
                                            </div>
                                            <div className="w-full space-y-3">
                                                <select 
                                                    value={p.teamId || ""} 
                                                    onChange={e => assignPlayerToTeam(p.id, e.target.value || undefined)}
                                                    className="w-full p-3 bg-gray-50 border-2 rounded-xl font-black text-[9px] outline-none uppercase tracking-widest cursor-pointer"
                                                >
                                                    <option value="">-- UNASSIGNED --</option>
                                                    {teams.map(t => <option key={t.id} value={t.id}>{lang === 'ar' ? t.nameAr : t.nameZh} ({t.players.length}/7)</option>)}
                                                </select>
                                                <button 
                                                    onClick={() => toggleFeatured(p.id)}
                                                    className={`w-full py-3 rounded-xl font-black text-[9px] transition uppercase tracking-widest ${p.isFeatured ? 'bg-red-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                                                >
                                                    {p.isFeatured ? 'DEMOTE' : 'FEATURE'}
                                                </button>
                                            </div>
                                            <button onClick={() => setPlayers(prev => prev.filter(pl => pl.id !== p.id))} className="text-[9px] text-red-500 font-black hover:underline mt-auto uppercase tracking-widest opacity-50">Erase</button>
                                        </div>
                                    ))}
                                    {players.filter(p => p.status === 'approved').length === 0 && <p className="col-span-full text-center py-20 text-gray-300 italic font-black text-2xl uppercase">Empty List.</p>}
                                </div>
                             </div>
                        )}

                        {adminSubTab === 'gallery' && (
                             <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl p-8 md:p-16 border border-gray-50">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                                    <h3 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Media Repository</h3>
                                    <label className="bg-red-900 text-white px-8 md:px-12 py-3 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black cursor-pointer hover:bg-black transition shadow-2xl text-[10px] md:text-xs tracking-widest uppercase flex items-center gap-3 transform hover:scale-105 active:scale-95">
                                        <span>APPEND MEDIA</span>
                                        <span className="text-xl md:text-2xl">📸</span>
                                        <input type="file" hidden accept="image/*" onChange={handleGalleryUpload} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
                                    {gallery.map(img => (
                                        <div key={img.id} className="relative group rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl aspect-square bg-gray-50 border p-1">
                                            <img src={img.url} className="w-full h-full object-cover rounded-[1.3rem] md:rounded-[2.2rem]" />
                                            <div className="absolute inset-0 bg-red-900/80 text-white font-black opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-4 text-center backdrop-blur-sm">
                                                <button onClick={() => deleteGalleryItem(img.id)} className="bg-white text-red-900 px-4 py-2 rounded-xl font-black text-[9px] tracking-widest transform hover:scale-110 active:scale-90 uppercase">Erase</button>
                                            </div>
                                        </div>
                                    ))}
                                    {gallery.length === 0 && <p className="col-span-full text-center py-20 text-gray-200 italic font-black text-2xl uppercase">Vault Empty.</p>}
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-20 md:py-32 mt-20 md:mt-32 border-t-[8px] md:border-t-[12px] border-red-900 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-red-900/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[60px] md:blur-[120px]"></div>
          
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-4 md:mb-8 text-red-900 uppercase select-none leading-none">YCFL</h2>
            <p className="text-gray-500 mb-10 md:mb-16 font-black text-[10px] md:text-sm tracking-[0.4em] md:tracking-[0.6em] uppercase">Yemeni Legacy in Sichuan</p>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-600">
                <button onClick={() => setActiveTab('home')} className="hover:text-red-700 transition-all">Foundation</button>
                <button onClick={() => setActiveTab('register')} className="hover:text-red-700 transition-all">Identity</button>
                <button onClick={() => setActiveTab('standings')} className="hover:text-red-700 transition-all">Board</button>
                <button onClick={() => setActiveTab('admin')} className="hover:text-red-700 transition-all">HQ</button>
            </div>
            
            <div className="mt-16 md:mt-24 flex justify-center gap-4 items-center opacity-30">
                <div className="w-10 md:w-16 h-[2px] bg-red-900"></div>
                <div className="flex gap-2">
                    <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-red-900"></div>
                    <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-white"></div>
                </div>
                <div className="w-10 md:w-16 h-[2px] bg-red-900"></div>
            </div>
            
            <div className="mt-12 text-[8px] md:text-[10px] text-gray-800 font-black tracking-[0.4em] md:tracking-[0.5em] uppercase space-y-2">
                <p>&copy; {new Date().getFullYear()} YCFL CHENGDU</p>
                <p className="text-red-900/30">Yemen Roots • Chengdu Heart</p>
            </div>
          </div>
      </footer>
    </div>
  );
};

export default App;
