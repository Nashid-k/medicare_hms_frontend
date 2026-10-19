import React, { useState } from 'react';
import { apiUrl } from '../services/api.js';

const DEPARTMENTS = [
  { id: 'Cardiology Wing', name: 'Cardiology Wing', icon: 'cardiology', beds: '47/50', wait: '8m' },
  { id: 'Neurology Dept', name: 'Neurology Dept', icon: 'neurology', beds: '31/36', wait: '12m' },
  { id: 'Orthopedics & Trauma', name: 'Orthopedics & Trauma', icon: 'orthopedics', beds: '28/32', wait: '10m' },
  { id: 'Pulmonology & ICU', name: 'Pulmonology & ICU', icon: 'pulmonology', beds: '19/20', wait: '5m' },
  { id: 'Maternal-Fetal & NICU', name: 'Maternal-Fetal & NICU', icon: 'pregnant_woman', beds: '22/25', wait: '7m' },
  { id: 'Oncology & Infusion', name: 'Oncology & Infusion', icon: 'radiology', beds: '18/22', wait: '9m' }
];

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:15 AM',
  '11:45 AM',
  '01:30 PM',
  '02:00 PM',
  '03:15 PM',
  '04:00 PM'
];

export default function AppointmentsView({ data, onRefresh, showToast }) {
  const { appointments = [], doctors = [], patients = [] } = data || {};
  const [subView, setSubView] = useState('both'); // 'booking' | 'queue' | 'both'
  const [selectedDept, setSelectedDept] = useState('Cardiology Wing');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah Jenkins');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [patientName, setPatientName] = useState('Marcus Vance');
  const [mrn, setMrn] = useState('MC-8821');
  const [visitType, setVisitType] = useState('New Consultation');
  const [priority, setPriority] = useState('Routine');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [conflictError, setConflictError] = useState('');
  const [lastBookedRef, setLastBookedRef] = useState(null);

  const deptDoctors = doctors.filter((d) => d.department === selectedDept);
  const activeDoctors = deptDoctors.length > 0 ? deptDoctors : doctors;

  const handlePatientSelect = (e) => {
    const val = e.target.value;
    if (val === 'NEW') {
      setPatientName('');
      setMrn(`MC-${Math.floor(8850 + Math.random() * 900)}`);
      return;
    }
    const found = patients.find((p) => p.mrn === val);
    if (found) {
      setPatientName(found.name);
      setMrn(found.mrn);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    setSubmitting(true);
    setConflictError('');
    try {
      const res = await fetch(apiUrl('/api/appointments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          mrn: mrn || 'MC-8901',
          doctorName: selectedDoctor,
          department: selectedDept,
          date: selectedDate,
          timeSlot: selectedSlot,
          visitType,
          priority,
          status: 'Checked-In',
          reason: reason || `${visitType} in ${selectedDept}`
        })
      });
      if (res.status === 409) {
        const errJson = await res.json().catch(() => ({}));
        setConflictError(errJson.error || 'Conflict: This slot is already booked for this doctor.');
        showToast('Slot Conflict: Doctor already booked for this slot!');
        return;
      }
      if (res.ok) {
        const created = await res.json();
        setLastBookedRef(created.tokenNumber || created.bookingReference || `APT-${Date.now().toString().slice(-4)}`);
        showToast(`Token ${created.tokenNumber} booked for ${created.patientName}!`);
        setReason('');
        onRefresh();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setConflictError(errJson.error || 'Failed to book appointment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (aptId, newStatus) => {
    await fetch(apiUrl(`/api/appointments/${aptId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        waitMinutes: newStatus === 'Completed' || newStatus === 'In-Consultation' ? 0 : 8
      })
    });
    showToast(`Appointment status updated to ${newStatus}`);
    onRefresh();
  };

  const handleDeleteAppointment = async (aptId) => {
    await fetch(apiUrl(`/api/appointments/${aptId}`), { method: 'DELETE' });
    showToast('Appointment slot released');
    onRefresh();
  };

  const filteredAppointments = appointments.filter(
    (a) => statusFilter === 'ALL' || a.status === statusFilter
  );

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Top Operational Banner & Concurrency Health */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
              Central Triage &amp; Rostering
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-code-sm text-code-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> Atomic Slot Mutex Active
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight mt-1">
            Appointment Operations &amp; Queue Engine
          </h1>
        </div>

        {/* Dual View Switcher */}
        <div className="appointment-view-switcher flex flex-nowrap items-center p-1 bg-surface-container-high rounded-xl shadow-sm gap-1 w-full md:w-auto">
          <button
            onClick={() => setSubView('both')}
            className={`min-w-0 flex-1 flex-nowrap whitespace-nowrap flex items-center justify-center gap-1 px-1.5 sm:px-space-md py-1.5 sm:py-2 rounded-xl font-label-md text-[12px] sm:text-label-md transition-all ${
              subView === 'both'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">splitscreen</span>
            <span className="hidden sm:inline">Split Command View</span>
            <span className="sm:hidden">Split</span>
          </button>
          <button
            onClick={() => setSubView('booking')}
            className={`min-w-0 flex-1 flex-nowrap whitespace-nowrap flex items-center justify-center gap-1 px-1.5 sm:px-space-md py-1.5 sm:py-2 rounded-xl font-label-md text-[12px] sm:text-label-md transition-all ${
              subView === 'booking'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">calendar_month</span>
            <span className="hidden sm:inline">Booking Engine</span>
            <span className="sm:hidden">Booking</span>
          </button>
          <button
            onClick={() => setSubView('queue')}
            className={`min-w-0 flex-1 flex-nowrap whitespace-nowrap flex items-center justify-center gap-1 px-1.5 sm:px-space-md py-1.5 sm:py-2 rounded-xl font-label-md text-[12px] sm:text-label-md transition-all ${
              subView === 'queue'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">table_rows</span>
            <span className="hidden sm:inline">Live Queue Board</span>
            <span className="sm:hidden">Queue</span>
            <span className="count-pill ml-0.5 px-1.5 py-0.5 bg-error text-on-error rounded-full font-code-sm text-[10px] sm:text-code-sm">
              {appointments.length}
            </span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-1.5">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Total Scheduled Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm mt-3">
            <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight tabular-nums">
              {appointments.length}
            </span>
            <span className="font-body-sm text-body-sm text-secondary font-medium">
              ↑ Live MongoDB Sync
            </span>
          </div>
          <div className="w-full bg-surface-container mt-3 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '76%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Doctor Capacity
            </span>
            <div className="w-8 h-8 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined text-[18px]">vital_signs</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm mt-3">
            <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight tabular-nums">
              88%
            </span>
            <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">
              {doctors.length} Attendings Active
            </span>
          </div>
          <div className="w-full bg-surface-container mt-3 h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Checked-In / Waiting
            </span>
            <div className="w-8 h-8 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm mt-3">
            <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight tabular-nums">
              {appointments.filter((a) => a.status === 'Checked-In' || a.status === 'Waiting').length}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Avg wait: <strong className="text-on-surface">9m</strong>
            </span>
          </div>
          <div className="w-full bg-surface-container mt-3 h-1.5 rounded-full overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full" style={{ width: '52%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Completed Consults
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm mt-3">
            <span className="font-headline-xl text-headline-xl text-secondary tracking-tight tabular-nums">
              {appointments.filter((a) => a.status === 'Completed').length}
            </span>
            <span className="font-code-sm text-code-sm text-secondary font-medium">
              Zero Collisions
            </span>
          </div>
          <div className="w-full bg-surface-container mt-3 h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '64%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left: 4-Step Interactive Booking Engine */}
        {(subView === 'both' || subView === 'booking') && (
          <form
            onSubmit={handleBookAppointment}
            className={`${
              subView === 'booking' ? 'xl:col-span-12' : 'xl:col-span-6'
            } flex flex-col gap-space-md`}
          >
            {/* Concurrency Mutex Banner */}
            <div className="bg-primary-fixed p-space-md rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px] text-on-primary-fixed-variant">
                  lock_clock
                </span>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-primary-fixed font-semibold">
                    Zero-Collision Scheduling Engine
                  </span>
                  <span className="font-body-sm text-body-sm text-on-primary-fixed-variant">
                    Slots locked atomically via MongoDB reservation leases.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 font-code-sm text-code-sm text-primary px-space-sm py-1 rounded bg-surface-container-lowest font-medium">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span>02:59</span>
              </div>
            </div>

            {/* Step 1: Department Selector */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest">
              <div className="flex items-center gap-space-xs mb-space-md">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                  1
                </span>
                <span className="font-title-md text-title-md text-on-surface">
                  Select Department &amp; Specialization
                </span>
              </div>
              <div className="mb-3">
                <select
                  data-testid="department-select"
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    const matchDoc = doctors.find((d) => d.department === e.target.value);
                    if (matchDoc) setSelectedDoctor(matchDoc.name);
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DEPARTMENTS.map((dept) => {
                  const active = selectedDept === dept.id;
                  return (
                    <button
                      type="button"
                      key={dept.id}
                      onClick={() => {
                        setSelectedDept(dept.id);
                        const matchDoc = doctors.find((d) => d.department === dept.id);
                        if (matchDoc) setSelectedDoctor(matchDoc.name);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        active
                          ? 'bg-primary-fixed border-primary/50 text-primary shadow-sm'
                          : 'bg-surface-container-low border-transparent text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[20px]">
                          {dept.icon}
                        </span>
                        <span className="font-code-sm text-[11px] text-secondary">
                          Wait ~{dept.wait}
                        </span>
                      </div>
                      <span className="font-title-md text-[13px] mt-2">{dept.name}</span>
                      <span className="font-label-sm text-[10px] text-on-surface-variant">
                        Beds: {dept.beds}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 & 3: Attending Physician & Time Slot */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                  2
                </span>
                <span className="font-title-md text-title-md text-on-surface">
                  Select Attending Physician &amp; Time Slot
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    data-testid="doctor-card"
                    onClick={() => setSelectedDoctor(doc.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedDoctor === doc.name
                        ? 'bg-primary-fixed border-primary/50'
                        : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-title-md text-[14px] text-on-surface">{doc.name}</span>
                      <span className="font-body-sm text-[12px] text-on-surface-variant">
                        {doc.specialty}
                      </span>
                      <span className="font-code-sm text-[11px] text-secondary mt-0.5">
                        {doc.room} · ${doc.consultationFee}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="status-pill px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[10px]">
                        {doc.status}
                      </span>
                      <button
                        type="button"
                        data-testid="select-doctor-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoctor(doc.name);
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          selectedDoctor === doc.name
                            ? 'bg-primary text-white'
                            : 'bg-surface-container hover:bg-primary-fixed hover:text-primary text-on-surface'
                        }`}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block">
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    data-testid="booking-date-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-2">
                  Available Atomic Time Slots ({selectedDate})
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      data-testid="slot-pill"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-1.5 rounded-lg font-code-sm text-code-sm border transition-all ${
                        selectedSlot === slot
                          ? 'bg-primary text-on-primary border-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Patient Assignment & Confirm */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                  3
                </span>
                <span className="font-title-md text-title-md text-on-surface">
                  Patient EHR Binding &amp; Triage Priority
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                    Select Existing EHR Patient
                  </label>
                  <select
                    onChange={handlePatientSelect}
                    value={patients.some((p) => p.mrn === mrn) ? mrn : 'NEW'}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    {patients.map((p) => (
                      <option key={p._id} value={p.mrn}>
                        {p.name} (#{p.mrn})
                      </option>
                    ))}
                    <option value="NEW">+ Enter Walk-In Patient Name</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Patient full name..."
                    required
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                    Encounter Type
                  </label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    <option value="New Consultation">New Consultation</option>
                    <option value="Follow-up">Follow-up Review</option>
                    <option value="Emergency Triage">Emergency Triage</option>
                    <option value="Telehealth">Telehealth Video</option>
                    <option value="Pre-Op Check">Pre-Op Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                    Triage Acuity Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    <option value="Routine">Routine (Standard Queue)</option>
                    <option value="Urgent">Urgent (Fast-Track)</option>
                    <option value="STAT">STAT (Immediate Resuscitation)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                  Chief Complaint / Clinical Reason
                </label>
                <textarea
                  name="reason"
                  rows={2}
                  data-testid="booking-reason-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Sub-sternal chest discomfort, ECG interpretation..."
                  className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>

              {conflictError && (
                <div
                  data-testid="slot-conflict-alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-label-md text-label-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-rose-600">warning</span>
                  <span>{conflictError}</span>
                </div>
              )}

              {lastBookedRef && !conflictError && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-label-md text-label-md flex items-center justify-between">
                  <span>Appointment Confirmed!</span>
                  <span data-testid="booking-reference-badge" className="font-bold">
                    #{lastBookedRef}
                  </span>
                </div>
              )}

              <button
                type="submit"
                data-testid="confirm-booking-btn"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary text-on-primary hover:opacity-90 font-title-md text-title-md shadow-sm transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span>
                  {submitting
                    ? 'Locking Slot in MongoDB...'
                    : `Confirm & Issue Token (${selectedSlot} · ${selectedDoctor})`}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Right: Live Reception & Token Queue Board */}
        {(subView === 'both' || subView === 'queue') && (
          <div
            className={`${
              subView === 'queue' ? 'xl:col-span-12' : 'xl:col-span-6'
            } bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest flex flex-col gap-space-md`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  Real-Time Token Board
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Live Reception &amp; Outpatient Queue ({filteredAppointments.length})
                </h2>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {['ALL', 'Checked-In', 'In-Consultation', 'Waiting', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-label-sm text-[11px] transition-colors ${
                      statusFilter === st
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {filteredAppointments.length === 0 && (
                <div className="p-8 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[36px] text-outline">event_available</span>
                  <p className="font-title-md text-title-md text-on-surface">Queue Clear</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No appointments match the current filter.</p>
                </div>
              )}
              {filteredAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    apt.status === 'In-Consultation'
                      ? 'bg-primary-fixed/70 border-primary/40'
                      : 'bg-surface-container-low/60 border-surface-container-highest'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      data-testid="booking-reference-badge"
                      className="px-3 py-2 rounded-xl bg-primary text-on-primary font-code-sm text-code-sm font-bold text-center min-w-[74px]"
                    >
                      <div>{apt.tokenNumber || apt.bookingReference}</div>
                      <div className="text-[10px] opacity-80 font-normal">{apt.timeSlot}</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-title-md text-[15px] text-on-surface">
                          {apt.patientName}
                        </span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">
                          #{apt.mrn}
                        </span>
                        <span
                          className={`status-pill px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            apt.priority === 'STAT'
                              ? 'bg-[#e11d48] text-white'
                              : apt.priority === 'Urgent'
                              ? 'bg-[#d97706] text-white'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {apt.priority}
                        </span>
                      </div>
                      <span className="font-body-sm text-[13px] text-primary font-medium mt-0.5">
                        {apt.doctorName} · {apt.department} ({apt.visitType})
                      </span>
                      <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                        {apt.reason}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-label-sm text-[12px] text-on-surface cursor-pointer"
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="Checked-In">Checked-In</option>
                      <option value="In-Consultation">In-Consultation</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => handleDeleteAppointment(apt._id)}
                      title="Cancel & Release Slot"
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
