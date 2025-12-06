import React, { useState, useEffect } from 'react';
import { Product, Invoice, InvoiceItem, PaymentStatus, Client, PaymentMode } from '../types';
import { storageService } from '../services/storageService';
import { Search, ShoppingCart, Minus, Plus, Trash2, Printer, CheckCircle, CreditCard, Banknote, Smartphone, ChevronUp, X } from 'lucide-react';
import InvoicePreview from './InvoicePreview';

const POSTerminal = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tenderAmount, setTenderAmount] = useState<number>(0);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode>(PaymentMode.Cash);
  
  // Mobile Cart State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  useEffect(() => {
    setProducts(storageService.getProducts());
    setClients(storageService.getClients());
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        description: product.name,
        quantity: 1,
        rate: product.price,
        taxRate: product.taxRate,
        hsn: product.hsn,
        productId: product.id
      }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setIsMobileCartOpen(false);
  };

  const handleCheckoutSubmit = () => {
    if (cart.length === 0) return;

    const client = clients.find(c => c.id === selectedClientId) || { id: 'walk-in', name: 'Walk-in Customer', email: '', address: '' };

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      number: `POS-${Date.now().toString().slice(-6)}`,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email || '',
      clientAddress: client.address || '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      items: cart,
      status: PaymentStatus.Paid,
      currency: 'INR',
      discount: 0,
      type: 'Thermal',
      taxType: 'CGST_SGST', // Default POS tax type
      paymentMode: selectedPaymentMode,
      notes: 'POS Transaction'
    };

    storageService.saveInvoice(newInvoice);
    setCompletedInvoice(newInvoice);
    setCart([]);
    setSelectedClientId('');
    setShowCheckout(false);
    setTenderAmount(0);
    setIsMobileCartOpen(false);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const cartTax = cart.reduce((sum, item) => sum + (item.quantity * item.rate * (item.taxRate / 100)), 0);
  const grandTotal = cartSubtotal + cartTax;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Component (Used for both Desktop Sidebar and Mobile Drawer)
  const CartContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="font-bold text-lg flex items-center text-slate-800">
          <ShoppingCart className="w-5 h-5 mr-2" /> Current Sale
        </h2>
        <div className="flex items-center space-x-3">
          <button onClick={clearCart} className="text-xs text-red-500 hover:underline font-medium">Clear</button>
          {/* Mobile Close Button */}
          <button onClick={() => setIsMobileCartOpen(false)} className="md:hidden text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
             <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
             <p>Cart is empty</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-medium text-slate-800 truncate">{item.description}</div>
                <div className="text-xs text-slate-500">₹{item.rate.toFixed(2)} x {item.quantity} | Tax: {item.taxRate}%</div>
              </div>
              <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><Minus className="w-3 h-3"/></button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><Plus className="w-3 h-3"/></button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-400 hover:text-red-600 ml-1"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3 pb-safe-area">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>₹{cartSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Total Tax</span>
          <span>₹{cartTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
          <span>Total Pay</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
        
        <button 
          onClick={() => { setTenderAmount(grandTotal); setShowCheckout(true); }}
          disabled={cart.length === 0}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-4 transition-colors text-lg"
        >
          Checkout
        </button>
      </div>
    </div>
  );

  if (completedInvoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
        <p className="text-slate-600 mb-8">Transaction #{completedInvoice.number}</p>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button 
            onClick={() => window.print()} 
            className="flex items-center justify-center px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 shadow-lg w-full md:w-auto"
          >
            <Printer className="w-5 h-5 mr-2" /> Print Receipt
          </button>
          <button 
            onClick={() => setCompletedInvoice(null)} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg w-full md:w-auto"
          >
            New Sale
          </button>
        </div>

        <div className="mt-8 p-4 bg-slate-100 rounded-lg max-h-96 overflow-auto border border-slate-200 hidden md:block">
          <p className="text-xs text-center text-slate-500 mb-2">Receipt Preview</p>
          <InvoicePreview invoice={completedInvoice} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-6 overflow-hidden relative">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-base md:text-lg"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="w-full md:w-48 border border-slate-300 rounded-lg px-3 py-2.5 md:py-0 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
            >
              <option value="">Walk-in Customer</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
         </div>

         <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
               {filteredProducts.map(product => (
                 <button 
                   key={product.id}
                   onClick={() => addToCart(product)}
                   className="flex flex-col items-start p-3 md:p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all bg-slate-50 hover:bg-white text-left group active:scale-95"
                 >
                   <div className="font-bold text-slate-800 line-clamp-2 mb-1 group-hover:text-indigo-600 text-sm md:text-base">{product.name}</div>
                   <div className="text-xs text-slate-500 mb-2">{product.sku}</div>
                   <div className="mt-auto flex justify-between w-full items-end">
                      <div className="font-bold text-base md:text-lg text-emerald-600">₹{product.price.toFixed(2)}</div>
                      <div className="text-[10px] md:text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 whitespace-nowrap">Stk: {product.stock}</div>
                   </div>
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Desktop Cart Sidebar */}
      <div className="hidden md:flex w-96 bg-white rounded-xl shadow-lg border border-slate-200 flex-col">
         <CartContent />
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-20 flex justify-between items-center">
         <div onClick={() => setIsMobileCartOpen(true)} className="flex-1 cursor-pointer">
            <div className="text-xs text-slate-500">{totalItems} Items</div>
            <div className="font-bold text-xl text-indigo-600 flex items-center">
              ₹{grandTotal.toFixed(2)} 
              <ChevronUp className="w-4 h-4 ml-1 text-slate-400" />
            </div>
         </div>
         <button 
            onClick={() => setIsMobileCartOpen(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md active:bg-indigo-700"
         >
            View Cart
         </button>
      </div>

      {/* Mobile Cart Sheet/Modal */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)}></div>
           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl h-[85vh] animate-in slide-in-from-bottom duration-300">
              <CartContent />
           </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-slate-900">Confirm Payment</h3>
                 <button onClick={() => setShowCheckout(false)} className="md:hidden text-slate-400 p-2"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="mb-6 text-center">
                 <div className="text-sm text-slate-500 mb-1">Total Payable Amount</div>
                 <div className="text-4xl font-bold text-slate-900">₹{grandTotal.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[PaymentMode.Cash, PaymentMode.Card, PaymentMode.UPI].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSelectedPaymentMode(mode)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${selectedPaymentMode === mode ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {mode === PaymentMode.Cash && <Banknote className="w-6 h-6 mb-1"/>}
                    {mode === PaymentMode.Card && <CreditCard className="w-6 h-6 mb-1"/>}
                    {mode === PaymentMode.UPI && <Smartphone className="w-6 h-6 mb-1"/>}
                    <span className="text-xs font-semibold">{mode}</span>
                  </button>
                ))}
              </div>

              {selectedPaymentMode === PaymentMode.Cash && (
                <div className="mb-6 bg-slate-50 p-4 rounded-lg">
                   <label className="block text-sm font-medium text-slate-700 mb-2">Tendered Amount</label>
                   <input 
                     type="number" 
                     value={tenderAmount}
                     onChange={e => setTenderAmount(parseFloat(e.target.value))}
                     className="w-full text-2xl font-bold p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                   <div className="flex justify-between mt-3 text-sm">
                      <span className="text-slate-600">Change to return:</span>
                      <span className={`font-bold ${tenderAmount >= grandTotal ? 'text-green-600' : 'text-red-500'}`}>
                        ₹{Math.max(0, tenderAmount - grandTotal).toFixed(2)}
                      </span>
                   </div>
                </div>
              )}

              <div className="flex space-x-3">
                 <button onClick={() => setShowCheckout(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">
                   Cancel
                 </button>
                 <button 
                   onClick={handleCheckoutSubmit}
                   disabled={selectedPaymentMode === PaymentMode.Cash && tenderAmount < grandTotal}
                   className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Complete Sale
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default POSTerminal;