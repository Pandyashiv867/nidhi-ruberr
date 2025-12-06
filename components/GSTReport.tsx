import React, { useMemo } from 'react';
import { storageService } from '../services/storageService';
import { Invoice, Purchase } from '../types';

const GSTReport = () => {
  const invoices = storageService.getInvoices();
  const purchases = storageService.getPurchases();

  // GSTR-1: Sales (Outward Supplies)
  const salesSummary = useMemo(() => {
    let totalTaxable = 0;
    let totalIGST = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const taxable = item.quantity * item.rate;
        const taxAmount = taxable * (item.taxRate / 100);
        
        totalTaxable += taxable;
        if (inv.taxType === 'IGST') {
          totalIGST += taxAmount;
        } else {
          totalCGST += taxAmount / 2;
          totalSGST += taxAmount / 2;
        }
      });
    });

    return { totalTaxable, totalIGST, totalCGST, totalSGST };
  }, [invoices]);

  // GSTR-2: Purchases (Inward Supplies) - Assumes 18% standard if not detailed
  const purchaseSummary = useMemo(() => {
     let totalVal = 0;
     let estimatedInputTax = 0;

     purchases.forEach(p => {
        const val = p.totalAmount;
        // Simplified Input Tax Credit logic (assuming 18% flat for estimation)
        const taxComponent = val - (val / 1.18); 
        totalVal += val;
        estimatedInputTax += taxComponent;
     });

     return { totalVal, estimatedInputTax };
  }, [purchases]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">GST Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GSTR-1 Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 p-4 text-white">
             <h2 className="font-bold text-lg">GSTR-1 Summary (Sales)</h2>
             <p className="text-indigo-100 text-sm">Outward Supplies</p>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Total Taxable Value</span>
                <span className="font-bold text-slate-900">₹{salesSummary.totalTaxable.toFixed(2)}</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">IGST</span>
                <span className="font-medium text-slate-900">₹{salesSummary.totalIGST.toFixed(2)}</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">CGST</span>
                <span className="font-medium text-slate-900">₹{salesSummary.totalCGST.toFixed(2)}</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">SGST</span>
                <span className="font-medium text-slate-900">₹{salesSummary.totalSGST.toFixed(2)}</span>
             </div>
             <div className="flex justify-between pt-2">
                <span className="text-slate-900 font-bold">Total Tax Liability</span>
                <span className="font-bold text-indigo-600 text-lg">
                   ₹{(salesSummary.totalIGST + salesSummary.totalCGST + salesSummary.totalSGST).toFixed(2)}
                </span>
             </div>
          </div>
        </div>

        {/* GSTR-2 Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-emerald-600 p-4 text-white">
             <h2 className="font-bold text-lg">GSTR-2 Summary (Purchases)</h2>
             <p className="text-emerald-100 text-sm">Input Tax Credit Estimation</p>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Total Purchase Value</span>
                <span className="font-bold text-slate-900">₹{purchaseSummary.totalVal.toFixed(2)}</span>
             </div>
             <div className="bg-emerald-50 p-4 rounded-lg mt-4">
                <div className="text-sm text-emerald-800 mb-1">Estimated Input Tax Credit (ITC)</div>
                <div className="text-2xl font-bold text-emerald-700">₹{purchaseSummary.estimatedInputTax.toFixed(2)}</div>
                <p className="text-xs text-emerald-600 mt-2">*Based on flat 18% calculation from total purchase amount.</p>
             </div>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
         <strong>Note:</strong> These reports are generated based on the invoices and purchase orders created in the system. Please consult with a CA for official GST filing.
      </div>
    </div>
  );
};

export default GSTReport;