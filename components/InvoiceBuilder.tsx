import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, PaymentStatus, Client, Product, PaymentMode } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Plus, Trash2, Wand2, Save, ArrowLeft, Loader2, Printer, ChevronLeft } from 'lucide-react';
import InvoicePreview from './InvoicePreview';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface InvoiceBuilderProps {
  existingInvoice?: Invoice | null;
  onSave: () => void;
  onCancel: () => void;
}

const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ existingInvoice, onSave, onCancel }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAiModal, setShowAiModal] = useState(false);

  const [invoice, setInvoice] = useState<Invoice>(existingInvoice || {
    id: generateId(),
    number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ id: generateId(), description: '', quantity: 1, rate: 0, taxRate: 0 }],
    status: PaymentStatus.Draft,
    currency: 'INR',
    discount: 0,
    type: 'Standard',
    taxType: 'CGST_SGST',
    notes: 'Thank you for your business!'
  });

  useEffect(() => {
    setClients(storageService.getClients());
    setProducts(storageService.getProducts());
  }, []);

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setInvoice(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        clientAddress: client.address,
        clientGstin: client.gstin
      }));
    } else {
       setInvoice(prev => ({ ...prev, clientId: '', clientName: '', clientEmail: '', clientAddress: '' }));
    }
  };

  const handleProductSelect = (itemId: string, productName: string) => {
    const product = products.find(p => p.name === productName);
    if (product) {
      setInvoice(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === itemId ? {
          ...item,
          description: product.name,
          rate: product.price,
          taxRate: product.taxRate,
          hsn: product.hsn,
          productId: product.id
        } : item)
      }));
    } else {
      updateItem(itemId, 'description', productName);
    }
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), description: '', quantity: 1, rate: 0, taxRate: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setLoadingAI(true);
    try {
      const result = await geminiService.parseInvoiceRequest(aiPrompt);
      
      const newItems = result.items.map(item => ({
        id: generateId(),
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        taxRate: 0 // AI currently doesn't guess tax
      }));

      setInvoice(prev => ({
        ...prev,
        clientName: result.clientName || prev.clientName,
        items: newItems.length > 0 ? newItems : prev.items
      }));
      setShowAiModal(false);
      setAiPrompt('');
    } catch (error) {
      alert("Failed to generate invoice from AI. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = () => {
    storageService.saveInvoice(invoice);
    onSave();
  };

  const printInvoice = () => {
    window.print();
  };

  if (viewMode === 'preview') {
    return (
      <div className="min-h-screen bg-slate-100 pb-10">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 no-print">
          <div className="flex items-center space-x-4">
            <button onClick={() => setViewMode('edit')} className="flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Edit
            </button>
          </div>
          <div className="flex items-center space-x-3">
             <button 
              onClick={printInvoice}
              className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" /> Print
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" /> Save Invoice
            </button>
          </div>
        </div>
        <div className="mt-8 overflow-auto">
           <InvoicePreview invoice={invoice} />
        </div>
      </div>
    );
  }

  // Calculate totals
  const subTotal = invoice.items.reduce((s, i) => s + (i.quantity * i.rate), 0);
  const totalTax = invoice.items.reduce((s, i) => s + (i.quantity * i.rate * (i.taxRate / 100)), 0);
  const grandTotal = subTotal - (invoice.discount || 0) + totalTax;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-800 mb-2 flex items-center">
             <ChevronLeft className="w-4 h-4 mr-1" /> Back to Invoices
           </button>
           <h2 className="text-2xl font-bold text-slate-900">{existingInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
        </div>
        
        <div className="flex space-x-2 w-full md:w-auto">
          <button 
            onClick={() => setShowAiModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:opacity-90 shadow-md transition-all text-sm"
          >
            <Wand2 className="w-4 h-4 mr-2" /> AI Autofill
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            Preview
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-colors text-sm"
          >
            <Save className="w-4 h-4 mr-2" /> Save
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Left Column: Client Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Client Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
              <select 
                value={invoice.clientId}
                onChange={handleClientChange}
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value="">-- Manual Entry --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                <input 
                  type="text" 
                  value={invoice.clientName}
                  onChange={e => setInvoice(prev => ({...prev, clientName: e.target.value}))}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
                <input 
                  type="text" 
                  value={invoice.clientGstin || ''}
                  onChange={e => setInvoice(prev => ({...prev, clientGstin: e.target.value}))}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="GST Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea 
                  value={invoice.clientAddress}
                  onChange={e => setInvoice(prev => ({...prev, clientAddress: e.target.value}))}
                  rows={3}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Street address, City, State, Zip"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Details */}
          <div className="space-y-6">
             <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Invoice Details</h3>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number</label>
                  <input 
                    type="text" 
                    value={invoice.number}
                    onChange={e => setInvoice(prev => ({...prev, number: e.target.value}))}
                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={invoice.status}
                    onChange={e => setInvoice(prev => ({...prev, status: e.target.value as PaymentStatus}))}
                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                  <input 
                    type="date" 
                    value={invoice.issueDate}
                    onChange={e => setInvoice(prev => ({...prev, issueDate: e.target.value}))}
                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={invoice.dueDate}
                    onChange={e => setInvoice(prev => ({...prev, dueDate: e.target.value}))}
                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
                   <select 
                      value={invoice.type}
                      onChange={e => setInvoice(prev => ({...prev, type: e.target.value as 'Standard' | 'Thermal'}))}
                      className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                   >
                     <option value="Standard">Standard A4</option>
                     <option value="Thermal">Thermal Receipt</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Tax Type</label>
                   <select 
                      value={invoice.taxType}
                      onChange={e => setInvoice(prev => ({...prev, taxType: e.target.value as 'CGST_SGST' | 'IGST'}))}
                      className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                   >
                     <option value="CGST_SGST">Intra-state (CGST + SGST)</option>
                     <option value="IGST">Inter-state (IGST)</option>
                   </select>
                </div>
             </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-200">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-slate-800">Items</h3>
             <button onClick={addItem} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
               <Plus className="w-4 h-4 mr-1" /> Add Item
             </button>
           </div>
           
           <div className="space-y-4">
             {invoice.items.map((item) => (
               <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm group">
                 {/* Mobile: Stacked, Desktop: Row */}
                 <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                   {/* Product Name Input */}
                   <div className="w-full md:flex-grow relative">
                      <label className="block md:hidden text-xs font-semibold text-slate-500 mb-1">Item Description</label>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={e => handleProductSelect(item.id, e.target.value)}
                        placeholder="Description or search product..."
                        list={`products-${item.id}`}
                        className="w-full bg-slate-50 md:bg-transparent border md:border-none border-slate-200 rounded p-2 font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 md:focus:ring-0"
                      />
                      <datalist id={`products-${item.id}`}>
                        {products.map(p => (
                          <option key={p.id} value={p.name}>{p.name} - ₹{p.price}</option>
                        ))}
                      </datalist>
                   </div>
                   
                   {/* Qty, Rate, Tax Container */}
                   <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                      <div className="md:w-24">
                        <label className="block md:hidden text-xs font-semibold text-slate-500 mb-1">Qty</label>
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="Qty"
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-right focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div className="md:w-28">
                         <label className="block md:hidden text-xs font-semibold text-slate-500 mb-1">Rate</label>
                        <input 
                          type="number" 
                          value={item.rate}
                          onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          placeholder="Rate"
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-right focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div className="md:w-24 relative">
                        <label className="block md:hidden text-xs font-semibold text-slate-500 mb-1">Tax%</label>
                        <input 
                          type="number" 
                          value={item.taxRate}
                          onChange={e => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                          placeholder="Tax%"
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-right focus:border-indigo-500 outline-none pr-6"
                        />
                        <span className="absolute right-2 top-8 md:top-2.5 text-xs text-slate-400">%</span>
                      </div>
                   </div>

                   {/* Total & Trash */}
                   <div className="flex justify-between items-center w-full md:w-auto mt-2 md:mt-0 border-t md:border-0 border-slate-100 pt-2 md:pt-0">
                      <div className="md:w-24 text-left md:text-right font-semibold text-slate-700 px-2 flex items-center md:block">
                         <span className="md:hidden text-xs text-slate-500 mr-2">Total:</span>
                         ₹{(item.quantity * item.rate).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-500 p-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
           
           <div className="mt-8 flex justify-end">
              <div className="w-full md:w-72 space-y-2">
                 <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{subTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-slate-600">
                    <span>Discount (Flat)</span>
                    <input 
                      type="number"
                      value={invoice.discount}
                      onChange={e => setInvoice(prev => ({...prev, discount: parseFloat(e.target.value) || 0}))}
                      className="w-24 bg-white border border-slate-200 rounded p-1 text-right text-sm focus:border-indigo-500 outline-none"
                    />
                 </div>
                 <div className="flex justify-between text-slate-600">
                    <span>Total GST</span>
                    <span className="font-medium">₹{totalTax.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-slate-900 text-lg font-bold border-t border-slate-300 pt-2">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="p-8 border-t border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Terms</label>
          <textarea 
            value={invoice.notes}
            onChange={e => setInvoice(prev => ({...prev, notes: e.target.value}))}
            className="w-full rounded-lg border-slate-300 border p-3 h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-slate-900 flex items-center">
                 <Wand2 className="w-5 h-5 mr-2 text-indigo-600" /> AI Auto-Fill
               </h3>
               <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
             </div>
             
             <p className="text-slate-600 mb-4 text-sm">
               Describe your invoice. <br/>
               <span className="text-slate-400 italic">"Bill Acme Corp for 5 hours of consultation at ₹1000/hr and a ₹500 software license."</span>
             </p>
             
             <textarea 
               value={aiPrompt}
               onChange={e => setAiPrompt(e.target.value)}
               className="w-full border-slate-300 border rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 outline-none mb-4 resize-none"
               placeholder="Type here..."
             />
             
             <div className="flex justify-end space-x-3">
               <button 
                 onClick={() => setShowAiModal(false)}
                 className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleAiGenerate}
                 disabled={loadingAI || !aiPrompt.trim()}
                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
               >
                 {loadingAI ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                 Generate
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceBuilder;