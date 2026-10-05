import {
  Bolt,
  Flame,
  HandHeart,
  Heart,
  Laugh,
  Leaf,
  MessageCircle,
  Minimize2,
  Shield,
  Smile,
  Sparkles,
} from "lucide-react";
import type { ToneMeta } from "@/lib/tones";

const ICONS = {
  message: MessageCircle,
  heart: Heart,
  spark: Sparkles,
  minimize: Minimize2,
  shield: Shield,
  smile: Smile,
  leaf: Leaf,
  flame: Flame,
  laugh: Laugh,
  hand: HandHeart,
  bolt: Bolt,
};

export function ToneIcon({ icon, className }: { icon: ToneMeta["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden />;
}
