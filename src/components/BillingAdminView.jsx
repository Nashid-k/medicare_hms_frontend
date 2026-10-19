import React, { useState } from 'react';
import { apiUrl } from '../services/api.js';

export default function BillingAdminView({ data, onRefresh, showToast }) {
  const {
    stats = {},
    invoices = [],
    doctors = [],
    patients = [],
    auditLogs = []
  } = data || {};
  const departmentRevenue = Object.values(
    invoices.reduce((totals, invoice) => {
      const department = invoice.department || 'Unassigned';
      totals[department] = totals[department] || { name: department, revenue: 0, count: 0 };
      totals[department].revenue += Number(invoice.subtotal) || 0;
      totals[department].count += 1;
      return totals;
    }, {})
  ).sort((a, b) => b.revenue - a.revenue);

  const [invoiceForm, setInvoiceForm] = useState({
    patientMrn: '',
    department: '',
    serviceDesc: '',
    code: '',
    amount: '',
    paymentMethod: 'Cash'
  });

  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [payingLoading, setPayingLoading] = useState(false);

  const handleSimulateRazorpayPayment = async () => {
    if (!selectedBill) return;
    setPayingLoading(true);
    try {
      const orderRes = await fetch(apiUrl('/api/payments/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: selectedBill._id,
          amount: selectedBill.patientPayable ?? selectedBill.subtotal,
          currency: 'INR'
        })
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Unable to create a payment order.');
      }

      let paymentVerified = false;
      if (orderData.orderId && orderData.signature) {
        const verifyRes = await fetch(apiUrl('/api/payments/verify'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: orderData.paymentId,
            razorpaySignature: orderData.signature,
            billId: selectedBill._id,
            amount: orderData.amount
          })
        });
        const verifyData = await verifyRes.json().catch(() => ({}));
        paymentVerified = verifyRes.ok && verifyData.verified === true;
      }

      if (paymentVerified) {
        await onRefresh();
      } else {
        throw new Error('Payment verification failed — invoice remains unsettled.');
      }
      setShowRazorpayModal(false);
      showToast(`Test payment verified. Invoice ${selectedBill.invoiceId} settled.`);
    } catch (error) {
      console.error('Payment verification failed:', error);
      setShowRazorpayModal(false);
      showToast(error.message || 'Payment could not be verified. Invoice remains unsettled.');
    } finally {
      setPayingLoading(false);
    }
  };

  const [newDoc, setNewDoc] = useState({
    name: '',
    specialty: '',
    department: '',
    qualification: '',
    room: '',
    consultationFee: ''
  });

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const pt = patients.find((p) => p.mrn === invoiceForm.patientMrn);
    if (!pt) {
      showToast('Select a registered patient for this invoice.');
      return;
    }

    const amt = Number(invoiceForm.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast('Enter a valid invoice amount greater than zero.');
      return;
    }
    const res = await fetch(apiUrl('/api/invoices'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: pt.name,
        mrn: pt.mrn,
        department: invoiceForm.department,
        attendingDoctor: pt.attendingDoctor || '',
        items: [
          {
            description: invoiceForm.serviceDesc,
            category: 'Clinical Procedure',
            code: invoiceForm.code,
            amount: amt
          }
        ],
        paymentMethod: invoiceForm.paymentMethod,
        status: 'Pending'
      })
    });
    if (res.ok) {
      const created = await res.json();
      showToast(`Generated Invoice ${created.invoiceId} ($${created.subtotal})`);
      onRefresh();
    }
  };

  const handleInvoiceStatus = async (invId, status) => {
    await fetch(apiUrl(`/api/invoices/${invId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(`Invoice marked as ${status}`);
    onRefresh();
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const res = await fetch(apiUrl('/api/doctors'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newDoc,
        consultationFee: Number(newDoc.consultationFee),
        status: 'On Duty'
      })
    });
    if (res.ok) {
      const doc = await res.json();
      setShowDocModal(false);
      showToast(`Credentialed ${doc.name} (${doc.employeeId})`);
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Top Executive Performance Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Active Inpatients
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-headline-md text-headline-md text-on-surface tracking-tight tabular-nums">
              {stats.activeInpatients || 0}
            </div>
            <div className="flex items-center gap-1 mt-1 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>Currently admitted</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Verified Doctors
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">
              verified_user
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-headline-md text-headline-md text-on-surface tracking-tight tabular-nums">
              {doctors.length}{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Rostered
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>On-duty roster</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Today&apos;s Consultations
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary-container">
              clinical_notes
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-headline-md text-headline-md text-on-surface tracking-tight tabular-nums">
              {stats.appointmentsToday || 0}
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="font-code-sm text-code-sm text-primary">
                {stats.completedAppointments || 0} Completed
              </span>
              <span>· {stats.waitingAppointments || 0} Queue</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Settled Revenue
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-headline-md text-headline-md text-on-surface tracking-tight font-code-sm tabular-nums">
              ${(stats.paidRevenue || 0).toLocaleString()}.00
            </div>
            <div className="flex items-center gap-1 mt-1 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>Collected invoice revenue</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Open EDI Claims
            </span>
            <span className="material-symbols-outlined text-[18px] text-error">
              pending_actions
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-headline-md text-headline-md text-error tracking-tight font-code-sm tabular-nums">
              ${(stats.pendingRevenue || 0).toLocaleString()}.00
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span>{invoices.filter((i) => i.status !== 'Paid').length} unsettled claims</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left 8 Columns: Department Breakdown + Itemized Invoicing Desk + Claims Table */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* Department Occupancy & Financial Velocity Header */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Departmental Metrics
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Department Revenue &amp; Occupancy Breakdown
                </h2>
              </div>
              <span className="px-2.5 py-1 bg-surface-container-low rounded-xl font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Real-time Ward Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
              {departmentRevenue.map((department) => (
                <div
                  key={department.name}
                  className="p-3.5 rounded-xl bg-surface-container-low flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-title-md text-[14px] text-on-surface">{department.name}</span>
                    <span className="text-secondary font-code-sm text-code-sm">{department.count} invoices</span>
                  </div>
                  <div className="font-headline-sm text-headline-sm text-primary font-code-sm">
                    ${department.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
              {departmentRevenue.length === 0 && (
                <p className="sm:col-span-2 lg:col-span-4 py-6 text-center text-on-surface-variant font-body-sm">
                  No invoice activity to report.
                </p>
              )}
            </div>
          </div>

          {/* Itemized Hospital Billing & Claims Desk */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  EDI 837I Revenue Cycle
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Hospital Billing, Claims &amp; Itemized Invoices ({invoices.length})
                </h2>
              </div>
            </div>

            {/* New Invoice Generator Form */}
            <form
              onSubmit={handleCreateInvoice}
              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant grid grid-cols-1 sm:grid-cols-6 gap-3 items-end"
            >
              <div className="sm:col-span-2">
                <label className="font-label-sm text-[11px] block mb-1">Patient (MRN)</label>
                <select
                  value={invoiceForm.patientMrn}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, patientMrn: e.target.value })
                  }
                  className="w-full h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p.mrn}>
                      {p.name} (#{p.mrn})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="font-label-sm text-[11px] block mb-1">
                  CPT Procedure / Billable Service
                </label>
                <input
                  required
                  value={invoiceForm.serviceDesc}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, serviceDesc: e.target.value })
                  }
                  className="w-full h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div>
                <label className="font-label-sm text-[11px] block mb-1">Total ($)</label>
                <input
                  type="number"
                  required
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-9 px-3 rounded-lg bg-primary text-on-primary hover:opacity-90 font-label-sm text-label-sm shadow-sm transition-opacity"
              >
                + Issue Claim
              </button>
            </form>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                    <th className="py-2.5 px-3">Invoice ID</th>
                    <th className="py-2.5 px-3">Patient / Dept</th>
                    <th className="py-2.5 px-3">Itemized Procedures</th>
                    <th className="py-2.5 px-3">Gross / Copay</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                  {invoices.map((inv) => (
                    <tr
                      key={inv._id}
                      data-testid="bill-row"
                      onClick={() => setSelectedBill(inv)}
                      className="hover:bg-surface-container-low/50 cursor-pointer"
                    >
                      <td className="py-3 px-3 font-code-sm text-primary font-semibold">
                        {inv.invoiceId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-title-md text-[13px] text-on-surface">
                            {inv.patientName}
                          </span>
                          <span className="font-code-sm text-[11px] text-on-surface-variant">
                            #{inv.mrn} · {inv.department}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">
                            {inv.items?.[0]?.description}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {inv.items?.length} line item(s) · {inv.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-code-sm tabular-nums">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">
                            ${Number(inv.subtotal).toLocaleString()}.00
                          </span>
                          <span className="text-[11px] text-secondary">
                            Pt Co-pay: ${inv.patientPayable}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {inv.status === 'Paid' ? (
                          <span
                            data-testid="bill-paid-badge"
                            className="status-pill px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800"
                          >
                            Paid
                          </span>
                        ) : (
                          <span
                            className={`status-pill px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              inv.status === 'Insurance Claim'
                                ? 'bg-primary-fixed text-primary'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {inv.status !== 'Paid' && Number(inv.patientPayable) > 0 ? (
                          <button
                            type="button"
                            data-testid="pay-now-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBill(inv);
                              setShowRazorpayModal(true);
                            }}
                            className="px-3 py-1 rounded-lg bg-secondary text-on-secondary font-label-sm text-[11px] hover:opacity-90"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span data-testid="bill-paid-badge" className="font-code-sm text-[11px] text-emerald-700 font-semibold">
                            {inv.status === 'Paid' ? '✓ Settled' : 'No balance due'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-[36px] text-outline">receipt_long</span>
                          <p className="font-title-md text-title-md text-on-surface">No Billing Invoices</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Issue a claim using the generator above to create an itemized invoice.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Doctor Credentialing Roster + System Administration */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                  Medical Staff Governance
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Attending Physician Roster
                </h2>
              </div>
              <button
                onClick={() => setShowDocModal(true)}
                className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-sm text-[11px]"
              >
                + Onboard MD
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-title-md text-[14px] text-on-surface">
                        {doc.name}
                      </span>
                      <span className="font-code-sm text-[10px] text-primary bg-primary-fixed px-1.5 py-0.5 rounded">
                        {doc.qualification}
                      </span>
                    </div>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      {doc.specialty}
                    </span>
                    <span className="font-code-sm text-[11px] text-secondary mt-0.5">
                      {doc.room} · Shift {doc.shiftHours}
                    </span>
                  </div>
                  <span className="status-pill shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[10px]">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Administration */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                System Administration &amp; DB Control
              </h3>
              <span className="material-symbols-outlined text-primary">
                admin_panel_settings
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Manage clinical invoices and doctor records using the controls on this page.
            </p>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showDocModal && (
        <div
          className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDocModal(false); }}
        >
          <div className="modal-content bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl border border-outline-variant animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Credential &amp; Onboard Attending Physician
              </h3>
              <button
                type="button"
                aria-label="Close add doctor modal"
                onClick={() => setShowDocModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddDoctor} className="flex flex-col gap-3 mt-4">
              <div>
                <label className="font-label-sm text-label-sm block mb-1">Doctor Full Name</label>
                <input
                  required
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="e.g. Dr. Alistair Finch"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm block mb-1">Specialty</label>
                <input
                  required
                  value={newDoc.specialty}
                  onChange={(e) => setNewDoc({ ...newDoc, specialty: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Department</label>
                  <input
                    required
                    value={newDoc.department}
                    onChange={(e) => setNewDoc({ ...newDoc, department: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Suite / Room</label>
                  <input
                    required
                    value={newDoc.room}
                    onChange={(e) => setNewDoc({ ...newDoc, room: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm transition-opacity"
                >
                  Verify &amp; Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Test Checkout Modal */}
      {showRazorpayModal && selectedBill && (
        <div
          data-testid="razorpay-checkout-modal"
          className="fixed inset-0 z-[100] bg-on-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRazorpayModal(false); }}
        >
          <div className="modal-content bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl border border-outline-variant flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface font-bold">
                    Razorpay Test Checkout Simulation
                  </h3>
                  <p className="font-label-sm text-[11px] text-on-surface-variant">
                    Local Test Mode · Simulated Checkout
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close checkout modal"
                onClick={() => setShowRazorpayModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-on-surface-variant">Invoice Reference:</span>
                <span className="font-code-sm text-primary font-bold">{selectedBill.invoiceId}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-on-surface-variant">Patient Name:</span>
                <span className="font-title-md text-on-surface font-semibold">{selectedBill.patientName}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-on-surface-variant">Item Description:</span>
                <span className="font-body-sm text-on-surface truncate max-w-[200px]">
                  {selectedBill.items?.[0]?.description}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
                <span className="font-title-md text-on-surface font-semibold">Total Payable:</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  ₹{Number(selectedBill.patientPayable ?? selectedBill.subtotal ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-label-sm text-[11px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">lock</span>
              <span>Local test payment · HMAC signature validation</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setShowRazorpayModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="simulate-pay-success-btn"
                disabled={payingLoading}
                onClick={handleSimulateRazorpayPayment}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-label-md text-label-md shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{payingLoading ? 'Verifying HMAC...' : 'Simulate Payment Success'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
