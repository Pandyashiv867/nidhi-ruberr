import React, { useEffect, useState } from 'react';
import { Invoice, BusinessSettings } from '../types';
import { storageService } from '../services/storageService';

interface InvoicePreviewProps {
  invoice: Invoice;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const [settings, setSettings] = useState<BusinessSettings>(storageService.getSettings());

  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  
  // Calculate total tax
  const totalTax = invoice.items.reduce((acc, item) => {
     const itemTotal = item.quantity * item.rate;
     return acc + (itemTotal * (item.taxRate / 100));
  }, 0);

  const total = subtotal - (invoice.discount || 0) + totalTax;

  if (invoice.type === 'Thermal') {
    return (
      <div className="bg-white mx-auto p-4 shadow-lg print:shadow-none print:p-0 font-mono text-sm text-black" style={{ width: '80mm', minHeight: '100mm' }} id="invoice-preview">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold uppercase">{settings.companyName}</h2>
          <p className="text-xs whitespace-pre-wrap">{settings.address}</p>
          <p className="text-xs">GSTIN: {settings.gstin}</p>
          <p className="text-xs">Ph: {settings.phone}</p>
        </div>

        <div className="border-b border-dashed border-black mb-2 pb-2">
          <div className="flex justify-between text-xs">
            <span>Date: {invoice.issueDate}</span>
            <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="text-xs">Inv #: {invoice.number}</div>
          <div className="text-xs">Cust: {invoice.clientName}</div>
        </div>

        <table className="w-full mb-2">
          <thead>
            <tr className="text-xs border-b border-black">
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Amt</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="py-1 pr-1">
                  <div className="font-bold">{item.description}</div>
                  <div className="text-[10px] text-slate-500">@{item.rate} | GST: {item.taxRate}%</div>
                </td>
                <td className="py-1 text-right align-top">{item.quantity}</td>
                <td className="py-1 text-right align-top">{(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-black pt-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
             <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Total GST:</span>
            <span>{totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm mt-2 border-t border-black pt-1">
            <span>TOTAL:</span>
            <span>INR {total.toFixed(2)}</span>
          </div>
          {invoice.paymentMode && (
             <div className="flex justify-between text-[10px] italic">
              <span>Paid via:</span>
              <span>{invoice.paymentMode}</span>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-xs">
          <p>Thank you for your business!</p>
        </div>
      </div>
    );
  }

  // Standard A4 Template
  return (
    <div className="bg-white w-full max-w-4xl mx-auto p-12 shadow-lg print:shadow-none print:p-0" id="invoice-preview">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
          <p className="text-slate-500 text-lg font-medium">#{invoice.number}</p>
        </div>
        <div className="text-right">
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl mb-4 ml-auto">
            {settings.companyName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-slate-800">{settings.companyName}</h2>
          <p className="text-slate-500 text-sm whitespace-pre-wrap max-w-xs ml-auto">{settings.address}</p>
          <p className="text-slate-500 text-sm font-semibold mt-1">GSTIN: {settings.gstin}</p>
          <p className="text-slate-500 text-sm">Ph: {settings.phone} | {settings.email}</p>
        </div>
      </div>

      {/* Bill To & Details */}
      <div className="flex justify-between mb-12">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
          <p className="text-slate-800 font-bold text-lg">{invoice.clientName}</p>
          <p className="text-slate-600 max-w-xs">{invoice.clientAddress}</p>
          <p className="text-slate-600">{invoice.clientEmail}</p>
          {invoice.clientGstin && <p className="text-slate-600 font-medium">GSTIN: {invoice.clientGstin}</p>}
        </div>
        <div className="text-right">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</h3>
            <p className="text-slate-800 font-medium">{invoice.issueDate}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</h3>
            <p className="text-slate-800 font-medium">{invoice.dueDate}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-slate-100">
            <th className="text-left py-3 text-sm font-bold text-slate-600">Description</th>
            <th className="text-left py-3 text-sm font-bold text-slate-600 w-24">HSN/SAC</th>
            <th className="text-right py-3 text-sm font-bold text-slate-600">Qty</th>
            <th className="text-right py-3 text-sm font-bold text-slate-600">Rate</th>
            <th className="text-right py-3 text-sm font-bold text-slate-600">Tax %</th>
            <th className="text-right py-3 text-sm font-bold text-slate-600">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-50">
              <td className="py-4 text-slate-800">{item.description}</td>
              <td className="py-4 text-slate-500 text-sm">{item.hsn || '-'}</td>
              <td className="py-4 text-right text-slate-600">{item.quantity}</td>
              <td className="py-4 text-right text-slate-600">₹{item.rate.toFixed(2)}</td>
              <td className="py-4 text-right text-slate-600">{item.taxRate}%</td>
              <td className="py-4 text-right text-slate-800 font-medium">
                ₹{(item.quantity * item.rate).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-80 space-y-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
             <div className="flex justify-between text-slate-600">
              <span>Discount</span>
              <span className="font-medium">-₹{invoice.discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t border-slate-100 my-2 pt-2">
             {invoice.taxType === 'IGST' ? (
                <div className="flex justify-between text-slate-600">
                  <span>IGST</span>
                  <span className="font-medium">₹{totalTax.toFixed(2)}</span>
                </div>
             ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST</span>
                    <span className="font-medium">₹{(totalTax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST</span>
                    <span className="font-medium">₹{(totalTax / 2).toFixed(2)}</span>
                  </div>
                </>
             )}
          </div>

          <div className="flex justify-between text-slate-900 text-lg font-bold border-t-2 border-slate-100 pt-3">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
         <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
            <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
               {settings.terms}
            </p>
         </div>
         <div className="text-right">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bank Details</h3>
             <p className="text-slate-600 text-sm">Bank: {settings.bankName}</p>
             <p className="text-slate-600 text-sm">A/c: {settings.accountNumber}</p>
             <p className="text-slate-600 text-sm">IFSC: {settings.ifsc}</p>
         </div>
      </div>
    </div>
  );
};

export default InvoicePreview;