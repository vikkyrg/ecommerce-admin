import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Search,
  Calendar,
  Phone,
  Mail,
  Eye,
  X,
  AlertCircle,
  Copy,
  Check,
  MapPin,
  MessageSquare,
  ChevronDown,
  RotateCcw,
  UserCheck,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import { fetchAdminCustomers, fetchAdminCustomerById } from '../services/adminApi';

export default function CustomersManagement() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [metrics, setMetrics] = useState({ totalCustomers: 0, newThisMonth: 0, activeCustomers: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Customer Details Drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Copy feedback states
  const [copiedField, setCopiedField] = useState(null);

  // Sub-modal for detailed enquiry inside drawer
  const [activeEnquiryView, setActiveEnquiryView] = useState(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search: debouncedSearch,
        page: currentPage,
        limit: pageSize
      };

      if (dateFilter !== 'all') {
        params.dateFilter = dateFilter;
      }

      const response = await fetchAdminCustomers(params);

      if (response.success) {
        setCustomers(response.data || []);
        setTotalCustomers(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 1);
        if (response.counts) {
          setMetrics(response.counts);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load registered customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [currentPage, debouncedSearch, dateFilter, statusFilter]);

  // Lock background scroll when drawer is open & Esc key support
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        if (activeEnquiryView) {
          setActiveEnquiryView(null);
        } else if (selectedCustomerId) {
          closeDrawer();
        }
      }
    };

    if (selectedCustomerId) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCustomerId, activeEnquiryView]);

  const openCustomerDetail = async id => {
    setSelectedCustomerId(id);
    setActiveEnquiryView(null);
    setLoadingDetail(true);
    try {
      const res = await fetchAdminCustomerById(id);
      if (res.success) {
        setCustomerDetail(res.data);
      }
    } catch (err) {
      alert(err.message || 'Unable to retrieve customer details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDrawer = () => {
    setSelectedCustomerId(null);
    setCustomerDetail(null);
    setActiveEnquiryView(null);
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setDateFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(search || statusFilter !== 'All' || dateFilter !== 'all');

  const getStatusBadge = status => {
    switch (status) {
      case 'New':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Contacted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* 1. Page Header */}
      <Topbar
        title="Registered Customers"
        subtitle="Manage registered customer accounts, contact details, and enquiry history."
        onMenuClick={toggleMobileMenu}
      />

      <main className="min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* 2. Compact Customer Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Registered Customers */}
          <div className="bg-white p-4.5 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B] block">
                Total Registered Customers
              </span>
              <p className="text-[26px] font-bold text-[#1E293B] mt-1 tracking-tight">
                {metrics.totalCustomers || totalCustomers}
              </p>
            </div>
            <div className="w-10 h-10 rounded-md bg-[#F8F3E9] text-[#B8862D] border border-[#E2D9C8] flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* New Registrations This Month */}
          <div className="bg-white p-4.5 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B] block">
                New Registrations This Month
              </span>
              <p className="text-[26px] font-bold text-[#1E293B] mt-1 tracking-tight">
                {metrics.newThisMonth ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-md bg-slate-100 text-[#1E293B] flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5 text-[#64748B]" />
            </div>
          </div>

          {/* Active Customers */}
          <div className="bg-white p-4.5 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B] block">
                Active Customers
              </span>
              <p className="text-[26px] font-bold text-emerald-700 mt-1 tracking-tight">
                {metrics.activeCustomers || totalCustomers}
              </p>
            </div>
            <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* 3. Search and Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-[#E2E8F0] space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full min-w-0 flex-1 sm:w-auto">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by customer name, email, phone, or customer ID..."
                className="w-full h-[42px] pl-10 pr-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              {/* Account Status Filter */}
              <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[150px]">
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Accounts</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Registration Date Filter */}
              <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[160px]">
                <select
                  value={dateFilter}
                  onChange={e => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Registered Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Clear Filters Action */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="h-[42px] px-3.5 border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-200/60 text-[13px] font-semibold text-[#64748B] hover:text-[#1E293B] rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title="Clear all search and filter conditions"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-[13.5px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadCustomers}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[12px] font-semibold transition cursor-pointer flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* 4. Customer Table */}
        {loading ? (
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="h-14 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          /* 8. Empty States */
          <div className="p-14 text-center bg-white rounded-lg border border-[#E2E8F0]">
            <Users className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-[18px] font-[650] text-[#1E293B]">
              {hasActiveFilters ? 'No Matching Customers Found' : 'No Registered Customers Found'}
            </h3>
            <p className="text-[14px] text-[#64748B] mt-1 max-w-md mx-auto">
              {hasActiveFilters
                ? 'No customer records match your current search and filter criteria. Try resetting your search terms or filters.'
                : 'Registered customers who create an account on the public website will be listed here automatically.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 h-[38px] px-4 border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[13px] font-semibold text-[#1E293B] rounded-md transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold w-[28%]">Customer</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold w-[22%]">Email Address</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold w-[18%]">Phone Number</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold w-[14%]">Registration Date</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold w-[10%]">Account Status</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold text-right w-[8%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                  {customers.map(c => (
                    <tr key={c._id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      {/* Customer: avatar, strong name, small muted customer ID */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[#F8F3E9] text-[#B8862D] border border-[#E2D9C8] flex items-center justify-center font-bold text-[13.5px] flex-shrink-0">
                            {c.name?.charAt(0) || 'C'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[14px] font-[650] text-[#1E293B] block truncate leading-snug">
                              {c.name}
                            </span>
                            <span className="text-[11.5px] text-[#64748B] block mt-0.5 font-mono">
                              ID: #{c._id ? c._id.slice(-6).toUpperCase() : '------'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email: properly aligned icon, normal weight, truncate overflow */}
                      <td className="px-5 py-3.5 text-[14px] text-[#1E293B]">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
                          <span className="truncate max-w-[210px] font-normal text-[#1E293B]">{c.email}</span>
                        </div>
                      </td>

                      {/* Phone: aligned phone icon, normal weight, font-mono */}
                      <td className="px-5 py-3.5 text-[14px] text-[#475569] font-mono">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
                          <span>{c.phone || '—'}</span>
                        </div>
                      </td>

                      {/* Registration Date: calendar icon, formatted */}
                      <td className="px-5 py-3.5 text-[13.5px] text-[#475569]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
                          <span>
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Account Status: small subtle green badge */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>

                      {/* Actions: View Details outlined button with gold accent on hover */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openCustomerDetail(c._id)}
                          className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3.5 text-[13px] font-semibold text-[#1E293B] transition-colors hover:border-[#B8862D] hover:bg-[#F8FAFC] hover:text-[#B8862D] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 7. Pagination Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-[#E2E8F0] text-[13px] text-[#64748B]">
              <span>
                Showing {customers.length ? (currentPage - 1) * pageSize + 1 : 0}–
                {Math.min(currentPage * pageSize, totalCustomers)} of {totalCustomers} customers
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  className="h-10 px-3.5 border border-[#E2E8F0] rounded text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[13px] transition-colors"
                >
                  Previous
                </button>
                <span className="tabular-nums px-2 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="h-10 px-3.5 border border-[#E2E8F0] rounded text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[13px] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 6. Customer Profile Side Drawer */}
      {selectedCustomerId && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-900/40 backdrop-blur-[1px] transition-opacity"
          onClick={closeDrawer}
        >
          <div
            className="flex h-full w-full max-w-[500px] flex-col border-l border-[#E2E8F0] bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Customer Identity Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {/* 54px Avatar */}
                <div className="w-[54px] h-[54px] rounded-lg bg-[#F8F3E9] text-[#B8862D] border border-[#E2D9C8] flex items-center justify-center font-bold text-[22px] flex-shrink-0 shadow-xs">
                  {customerDetail?.name?.charAt(0) || 'C'}
                </div>

                <div className="min-w-0">
                  <h3 className="text-[20px] font-[650] text-[#1E293B] leading-snug truncate tracking-tight">
                    {customerDetail?.name || 'Customer Profile'}
                  </h3>

                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span className="text-[12px] font-mono font-medium text-[#64748B]">
                      ID: #{customerDetail?._id ? customerDetail._id.slice(-6).toUpperCase() : '------'}
                    </span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeDrawer}
                className="p-1.5 text-[#64748B] hover:text-[#1E293B] rounded-md hover:bg-slate-200/50 transition-colors cursor-pointer"
                aria-label="Close drawer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
              {loadingDetail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-slate-100 rounded-md animate-pulse" />
                    <div className="h-20 bg-slate-100 rounded-md animate-pulse" />
                  </div>
                  <div className="h-32 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-40 bg-slate-100 rounded-md animate-pulse" />
                </div>
              ) : customerDetail ? (
                <>
                  {/* Account Overview Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-lg">
                      <span className="text-[12px] font-medium text-[#64748B] block">
                        Customer Since
                      </span>
                      <span className="text-[15px] font-semibold text-[#1E293B] mt-1 block">
                        {customerDetail.createdAt
                          ? new Date(customerDetail.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '—'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-lg">
                      <span className="text-[12px] font-medium text-[#64748B] block">
                        Total Enquiries
                      </span>
                      <span className="text-[15px] font-semibold text-[#1E293B] mt-1 block">
                        {customerDetail.enquiries?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="text-[15px] font-[600] text-[#1E293B] pb-2 border-b border-[#E2E8F0]">
                      Contact Information
                    </h4>

                    <div className="space-y-2">
                      {/* Email Row */}
                      <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Mail className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[12px] text-[#64748B] font-medium block leading-none mb-1">
                              Email Address
                            </span>
                            <a
                              href={`mailto:${customerDetail.email}`}
                              className="text-[14px] font-medium text-[#1E293B] hover:text-[#B8862D] hover:underline truncate block"
                            >
                              {customerDetail.email}
                            </a>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(customerDetail.email, 'email')}
                          className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-white rounded border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer flex-shrink-0"
                          title="Copy email to clipboard"
                        >
                          {copiedField === 'email' ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Phone Row */}
                      <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Phone className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[12px] text-[#64748B] font-medium block leading-none mb-1">
                              Phone Number
                            </span>
                            <a
                              href={`tel:${customerDetail.phone}`}
                              className="text-[14px] font-medium text-[#1E293B] hover:text-[#B8862D] font-mono truncate block"
                            >
                              {customerDetail.phone || 'Not provided'}
                            </a>
                          </div>
                        </div>

                        {customerDetail.phone && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(customerDetail.phone, 'phone')}
                            className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-white rounded border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer flex-shrink-0"
                            title="Copy phone number to clipboard"
                          >
                            {copiedField === 'phone' ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Saved Addresses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                      <h4 className="text-[15px] font-[600] text-[#1E293B]">Saved Addresses</h4>
                      <span className="text-[12px] text-[#64748B] font-medium">
                        {customerDetail.addresses?.length || 0} registered
                      </span>
                    </div>

                    {!customerDetail.addresses || customerDetail.addresses.length === 0 ? (
                      <div className="p-5 border border-dashed border-[#E2E8F0] rounded-lg text-center bg-[#F8FAFC]">
                        <MapPin className="w-6 h-6 text-[#94A3B8] mx-auto mb-1.5" />
                        <p className="text-[13px] font-medium text-[#1E293B]">No Saved Addresses</p>
                        <p className="text-[12px] text-[#64748B] mt-0.5">
                          This customer has not recorded any shipping or delivery addresses yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {customerDetail.addresses.map((addr, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-white border border-[#E2E8F0] rounded-lg space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-semibold text-[#1E293B] inline-flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#B8862D]" />
                                {addr.addressType || 'Home Address'}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10.5px] px-2 py-0.5 bg-[#F8F3E9] text-[#B8862D] font-bold rounded border border-[#E2D9C8]">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="text-[13px] text-[#475569] leading-relaxed">
                              {addr.fullName && <span className="font-medium text-[#1E293B] block">{addr.fullName}</span>}
                              {addr.house}, {addr.street}{addr.area ? `, ${addr.area}` : ''}
                            </p>

                            <div className="text-[12px] text-[#64748B] flex items-center flex-wrap gap-x-2 pt-0.5 font-medium">
                              <span>City: <strong className="text-[#1E293B] font-medium">{addr.city}</strong></span>
                              <span>•</span>
                              <span>State: <strong className="text-[#1E293B] font-medium">{addr.state}</strong></span>
                              <span>•</span>
                              <span>Pincode: <strong className="text-[#1E293B] font-medium">{addr.pincode}</strong></span>
                              <span>•</span>
                              <span>Country: <strong className="text-[#1E293B] font-medium">India</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Customer Enquiry History */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                      <h4 className="text-[15px] font-[600] text-[#1E293B]">Customer Enquiry History</h4>
                      <span className="text-[12px] text-[#64748B] font-medium">
                        {customerDetail.enquiries?.length || 0} submissions
                      </span>
                    </div>

                    {!customerDetail.enquiries || customerDetail.enquiries.length === 0 ? (
                      <div className="p-5 border border-dashed border-[#E2E8F0] rounded-lg text-center bg-[#F8FAFC]">
                        <MessageSquare className="w-6 h-6 text-[#94A3B8] mx-auto mb-1.5" />
                        <p className="text-[13px] font-medium text-[#1E293B]">No Enquiry History</p>
                        <p className="text-[12px] text-[#64748B] mt-0.5">
                          No product enquiries or assistance requests submitted under this account.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {customerDetail.enquiries.map(enq => (
                          <div
                            key={enq._id}
                            onClick={() => setActiveEnquiryView(enq)}
                            className="p-3.5 bg-white border border-[#E2E8F0] hover:border-[#B8862D] rounded-lg transition-colors cursor-pointer group space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[13.5px] font-semibold text-[#1E293B] group-hover:text-[#B8862D] truncate">
                                {enq.productName || enq.subject || 'Product Enquiry'}
                              </span>
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded border flex-shrink-0 ${getStatusBadge(
                                  enq.status
                                )}`}
                              >
                                {enq.status}
                              </span>
                            </div>

                            <p className="text-[13px] text-[#64748B] line-clamp-2 leading-relaxed">
                              {enq.message}
                            </p>

                            <div className="flex items-center justify-between pt-1 text-[11.5px] text-[#94A3B8]">
                              <span>
                                {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-[#B8862D] font-medium inline-flex items-center gap-0.5 group-hover:underline">
                                View Details <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Fixed Footer with Close Button */}
            <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={closeDrawer}
                className="h-[38px] px-5 border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[13px] font-semibold text-[#1E293B] rounded-md transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal for Detailed Enquiry */}
      {activeEnquiryView && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 sm:items-center sm:p-4">
          <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h4 className="text-[16px] font-[650] text-[#1E293B]">
                  {activeEnquiryView.productName || activeEnquiryView.subject || 'Enquiry Details'}
                </h4>
                <span className="text-[12px] text-[#64748B]">
                  ID: #{activeEnquiryView._id ? activeEnquiryView._id.slice(-6).toUpperCase() : ''}
                </span>
              </div>
              <button
                onClick={() => setActiveEnquiryView(null)}
                className="p-1 text-[#64748B] hover:text-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-[13.5px]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Status:</span>
                <span className={`px-2 py-0.5 rounded text-[11.5px] font-semibold border ${getStatusBadge(activeEnquiryView.status)}`}>
                  {activeEnquiryView.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Submitted Date:</span>
                <span className="text-[#1E293B] font-medium">
                  {new Date(activeEnquiryView.createdAt).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-[#64748B] block mb-1 font-medium">Customer Message:</span>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[#1E293B] leading-relaxed whitespace-pre-wrap">
                  {activeEnquiryView.message}
                </div>
              </div>

              {activeEnquiryView.adminNotes && (
                <div>
                  <span className="text-[#64748B] block mb-1 font-medium">Admin Notes:</span>
                  <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-md text-amber-950 text-[13px]">
                    {activeEnquiryView.adminNotes}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveEnquiryView(null)}
                className="h-[36px] px-4 border border-[#E2E8F0] rounded-md text-[13px] font-semibold text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                Back to Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
