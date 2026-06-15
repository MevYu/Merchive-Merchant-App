import { View, Text } from '@tarojs/components';

// KpiCard is a small framed number — dashboard uses 4 of them in a
// 2x2 grid. Kept stateless and style-inlined to avoid pulling in a
// css-modules toolchain just for this card.

export interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}

export default function KpiCard({ label, value, hint, accent = 'var(--primary)' }: KpiCardProps) {
  return (
    <View
      style={{
        flex: 1,
        background: 'var(--bg-elev)',
        borderRadius: '16px',
        border: '1px solid rgba(17,24,39,0.10)',
        boxShadow: '0 1px 2px rgba(17,24,39,0.04)',
        padding: '12px',
        margin: '4px',
        minWidth: 0,
      }}
    >
      <Text style={{ display: 'block', fontSize: '11px', color: 'var(--text-mute)' }}>{label}</Text>
      <Text
        style={{
          display: 'block',
          fontSize: '20px',
          fontWeight: 'bold',
          color: accent,
          marginTop: '4px',
        }}
      >
        {value}
      </Text>
      {hint && (
        <Text style={{ display: 'block', fontSize: '10px', color: 'var(--text-mute)', marginTop: '2px' }}>
          {hint}
        </Text>
      )}
    </View>
  );
}
