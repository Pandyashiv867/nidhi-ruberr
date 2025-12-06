import React, { useState, useEffect } from 'react';
import { Expense, PaymentMode } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Trash2, Wallet, Calendar } from 'lucide-react';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    paymentMode: PaymentMode.Cash
  });

  useEffect(() => {
    setExpenses(storageService.getExpenses());
  }, []);

  const handleSave = () => {
    if (!newExpense.amount || !newExpense.category) return;
    
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      date: newExpense.date!,
      category: newExpense.category!,
      description: newExpense.description || '',
      amount: Number(newExpense.amount),
      paymentMode: newExpense.paymentMode as PaymentMode
    };

    storageService.saveExpense(expense);
    setExpenses(storageService.getExpenses());
    setIsModalOpen(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      paymentMode: PaymentMode.Cash
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this record?")) {
      storageService.deleteExpense(id);
      setExpenses(storageService.getExpenses());
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
           <p className="text-slate-500">Track your business spending</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 flex items-center shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Summary Card */}
         <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
               <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                     <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium opacity-90">Total Expenses</span>
               </div>
               <div className="text-3xl font-bold mb-1">₹{totalExpenses.toFixed(2)}</div>
               <div className="text-sm opacity-75">All time record</div>
            </div>
            
            <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase text-slate-500">By Category</h3>
               <div className="space-y-3">
                  {Object.entries(expenses.reduce((acc, curr) => {
                     acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                     return acc;
                  }, {} as Record<string, number>)).map(([cat, amount]) => (
                     <div key={cat} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{cat}</span>
                        <span className="font-bold text-slate-800">₹{(amount as number).toFixed(2)}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Expense List */}
         <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">Recent Transactions</div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                     <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Mode</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                     {expenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-slate-50">
                           <td className="px-6 py-3 text-slate-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-2 opacity-50"/> {exp.date}
                           </td>
                           <td className="px-6 py-3 font-medium text-slate-800">{exp.category}</td>
                           <td className="px-6 py-3 text-slate-600">{exp.description}</td>
                           <td className="px-6 py-3 text-slate-500 text-xs">{exp.paymentMode}</td>
                           <td className="px-6 py-3 text-right font-bold text-rose-600">-₹{exp.amount.toFixed(2)}</td>
                           <td className="px-6 py-3 text-right">
                              <button onClick={() => handleDelete(exp.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                           </td>
                        </tr>
                     ))}
                     {expenses.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">No expenses recorded.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
             <h2 className="text-xl font-bold mb-4">Add Expense</h2>
             
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" className="w-full border rounded p-2" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input list="categories" placeholder="e.g. Rent, Electricity, Salary" className="w-full border rounded p-2" value={newExpense.category || ''} onChange={e => setNewExpense({...newExpense, category: e.target.value})} />
                  <datalist id="categories">
                     <option value="Rent" />
                     <option value="Utilities" />
                     <option value="Salary" />
                     <option value="Travel" />
                     <option value="Office Supplies" />
                  </datalist>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input type="number" className="w-full border rounded p-2" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <input type="text" className="w-full border rounded p-2" value={newExpense.description || ''} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                  <select className="w-full border rounded p-2" value={newExpense.paymentMode} onChange={e => setNewExpense({...newExpense, paymentMode: e.target.value as PaymentMode})}>
                     {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
             </div>

             <div className="flex justify-end space-x-3 mt-6">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
               <button onClick={handleSave} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Save</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;