
export type Language = 'ar' | 'zh';

export interface PlayerStats {
  speed: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  name: string;
  phone: string;
  wechatId: string;
  status: 'pending' | 'approved' | 'rejected';
  teamId?: string;
  stats?: PlayerStats;
  rating?: number;
  photo?: string; // Base64 or URL
  isFeatured?: boolean; // Controls display on Home page
}

export interface Team {
  id: string;
  nameAr: string;
  nameZh: string;
  players: string[]; // Player IDs
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  date: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  status: 'scheduled' | 'finished';
}
