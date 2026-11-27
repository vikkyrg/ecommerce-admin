import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Mail,
  Search,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
  X,
  ChevronDown,
  MessageSquare,
  Package,
  Clock,
  Send,
  UserCheck
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import {
  fetchAdminEnquiries,
  fetchAdminEnquiryById,
  updateAdminEnquiryStatus,
  updateAdminEnquiryNotes,
  deleteAdminEnquiry
} from '../services/adminApi';

export default function EnquiriesManagement() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [enquiries, setEnquiries] = useState([]);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [counts, setCounts] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Details Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchAdminEnquiries({
        search,
        status: statusFilter,
        page: currentPage,
        limit: pageSize
      });

      if (response.success) {
        setEnquiries(response.data || []);
        setTotalEnquiries(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 1);
        if (response.counts) {
          setCounts(response.counts);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [currentPage, search, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateAdminEnquiryStatus(id, newStatus);
      if (res.success) {
        setEnquiries(prev =>
          prev.map(item => (item._id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
        }
        setSuccess('Enquiry status updated successfully.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const openEnquiryModal = async id => {
    setLoadingDetail(true);
    try {
      const res = await fetchAdminEnquiryById(id);
      if (res.success) {
        setSelectedEnquiry(res.data);
        setAdminNotesInput(res.data.adminNotes || '');
      }
    } catch (err) {
      alert(err.message || 'Unable to open enquiry');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setUpdatingNotes(true);
    try {
      const res = await updateAdminEnquiryNotes(selectedEnquiry._id, adminNotesInput);
      if (res.success) {
        setSelectedEnquiry(prev => ({ ...prev, adminNotes: adminNotesInput }));
        setEnquiries(prev =>
          prev.map(item =>
            item._id === selectedEnquiry._id ? { ...item, adminNotes: adminNotesInput } : item
          )
        );
        setSuccess('Admin notes updated.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to save notes');
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await deleteAdminEnquiry(deleteConfirmId);
      if (res.success) {
        setEnquiries(prev => prev.filter(e => e._id !== deleteConfirmId));
        if (selectedEnquiry?._id === deleteConfirmId) {
          setSelectedEnquiry(null);
        }
        setDeleteConfirmId(null);
        setSuccess('Enquiry deleted successfully.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete enquiry');
    }
  };

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
      <Topbar
        title="Product Enquiries"
        subtitle="Manage customer questions, quotes, and technical assistance requests"
        onMenuClick={toggleMobileMenu}
      />

      <main className="min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white p-4.5 rounded-lg border border-[#E2E8F0]">
            <span className="text-[12px] font-semibold uppercase text-[#64748B]">Total Enquiries</span>
            <p className="text-[28px] font-bold text-[#1E293B] mt-1">{counts.total || totalEnquiries}</p>
          </div>
          <div className="bg-white p-4.5 rounded-lg border border-[#E2E8F0]">
            <span className="text-[12px] font-semibold uppercase text-amber-700">New Submissions</span>
            <p className="text-[28px] font-bold text-amber-700 mt-1">{counts.new || 0}</p>
          </div>
          <div className="bg-white p-4.5 rounded-lg border border-[#E2E8F0]">
            <span className="text-[12px] font-semibold uppercase text-blue-700">In Progress / Contacted</span>
            <p className="text-[28px] font-bold text-blue-700 mt-1">{counts.inProgress || 0}</p>
          </div>
          <div className="bg-white p-4.5 rounded-lg border border-[#E2E8F0]">
            <span className="text-[12px] font-semibold uppercase text-emerald-700">Resolved Enquiries</span>
            <p className="text-[28px] font-bold text-emerald-700 mt-1">{counts.resolved || 0}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col items-stretch justify-between gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative w-full min-w-0 flex-1 sm:max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer, email, phone, product..."
              className="w-full h-[42px] pl-10 pr-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
            />
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[160px]">
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              onClick={loadEnquiries}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[12px] font-semibold transition cursor-pointer flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-[13.5px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Enquiry Listing Table */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="h-16 bg-white rounded-lg border border-[#E2E8F0] animate-pulse" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-14 text-center bg-white rounded-lg border border-[#E2E8F0]">
            <Mail className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-[18px] font-[650] text-[#1E293B]">No Enquiries Found</h3>
            <p className="text-[14px] text-[#64748B] mt-1">
              Customer inquiries submitted via the website contact or product forms will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Enquiry ID</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Customer Name</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Email & Phone</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Product Name</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Submitted Date</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                  {enquiries.map(enq => (
                    <tr key={enq._id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Enquiry ID */}
                      <td className="px-5 py-3.5 text-[12.5px] font-mono text-[#64748B]">
                        #{enq._id.slice(-6).toUpperCase()}
                      </td>

                      {/* Customer Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-[#1E293B]">
                            {enq.customerName}
                          </span>
                          {enq.customerId && (
                            <span
                              title="Registered Customer"
                              className="px-1.5 py-0.2 bg-[#F8F3E9] text-[#B8862D] rounded text-[10px] font-bold border border-[#E2D9C8]"
                            >
                              USER
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="px-5 py-3.5 text-[13.5px]">
                        <span className="block text-[#1E293B] truncate max-w-[200px]">{enq.email}</span>
                        <span className="block text-[#64748B] text-[12px] font-mono mt-0.5">{enq.phone}</span>
                      </td>

                      {/* Product Name */}
                      <td className="px-5 py-3.5 text-[13.5px] text-[#475569]">
                        <span className="block truncate max-w-[220px] font-medium">
                          {enq.productName || enq.subject || 'General Enquiry'}
                        </span>
                      </td>

                      {/* Enquiry Date */}
                      <td className="px-5 py-3.5 text-[13px] text-[#64748B] whitespace-nowrap">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <select
                          value={enq.status}
                          onChange={e => handleStatusChange(enq._id, e.target.value)}
                          className={`min-h-10 px-2.5 py-1 rounded text-[12px] font-semibold border cursor-pointer ${getStatusBadge(
                            enq.status
                          )}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEnquiryModal(enq._id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                            title="View Enquiry Details"
                            aria-label="View Enquiry Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(enq._id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            title="Delete Enquiry"
                            aria-label="Delete Enquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-[#E2E8F0] text-[13px] text-[#64748B]">
              <span>
                Showing {enquiries.length ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, totalEnquiries)} of {totalEnquiries} enquiries
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-10 px-3.5 border border-[#E2E8F0] rounded text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[13px]"
                >
                  Previous
                </button>
                <span className="tabular-nums px-2 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-10 px-3.5 border border-[#E2E8F0] rounded text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[13px]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/40 p-2 sm:items-center sm:p-4">
          <div className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-lg animate-in fade-in zoom-in-95 duration-150 sm:max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-bold text-[#1E293B] leading-tight">
                  Enquiry #{selectedEnquiry._id.slice(-6).toUpperCase()}
                </h3>
                <span className="text-[12px] text-[#64748B]">
                  Submitted on {new Date(selectedEnquiry.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                aria-label="Close enquiry details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="min-h-0 space-y-5 overflow-y-auto p-4 sm:p-6">
              {/* Customer Profile Card with Direct Actions */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold text-[#1E293B]">
                      {selectedEnquiry.customerName}
                    </span>
                    {selectedEnquiry.customerId && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F8F3E9] text-[#B8862D] border border-[#E2D9C8]">
                        Registered Customer
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-[#64748B] mt-1 space-y-0.5">
                    <p>Email: {selectedEnquiry.email}</p>
                    <p>Phone: {selectedEnquiry.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${selectedEnquiry.customerName}, this is NS Stone Chemicals regarding your enquiry for "${selectedEnquiry.productName || selectedEnquiry.subject}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-semibold rounded-md transition-colors inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(
                      `NS Stone Chemicals - Regarding your enquiry: ${selectedEnquiry.subject || selectedEnquiry.productName}`
                    )}`}
                    className="h-10 px-3.5 border border-[#E2E8F0] bg-white hover:bg-slate-100 text-[#1E293B] text-[12.5px] font-semibold rounded-md transition-colors inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>

              {/* Product Reference */}
              {selectedEnquiry.productName && (
                <div className="p-4 border border-[#E2E8F0] rounded-md bg-white flex items-center gap-4">
                  <div className="w-12 h-12 rounded border border-[#E2E8F0] bg-white p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedEnquiry.productImage ? (
                      <img
                        src={selectedEnquiry.productImage}
                        alt={selectedEnquiry.productName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-[#94A3B8]" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase text-[#64748B] block">
                      Enquired Product
                    </span>
                    <span className="text-[14px] font-semibold text-[#1E293B]">
                      {selectedEnquiry.productName}
                    </span>
                  </div>
                </div>
              )}

              {/* Customer Message */}
              <div>
                <label className="block text-[13px] font-bold text-[#1E293B] mb-1.5">
                  Customer Message:
                </label>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[13.5px] text-[#1E293B] leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Status Update */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label className="text-[13px] font-bold text-[#1E293B]">Enquiry Status:</label>
                <select
                  value={selectedEnquiry.status}
                  onChange={e => handleStatusChange(selectedEnquiry._id, e.target.value)}
                  className={`px-3 py-1.5 rounded-md text-[13px] font-semibold border cursor-pointer ${getStatusBadge(
                    selectedEnquiry.status
                  )}`}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label className="block text-[13px] font-bold text-[#1E293B] mb-1.5">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotesInput}
                  onChange={e => setAdminNotesInput(e.target.value)}
                  placeholder="Record callback attempts, quoted price discounts, or resolution details..."
                  className="w-full p-3 bg-white text-[#1E293B] text-[13.5px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={updatingNotes}
                    className="h-[34px] px-3.5 bg-[#B8862D] hover:bg-[#9c7126] text-white text-[12.5px] font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {updatingNotes ? 'Saving Notes...' : 'Save Admin Notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedEnquiry._id)}
                className="text-red-600 hover:text-red-700 text-[13px] font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Enquiry</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="h-[38px] px-4 border border-[#E2E8F0] bg-white rounded-md text-[13px] font-semibold text-[#1E293B] hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 sm:items-center sm:p-4">
          <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-sm space-y-4 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-lg sm:p-6">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-[17px] text-[#1E293B]">Delete Enquiry</h3>
            </div>
            <p className="text-[13.5px] text-[#64748B] leading-relaxed">
              Are you sure you want to delete this enquiry? This action cannot be undone.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-[36px] px-3.5 rounded-md border border-[#E2E8F0] text-[13px] text-[#1E293B] font-medium hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEnquiry}
                className="h-[36px] px-3.5 rounded-md bg-red-600 hover:bg-red-700 text-[13px] text-white font-semibold"
              >
                Delete Enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
