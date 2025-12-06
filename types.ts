export enum PaymentStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue'
}

export enum PaymentMode {
  Cash = 'Cash',
  Card = 'Card',
  UPI = 'UPI',
  BankTransfer = 'Bank Transfer',
  Credit = 'Credit'
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number; // Item specific tax
  hsn?: string;
  productId?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  gstin?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; // Selling Price
  purchasePrice: number; // Cost Price
  stock: number;
  category: string;
  hsn?: string;
  taxRate: number; // Default GST %
}

export interface BusinessSettings {
  companyName: string;
  address: string;
  gstin: string;
  phone: string;
  email: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  terms?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientGstin?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  status: PaymentStatus;
  notes?: string;
  currency: string;
  discount: number; // Bill-wise discount
  type: 'Standard' | 'Thermal';
  taxType: 'CGST_SGST' | 'IGST'; // Intra vs Inter state
  paymentMode?: PaymentMode;
}

export interface Quotation {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  date: string;
  validUntil: string;
  items: InvoiceItem[];
  status: 'Open' | 'Accepted' | 'Converted';
  discount: number;
  taxType: 'CGST_SGST' | 'IGST';
}

export interface Purchase {
  id: string;
  number: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
  totalAmount: number;
  status: 'Received' | 'Pending';
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: PaymentMode;
}

export interface AIParseResult {
  clientName?: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
  }[];
}