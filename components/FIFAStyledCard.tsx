
import React from 'react';
import { Player, PlayerStats, Language } from '../types';

interface FIFAStyledCardProps {
  player: Player;
  lang: Language;
}

const FIFAStyledCard: React.FC<FIFAStyledCardProps> = ({ player, lang }) => {
  const stats = player.stats || {
    speed: 75, shooting: 70, passing: 80, dribbling: 78, defending: 65, physical: 72
  };
  
  const overall = player.rating || Math.round(
    (stats.speed + stats.shooting + stats.passing + stats.dribbling + stats.defending + stats.physical) / 6
  );

  const labels = lang === 'ar' ? 
    ['سرعة', 'تسديد', 'تمرير', 'مراوغة', 'دفاع', 'بدني'] : 
    ['速度', '射门', '传球', '盘带', '防守', '体能'];

  const statKeys: (keyof PlayerStats)[] = ['speed', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];

  const profilePhoto = player.photo || `https://picsum.photos/seed/${player.id}/200`;

  return (
    <div className="relative w-64 h-96 bg-[#d1a33b] p-1 rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
      {/* Background with texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f3db7e] via-[#d1a33b] to-[#a67c2d] opacity-90 z-0"></div>
      
      {/* Decorative lines */}
      <div className="absolute inset-0 border-4 border-yellow-200 opacity-20 z-0"></div>

      <div className="relative z-10 h-full flex flex-col p-4 text-gray-900 font-bold uppercase">
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-center">
            <span className="text-5xl">{overall}</span>
            <span className="text-xl">ST</span>
            <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Yemen.svg/1200px-Flag_of_Yemen.svg.png" 
                alt="Yemen" 
                className="w-10 h-6 mt-2 rounded shadow-sm"
            />
          </div>
          <div className="flex-1 ml-4 overflow-hidden rounded-full border-2 border-yellow-100 bg-white/50 aspect-square">
             <img 
                src={profilePhoto} 
                alt={player.name}
                className="w-full h-full object-cover"
             />
          </div>
        </div>

        <div className="mt-4 text-center">
            <h3 className="text-2xl border-b-2 border-yellow-700/30 pb-1 truncate font-black">{player.name}</h3>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm px-2">
            {statKeys.map((key, idx) => (
                <div key={key} className="flex justify-between border-b border-yellow-700/20">
                    <span className="font-black">{stats[key]}</span>
                    <span className="text-[10px]">{labels[idx]}</span>
                </div>
            ))}
        </div>

        <div className="mt-auto flex justify-center pt-2">
            <span className="bg-black/10 px-4 py-1 rounded-full text-[10px] font-black">YCFL LEAGUE CHENGDU</span>
        </div>
      </div>
    </div>
  );
};

export default FIFAStyledCard;
