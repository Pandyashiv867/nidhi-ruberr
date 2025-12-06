import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, ScanBarcode } from 'lucide-react';

declare const JsBarcode: any;

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'barcode'>('list');
  const [barcodeProduct, setBarcodeProduct] = useState<string>('');
  const barcodeRef = useRef<SVGSVGElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    setProducts(storageService.getProducts());
  }, []);

  useEffect(() => {
    if (activeTab === 'barcode' && barcodeProduct && barcodeRef.current) {
       const prod = products.find(p => p.id === barcodeProduct);
       if (prod) {
          try {
             JsBarcode(barcodeRef.current, prod.sku, {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 50,
                displayValue: true
             });
          } catch (e) { console.error(e); }
       }
    }
  }, [activeTab, barcodeProduct]);

  const handleSave = () => {
    if (!formData.name || !formData.price) return;
    
    const productToSave: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      sku: formData.sku || 'SKU-' + Math.floor(Math.random()*1000),
      price: Number(formData.price),
      purchasePrice: Number(formData.purchasePrice) || 0,
      stock: Number(formData.stock) || 0,
      category: formData.category || 'General',
      hsn: formData.hsn || '',
      taxRate: Number(formData.taxRate) || 0
    };
    
    storageService.saveProduct(productToSave);
    setProducts(storageService.getProducts());
    setIsModalOpen(false);
    setFormData({});
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) {
      storageService.deleteProduct(id);
      setProducts(storageService.getProducts());
    }
  };

  const openNew = () => {
    setEditingProduct(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
        <div className="flex space-x-2 bg-white rounded-lg p-1 border border-slate-200">
           <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}>Product List</button>
           <button onClick={() => setActiveTab('barcode')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'barcode' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}>Barcode Tool</button>
        </div>
      </div>

      {activeTab === 'list' && (
         <>
          <div className="flex justify-end">
            <button onClick={openNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center shadow-sm">
              <Plus className="w-5 h-5 mr-2" /> Add Product
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Total Items: {products.length}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Name / SKU</th>
                      <th className="px-6 py-4">HSN</th>
                      <th className="px-6 py-4">GST %</th>
                      <th className="px-6 py-4 text-right">Cost</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center mr-3 text-slate-400">
                                  <Package className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{product.name}</div>
                                <div className="text-xs text-slate-500">{product.sku}</div>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{product.hsn || '-'}</td>
                        <td className="px-6 py-4 text-slate-500">{product.taxRate}%</td>
                        <td className="px-6 py-4 text-right text-slate-500">₹{product.purchasePrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">₹{product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                            {product.stock < 10 ? (
                              <div className="flex items-center justify-end text-red-600 font-bold">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> {product.stock}
                              </div>
                            ) : (
                              <span className="text-slate-600">{product.stock}</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </div>
         </>
      )}

      {activeTab === 'barcode' && (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-xl font-bold mb-6 flex items-center"><ScanBarcode className="w-6 h-6 mr-2 text-indigo-600"/> Barcode Generator</h2>
            <div className="w-full max-w-md mb-8">
               <label className="block text-sm font-medium text-slate-700 mb-2">Select Product to Generate Barcode</label>
               <select 
                  className="w-full border p-2 rounded-lg"
                  value={barcodeProduct}
                  onChange={e => setBarcodeProduct(e.target.value)}
               >
                  <option value="">-- Select Product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex items-center justify-center bg-slate-50 w-full max-w-md min-h-[150px]">
               {barcodeProduct ? (
                  <div className="text-center">
                     <svg ref={barcodeRef}></svg>
                     <p className="text-sm text-slate-500 mt-2">{products.find(p => p.id === barcodeProduct)?.name}</p>
                     <button onClick={() => window.print()} className="mt-4 text-xs text-indigo-600 hover:underline">Print this page</button>
                  </div>
               ) : (
                  <p className="text-slate-400">Select a product to view barcode</p>
               )}
            </div>
         </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
             <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                 <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                   <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                   <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">HSN Code</label>
                   <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.hsn || ''} onChange={e => setFormData({...formData, hsn: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">GST Rate (%)</label>
                   <input type="number" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.taxRate || ''} onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value)})} />
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label>
                   <input type="number" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.purchasePrice || ''} onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
                   <input type="number" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                   <input type="number" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: parseFloat(e.target.value)})} />
                 </div>
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

export default ProductList;