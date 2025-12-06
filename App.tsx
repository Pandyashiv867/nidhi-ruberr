import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import InvoiceBuilder from './components/InvoiceBuilder';
import ClientList from './components/ClientList';
import ProductList from './components/ProductList';
import POSTerminal from './components/POSTerminal';
import PurchaseManager from './components/PurchaseManager';
import ExpenseTracker from './components/ExpenseTracker';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Quotations from './components/Quotations';
import GSTReport from './components/GSTReport';
import { LayoutDashboard, FileText, Users, Settings as SettingsIcon, Plus, LogOut, Menu, X, Trash2, Edit, ShoppingCart, Package, Truck, Wallet, BarChart3, FileBadge, Receipt, ChevronRight, Download } from 'lucide-react';
import { storageService } from './services/storageService';
import { Invoice } from './types';

// Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, installPrompt, onInstall }: { isOpen: boolean, setIsOpen: (o: boolean) => void, installPrompt: any, onInstall: () => void }) => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'POS Terminal', path: '/pos' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: FileBadge, label: 'Estimates/Quotes', path: '/quotations' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: Truck, label: 'Purchases', path: '/purchases' },
    { icon: Wallet, label: 'Expenses', path: '/expenses' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: BarChart3, label: 'Analytics', path: '/reports' },
    { icon: Receipt, label: 'GST Reports', path: '/gst-report' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 no-print flex flex-col`}>
        <div className="p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 text-white font-bold text-xl">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">B</div>
             <span>BilleGen</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 space-y-1 overflow-y-auto flex-1 no-scrollbar">
          {menuItems.map((item) => {
             const isActive = location.pathname === item.path;
             return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
             );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0 space-y-2">
           {installPrompt && (
             <button 
               onClick={onInstall}
               className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white w-full rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all font-medium mb-2"
             >
               <Download className="w-5 h-5" />
               <span>Install App</span>
             </button>
           )}
           <button className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white w-full">
             <LogOut className="w-5 h-5" />
             <span>Sign Out</span>
           </button>
        </div>
      </div>
    </>
  );
};

// Invoice List Page
const InvoicesPage = ({ onCreateNew }: { onCreateNew: () => void }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setInvoices(storageService.getInvoices());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      storageService.deleteInvoice(id);
      setInvoices(storageService.getInvoices());
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (editingId === 'new') {
    return (
      <InvoiceBuilder 
        onSave={() => { setEditingId(null); setInvoices(storageService.getInvoices()); }}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  if (editingId) {
     const inv = invoices.find(i => i.id === editingId);
     return (
       <InvoiceBuilder 
         existingInvoice={inv}
         onSave={() => { setEditingId(null); setInvoices(storageService.getInvoices()); }}
         onCancel={() => setEditingId(null)}
       />
     );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
         <button 
           onClick={() => setEditingId('new')}
           className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center shadow-sm w-full sm:w-auto justify-center"
         >
           <Plus className="w-5 h-5 mr-2" /> New Invoice
         </button>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-200 bg-slate-50">
           <input 
             type="text" 
             placeholder="Search invoices..." 
             className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
         </div>
         <div className="overflow-x-auto">
           {/* Responsive Table: Hidden Header on Mobile, Block rows on Mobile */}
           <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold hidden md:table-header-group">
               <tr>
                 <th className="px-6 py-4">Number</th>
                 <th className="px-6 py-4">Client</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Amount</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 text-sm block md:table-row-group">
               {filteredInvoices.map(inv => {
                 const subTotal = inv.items.reduce((s, i) => s + (i.quantity * i.rate), 0);
                 const totalTax = inv.items.reduce((s, i) => s + (i.quantity * i.rate * (i.taxRate/100)), 0);
                 const total = subTotal - (inv.discount || 0) + totalTax;
                 return (
                   <tr key={inv.id} className="hover:bg-slate-50 transition-colors block md:table-row p-4 border-b md:border-b-0 relative">
                     {/* Mobile Card Layout Content */}
                     <td className="md:px-6 md:py-4 block md:table-cell mb-1 md:mb-0">
                       <span className="md:hidden text-xs text-slate-500 font-bold mr-2">#</span>
                       <span className="font-medium text-slate-900">{inv.number}</span>
                     </td>
                     <td className="md:px-6 md:py-4 block md:table-cell text-slate-600 mb-1 md:mb-0">
                       <span className="md:hidden text-xs text-slate-500 mr-2">Client:</span>
                       {inv.clientName}
                     </td>
                     <td className="md:px-6 md:py-4 block md:table-cell text-slate-500 mb-1 md:mb-0 text-xs md:text-sm">
                       <span className="md:hidden text-xs text-slate-500 mr-2">Date:</span>
                       {inv.issueDate}
                     </td>
                     <td className="md:px-6 md:py-4 block md:table-cell font-medium text-slate-900 mb-2 md:mb-0">
                        <span className="md:hidden text-xs text-slate-500 mr-2">Total:</span>
                        ₹{total.toFixed(2)}
                     </td>
                     <td className="md:px-6 md:py-4 block md:table-cell mb-2 md:mb-0">
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold
                         ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                           inv.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                           inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                         }`}>
                         {inv.status}
                       </span>
                     </td>
                     <td className="md:px-6 md:py-4 md:text-right block md:table-cell absolute top-4 right-4 md:static">
                       <div className="flex justify-end space-x-2">
                         <button onClick={() => setEditingId(inv.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors bg-slate-50 md:bg-transparent">
                           <Edit className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(inv.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-slate-50 md:bg-transparent">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
               {filteredInvoices.length === 0 && (
                 <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-400 block w-full">
                     No invoices found. Create one to get started!
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
};

// Main App Layout
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} installPrompt={installPrompt} onInstall={handleInstallClick} />
        
        <div className="flex-1 md:ml-64 flex flex-col min-w-0 transition-all duration-200">
          <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-6 justify-between sticky top-0 z-30 no-print shadow-sm md:shadow-none">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800 p-1">
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-auto flex items-center space-x-4">
               {/* Mobile Title if needed */}
               <span className="md:hidden font-bold text-slate-700 text-lg">SealMaster</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
                A
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto print:p-0 print:overflow-visible pb-20 md:pb-6">
            <Routes>
              <Route path="/" element={<Dashboard invoices={storageService.getInvoices()} />} />
              <Route path="/invoices" element={<InvoicesPage onCreateNew={() => {}} />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/clients" element={<ClientList />} />
              <Route path="/inventory" element={<ProductList />} />
              <Route path="/pos" element={<POSTerminal />} />
              <Route path="/purchases" element={<PurchaseManager />} />
              <Route path="/expenses" element={<ExpenseTracker />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/gst-report" element={<GSTReport />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;