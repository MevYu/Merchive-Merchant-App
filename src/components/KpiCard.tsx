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

export default function KpiCard({ label, value, hint, accent = '#22d3ee' }: KpiCardProps) {
  return (
    <View
      style={{
        flex: 1,
        background: 'rgba(20, 28, 58, 0.6)',
        borderRadius: '10px',
        padding: '12px',
        margin: '4px',
        minWidth: 0,
      }}
    >
      <Text style={{ display: 'block', fontSize: '11px', color: '#aab3c8' }}>{label}</Text>
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
        <Text style={{ display: 'block', fontSize: '10px', color: '#6b7493', marginTop: '2px' }}>
          {hint}
        </Text>
      )}
    </View>
  );
}
