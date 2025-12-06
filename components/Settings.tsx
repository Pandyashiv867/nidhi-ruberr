import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { BusinessSettings } from '../types';
import { Save, Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState<BusinessSettings>(storageService.getSettings());
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = () => {
    storageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billegen_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (storageService.importData(json)) {
        setImportStatus('success');
        setSettings(storageService.getSettings()); // Refresh local state
        setTimeout(() => window.location.reload(), 1500); // Reload to refresh all components
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Business Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={settings.companyName}
              onChange={e => setSettings({...settings, companyName: e.target.value})}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              rows={3}
              value={settings.address}
              onChange={e => setSettings({...settings, address: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={settings.gstin}
              onChange={e => setSettings({...settings, gstin: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={settings.phone}
              onChange={e => setSettings({...settings, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={settings.email}
              onChange={e => setSettings({...settings, email: e.target.value})}
            />
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 mt-8 mb-6 border-b pb-2">Bank Details & Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={settings.bankName || ''}
              onChange={e => setSettings({...settings, bankName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={settings.accountNumber || ''}
              onChange={e => setSettings({...settings, accountNumber: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={settings.ifsc || ''}
              onChange={e => setSettings({...settings, ifsc: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Terms & Conditions</label>
            <textarea 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
              rows={4}
              value={settings.terms || ''}
              onChange={e => setSettings({...settings, terms: e.target.value})}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all"
          >
            {saved ? <CheckCircle className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Data Management</h2>
        <div className="flex flex-col md:flex-row gap-4">
           <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center"><Download className="w-4 h-4 mr-2"/> Backup Data</h3>
              <p className="text-sm text-slate-500 mb-4">Download a copy of all your clients, products, invoices, and settings.</p>
              <button onClick={handleExport} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm">Download JSON</button>
           </div>
           
           <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center"><Upload className="w-4 h-4 mr-2"/> Restore Data</h3>
              <p className="text-sm text-slate-500 mb-4">Restore data from a previously backed up JSON file.</p>
              <div className="flex items-center space-x-2">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImport}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
              {importStatus === 'success' && <p className="text-green-600 text-sm mt-2 font-medium">Data restored successfully! reloading...</p>}
              {importStatus === 'error' && <p className="text-red-600 text-sm mt-2 font-medium">Invalid file format.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;