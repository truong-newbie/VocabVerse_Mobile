import { Text } from '@/components/ui/Text';

export type IconName =
  | 'close'
  | 'plus'
  | 'search'
  | 'chevron-right'
  | 'chevron-left'
  | 'check'
  | 'flame'
  | 'trophy'
  | 'bell'
  | 'settings'
  | 'logout'
  | 'book'
  | 'pencil'
  | 'trash'
  | 'eye'
  | 'eye-off'
  | 'star'
  | 'lightning'
  | 'sparkle'
  | 'play'
  | 'pause'
  | 'replay'
  | 'arrow-right'
  | 'arrow-left'
  | 'menu'
  | 'filter'
  | 'sort'
  | 'send'
  | 'refresh'
  | 'home'
  | 'cards'
  | 'practice'
  | 'profile';

const ICON_MAP: Record<IconName, string> = {
  close: '✕',
  plus: '+',
  search: '🔍',
  'chevron-right': '›',
  'chevron-left': '‹',
  check: '✓',
  flame: '🔥',
  trophy: '🏆',
  bell: '🔔',
  settings: '⚙',
  logout: '⎋',
  book: '📖',
  pencil: '✎',
  trash: '🗑',
  eye: '👁',
  'eye-off': '◌',
  star: '★',
  lightning: '⚡',
  sparkle: '✨',
  play: '▶',
  pause: '❚❚',
  replay: '↻',
  'arrow-right': '→',
  'arrow-left': '←',
  menu: '☰',
  filter: '⌕',
  sort: '⇅',
  send: '➤',
  refresh: '↻',
  home: '⌂',
  cards: '🂠',
  practice: '🎯',
  profile: '☺',
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}

/**
 * Lightweight icon set based on Unicode + emoji glyphs so the project
 * does not need react-native-vector-icons during the foundation
 * phase. Swap to a real icon font in Phase 4 if needed.
 */
export function Icon({ name, size = 18, color, accessibilityLabel }: IconProps) {
  return (
    <Text
      style={{ fontSize: size, lineHeight: size + 4, color, textAlign: 'center' }}
      accessibilityLabel={accessibilityLabel ?? name}
    >
      {ICON_MAP[name]}
    </Text>
  );
}
