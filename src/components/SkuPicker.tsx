import { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { useTranslation } from 'react-i18next';

// SkuPicker is a placeholder for the order-wizard's add-SKU step.
// Real picker would fetch from /catalog/skus + barcode scan + image
// thumbnails — punted to P2. Until then, manual sku_id + qty entry
// keeps the rest of the flow exercisable.

export interface SkuPickerProps {
  onAdd: (sku_id: string, qty: number) => void;
}

export default function SkuPicker({ onAdd }: SkuPickerProps) {
  const { t } = useTranslation();
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('1');

  const submit = () => {
    const q = Math.max(1, parseInt(qty || '1', 10) || 1);
    if (!sku.trim()) return;
    onAdd(sku.trim(), q);
    setSku('');
    setQty('1');
  };

  return (
    <View
      style={{
        background: 'rgba(20, 28, 58, 0.6)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '8px',
      }}
    >
      <Text style={{ display: 'block', color: '#aab3c8', fontSize: '12px', marginBottom: '6px' }}>
        {t('pages:orders.addSku')}
      </Text>
      <View style={{ display: 'flex', gap: '8px' }}>
        <Input
          value={sku}
          onInput={(e) => setSku(e.detail.value)}
          placeholder="sku_id"
          style={{
            flex: 2,
            padding: '8px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '6px',
            color: '#e6edf7',
            fontSize: '13px',
          }}
        />
        <Input
          type="number"
          value={qty}
          onInput={(e) => setQty(e.detail.value)}
          placeholder="qty"
          style={{
            flex: 1,
            padding: '8px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '6px',
            color: '#e6edf7',
            fontSize: '13px',
          }}
        />
        <View
          onClick={submit}
          style={{
            background: '#22d3ee',
            color: '#0b1020',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          <Text style={{ color: '#0b1020' }}>+</Text>
        </View>
      </View>
    </View>
  );
}
