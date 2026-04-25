import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Bitcoin,
  Briefcase,
  Cpu,
  Film,
  Flame,
  Globe2,
  HeartPulse,
  Landmark,
  LayoutGrid,
  LineChart,
  Megaphone,
  Microscope,
  Music,
  Newspaper,
  Plane,
  Radio,
  Scale,
  Shield,
  Sparkles,
  Sprout,
  Trophy,
  Users,
  Wheat,
  Wrench,
} from "lucide-react";

/** Explicit slug → icon for known editorial categories. */
const SLUG_ICON: Record<string, LucideIcon> = {
  signals: Radio,
  news: Newspaper,
  politics: Landmark,
  business: Briefcase,
  finance: Banknote,
  markets: LineChart,
  tech: Cpu,
  technology: Cpu,
  science: Microscope,
  health: HeartPulse,
  sports: Trophy,
  entertainment: Film,
  music: Music,
  culture: Sparkles,
  world: Globe2,
  travel: Plane,
  climate: Sprout,
  environment: Sprout,
  energy: Flame,
  agriculture: Wheat,
  crypto: Bitcoin,
  cybersecurity: Shield,
  opinion: Megaphone,
  society: Users,
  lifestyle: Sparkles,
  automotive: Wrench,
  gaming: Trophy,
};

type KeywordIcon = { re: RegExp; Icon: LucideIcon };

const KEYWORD_ICONS: KeywordIcon[] = [
  { re: /signal|transmission|wire|dispatch/i, Icon: Radio },
  { re: /politic|election|parliament|government|policy/i, Icon: Landmark },
  { re: /market|stock|trade|econom|finance|bank|invest/i, Icon: LineChart },
  { re: /business|commerce|industry|corporate|startup/i, Icon: Briefcase },
  { re: /tech|digital|cyber|software|ai|comput|data|internet/i, Icon: Cpu },
  { re: /science|research|space|lab|physics|chemistry|biology/i, Icon: Microscope },
  { re: /health|medical|medicine|hospital|wellness|disease/i, Icon: HeartPulse },
  { re: /sport|olympic|league|football|soccer|basket|athlet/i, Icon: Trophy },
  { re: /entertain|celebr|hollywood|movie|television|tv\b/i, Icon: Film },
  { re: /music|concert|album|artist/i, Icon: Music },
  { re: /climate|weather|environment|carbon|green|energy/i, Icon: Sprout },
  { re: /crypto|blockchain|bitcoin|ethereum|defi/i, Icon: Bitcoin },
  { re: /war|conflict|defense|defence|military|security|nato/i, Icon: Shield },
  { re: /travel|tourism|flight|airline/i, Icon: Plane },
  { re: /education|school|university|student/i, Icon: Newspaper },
  { re: /law|legal|court|justice|crime/i, Icon: Scale },
  { re: /real\s*estate|housing|property/i, Icon: Banknote },
];

export function mainTopicIconFor(slug: string, name: string): LucideIcon {
  const s = slug.toLowerCase();
  const direct = SLUG_ICON[s];
  if (direct) return direct;

  const n = name.toLowerCase();
  const slugish = n.replace(/\s+/g, "-");
  const fromNameSlug = SLUG_ICON[slugish];
  if (fromNameSlug) return fromNameSlug;

  for (const { re, Icon } of KEYWORD_ICONS) {
    if (re.test(s) || re.test(n)) return Icon;
  }

  return LayoutGrid;
}
