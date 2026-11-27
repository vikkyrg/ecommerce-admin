import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  X,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Check,
  Ban
} from 'lucide-react';
import { fetchAdminOrders, updateAdminOrderStatus } from '../services/adminApi';

const STATUS_OPTIONS = [
  'All Orders',
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const STATUS_TRANSITIONS = {
  'Order Placed': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Processing', 'Cancelled'],
  'Processing': ['Shipped', 'Cancelled'],
  'Shipped': ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  'Delivered': [],
  'Cancelled': []
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Orders');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status update modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [paymentStatusInput, setPaymentStatusInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load orders from database.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderNum = (order.orderNumber || '').toLowerCase();
      const custName = (order.customerName || order.shippingAddress?.fullName || '').toLowerCase();
      const phone = (order.phone || order.shippingAddress?.phone || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || orderNum.includes(term) || custName.includes(term) || phone.includes(term);
      if (!matchesSearch) return false;

      if (statusFilter !== 'All Orders' && order.orderStatus !== statusFilter) {
        return false;
      }

      if (paymentFilter !== 'All' && (order.paymentMethod || '').toUpperCase() !== paymentFilter.toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleOpenStatusModal = order => {
    setSelectedOrder(order);
    setNewStatus('');
    setStatusNote('');
    setTrackingNumberInput(order.trackingNumber || '');
    setPaymentStatusInput(order.paymentStatus || 'Pending');
    setUpdateError('');
    setUpdateSuccess('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async e => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const payload = {
        orderStatus: newStatus,
        note: statusNote.trim(),
        trackingNumber: trackingNumberInput.trim() || undefined,
        paymentStatus: paymentStatusInput || undefined
      };

      const updated = await updateAdminOrderStatus(selectedOrder._id, payload);
      setUpdateSuccess(`Order status successfully updated to "${newStatus}"!`);

      // Update in state list
      setOrders(prev => prev.map(o => (o._id === updated._id ? updated : o)));
      setSelectedOrder(updated);

      setTimeout(() => {
        setStatusModalOpen(false);
      }, 1200);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Confirmed':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Order Placed':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight font-['Manrope']">
              Order Management
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer orders, update delivery status, and review payment verifications.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-6 lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, Customer, Phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
            />
          </div>

          {/* Payment Filter */}
          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="All">All Payment Methods</option>
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="NetBanking">Net Banking</option>
            </select>
          </div>

        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          {STATUS_OPTIONS.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-[#ffdf9c] shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table & Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-700 text-xs">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
          <h3 className="font-bold text-sm text-slate-800">No matching orders found</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order ID &amp; Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-semibold text-slate-800 block">
                        {order.customerName || order.shippingAddress?.fullName || 'Customer'}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                        {order.phone || order.shippingAddress?.phone || 'No phone'}
                      </span>
                    </td>

                    {/* Products */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="text-slate-700 line-clamp-1 max-w-[200px]">
                        {order.orderItems?.[0]?.name || 'Product'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {order.orderItems?.length || 1} line {(order.orderItems?.length || 1) === 1 ? 'item' : 'items'}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 align-top font-bold text-slate-900 font-['Manrope']">
                      ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-700">
                          {order.paymentMethod || 'COD'}
                        </span>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded w-max ${
                          order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="py-3.5 px-4 align-top">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleOpenStatusModal(order)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-[#ffdf9c] bg-slate-900 hover:bg-black rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title="Update Status"
                      >
                        <span>Update Status</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW ORDER DETAILS MODAL
          ========================================================================= */}
      {selectedOrder && !statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#ffdf9c]" />
                <h3 className="font-bold text-sm sm:text-base font-['Manrope'] text-white">
                  Order Details — {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
              
              {/* Order Status & Quick Meta */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border mt-0.5 ${getStatusBadge(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Placed Date</span>
                  <span className="font-semibold text-slate-800">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment</span>
                  <span className="font-bold text-slate-900">
                    {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus || 'Pending'})
                  </span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tracking AWB</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* Customer & Delivery Address Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Customer Information */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer Information</span>
                  </h4>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-semibold text-slate-900">{selectedOrder.customerName || selectedOrder.shippingAddress?.fullName}</p>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{selectedOrder.phone || selectedOrder.shippingAddress?.phone}</span>
                    </p>
                    {selectedOrder.guestEmail && (
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{selectedOrder.guestEmail}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shipping Address</span>
                  </h4>
                  {selectedOrder.shippingAddress ? (
                    <div className="space-y-0.5 text-slate-600 leading-relaxed">
                      <p className="font-semibold text-slate-800">{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.house}, {selectedOrder.shippingAddress.street}</p>
                      {selectedOrder.shippingAddress.area && <p>{selectedOrder.shippingAddress.area}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                      {selectedOrder.shippingAddress.landmark && (
                        <p className="text-[11px] text-slate-400">Landmark: {selectedOrder.shippingAddress.landmark}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No shipping address recorded</p>
                  )}
                </div>

              </div>

              {/* Ordered Products */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
                  Ordered Items ({selectedOrder.orderItems?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Qty: <strong className="text-slate-700">{item.quantity}</strong> × ₹{(item.price || 0).toLocaleString('en-IN')}
                            {item.size && ` • ${item.size}`}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 font-['Manrope'] whitespace-nowrap">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">₹{(selectedOrder.itemsPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-semibold">-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Final Total:</span>
                  <span className="font-['Manrope'] text-base font-extrabold">
                    ₹{(selectedOrder.totalPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Status History Timeline */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    Order Status History
                  </h4>
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                    {selectedOrder.statusHistory.map((hist, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-slate-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{hist.status}</span>
                            <span className="text-[10px] text-slate-400">
                              {hist.updatedAt ? new Date(hist.updatedAt).toLocaleString('en-IN') : ''}
                            </span>
                          </div>
                          {hist.note && <p className="text-slate-500 text-[11px] mt-0.5">{hist.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Details if Cancelled */}
              {selectedOrder.orderStatus === 'Cancelled' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                  <span className="font-bold block">Cancellation Record:</span>
                  <p>Cancelled By: <strong className="capitalize">{selectedOrder.cancelledBy || 'Customer'}</strong></p>
                  {selectedOrder.cancellationReason && <p>Reason: {selectedOrder.cancellationReason}</p>}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => handleOpenStatusModal(selectedOrder)}
                className="px-4 py-2 text-xs font-bold text-[#ffdf9c] bg-slate-900 hover:bg-black rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Update Order Status</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          UPDATE STATUS MODAL
          ========================================================================= */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <h3 className="font-bold text-sm font-['Manrope'] text-white">
                Update Status — {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4 text-xs">
              
              <div>
                <span className="text-slate-500 block mb-1">Current Order Status:</span>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedOrder.orderStatus)}`}>
                  {selectedOrder.orderStatus}
                </span>
              </div>

              {/* Status Transition Select */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  New Order Status *
                </label>
                <select
                  required
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="">Select next status...</option>
                  {(STATUS_TRANSITIONS[selectedOrder.orderStatus] || []).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                {(STATUS_TRANSITIONS[selectedOrder.orderStatus] || []).length === 0 && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    This order is in a final status ({selectedOrder.orderStatus}) and cannot be transitioned further.
                  </p>
                )}
              </div>

              {/* Tracking Number Input (if Shipped or Out for Delivery) */}
              {(newStatus === 'Shipped' || newStatus === 'Out for Delivery' || selectedOrder.trackingNumber) && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Courier / AWB Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumberInput}
                    onChange={e => setTrackingNumberInput(e.target.value)}
                    placeholder="e.g. TRK-98472910"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 focus:bg-white uppercase font-mono"
                  />
                </div>
              )}

              {/* Payment Status update (especially for COD delivery collection) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatusInput}
                  onChange={e => setPaymentStatusInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 focus:bg-white cursor-pointer"
                >
                  <option value="Pending">Pending (Unpaid)</option>
                  <option value="Paid">Paid / Collected</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  For COD orders, mark as "Paid" only when cash has been collected upon delivery.
                </p>
              </div>

              {/* Status Note */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Status Note / Reason
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="e.g. Verified with customer, preparing packaging dispatch."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 focus:bg-white resize-none"
                />
              </div>

              {updateError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{updateError}</span>
                </div>
              )}

              {updateSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                  <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{updateSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !newStatus}
                  className="px-4 py-2 text-xs font-bold text-[#ffdf9c] bg-slate-900 hover:bg-black rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Saving...' : 'Update Status'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
