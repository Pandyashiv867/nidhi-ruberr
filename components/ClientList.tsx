import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Edit, Trash2, Search, Mail, MapPin, Phone } from 'lucide-react';

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({});

  useEffect(() => {
    setClients(storageService.getClients());
  }, []);

  const handleSave = () => {
    if (!formData.name) return;
    
    const clientToSave: Client = {
      id: editingClient?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      email: formData.email || '',
      address: formData.address || '',
      phone: formData.phone || ''
    };
    
    storageService.saveClient(clientToSave);
    setClients(storageService.getClients());
    setIsModalOpen(false);
    setFormData({});
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this client?")) {
      storageService.deleteClient(id);
      setClients(storageService.getClients());
    }
  };

  const openNew = () => {
    setEditingClient(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <button onClick={openNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-3">
                 <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                 <div className="flex space-x-1">
                   <button onClick={() => handleEdit(client)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded">
                     <Edit className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDelete(client.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
               
               <div className="space-y-2 text-sm text-slate-600">
                 {client.email && <div className="flex items-center"><Mail className="w-4 h-4 mr-2 opacity-50"/> {client.email}</div>}
                 {client.phone && <div className="flex items-center"><Phone className="w-4 h-4 mr-2 opacity-50"/> {client.phone}</div>}
                 {client.address && <div className="flex items-start"><MapPin className="w-4 h-4 mr-2 opacity-50 mt-0.5"/> {client.address}</div>}
               </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
             <h2 className="text-xl font-bold mb-4">{editingClient ? 'Edit Client' : 'New Client'}</h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                 <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                 <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                 <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                 <textarea className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" rows={3} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
               </div>
             </div>

             <div className="flex justify-end space-x-3 mt-6">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
               <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;