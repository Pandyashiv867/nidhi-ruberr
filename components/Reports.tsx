import React, { useMemo, useState } from 'react';
import { storageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Invoice, PaymentStatus, Product } from '../types';

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'stock'>('sales');
  
  const invoices = storageService.getInvoices();
  const products = storageService.getProducts();
  const expenses = storageService.getExpenses();

  // --- Sales Data Logic ---
  const salesData = useMemo(() => {
    const data: Record<string, number> = {};
    invoices.filter(i => i.status === PaymentStatus.Paid).forEach(inv => {
      const month = new Date(inv.issueDate).toLocaleString('default', { month: 'short' });
      const total = inv.items.reduce((s, item) => s + (item.quantity * item.rate), 0);
      data[month] = (data[month] || 0) + total;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  const paymentModeData = useMemo(() => {
    const data: Record<string, number> = {};
    invoices.filter(i => i.status === PaymentStatus.Paid).forEach(inv => {
      const mode = inv.paymentMode || 'Unknown';
      data[mode] = (data[mode] || 0) + 1;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  // --- Stock Data Logic ---
  const stockValuation = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const lowStockItems = products.filter(p => p.stock < 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <div className="bg-white border border-slate-200 rounded-lg p-1 flex space-x-1">
           <button onClick={() => setActiveTab('sales')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'sales' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>Sales Analysis</button>
           <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'stock' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>Inventory Report</button>
        </div>
      </div>

      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Revenue Chart */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6">Monthly Revenue</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Payment Modes */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6">Sales by Payment Mode</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentModeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentModeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                 {paymentModeData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center text-xs">
                       <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                       {entry.name} ({entry.value})
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'stock' && (
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 text-sm font-medium mb-1">Total Stock Value (Cost)</h3>
                  <div className="text-3xl font-bold text-slate-900">₹{stockValuation.toFixed(2)}</div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 text-sm font-medium mb-1">Total Products</h3>
                  <div className="text-3xl font-bold text-slate-900">{products.length}</div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 text-sm font-medium mb-1">Low Stock Items</h3>
                  <div className="text-3xl font-bold text-red-600">{lowStockItems.length}</div>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-200 font-bold bg-slate-50">Low Stock Alert</div>
               <table className="w-full text-left">
                  <thead className="text-xs text-slate-500 bg-white border-b border-slate-100">
                     <tr>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3">SKU</th>
                        <th className="px-6 py-3 text-right">Current Stock</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                     {lowStockItems.map(p => (
                        <tr key={p.id}>
                           <td className="px-6 py-3 font-medium text-slate-900">{p.name}</td>
                           <td className="px-6 py-3 text-slate-500">{p.sku}</td>
                           <td className="px-6 py-3 text-right font-bold text-red-600">{p.stock}</td>
                        </tr>
                     ))}
                     {lowStockItems.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-6 text-center text-slate-400">Inventory levels are healthy.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}
    </div>
  );
};

export default Reports;