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
  if (process.env.NODE_ENV !== 'production' && !ICON_MAP[iconName]) {
    console.warn(`TypeIcon: unknown icon "${iconName}", falling back to File`);
  }
  const Icon = ICON_MAP[iconName] ?? File;
  return <Icon size={size} style={{ color }} />;
}
