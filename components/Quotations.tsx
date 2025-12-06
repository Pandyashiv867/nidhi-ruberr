import React, { useState, useEffect } from 'react';
import { Quotation, Invoice, Client, Product, InvoiceItem, PaymentStatus } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Trash2, Edit, FileText, ArrowRight, Printer, Save, ArrowLeft, CheckCircle } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const QuotationBuilder = ({ existingQuotation, onSave, onCancel }: { existingQuotation?: Quotation, onSave: () => void, onCancel: () => void }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotation, setQuotation] = useState<Quotation>(existingQuotation || {
    id: generateId(),
    number: `EST-${Date.now().toString().slice(-6)}`,
    clientId: '',
    clientName: '',
    clientAddress: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ id: generateId(), description: '', quantity: 1, rate: 0, taxRate: 0 }],
    status: 'Open',
    discount: 0,
    taxType: 'CGST_SGST'
  });

  useEffect(() => {
    setClients(storageService.getClients());
    setProducts(storageService.getProducts());
  }, []);

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const client = clients.find(c => c.id === e.target.value);
    if (client) {
      setQuotation(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
        clientAddress: client.address
      }));
    }
  };

  const addItem = () => {
    setQuotation(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), description: '', quantity: 1, rate: 0, taxRate: 0 }]
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setQuotation(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
    }));
  };

  const handleProductSelect = (itemId: string, productName: string) => {
    const product = products.find(p => p.name === productName);
    if (product) {
      setQuotation(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === itemId ? {
          ...item, description: product.name, rate: product.price, taxRate: product.taxRate, hsn: product.hsn, productId: product.id
        } : item)
      }));
    } else {
      updateItem(itemId, 'description', productName);
    }
  };

  const handleSave = () => {
    storageService.saveQuotation(quotation);
    onSave();
  };

  const convertToInvoice = () => {
    const newInvoice: Invoice = {
      id: generateId(),
      number: `INV-${Date.now().toString().slice(-6)}`,
      clientId: quotation.clientId,
      clientName: quotation.clientName,
      clientEmail: '',
      clientAddress: quotation.clientAddress,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: quotation.items.map(i => ({...i, id: generateId()})),
      status: PaymentStatus.Pending,
      currency: 'INR',
      discount: quotation.discount,
      type: 'Standard',
      taxType: quotation.taxType,
      notes: `Converted from Estimate #${quotation.number}`
    };
    storageService.saveInvoice(newInvoice);
    setQuotation({...quotation, status: 'Converted'});
    storageService.saveQuotation({...quotation, status: 'Converted'});
    alert("Converted to Invoice successfully! Go to Invoices to view it.");
    onSave();
  };

  const subTotal = quotation.items.reduce((s, i) => s + (i.quantity * i.rate), 0);
  const totalTax = quotation.items.reduce((s, i) => s + (i.quantity * i.rate * (i.taxRate / 100)), 0);
  const total = subTotal - quotation.discount + totalTax;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onCancel} className="flex items-center text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="flex space-x-3">
          {existingQuotation && quotation.status !== 'Converted' && (
             <button onClick={convertToInvoice} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2" /> Convert to Invoice
             </button>
          )}
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center shadow-sm">
             <Save className="w-4 h-4 mr-2" /> Save Estimate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
         <h2 className="text-xl font-bold border-b pb-2">Estimate Details</h2>
         <div className="grid grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
               <select value={quotation.clientId} onChange={handleClientChange} className="w-full border rounded p-2">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
               <input type="date" value={quotation.date} onChange={e => setQuotation({...quotation, date: e.target.value})} className="w-full border rounded p-2" />
            </div>
         </div>

         <div>
           <h3 className="font-semibold mb-2">Items</h3>
           {quotation.items.map(item => (
              <div key={item.id} className="flex gap-2 mb-2 items-center">
                 <input 
                    list={`prod-${item.id}`} 
                    value={item.description} 
                    onChange={e => handleProductSelect(item.id, e.target.value)} 
                    className="flex-1 border rounded p-2" placeholder="Description" 
                 />
                 <datalist id={`prod-${item.id}`}>{products.map(p => <option key={p.id} value={p.name} />)}</datalist>
                 <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))} className="w-20 border rounded p-2" placeholder="Qty" />
                 <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value))} className="w-24 border rounded p-2" placeholder="Rate" />
                 <input type="number" value={item.taxRate} onChange={e => updateItem(item.id, 'taxRate', parseFloat(e.target.value))} className="w-20 border rounded p-2" placeholder="Tax%" />
                 <button onClick={() => setQuotation(prev => ({...prev, items: prev.items.filter(i => i.id !== item.id)}))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
           ))}
           <button onClick={addItem} className="text-indigo-600 text-sm font-medium mt-2">+ Add Item</button>
         </div>

         <div className="flex justify-end pt-4 border-t">
            <div className="w-64 space-y-2 text-right">
               <div className="text-slate-600">Subtotal: ₹{subTotal.toFixed(2)}</div>
               <div className="text-slate-600">Tax: ₹{totalTax.toFixed(2)}</div>
               <div className="text-xl font-bold text-slate-900">Total: ₹{total.toFixed(2)}</div>
            </div>
         </div>
      </div>
    </div>
  );
};

const Quotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setQuotations(storageService.getQuotations());
  }, [editingId]);

  const handleDelete = (id: string) => {
    if (confirm("Delete this estimate?")) {
      storageService.deleteQuotation(id);
      setQuotations(storageService.getQuotations());
    }
  };

  if (editingId) {
    const q = quotations.find(x => x.id === editingId);
    return <QuotationBuilder existingQuotation={q} onSave={() => setEditingId(null)} onCancel={() => setEditingId(null)} />;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Estimates / Quotations</h1>
          <button onClick={() => setEditingId('new')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center shadow-sm">
             <Plus className="w-5 h-5 mr-2" /> New Estimate
          </button>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 text-sm">
             {quotations.map(q => {
               const total = q.items.reduce((s, i) => s + (i.quantity * i.rate * (1 + i.taxRate/100)), 0) - q.discount;
               return (
                 <tr key={q.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{q.number}</td>
                    <td className="px-6 py-4">{q.clientName}</td>
                    <td className="px-6 py-4">{q.date}</td>
                    <td className="px-6 py-4">₹{total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-xs ${q.status === 'Converted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                         {q.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => setEditingId(q.id)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                 </tr>
               );
             })}
             {quotations.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">No estimates found.</td></tr>}
           </tbody>
         </table>
       </div>
    </div>
  );
};

export default Quotations;