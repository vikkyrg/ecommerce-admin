import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Package,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import { fetchAdminCategories, fetchAdminProducts } from '../services/adminApi';

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminCategories(), fetchAdminProducts()])
      .then(([cats, prodsData]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prodsData?.products) ? prodsData.products : []);
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeProducts = products.filter(p => p.isActive !== false && p.inStock !== false);
  const recentProducts = products.slice(0, 5);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Admin Control Center"
        subtitle="Overview of categories, inventory, and catalog status"
      />

      <main className="p-6 sm:p-8 space-y-8 flex-1">
        
        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e2e3e1] shadow-2xs">
          <div>
            <h3 className="font-['Manrope'] font-bold text-base text-black">Quick Management</h3>
            <p className="text-xs text-neutral-500 font-['Inter']">Manage your product catalog and store categories directly.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/categories?action=new"
              className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-semibold font-['Inter'] transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </Link>

            <Link
              to="/products?action=new"
              className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-[#ffdf9c] px-4 py-2.5 rounded-xl text-xs font-bold font-['Inter'] transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-[#e2e3e1] shadow-2xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-['Inter']">Total Categories</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="font-['Manrope'] font-extrabold text-3xl text-black">
              {loading ? '...' : categories.length}
            </p>
            <Link to="/categories" className="text-xs font-semibold text-neutral-600 hover:text-black inline-flex items-center gap-1 mt-3">
              <span>Manage Categories</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e2e3e1] shadow-2xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-['Inter']">Total Products</span>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="font-['Manrope'] font-extrabold text-3xl text-black">
              {loading ? '...' : products.length}
            </p>
            <Link to="/products" className="text-xs font-semibold text-neutral-600 hover:text-black inline-flex items-center gap-1 mt-3">
              <span>View Product List</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e2e3e1] shadow-2xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-['Inter']">Active Products</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-['Manrope'] font-extrabold text-3xl text-emerald-700">
              {loading ? '...' : activeProducts.length}
            </p>
            <span className="text-xs text-neutral-500 block mt-3">Visible on Customer Store</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e2e3e1] shadow-2xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-['Inter']">Best Sellers</span>
              <div className="w-8 h-8 rounded-lg bg-[#141619] text-[#ffdf9c] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-['Manrope'] font-extrabold text-3xl text-black">
              {loading ? '...' : products.filter(p => p.isBestSeller).length}
            </p>
            <span className="text-xs text-neutral-500 block mt-3">Homepage Featured</span>
          </div>
        </div>

        {/* Recently Added Products List */}
        <div className="bg-white rounded-2xl border border-[#e2e3e1] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="font-['Manrope'] font-bold text-base text-black">Recently Added Products</h3>
              <p className="text-xs text-neutral-500">Live products in the NS Stone Chemicals catalog.</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-neutral-700 hover:text-black">
              View All Products →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-['Inter']">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentProducts.map(p => (
                  <tr key={p.id || p.sku} className="hover:bg-neutral-50/70">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 object-contain rounded border border-neutral-200 p-0.5 bg-white flex-shrink-0" />
                      <span className="font-semibold text-black line-clamp-1 max-w-sm">{p.name}</span>
                    </td>
                    <td className="p-4 font-mono font-medium text-neutral-600">{p.sku}</td>
                    <td className="p-4 text-neutral-600 line-clamp-1 max-w-[150px]">{p.category}</td>
                    <td className="p-4 font-bold text-black">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td className="p-4">{p.stock || 25} units</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
