import React, { useMemo } from 'react';
import { Invoice, PaymentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
}

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-xl md:text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ invoices }) => {
  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter(i => i.status === PaymentStatus.Paid)
      .reduce((sum, inv) => {
        const invTotal = inv.items.reduce((s, item) => s + (item.quantity * item.rate), 0);
        return sum + invTotal; // Simplified tax calc for stats
      }, 0);

    const pendingAmount = invoices
      .filter(i => i.status === PaymentStatus.Pending)
      .reduce((sum, inv) => {
        const invTotal = inv.items.reduce((s, item) => s + (item.quantity * item.rate), 0);
        return sum + invTotal;
      }, 0);

    return {
      totalRevenue,
      pendingAmount,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(i => i.status === PaymentStatus.Paid).length
    };
  }, [invoices]);

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    invoices.forEach(inv => {
      const month = new Date(inv.issueDate).toLocaleString('default', { month: 'short' });
      const total = inv.items.reduce((s, item) => s + (item.quantity * item.rate), 0);
      data[month] = (data[month] || 0) + total;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Pending Amount" 
          value={`₹${stats.pendingAmount.toLocaleString('en-IN')}`} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Total Invoices" 
          value={stats.totalInvoices.toString()} 
          icon={FileText} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Paid Invoices" 
          value={stats.paidInvoices.toString()} 
          icon={CheckCircle} 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#4f46e5" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${inv.status === 'Paid' ? 'bg-emerald-500' : inv.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{inv.clientName}</p>
                    <p className="text-xs text-slate-500">{inv.number}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap ml-2">
                  ₹{inv.items.reduce((acc, i) => acc + (i.quantity * i.rate), 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;