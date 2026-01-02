export type ReceiptItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

// New: Settings for the visual appearance
export type ReceiptSettings = {
  color: string;
  showLogo: boolean;
  template: 'simple' | 'detailed';
};

export type ReceiptData = {
  receiptNumber: string;
  date: string;
  customerName: string;
  currency: '₦' | '$' | '€' | '£';
  items: ReceiptItem[];
  paymentMethod: 'Cash' | 'Transfer' | 'POS' | 'Card';
  status: 'Paid' | 'Pending' | 'Unpaid';
  discount: number;
  shipping: number;
  businessName: string;
  businessPhone: string;
  note: string;
};
