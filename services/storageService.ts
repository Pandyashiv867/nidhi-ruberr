import { Invoice, Client, PaymentStatus, Product, Supplier, Expense, Purchase, PaymentMode, BusinessSettings, Quotation } from '../types';

const INVOICE_KEY = 'billegen_invoices';
const QUOTATION_KEY = 'billegen_quotations';
const CLIENT_KEY = 'billegen_clients';
const PRODUCT_KEY = 'billegen_products';
const SUPPLIER_KEY = 'billegen_suppliers';
const EXPENSE_KEY = 'billegen_expenses';
const PURCHASE_KEY = 'billegen_purchases';
const SETTINGS_KEY = 'billegen_settings';

// Mock Data
const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Precision Earthmovers Pvt Ltd', email: 'purchase@precisionearth.in', address: 'Plot 45, MIDC Industrial Area, Pune, MH', phone: '+91 98765 43210', gstin: '27AAACP1234F1Z5' },
  { id: '2', name: 'Star Hydraulic Works', email: 'service@starhydro.in', address: 'Shop 12, Transport Nagar, Delhi', phone: '+91 99887 66554' },
  { id: '3', name: 'Walk-in Mechanic', email: '', address: '', phone: '' },
];

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'National Polymers & Rubbers', contactPerson: 'Vikram Sethi', phone: '011-2345678', email: 'sales@nationalpolymer.in', gstin: '07AAACN1234F1Z1' },
  { id: 's2', name: 'Imported Seal Distributors', contactPerson: 'Amit Shah', phone: '022-8765432', email: 'orders@isdindia.com' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Nitrile (NBR) O-Ring Kit (419 Pcs)', sku: 'OR-NBR-KIT', price: 1250, purchasePrice: 800, stock: 50, category: 'O-Rings', hsn: '401693', taxRate: 18 },
  { id: 'p2', name: 'TC Oil Seal 25x40x7 (Double Lip)', sku: 'OS-TC-25407', price: 85, purchasePrice: 45, stock: 200, category: 'Oil Seals', hsn: '848790', taxRate: 18 },
  { id: 'p3', name: 'PTFE Piston Ring 60mm', sku: 'PTFE-PR-60', price: 450, purchasePrice: 280, stock: 75, category: 'PTFE Rings', hsn: '392690', taxRate: 18 },
  { id: 'p4', name: 'PU Rod Seal U-Cup 50x60x8', sku: 'RS-PU-50608', price: 180, purchasePrice: 110, stock: 150, category: 'Rod Seals', hsn: '848410', taxRate: 18 },
  { id: 'p5', name: 'Viton (FKM) O-Ring 3mm x 20mm', sku: 'OR-FKM-320', price: 45, purchasePrice: 20, stock: 500, category: 'O-Rings', hsn: '401693', taxRate: 18 },
  { id: 'p6', name: 'Hydraulic Cylinder Seal Kit (JCB 3DX)', sku: 'SK-JCB-3DX', price: 2800, purchasePrice: 1800, stock: 15, category: 'Kits', hsn: '848490', taxRate: 18 },
  { id: 'p7', name: 'Das Compact Seal 80x60x22.4', sku: 'DAS-8060', price: 850, purchasePrice: 550, stock: 40, category: 'Piston Seals', hsn: '848410', taxRate: 18 },
  { id: 'p8', name: 'Wiper Seal 40x48x5/7', sku: 'WS-4048', price: 65, purchasePrice: 35, stock: 300, category: 'Wipers', hsn: '401693', taxRate: 18 },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: '101',
    number: 'INV-2023-001',
    clientId: '1',
    clientName: 'Precision Earthmovers Pvt Ltd',
    clientEmail: 'purchase@precisionearth.in',
    clientAddress: 'Plot 45, MIDC Industrial Area, Pune, MH',
    issueDate: '2023-10-01',
    dueDate: '2023-10-15',
    items: [
      { id: 'a1', description: 'Hydraulic Cylinder Seal Kit (JCB 3DX)', quantity: 2, rate: 2800, taxRate: 18, hsn: '848490', productId: 'p6' },
      { id: 'a2', description: 'TC Oil Seal 25x40x7 (Double Lip)', quantity: 10, rate: 85, taxRate: 18, hsn: '848790', productId: 'p2' },
    ],
    status: PaymentStatus.Paid,
    currency: 'INR',
    discount: 100,
    type: 'Standard',
    taxType: 'IGST',
    paymentMode: PaymentMode.BankTransfer
  }
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', date: '2023-10-05', category: 'Rent', description: 'Shop Rent Oct', amount: 15000, paymentMode: PaymentMode.BankTransfer },
  { id: 'e2', date: '2023-10-10', category: 'Logistics', description: 'Transport Charges - Rubber Parts', amount: 1200, paymentMode: PaymentMode.Cash },
];

const DEFAULT_SETTINGS: BusinessSettings = {
  companyName: 'Royal Seals & Hydraulics',
  address: 'Shop 42, Machinery Market, Kashmere Gate, Delhi - 110006',
  gstin: '07AABCR1234F1Z5',
  phone: '+91 98765 43210',
  email: 'sales@royalseals.in',
  bankName: 'HDFC Bank',
  accountNumber: '50200012345678',
  ifsc: 'HDFC0001234',
  terms: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged on overdue payments.'
};

export const storageService = {
  // Settings
  getSettings: (): BusinessSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: BusinessSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
  exportData: () => {
    const data = {
      settings: storageService.getSettings(),
      clients: storageService.getClients(),
      products: storageService.getProducts(),
      invoices: storageService.getInvoices(),
      suppliers: storageService.getSuppliers(),
      purchases: storageService.getPurchases(),
      expenses: storageService.getExpenses(),
      quotations: storageService.getQuotations()
    };
    return JSON.stringify(data);
  },
  importData: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
      if (data.clients) localStorage.setItem(CLIENT_KEY, JSON.stringify(data.clients));
      if (data.products) localStorage.setItem(PRODUCT_KEY, JSON.stringify(data.products));
      if (data.invoices) localStorage.setItem(INVOICE_KEY, JSON.stringify(data.invoices));
      if (data.suppliers) localStorage.setItem(SUPPLIER_KEY, JSON.stringify(data.suppliers));
      if (data.purchases) localStorage.setItem(PURCHASE_KEY, JSON.stringify(data.purchases));
      if (data.expenses) localStorage.setItem(EXPENSE_KEY, JSON.stringify(data.expenses));
      if (data.quotations) localStorage.setItem(QUOTATION_KEY, JSON.stringify(data.quotations));
      return true;
    } catch (e) {
      return false;
    }
  },

  // Invoices
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(INVOICE_KEY);
    return data ? JSON.parse(data) : MOCK_INVOICES;
  },
  saveInvoice: (invoice: Invoice) => {
    const invoices = storageService.getInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id);
    
    if (index === -1) { // New invoice
      const products = storageService.getProducts();
      invoice.items.forEach(item => {
        if (item.productId) {
          const pIndex = products.findIndex(p => p.id === item.productId);
          if (pIndex >= 0) {
            products[pIndex].stock = Math.max(0, products[pIndex].stock - item.quantity);
          }
        }
      });
      localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
    }

    if (index >= 0) invoices[index] = invoice;
    else invoices.unshift(invoice);
    localStorage.setItem(INVOICE_KEY, JSON.stringify(invoices));
  },
  deleteInvoice: (id: string) => {
    const invoices = storageService.getInvoices().filter(i => i.id !== id);
    localStorage.setItem(INVOICE_KEY, JSON.stringify(invoices));
  },

  // Quotations
  getQuotations: (): Quotation[] => {
    const data = localStorage.getItem(QUOTATION_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveQuotation: (quotation: Quotation) => {
    const list = storageService.getQuotations();
    const index = list.findIndex(q => q.id === quotation.id);
    if (index >= 0) list[index] = quotation; else list.unshift(quotation);
    localStorage.setItem(QUOTATION_KEY, JSON.stringify(list));
  },
  deleteQuotation: (id: string) => {
    const list = storageService.getQuotations().filter(q => q.id !== id);
    localStorage.setItem(QUOTATION_KEY, JSON.stringify(list));
  },

  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(CLIENT_KEY);
    return data ? JSON.parse(data) : MOCK_CLIENTS;
  },
  saveClient: (client: Client) => {
    const list = storageService.getClients();
    const index = list.findIndex(i => i.id === client.id);
    if (index >= 0) list[index] = client; else list.push(client);
    localStorage.setItem(CLIENT_KEY, JSON.stringify(list));
  },
  deleteClient: (id: string) => {
    const list = storageService.getClients().filter(i => i.id !== id);
    localStorage.setItem(CLIENT_KEY, JSON.stringify(list));
  },

  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(PRODUCT_KEY);
    return data ? JSON.parse(data) : MOCK_PRODUCTS;
  },
  saveProduct: (product: Product) => {
    const list = storageService.getProducts();
    const index = list.findIndex(i => i.id === product.id);
    if (index >= 0) list[index] = product; else list.push(product);
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(list));
  },
  deleteProduct: (id: string) => {
    const list = storageService.getProducts().filter(i => i.id !== id);
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(list));
  },

  // Suppliers
  getSuppliers: (): Supplier[] => {
    const data = localStorage.getItem(SUPPLIER_KEY);
    return data ? JSON.parse(data) : MOCK_SUPPLIERS;
  },
  saveSupplier: (supplier: Supplier) => {
    const list = storageService.getSuppliers();
    const index = list.findIndex(s => s.id === supplier.id);
    if (index >= 0) list[index] = supplier; else list.push(supplier);
    localStorage.setItem(SUPPLIER_KEY, JSON.stringify(list));
  },
  deleteSupplier: (id: string) => {
    const list = storageService.getSuppliers().filter(s => s.id !== id);
    localStorage.setItem(SUPPLIER_KEY, JSON.stringify(list));
  },

  // Expenses
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(EXPENSE_KEY);
    return data ? JSON.parse(data) : MOCK_EXPENSES;
  },
  saveExpense: (expense: Expense) => {
    const list = storageService.getExpenses();
    const index = list.findIndex(e => e.id === expense.id);
    if (index >= 0) list[index] = expense; else list.unshift(expense);
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(list));
  },
  deleteExpense: (id: string) => {
    const list = storageService.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(list));
  },

  // Purchases
  getPurchases: (): Purchase[] => {
    const data = localStorage.getItem(PURCHASE_KEY);
    return data ? JSON.parse(data) : [];
  },
  savePurchase: (purchase: Purchase) => {
    const list = storageService.getPurchases();
    const index = list.findIndex(p => p.id === purchase.id);
    
    // Add stock
    if (index === -1) {
      const products = storageService.getProducts();
      purchase.items.forEach(item => {
        const pIndex = products.findIndex(p => p.id === item.productId);
        if (pIndex >= 0) {
          products[pIndex].stock += item.quantity;
        }
      });
      localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
    }

    if (index >= 0) list[index] = purchase; else list.unshift(purchase);
    localStorage.setItem(PURCHASE_KEY, JSON.stringify(list));
  }
};