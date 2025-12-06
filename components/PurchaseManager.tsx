import React, { useState, useEffect } from 'react';
import { Supplier, Purchase, Product } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Trash2, Truck, ShoppingBag, ArrowRight } from 'lucide-react';

const PurchaseManager = () => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'suppliers'>('purchases');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // New Supplier State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});

  // New Purchase State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseCart, setPurchaseCart] = useState<{product: Product, quantity: number, cost: number}[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setSuppliers(storageService.getSuppliers());
    setPurchases(storageService.getPurchases());
    setProducts(storageService.getProducts());
  };

  const handleSaveSupplier = () => {
    if (!newSupplier.name) return;
    const s: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSupplier.name,
      contactPerson: newSupplier.contactPerson || '',
      phone: newSupplier.phone || '',
      email: newSupplier.email || '',
      gstin: newSupplier.gstin || ''
    };
    storageService.saveSupplier(s);
    refreshData();
    setIsSupplierModalOpen(false);
    setNewSupplier({});
  };

  const deleteSupplier = (id: string) => {
    if (confirm("Delete supplier?")) {
      storageService.deleteSupplier(id);
      refreshData();
    }
  };

  const addToPurchaseCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setPurchaseCart(prev => {
       const existing = prev.find(i => i.product.id === productId);
       if (existing) return prev; // Already added
       return [...prev, { product, quantity: 1, cost: product.purchasePrice }];
    });
  };

  const updatePurchaseItem = (idx: number, field: 'quantity' | 'cost', value: number) => {
    setPurchaseCart(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removePurchaseItem = (idx: number) => {
    setPurchaseCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePurchase = () => {
    if (!selectedSupplierId || purchaseCart.length === 0) return;
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    
    const purchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      number: `PO-${Date.now().toString().slice(-6)}`,
      supplierId: selectedSupplierId,
      supplierName: supplier?.name || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      items: purchaseCart.map(i => ({
         productId: i.product.id,
         productName: i.product.name,
         quantity: i.quantity,
         unitCost: i.cost
      })),
      totalAmount: purchaseCart.reduce((sum, i) => sum + (i.quantity * i.cost), 0),
      status: 'Received'
    };

    storageService.savePurchase(purchase);
    refreshData();
    setIsPurchaseModalOpen(false);
    setPurchaseCart([]);
    setSelectedSupplierId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Purchase Management</h1>
        <div className="flex space-x-2 bg-white rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'purchases' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Purchase Orders
          </button>
          <button 
             onClick={() => setActiveTab('suppliers')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'suppliers' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Suppliers
          </button>
        </div>
      </div>

      {activeTab === 'suppliers' ? (
        <div className="space-y-4">
           <button onClick={() => setIsSupplierModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center shadow-sm w-fit">
              <Plus className="w-4 h-4 mr-2" /> Add Supplier
           </button>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {suppliers.map(s => (
               <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group">
                  <div className="flex items-center mb-3">
                     <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mr-3">
                        <Truck className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800">{s.name}</h3>
                        <p className="text-xs text-slate-500">{s.contactPerson}</p>
                     </div>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                     <p>Ph: {s.phone}</p>
                     <p>Email: {s.email}</p>
                     {s.gstin && <p className="text-xs bg-slate-100 inline-block px-1 rounded mt-1">GST: {s.gstin}</p>}
                  </div>
                  <button onClick={() => deleteSupplier(s.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="space-y-4">
           <button onClick={() => setIsPurchaseModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center shadow-sm w-fit">
              <Plus className="w-4 h-4 mr-2" /> Create Purchase Order (Stock In)
           </button>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                       <th className="px-6 py-4">PO Number</th>
                       <th className="px-6 py-4">Date</th>
                       <th className="px-6 py-4">Supplier</th>
                       <th className="px-6 py-4">Items</th>
                       <th className="px-6 py-4">Total Amount</th>
                       <th className="px-6 py-4">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 text-sm">
                    {purchases.map(p => (
                       <tr key={p.id}>
                          <td className="px-6 py-4 font-mono font-medium">{p.number}</td>
                          <td className="px-6 py-4 text-slate-500">{p.date}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{p.supplierName}</td>
                          <td className="px-6 py-4 text-slate-500">{p.items.length} Items</td>
                          <td className="px-6 py-4 font-medium text-emerald-600">₹{p.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Received</span></td>
                       </tr>
                    ))}
                    {purchases.length === 0 && (
                       <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No purchase records found.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
             <h2 className="text-xl font-bold mb-4">New Supplier</h2>
             <div className="space-y-4">
               <input placeholder="Company Name" className="w-full border rounded p-2" value={newSupplier.name || ''} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
               <input placeholder="Contact Person" className="w-full border rounded p-2" value={newSupplier.contactPerson || ''} onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})} />
               <input placeholder="Phone" className="w-full border rounded p-2" value={newSupplier.phone || ''} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} />
               <input placeholder="Email" className="w-full border rounded p-2" value={newSupplier.email || ''} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
               <input placeholder="GSTIN" className="w-full border rounded p-2" value={newSupplier.gstin || ''} onChange={e => setNewSupplier({...newSupplier, gstin: e.target.value})} />
             </div>
             <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button onClick={handleSaveSupplier} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
             </div>
           </div>
        </div>
      )}

      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Purchase Order</h2>
                <button onClick={() => setIsPurchaseModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Left: Product Selection */}
                <div className="lg:col-span-1 border-r border-slate-200 pr-6 flex flex-col overflow-hidden">
                   <select 
                      className="w-full border p-2 rounded mb-4"
                      value={selectedSupplierId}
                      onChange={e => setSelectedSupplierId(e.target.value)}
                   >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>

                   <div className="font-semibold text-sm text-slate-500 mb-2 uppercase">Add Products</div>
                   <div className="flex-1 overflow-y-auto space-y-2">
                      {products.map(p => (
                         <button key={p.id} onClick={() => addToPurchaseCart(p.id)} className="w-full text-left p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 flex justify-between items-center group">
                            <span className="font-medium text-sm text-slate-700 truncate">{p.name}</span>
                            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />
                         </button>
                      ))}
                   </div>
                </div>

                {/* Right: Cart */}
                <div className="lg:col-span-2 flex flex-col overflow-hidden">
                   <div className="flex-1 overflow-y-auto">
                      <table className="w-full">
                         <thead className="bg-slate-50 text-xs text-slate-500 text-left">
                            <tr>
                               <th className="p-2">Item</th>
                               <th className="p-2 w-24">Qty (Add Stock)</th>
                               <th className="p-2 w-24">Unit Cost</th>
                               <th className="p-2 w-24">Total</th>
                               <th className="p-2 w-10"></th>
                            </tr>
                         </thead>
                         <tbody>
                            {purchaseCart.map((item, idx) => (
                               <tr key={idx} className="border-b border-slate-100">
                                  <td className="p-2 font-medium text-sm">{item.product.name}</td>
                                  <td className="p-2">
                                     <input type="number" className="w-20 border rounded p-1" value={item.quantity} onChange={e => updatePurchaseItem(idx, 'quantity', parseFloat(e.target.value))} />
                                  </td>
                                  <td className="p-2">
                                     <input type="number" className="w-20 border rounded p-1" value={item.cost} onChange={e => updatePurchaseItem(idx, 'cost', parseFloat(e.target.value))} />
                                  </td>
                                  <td className="p-2 text-sm font-bold text-slate-700">
                                     ₹{(item.quantity * item.cost).toFixed(2)}
                                  </td>
                                  <td className="p-2">
                                     <button onClick={() => removePurchaseItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                  </td>
                               </tr>
                            ))}
                            {purchaseCart.length === 0 && (
                               <tr><td colSpan={5} className="p-8 text-center text-slate-400">Select products to add to purchase order</td></tr>
                            )}
                         </tbody>
                      </table>
                   </div>

                   <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between items-center">
                      <div className="text-xl font-bold text-slate-800">
                         Total: ₹{purchaseCart.reduce((s, i) => s + (i.quantity * i.cost), 0).toFixed(2)}
                      </div>
                      <button 
                         onClick={handleSavePurchase}
                         disabled={!selectedSupplierId || purchaseCart.length === 0}
                         className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                         Confirm Purchase
                      </button>
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManager;