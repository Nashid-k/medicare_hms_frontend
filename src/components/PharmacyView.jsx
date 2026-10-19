import React, { useState } from 'react';
import { apiUrl } from '../services/api.js';

export default function PharmacyView({ data, currentUser, activeRole, onRefresh, showToast }) {
  const { inventory = [], prescriptions = [], auditLogs = [] } = data || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [scannerText, setScannerText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newBatch, setNewBatch] = useState({
    medicineName: '',
    batchId: `BAT-${Math.floor(10000 + Math.random() * 89999)}`,
    ndc: '0071-0156-23',
    manufacturer: 'Pfizer Clinical Labs',
    category: 'CARDIO',
    quantity: 250,
    minLevel: 50,
    unitPrice: 1.45,
    expiryDate: '2027-12-31'
  });

  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'Pending');
  const dispensedCount = prescriptions.filter((p) => p.status === 'Dispensed').length;
  const lowStockBatches = inventory.filter(
    (b) => b.status === 'Low Stock' || b.quantity <= b.minLevel
  );
  const nearExpiryBatches = inventory.filter((b) => b.status === 'Near Expiry');

  const filteredInventory = inventory.filter((item) => {
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.medicineName.toLowerCase().includes(q) ||
      item.batchId.toLowerCase().includes(q) ||
      item.ndc.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const [selectedRx, setSelectedRx] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState(() => inventory[0]?.batchId || 'BAT-77312');
  const [dispenseQty, setDispenseQty] = useState('30');
  const [stockError, setStockError] = useState('');
  const [isDispensedSuccess, setIsDispensedSuccess] = useState(false);

  const handleExecuteDispense = async () => {
    setStockError('');
    setIsDispensedSuccess(false);
    const qty = Number(dispenseQty) || 1;
    const targetBatch =
      inventory.find((b) => b.batchId === selectedBatchId) || inventory[0];
    if (targetBatch && targetBatch.quantity < qty) {
      setStockError(
        `Insufficient stock in batch ${targetBatch.batchId}. Available: ${targetBatch.quantity}, requested: ${qty}`
      );
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/pharmacy/dispense'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatchId || targetBatch?.batchId,
          quantity: qty,
          quantityToDispense: qty,
          medicineName: targetBatch?.medicineName,
          patientName: selectedRx?.patientName || 'Marcus Vance',
          prescriptionId: selectedRx?._id || selectedRx?.rxId,
          dispensedBy: 'PharmD. R. Vance'
        })
      });
      const resJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStockError(resJson.error || 'Dispense failed due to stock constraint');
        return;
      }
      setIsDispensedSuccess(true);
      showToast(
        `Dispensed ${qty} units of ${targetBatch?.medicineName || 'medicine'} from batch ${
          selectedBatchId || targetBatch?.batchId
        }!`
      );
      onRefresh();
    } catch {
      setStockError('Error connecting to pharmacy dispense API');
    }
  };

  const handleDispenseRx = async (rxId) => {
    const res = await fetch(apiUrl(`/api/prescriptions/${rxId}/dispense`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispensedBy: currentUser?.name || 'PharmD. R. Vance' })
    });
    if (res.ok) {
      showToast('Prescription dispensed & batch inventory deducted in MongoDB!');
      onRefresh();
    }
  };

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(apiUrl('/api/inventory'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newBatch,
        quantity: Number(newBatch.quantity),
        minLevel: Number(newBatch.minLevel),
        unitPrice: Number(newBatch.unitPrice)
      })
    });
    if (res.ok) {
      const created = await res.json();
      setShowAddModal(false);
      showToast(`Ingested batch ${created.batchId} (${created.medicineName})`);
      setNewBatch({
        ...newBatch,
        medicineName: '',
        batchId: `BAT-${Math.floor(10000 + Math.random() * 89999)}`
      });
      onRefresh();
    }
  };

  const handleAdjustStock = async (batch, delta) => {
    const newQty = Math.max(0, batch.quantity + delta);
    await fetch(apiUrl(`/api/inventory/${batch._id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty })
    });
    showToast(`Adjusted ${batch.batchId} stock to ${newQty} units`);
    onRefresh();
  };

  const handleSimulateBarcode = () => {
    const samples = [
      'Scanned GS1-128: (01)0030069315002(17)271114(10)BAT-77312 [Atorvastatin 20mg · Verified]',
      'Scanned 2D DataMatrix: (01)07811852319(17)270108(10)BAT-65022 [Amoxicillin 875mg · Verified]',
      'Scanned GS1-128: (01)00933165201(17)270830(10)BAT-88123 [Albuterol HFA · Verified]'
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setScannerText(picked);
    setTimeout(() => setScannerText(''), 4000);
  };

  const handleExportCsv = () => {
    const headers = ['Medicine,Batch ID,NDC,Manufacturer,Category,Stock,Unit Price,Expiry,Status'];
    const rows = inventory.map(
      (b) =>
        `"${b.medicineName}",${b.batchId},${b.ndc},"${b.manufacturer}",${b.category},${b.quantity},$${b.unitPrice},${b.expiryDate},${b.status}`
    );
    const csv = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute(
      'download',
      `MediCare_Pharmacy_Audit_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Pharmacy Audit CSV');
  };

  const totalUnits = inventory.reduce((sum, b) => sum + (b.quantity || 0), 0);

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Top Metric Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Total Active Units
              </span>
              <h2 className="font-headline-xl text-headline-xl text-on-surface mt-1 tracking-tight tabular-nums">
                {totalUnits.toLocaleString()}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-on-surface-variant pt-2">
            <span className="font-code-sm text-code-sm flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>{' '}
              {inventory.length} Active Batches
            </span>
            <span className="font-label-sm text-label-sm bg-surface-container-low px-2 py-0.5 rounded text-on-surface-variant">
              99.4% Verified
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
          <div className="flex items-start justify-between pl-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Low Stock Critical
                </span>
                <span className="status-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Reorder
                </span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface mt-1 tracking-tight tabular-nums">
                {lowStockBatches.length}{' '}
                <span className="font-headline-sm text-headline-sm text-on-surface-variant">
                  SKUs
                </span>
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pl-1 pt-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Auto-reorder threshold active
            </span>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className="font-label-sm text-label-sm text-primary hover:underline"
            >
              Review →
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
          <div className="flex items-start justify-between pl-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Expiring ≤ 30 Days
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-error-container text-on-error-container">
                  {nearExpiryBatches.length} Batches
                </span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-error mt-1 tracking-tight tabular-nums">
                {nearExpiryBatches.length}{' '}
                <span className="font-headline-sm text-headline-sm text-on-surface-variant">
                  Quarantine
                </span>
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[24px]">event_busy</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pl-1 pt-2">
            <span className="font-code-sm text-code-sm text-on-surface-variant">
              FEFO Protocol Enforced
            </span>
            <span className="font-label-sm text-label-sm text-error font-medium">
              Log Depletion
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Dispensed Today
              </span>
              <h2 className="font-headline-xl text-headline-xl text-on-surface mt-1 tracking-tight tabular-nums">
                {85 + dispensedCount}{' '}
                <span className="font-headline-sm text-headline-sm text-secondary font-medium">
                  ✓
                </span>
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">prescriptions</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {pendingPrescriptions.length} Active in dispensing queue
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-primary font-medium">Avg 3.8m</span>
          </div>
        </div>
      </div>

      {/* Scanner Simulation Alert */}
      {scannerText && (
        <div className="p-space-md rounded-xl bg-secondary text-on-secondary flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 font-code-sm text-code-sm">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span>{scannerText}</span>
          </div>
          <button onClick={() => setScannerText('')} className="text-white/80 hover:text-on-primary">
            Dismiss
          </button>
        </div>
      )}

      {/* CONTROL ACTION BAR */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
        <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-space-sm">
          <div className="flex-1 min-w-0 sm:min-w-[240px] flex items-center gap-2 bg-surface-container-low px-space-md py-2.5 rounded-lg text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-outline shrink-0">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Medicine, NDC (e.g. 0071-0156), or Batch ID..."
              className="bg-transparent w-full min-w-0 text-body-sm font-body-sm placeholder:text-outline focus:outline-none"
            />
            <span className="hidden sm:inline font-code-sm text-code-sm bg-surface-container-highest px-1.5 py-0.5 rounded text-on-surface-variant shrink-0">
              F3
            </span>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-space-md py-2.5 rounded-lg">
            <span className="material-symbols-outlined text-[18px] text-outline">category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none pr-2 cursor-pointer"
            >
              <option value="ALL">All Categories (All Formulations)</option>
              <option value="CARDIO">Cardiovascular</option>
              <option value="ANTI">Antibiotics &amp; Antimicrobials</option>
              <option value="ANALG">Analgesics &amp; Pain Mgmt</option>
              <option value="RESP">Respiratory &amp; Broncho</option>
              <option value="NEURO">Neurology</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            type="button"
            onClick={handleSimulateBarcode}
            className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">
              barcode_scanner
            </span>
            <span>Scan 2D Matrix</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">download</span>
            <span>Audit CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md transition-opacity shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            <span>Add Medicine Batch</span>
          </button>
        </div>
      </div>

      {/* MAIN 12-COLUMN WORKSPACE: Inventory Table (8 cols) + Live Dispensing Queue (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left 8 Columns: Batch Inventory Repository + Audit Ledger */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
            <div className="p-space-md border-b border-surface-container-highest flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Active Pharmaceutical Batch Repository
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  FEFO (First-Expired, First-Out) lot tracking &amp; automated stock deduction
                </p>
              </div>
              <span className="font-code-sm text-code-sm text-primary">
                Showing {filteredInventory.length} Batches
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                    <th className="py-3 px-space-md">Medicine &amp; Formulation</th>
                    <th className="py-3 px-space-md">Batch ID / NDC</th>
                    <th className="py-3 px-space-md">Manufacturer</th>
                    <th className="py-3 px-space-md">Stock Level</th>
                    <th className="py-3 px-space-md">Unit / Expiry</th>
                    <th className="py-3 px-space-md text-center">Status</th>
                    <th className="py-3 px-space-md text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                  {filteredInventory.map((batch) => {
                    const pct = Math.min(100, Math.round((batch.quantity / 500) * 100));
                    return (
                      <tr
                        key={batch._id}
                        className="hover:bg-surface-container-low/60 transition-colors"
                      >
                        <td className="py-3.5 px-space-md">
                          <div className="flex flex-col">
                            <span className="text-on-surface font-title-md text-[14px]">
                              {batch.medicineName}
                            </span>
                            <span className="text-on-surface-variant text-[12px]">
                              {batch.formulation}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md font-code-sm text-code-sm">
                          <div className="flex flex-col">
                            <span className="text-primary font-semibold">{batch.batchId}</span>
                            <span className="text-on-surface-variant text-[11px]">{batch.ndc}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md text-on-surface-variant">
                          {batch.manufacturer}
                        </td>
                        <td className="py-3.5 px-space-md">
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex justify-between font-code-sm text-code-sm tabular-nums">
                              <span className="font-bold text-on-surface">{batch.quantity}</span>
                              <span className="text-on-surface-variant">Min: {batch.minLevel}</span>
                            </div>
                            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  batch.status === 'Low Stock'
                                    ? 'bg-amber-500'
                                    : batch.status === 'Near Expiry'
                                    ? 'bg-error'
                                    : 'bg-secondary'
                                }`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md font-code-sm text-code-sm tabular-nums">
                          <div className="flex flex-col">
                            <span className="text-on-surface font-semibold">
                              ${Number(batch.unitPrice).toFixed(2)}
                            </span>
                            <span className="text-on-surface-variant">Exp: {batch.expiryDate}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md text-center">
                          <span
                            className={`status-pill inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              batch.status === 'Optimal'
                                ? 'bg-emerald-50 text-emerald-800'
                                : batch.status === 'Low Stock'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                batch.status === 'Optimal'
                                  ? 'bg-emerald-600'
                                  : batch.status === 'Low Stock'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-600'
                              }`}
                            ></span>
                            {batch.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-space-md text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(batch, 50)}
                              title="Restock +50 units"
                              className="px-2 py-1 rounded bg-surface-container-low hover:bg-primary hover:text-on-primary font-code-sm text-[11px] transition-colors"
                            >
                              +50
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(batch, -10)}
                              title="Audit -10 units"
                              className="px-2 py-1 rounded bg-surface-container-low hover:bg-error hover:text-on-primary font-code-sm text-[11px] transition-colors"
                            >
                              -10
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pharmacy Dispensing Audit Ledger */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="font-title-md text-title-md text-on-surface">
                Narcotics &amp; Formulary Chain-of-Custody Ledger
              </span>
              <span className="font-code-sm text-code-sm text-secondary"> DEA 222 / MongoDB</span>
            </div>
            <div className="flex flex-col gap-2 font-code-sm text-code-sm">
              {auditLogs
                .filter((l) => l.actionType === 'DISPENSED' || l.actionType === 'INTAKE')
                .slice(0, 5)
                .map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between bg-emerald-50/80 text-emerald-950 px-3 py-2 rounded-lg border border-emerald-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-secondary font-bold">
                        [{log.timeStr}] {log.actionType}
                      </span>
                      <span className="text-on-surface">{log.summary}</span>
                    </div>
                    <span className="text-outline shrink-0 ml-2">{log.actor}</span>
                  </div>
                ))}
              {auditLogs.filter((l) => l.actionType === 'DISPENSED' || l.actionType === 'INTAKE').length === 0 && (
                <div className="p-4 rounded-lg bg-surface-container-low text-center text-on-surface-variant text-[12px]">
                  No pharmaceutical chain-of-custody transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Live Outpatient & Inpatient Dispensing Queue */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  CPOE Live Feed
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Prescription Dispensing Queue ({pendingPrescriptions.length})
                </h3>
              </div>
              <span className="status-pill px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-code-sm text-code-sm font-bold">
                {pendingPrescriptions.length} Pending
              </span>
            </div>

            {/* Dispensing Execution Workspace */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  Dispense Workspace {selectedRx ? `(${selectedRx.prescriptionNumber || selectedRx.rxId})` : ''}
                </span>
                {isDispensedSuccess && (
                  <span
                    data-testid="dispensed-status-badge"
                    className="status-pill px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[11px] font-semibold"
                  >
                    ✓ Dispensed &amp; Deducted
                  </span>
                )}
              </div>

              {stockError && (
                <div
                  data-testid="stock-error-alert"
                  className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-label-sm text-[12px] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-600">error</span>
                  <span>{stockError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div>
                  <label className="font-label-sm text-[11px] block text-on-surface-variant mb-1">
                    Select Target Pharmaceutical Batch
                  </label>
                  <select
                    data-testid="dispense-batch-select"
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-[12px] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    {inventory.map((b) => (
                      <option key={b._id} value={b.batchId} label={b.batchId}>
                        {b.batchId} — {b.medicineName} (Stock: {b.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-[11px] block text-on-surface-variant mb-1">
                    Dispense Quantity (Units)
                  </label>
                  <input
                    type="number"
                    name="dispenseQuantity"
                    value={dispenseQty}
                    onChange={(e) => setDispenseQty(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-[12px] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>

                <button
                  type="button"
                  data-testid="execute-dispense-btn"
                  onClick={handleExecuteDispense}
                  className="w-full py-2 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-opacity flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Execute Dispense &amp; Deduct Batch</span>
                </button>
              </div>
            </div>

            {pendingPrescriptions.length === 0 ? (
              <div className="p-space-lg rounded-xl bg-surface-container-low text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] text-secondary mb-2">
                  task_alt
                </span>
                <p className="font-title-md text-title-md text-on-surface">Queue Cleared</p>
                <p className="font-body-sm text-body-sm">
                  All outpatient and urgent department prescriptions fulfilled.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingPrescriptions.map((rx) => {
                  const med = rx.medications?.[0] || {};
                  return (
                    <div
                      key={rx._id}
                      data-testid="prescription-queue-row"
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-title-md text-[15px] text-on-surface">
                            {rx.patientName}
                          </span>
                          <span className="font-code-sm text-code-sm text-primary font-bold">
                            #{rx.prescriptionNumber || rx.rxId}
                          </span>
                        </div>
                        <span
                          className={`status-pill px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rx.priority === 'STAT'
                              ? 'bg-[#e11d48] text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rx.priority}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-highest flex flex-col gap-1">
                        <span className="font-title-md text-[13px] text-primary">{med.name}</span>
                        <span className="font-body-sm text-[12px] text-on-surface-variant">
                          {med.dosage} · {med.frequency} · {med.duration}
                        </span>
                        <div className="flex items-center justify-between font-code-sm text-[11px] text-secondary mt-1">
                          <span>Lot: {med.batchId || 'BAT-77312'}</span>
                          <span className="font-bold">Qty: {med.quantity || 30} units</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>Prescribed by {rx.doctorName}</span>
                        <span className="font-code-sm">ICD-10: {rx.icd10}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRx(rx);
                          if (med.batchId) setSelectedBatchId(med.batchId);
                          setDispenseQty(med.quantity || 30);
                        }}
                        className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary hover:opacity-95 font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Select for Dispensing ({rx.prescriptionNumber || rx.rxId})</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Batch Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="modal-content bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-outline-variant animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Ingest New Pharmaceutical Batch
              </h3>
              <button
                type="button"
                aria-label="Close add batch modal"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddBatchSubmit} className="flex flex-col gap-3 mt-4">
              <div>
                <label className="font-label-sm text-label-sm block mb-1">
                  Medication Name &amp; Strength
                </label>
                <input
                  required
                  value={newBatch.medicineName}
                  onChange={(e) => setNewBatch({ ...newBatch, medicineName: e.target.value })}
                  placeholder="e.g. Metoprolol Succinate 50mg"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Batch ID</label>
                  <input
                    required
                    value={newBatch.batchId}
                    onChange={(e) => setNewBatch({ ...newBatch, batchId: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">NDC Code</label>
                  <input
                    required
                    value={newBatch.ndc}
                    onChange={(e) => setNewBatch({ ...newBatch, ndc: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Manufacturer</label>
                  <input
                    required
                    value={newBatch.manufacturer}
                    onChange={(e) => setNewBatch({ ...newBatch, manufacturer: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Category</label>
                  <select
                    value={newBatch.category}
                    onChange={(e) => setNewBatch({ ...newBatch, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    <option value="CARDIO">Cardiovascular</option>
                    <option value="ANTI">Antibiotics</option>
                    <option value="ANALG">Analgesics</option>
                    <option value="RESP">Respiratory</option>
                    <option value="NEURO">Neurology</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    required
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newBatch.unitPrice}
                    onChange={(e) => setNewBatch({ ...newBatch, unitPrice: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-sm text-label-sm block mb-1">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={newBatch.expiryDate}
                  onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm transition-opacity"
                >
                  Ingest Batch to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
