import React, { useState } from 'react';

export default function WardAndLabView({ data, onRefresh, showToast }) {
  const { beds = [], labs = [], patients = [] } = data || {};
  const [selectedBed, setSelectedBed] = useState(null);
  const [assignPatientMrn, setAssignPatientMrn] = useState('');
  const [assignDiagnosis, setAssignDiagnosis] = useState('');

  const [editingLab, setEditingLab] = useState(null);
  const [labResultVal, setLabResultVal] = useState('');
  const [labFlagVal, setLabFlagVal] = useState('Normal');

  const handleAssignBed = async (e) => {
    e.preventDefault();
    if (!selectedBed) return;
    const pt = patients.find((p) => p.mrn === assignPatientMrn) || patients[0];
    if (!pt) return;

    const res = await fetch(`/api/beds/${selectedBed._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Occupied',
        patientName: pt.name,
        mrn: pt.mrn,
        attendingDoctor: pt.attendingDoctor || 'Dr. Sarah Jenkins',
        acuity: pt.acuity || 'Amber',
        admittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        diagnosis: assignDiagnosis || pt.chronicConditions?.[0] || 'Inpatient Telemetry'
      })
    });
    if (res.ok) {
      showToast(`Assigned Bed ${selectedBed.bedNumber} to ${pt.name}`);
      setSelectedBed(null);
      setAssignDiagnosis('');
      onRefresh();
    }
  };

  const handleReleaseBed = async (bed, nextStatus) => {
    await fetch(`/api/beds/${bed._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        patientName: '',
        mrn: '',
        attendingDoctor: '',
        acuity: 'None',
        admittedAt: '',
        diagnosis: '',
        ventilatorActive: false
      })
    });
    showToast(`Bed ${bed.bedNumber} marked as ${nextStatus}`);
    onRefresh();
  };

  const handleUpdateLabResult = async (e) => {
    e.preventDefault();
    if (!editingLab) return;
    const res = await fetch(`/api/labs/${editingLab._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultValue: labResultVal,
        flag: labFlagVal,
        status: labFlagVal === 'Critical' ? 'Critical Alert' : 'Completed'
      })
    });
    if (res.ok) {
      showToast(`Verified lab result for ${editingLab.orderId}`);
      setEditingLab(null);
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Header */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
            Inpatient Ward Operations &amp; Diagnostic Pathology
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface mt-1">
            Bed Telemetry Matrix &amp; Laboratory Diagnostics Vault
          </h1>
        </div>
        <div className="flex items-center gap-2 font-code-sm text-code-sm">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            {beds.filter((b) => b.status === 'Available').length} Beds Available
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-primary-fixed text-primary">
            {beds.filter((b) => b.status === 'Occupied').length} Occupied
          </span>
        </div>
      </div>

      {/* Ward Bed Telemetry Grid */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Real-Time Inpatient Ward &amp; ICU Bed Telemetry
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Click any Available bed to admit a patient, or discharge/clean occupied beds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {beds.map((bed) => {
            const isOccupied = bed.status === 'Occupied';
            const isAvailable = bed.status === 'Available';
            const borderLeft =
              bed.acuity === 'Rose'
                ? 'border-l-4 border-l-[#e11d48]'
                : bed.acuity === 'Amber'
                ? 'border-l-4 border-l-[#d97706]'
                : isAvailable
                ? 'border-l-4 border-l-[#059669]'
                : 'border-l-4 border-l-[#94a3b8]';

            return (
              <div
                key={bed._id}
                className={`p-4 rounded-xl bg-surface-container-low border border-surface-container-highest ${borderLeft} flex flex-col justify-between gap-3 hover:shadow-md transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-code-sm text-[14px] font-bold text-primary">
                      {bed.bedNumber}
                    </span>
                    <span
                      className={`status-pill px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isOccupied
                          ? 'bg-primary-fixed text-primary'
                          : isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>
                  <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
                    {bed.wardName} · {bed.bedType}
                  </div>

                  {isOccupied ? (
                    <div className="mt-3 p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-highest flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-title-md text-[14px] text-on-surface">
                          {bed.patientName}
                        </span>
                        <span className="font-code-sm text-[11px] text-on-surface-variant">
                          #{bed.mrn}
                        </span>
                      </div>
                      <span className="font-body-sm text-[12px] text-on-surface-variant line-clamp-1">
                        {bed.diagnosis}
                      </span>
                      <span className="font-code-sm text-[11px] text-secondary mt-0.5">
                        {bed.attendingDoctor}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 p-4 rounded-lg bg-surface-container-lowest/60 border border-dashed border-outline-variant text-center text-on-surface-variant font-body-sm text-[12px]">
                      {isAvailable
                        ? 'Sterile & Ready for Admission'
                        : 'Environmental UV-C Sanitization'}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-surface-container-highest">
                  {isOccupied ? (
                    <>
                      <button
                        onClick={() => handleReleaseBed(bed, 'Cleaning')}
                        className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-amber-100 text-on-surface font-label-sm text-[11px]"
                      >
                        Discharge → Clean
                      </button>
                      <button
                        onClick={() => handleReleaseBed(bed, 'Available')}
                        className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-label-sm text-[11px] transition-colors"
                      >
                        Free
                      </button>
                    </>
                  ) : isAvailable ? (
                    <button
                      onClick={() => {
                        setSelectedBed(bed);
                        setAssignPatientMrn(patients[0]?.mrn || '');
                      }}
                      className="w-full py-1.5 rounded-lg bg-primary text-on-primary hover:opacity-90 font-label-sm text-[11px] transition-opacity"
                    >
                      + Assign Inpatient to Bed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReleaseBed(bed, 'Available')}
                      className="w-full py-1.5 rounded-lg bg-secondary text-on-secondary hover:opacity-90 font-label-sm text-[11px] transition-opacity"
                    >
                      Mark Sanitized &amp; Available
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Laboratory Diagnostics & Pathology Vault */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
              Pathology &amp; PACS Analyzer Queue
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Laboratory Diagnostics &amp; Biomarker Verification Vault
            </h2>
          </div>
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            {labs.length} Total Orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Patient / MRN</th>
                <th className="py-3 px-3">Diagnostic Assay / Study</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Result &amp; Reference</th>
                <th className="py-3 px-3">Flag</th>
                <th className="py-3 px-3 text-right">Verify Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
              {labs.map((lab) => (
                <tr key={lab._id} className="hover:bg-surface-container-low/50">
                  <td className="py-3 px-3 font-code-sm text-primary font-semibold">
                    {lab.orderId}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-title-md text-[13px] text-on-surface">
                        {lab.patientName}
                      </span>
                      <span className="font-code-sm text-[11px] text-on-surface-variant">
                        #{lab.mrn} · {lab.orderedBy}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">{lab.testName}</span>
                      <span className="text-[11px] text-on-surface-variant">{lab.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        lab.priority === 'STAT'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {lab.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-code-sm text-code-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">{lab.resultValue}</span>
                      <span className="text-[11px] text-on-surface-variant">
                        Ref: {lab.referenceRange}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`status-pill px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        lab.flag === 'Critical'
                          ? 'bg-[#e11d48] text-white'
                          : lab.flag === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {lab.flag}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setEditingLab(lab);
                        setLabResultVal(lab.resultValue);
                        setLabFlagVal(lab.flag === 'Pending' ? 'Normal' : lab.flag);
                      }}
                      className="px-3 py-1 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary font-label-sm text-[11px] transition-colors"
                    >
                      Enter Result
                    </button>
                  </td>
                </tr>
              ))}
              {labs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-outline">biotech</span>
                      <p className="font-title-md text-title-md text-on-surface">No Diagnostic Orders</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">All laboratory and imaging diagnostic orders completed.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Patient to Bed Modal */}
      {selectedBed && (
        <div
          className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBed(null); }}
        >
          <div className="modal-content bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl border border-outline-variant animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Admit Patient to Bed {selectedBed.bedNumber}
                </h3>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  {selectedBed.wardName} ({selectedBed.bedType})
                </p>
              </div>
              <button
                type="button"
                aria-label="Close bed assignment modal"
                onClick={() => setSelectedBed(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAssignBed} className="flex flex-col gap-3 mt-4">
              <div>
                <label className="font-label-sm text-label-sm block mb-1">Select Patient</label>
                <select
                  value={assignPatientMrn}
                  onChange={(e) => setAssignPatientMrn(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p.mrn}>
                      {p.name} (#{p.mrn})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-sm text-label-sm block mb-1">
                  Admission Diagnosis
                </label>
                <input
                  value={assignDiagnosis}
                  onChange={(e) => setAssignDiagnosis(e.target.value)}
                  placeholder="e.g., Post-PCI Telemetry & Hemodynamic Observation"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedBed(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm transition-opacity"
                >
                  Confirm Bed Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Result Verification Modal */}
      {editingLab && (
        <div
          className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingLab(null); }}
        >
          <div className="modal-content bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl border border-outline-variant animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Verify Diagnostic Result · {editingLab.orderId}
                </h3>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  {editingLab.testName} for {editingLab.patientName}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close verification modal"
                onClick={() => setEditingLab(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateLabResult} className="flex flex-col gap-3 mt-4">
              <div>
                <label className="font-label-sm text-label-sm block mb-1">
                  Quantitative / Narrative Result Value
                </label>
                <input
                  required
                  value={labResultVal}
                  onChange={(e) => setLabResultVal(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm block mb-1">Abnormality Flag</label>
                <select
                  value={labFlagVal}
                  onChange={(e) => setLabFlagVal(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                >
                  <option value="Normal">Normal (Within Reference)</option>
                  <option value="High">High / Abnormal</option>
                  <option value="Critical">Critical Panic Value</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setEditingLab(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm transition-opacity"
                >
                  Sign &amp; Release Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
