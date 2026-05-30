import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CURRENCY } from '@/lib/utils';

export type ReceiptData = {
  orderId: string;
  storeName: string;
  date: string;
  cashierName: string;
  customerName: string | null;
  paymentMethod: string;
  status: string;
  items: Array<{ id: string; name: string; quantity: number; unitPrice: number }>;
  total: number;
};

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 28, backgroundColor: '#ffffff', color: '#1a1a1a' },
  center: { textAlign: 'center' },
  storeName: { fontSize: 16, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 3 },
  subtitle: { fontSize: 8, textAlign: 'center', color: '#888888', letterSpacing: 2, marginBottom: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e5e5', marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#666666' },
  value: { fontFamily: 'Helvetica-Bold' },
  mono: { fontFamily: 'Courier-Bold' },
  sectionTitle: { fontSize: 8, color: '#888888', letterSpacing: 1.5, marginBottom: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  itemName: { flex: 1 },
  itemQty: { color: '#888888', marginLeft: 4 },
  itemTotal: { fontFamily: 'Helvetica-Bold', marginLeft: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  totalValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#16a34a' },
  refunded: { textAlign: 'center', color: '#dc2626', fontFamily: 'Helvetica-Bold', fontSize: 11, marginTop: 6 },
  footer: { textAlign: 'center', color: '#aaaaaa', fontSize: 8, marginTop: 16 },
});

const PAYMENT_LABELS: Record<string, string> = { CASH: 'Cash', CARD: 'Credit Card', NFC: 'NFC / Mobile' };

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  return (
    <Document title={`Receipt #${data.orderId}`} author={data.storeName}>
      <Page size="A6" style={s.page}>
        <Text style={s.storeName}>{data.storeName}</Text>
        <Text style={s.subtitle}>RECEIPT</Text>

        <View style={s.divider} />

        <View style={s.row}>
          <Text style={s.label}>Date</Text>
          <Text style={s.value}>{data.date}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Order #</Text>
          <Text style={s.mono}>{data.orderId}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Cashier</Text>
          <Text style={s.value}>{data.cashierName}</Text>
        </View>
        {data.customerName && (
          <View style={s.row}>
            <Text style={s.label}>Customer</Text>
            <Text style={s.value}>{data.customerName}</Text>
          </View>
        )}
        <View style={s.row}>
          <Text style={s.label}>Payment</Text>
          <Text style={s.value}>{PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod}</Text>
        </View>

        {data.status === 'REFUNDED' && <Text style={s.refunded}>— REFUNDED —</Text>}

        <View style={s.divider} />

        <Text style={s.sectionTitle}>ITEMS</Text>
        {data.items.map(item => (
          <View key={item.id} style={s.itemRow}>
            <Text style={s.itemName}>{item.name}</Text>
            <Text style={s.itemQty}>× {item.quantity}</Text>
            <Text style={s.itemTotal}>{CURRENCY} {(item.unitPrice * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View style={s.divider} />

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>{CURRENCY} {data.total.toFixed(2)}</Text>
        </View>

        <Text style={s.footer}>Thank you for your purchase!</Text>
      </Page>
    </Document>
  );
}
