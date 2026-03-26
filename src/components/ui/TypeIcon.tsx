import { Code, Sparkles, Terminal, StickyNote, Link as LinkIcon, File, Image } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
};

export default function TypeIcon({
  iconName,
  color,
  size = 14,
}: {
  iconName: string;
  color: string;
  size?: number;
}) {
  const Icon = ICON_MAP[iconName] ?? File;
  return <Icon size={size} style={{ color }} />;
}
