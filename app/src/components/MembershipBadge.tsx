interface MembershipBadgeProps {
  tier: string;
  size?: 'sm' | 'md' | 'lg';
}

const TIER_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  Bronze: { bg: '#CD7F32', text: '#fff', icon: '🥉' },
  Silver: { bg: '#C0C0C0', text: '#333', icon: '🥈' },
  Gold:   { bg: '#FFD700', text: '#333', icon: '🥇' },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export default function MembershipBadge({ tier, size = 'md' }: MembershipBadgeProps) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.Bronze;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.icon} {tier}
    </span>
  );
}
