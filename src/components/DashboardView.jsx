import React from 'react';

export default function DashboardView({
  data,
  currentUser,
  activeRole,
  onNavigate,
  onSelectPatient,
  onRefresh
}) {
  const isPatient =
    activeRole === 'Patient' ||
    data?.role === 'patient' ||
    currentUser?.role === 'patient' ||
    String(currentUser?.role || '').toLowerCase() === 'patient';

  const {
    stats = {},
    patientProfile = null,
    patients = [],
    appointments = [],
    labs = [],
    beds = [],
    auditLogs = [],
    prescriptions = [],
    invoices = [],
    inventory = []
  } = data || {};

  // ==========================================
  // 1. PATIENT PORTAL VIEW (For Patient Role)
  // ==========================================
  if (isPatient) {
    const profile = patientProfile || (patients.length > 0 ? patients[0] : null) || {
      name: currentUser?.name || 'Patient',
      mrn: 'MC-8821',
      bloodGroup: 'O+ Positive',
      department: 'General Medicine',
      attendingDoctor: 'Dr. Sarah Jenkins',
      status: 'Active',
      acuity: 'Emerald',
      vitals: { bp: '120/80', hr: 72, spo2: 99, temp: '36.8°C', respRate: 16, weight: '70 kg' },
      allergies: [],
      chronicConditions: []
    };

    const myAppointments = appointments || [];
    const myPrescriptions = prescriptions || [];
    const myInvoices = invoices || [];

    return (
      <div className="flex flex-col w-full gap-space-lg pb-12">
        {/* Top Personal Patient Welcome Banner */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                My Health Portal
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-code-sm text-[11px] border border-outline-variant">
                MRN #{profile.mrn}
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface mt-1.5 tracking-tight">
              Welcome, {profile.name}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Access your personal care plan, upcoming doctor consultations, active prescriptions, and billing receipts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              data-testid="patient-book-appointment-btn"
              onClick={() => onNavigate('appointments')}
              className="flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

        {/* 4 Patient-Centric KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Upcoming Appointments */}
          <div
            onClick={() => onNavigate('appointments')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                My Appointments
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {stats.upcomingAppointments !== undefined ? stats.upcomingAppointments : myAppointments.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-primary font-label-sm text-label-sm font-medium">
                <span>{myAppointments.length > 0 ? 'Upcoming consultations' : 'No upcoming visits'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Prescriptions */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                My Prescriptions
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">medication</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {stats.activePrescriptions !== undefined ? stats.activePrescriptions : myPrescriptions.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>Active prescribed medications</span>
              </div>
            </div>
          </div>

          {/* Card 3: Latest Recorded Vitals */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Latest Vitals
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-rose-600">
                <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {profile.vitals?.bp || '120/80'}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>HR {profile.vitals?.hr || 72} bpm · SpO2 {profile.vitals?.spo2 || 99}%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Invoices & Copay */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Billing &amp; Copay
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-amber-700">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                ${stats.pendingBalance !== undefined ? stats.pendingBalance : 0}
              </div>
              <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm">
                {(stats.pendingInvoices || 0) > 0 ? (
                  <span className="text-amber-800 font-medium">{stats.pendingInvoices} Pending Invoice(s)</span>
                ) : (
                  <span className="text-emerald-700 font-medium">All bills up to date</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main 12-Column Patient Portal Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left 8 Columns: My Appointments & Prescriptions & Health Baseline */}
          <div className="xl:col-span-8 flex flex-col gap-space-lg">
            {/* My Scheduled Consultations */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Care Schedule
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    My Appointments &amp; Consultations
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('appointments')}
                  className="px-3 py-1.5 rounded-xl bg-primary-fixed text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors self-start sm:self-auto flex items-center gap-1"
                >
                  <span>Book / View Schedule</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              {myAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container border-b border-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                        <th className="py-2.5 px-3">Token #</th>
                        <th className="py-2.5 px-3">Doctor &amp; Department</th>
                        <th className="py-2.5 px-3">Date &amp; Time Slot</th>
                        <th className="py-2.5 px-3">Encounter Type</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                      {myAppointments.map((apt) => {
                        const statusPill =
                          apt.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : apt.status === 'In-Consultation'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : apt.status === 'Cancelled' || apt.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200';
                        return (
                          <tr key={apt._id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-3 px-3">
                              <span className="px-2 py-1 rounded-lg bg-primary-fixed text-primary font-code-sm text-code-sm font-bold">
                                {apt.tokenNumber || 'TKN'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-on-surface">{apt.doctorName || 'Attending Doctor'}</span>
                                <span className="font-code-sm text-code-sm text-on-surface-variant">{apt.department}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-code-sm text-code-sm">
                              <div className="flex flex-col">
                                <span className="text-on-surface font-medium">{apt.date}</span>
                                <span className="text-on-surface-variant">{apt.timeSlot}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-on-surface-variant">
                              {apt.visitType || 'General Consultation'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusPill}`}>
                                {apt.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[36px] text-outline">event_available</span>
                  <p className="font-title-md text-title-md text-on-surface">No Appointments Scheduled</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                    Book an appointment with a specialist or consultation doctor at your convenience.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('appointments')}
                    className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-opacity"
                  >
                    Schedule an Appointment
                  </button>
                </div>
              )}
            </div>

            {/* My Active Prescriptions */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Medication Management
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    My Prescriptions &amp; Medications
                  </h2>
                </div>
                <span className="font-code-sm text-code-sm text-secondary font-medium">
                  {myPrescriptions.length} Records
                </span>
              </div>

              {myPrescriptions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {myPrescriptions.map((rx) => (
                    <div
                      key={rx._id}
                      className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col gap-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container pb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">prescriptions</span>
                          <span className="font-title-md text-[14px] text-on-surface font-semibold">
                            Rx #{rx.rxId}
                          </span>
                          <span className="text-[12px] text-on-surface-variant">
                            · Prescribed by {rx.doctorName} ({rx.department})
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            rx.status === 'Dispensed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {rx.status === 'Dispensed' ? 'Dispensed / Ready' : 'Pending Pharmacy'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                        {(rx.medications || []).map((med, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-highest flex flex-col">
                            <span className="font-medium text-on-surface text-[13px]">{med.name}</span>
                            <span className="font-code-sm text-[11px] text-primary mt-0.5">{med.dosage}</span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                              {med.frequency} · {med.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[36px] text-outline">medication</span>
                  <p className="font-title-md text-title-md text-on-surface">No Active Prescriptions</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Your doctor will upload medications and dosage instructions after your clinical evaluation.
                  </p>
                </div>
              )}
            </div>

            {/* My Clinical Summary & Vitals Profile */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Health Baseline
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    My Clinical Summary &amp; Vitals
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-sm text-label-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Baseline Stable
                </span>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-space-md">
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col items-center text-center">
                  <span className="text-[11px] text-on-surface-variant uppercase font-medium">Blood Pressure</span>
                  <span className="font-headline-sm text-[16px] text-on-surface font-bold mt-1">
                    {profile.vitals?.bp || '120/80'}
                  </span>
                  <span className="text-[10px] text-emerald-700">mmHg</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col items-center text-center">
                  <span className="text-[11px] text-on-surface-variant uppercase font-medium">Heart Rate</span>
                  <span className="font-headline-sm text-[16px] text-primary font-bold mt-1">
                    {profile.vitals?.hr || 72}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">bpm</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col items-center text-center">
                  <span className="text-[11px] text-on-surface-variant uppercase font-medium">Oxygen (SpO2)</span>
                  <span className="font-headline-sm text-[16px] text-secondary font-bold mt-1">
                    {profile.vitals?.spo2 || 99}%
                  </span>
                  <span className="text-[10px] text-emerald-700">Normal</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col items-center text-center">
                  <span className="text-[11px] text-on-surface-variant uppercase font-medium">Temperature</span>
                  <span className="font-headline-sm text-[16px] text-on-surface font-bold mt-1">
                    {profile.vitals?.temp || '36.8°C'}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Oral</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col items-center text-center">
                  <span className="text-[11px] text-on-surface-variant uppercase font-medium">Resp. Rate</span>
                  <span className="font-headline-sm text-[16px] text-on-surface font-bold mt-1">
                    {profile.vitals?.respRate || 16}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">/min</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col items-center text-center">
                  <span className="text-[11px] text-on-surface-variant uppercase font-medium">Weight</span>
                  <span className="font-headline-sm text-[16px] text-on-surface font-bold mt-1">
                    {profile.vitals?.weight || '70 kg'}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">kg</span>
                </div>
              </div>

              {/* Allergies & Chronic Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-surface-container">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold block mb-1.5">
                    Known Drug &amp; Environmental Allergies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.allergies && profile.allergies.length > 0 ? (
                      profile.allergies.map((allergy, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-label-sm text-[12px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-rose-600">warning</span>
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <span className="text-on-surface-variant text-[13px]">No known drug allergies reported.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold block mb-1.5">
                    Chronic Medical Conditions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.chronicConditions && profile.chronicConditions.length > 0 ? (
                      profile.chronicConditions.map((condition, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-label-sm text-[12px]">
                          {condition}
                        </span>
                      ))
                    ) : (
                      <span className="text-on-surface-variant text-[13px]">No chronic conditions documented.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Billing Receipts & Care Team Contact */}
          <div className="xl:col-span-4 flex flex-col gap-space-lg">
            {/* My Invoices & Copay Statement */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  My Invoices &amp; Billing
                </h2>
                <span className="font-code-sm text-code-sm text-secondary font-medium">
                  {myInvoices.length} Bills
                </span>
              </div>

              {myInvoices.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {myInvoices.map((inv) => (
                    <div
                      key={inv._id}
                      className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-code-sm text-code-sm font-bold text-on-surface">
                          {inv.invoiceId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-[12px] text-on-surface-variant">
                        {inv.department} · {inv.issuedDate || 'Recent'}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-surface-container font-code-sm text-[12px]">
                        <span className="text-on-surface-variant">Payable:</span>
                        <span className="font-bold text-on-surface text-[13px]">
                          ${inv.patientPayable != null ? inv.patientPayable : inv.subtotal}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-surface-container-low text-center">
                  <span className="material-symbols-outlined text-[32px] text-outline block mb-1">receipt</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No active billing records found.</p>
                </div>
              )}
            </div>

            {/* My Attending Physician & Care Team */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">stethoscope</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Attending Care Team
                </h2>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-title-lg text-title-lg font-bold">
                  {(profile.attendingDoctor || 'Dr. Jenkins').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <div className="font-title-md text-[14px] text-on-surface font-semibold truncate">
                    {profile.attendingDoctor || 'Dr. Sarah Jenkins'}
                  </div>
                  <div className="font-code-sm text-[11px] text-primary font-medium">
                    {profile.department || 'Primary Care Physician'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    Room: {profile.wardBed || 'Outpatient Clinic 304'}
                  </div>
                </div>
              </div>

              {/* 24/7 Helpline Card */}
              <div className="p-3.5 rounded-xl bg-primary text-on-primary flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  <span className="font-title-md text-title-md font-bold">MediCare Patient Help</span>
                </div>
                <p className="font-body-sm text-[12px] opacity-90 leading-snug">
                  Need urgent assistance or have questions about medications? Call the 24/7 Clinical Care Desk.
                </p>
                <div className="font-code-sm text-[13px] font-bold mt-1 bg-white/10 px-2.5 py-1 rounded-lg w-fit">
                  📞 +1 (800) 555-CARE (2273)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ROLE IDENTIFICATION
  // ==========================================
  const isDoctor =
    activeRole === 'Doctor' ||
    data?.role === 'doctor' ||
    String(currentUser?.role || '').toLowerCase() === 'doctor';

  const isReception =
    activeRole === 'Reception' ||
    data?.role === 'receptionist' ||
    String(currentUser?.role || '').toLowerCase() === 'receptionist' ||
    String(currentUser?.role || '').toLowerCase() === 'reception';

  const isPharmacy =
    activeRole === 'Pharmacy' ||
    data?.role === 'pharmacist' ||
    String(currentUser?.role || '').toLowerCase() === 'pharmacist' ||
    String(currentUser?.role || '').toLowerCase() === 'pharmacy';

  // ==========================================
  // 3. DOCTOR CLINICAL DASHBOARD
  // ==========================================
  if (isDoctor) {
    const docName = data?.doctorProfile?.name || currentUser?.name || 'Dr. Sarah Jenkins';
    const docDept = data?.doctorProfile?.department || 'Cardiology Wing';
    const docSpecialty = data?.doctorProfile?.specialty || 'Attending Physician';
    const criticalLabsList = labs.filter((l) => l.flag === 'Critical' || l.flag === 'High');

    return (
      <div className="flex flex-col w-full gap-space-lg pb-12">
        {/* Banner */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Clinical Care Desk
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-code-sm text-[11px] border border-outline-variant">
                {docDept}
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface mt-1.5 tracking-tight">
              Welcome, {docName}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {docSpecialty} · Review your assigned patient queue, admitted inpatients, and STAT diagnostic alerts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              data-testid="doctor-open-workspace"
              onClick={() => onNavigate('patient-workspace')}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">stethoscope</span>
              <span>Open EHR Workspace</span>
            </button>
            <button
              type="button"
              data-testid="doctor-my-schedule"
              onClick={() => onNavigate('appointments')}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>My Queue</span>
            </button>
          </div>
        </div>

        {/* 4 Clinical KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Consultations Today */}
          <div
            onClick={() => onNavigate('appointments')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Consultations Today
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {stats.consultationsToday ?? appointments.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-primary font-label-sm text-label-sm font-medium">
                <span>{stats.waitingPatients ?? 0} Waiting · {stats.completedConsultations ?? 0} Done</span>
              </div>
            </div>
          </div>

          {/* Card 2: Admitted Inpatients */}
          <div
            onClick={() => onNavigate('ward-labs')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Assigned Inpatients
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">bed</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-secondary tabular-nums">
                {stats.myInpatients ?? 0}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>Under your direct ward care</span>
              </div>
            </div>
          </div>

          {/* Card 3: STAT Lab Alerts */}
          <div
            onClick={() => onNavigate('ward-labs')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-error font-semibold uppercase tracking-wider">
                  STAT Lab Alerts
                </span>
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
              </div>
            </div>
            <div className="mt-3 pl-1">
              <div className="font-headline-lg text-headline-lg text-error tabular-nums">
                {stats.urgentLabAlerts ?? criticalLabsList.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-error font-label-sm text-label-sm">
                <span>Critical / High diagnostic alerts</span>
              </div>
            </div>
          </div>

          {/* Card 4: Active Prescriptions */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Prescriptions Issued
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-amber-700">
                <span className="material-symbols-outlined text-[20px]">medication</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {stats.activePrescriptionsCount ?? prescriptions.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>Active clinical prescriptions</span>
              </div>
            </div>
          </div>
        </section>

        {/* 12-Column Doctor Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left 8 Cols: Clinical Patient Census & Vitals */}
          <div className="xl:col-span-8 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Clinical Worklist
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Assigned Patients &amp; Triage Roster
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate('patient-workspace')}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity self-start sm:self-auto flex items-center gap-1"
                >
                  <span>Open Patient Workspace</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                      <th className="py-2.5 px-3">Patient / MRN</th>
                      <th className="py-2.5 px-3">Ward &amp; Bed</th>
                      <th className="py-2.5 px-3">Vitals (BP · HR · SpO2)</th>
                      <th className="py-2.5 px-3">Acuity / Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                    {patients.map((pt) => {
                      const badgeStyle =
                        pt.acuity === 'Rose'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : pt.acuity === 'Amber'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      const dotStyle =
                        pt.acuity === 'Rose'
                          ? 'bg-rose-500'
                          : pt.acuity === 'Amber'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600';
                      return (
                        <tr key={pt._id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-title-md text-[13px]">
                                {pt.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-title-md text-[14px] text-on-surface">{pt.name}</span>
                                <span className="font-code-sm text-code-sm text-on-surface-variant">
                                  #{pt.mrn} · {pt.age}y {pt.gender}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-on-surface">{pt.department}</span>
                              <span className="font-code-sm text-code-sm text-secondary">{pt.wardBed || 'Outpatient'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-code-sm text-code-sm tabular-nums">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface">BP {pt.vitals?.bp || '120/80'}</span>
                              <span className="px-2 py-0.5 rounded bg-surface-container-low text-primary">HR {pt.vitals?.hr || 75}</span>
                              <span className="px-2 py-0.5 rounded bg-surface-container-low text-secondary">{pt.vitals?.spo2 || 98}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>
                              {pt.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                onSelectPatient(pt);
                                onNavigate('patient-workspace');
                              }}
                              className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:opacity-90 font-label-sm text-label-sm transition-colors"
                            >
                              Consult EHR
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {patients.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                          No patients assigned currently.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Critical Labs + Today's Appointments */}
          <div className="xl:col-span-4 flex flex-col gap-space-lg">
            {/* STAT Diagnostic Alerts */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    STAT Lab Alerts
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate('ward-labs')}
                  className="font-label-sm text-label-sm text-primary hover:underline"
                >
                  Lab Vault →
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {criticalLabsList.map((lab) => (
                  <div
                    key={lab._id}
                    className={`p-3 rounded-xl border-l-4 ${
                      lab.flag === 'Critical' ? 'border-[#e11d48] bg-[#fff1f2]/70' : 'border-[#d97706] bg-[#fffbeb]/70'
                    } flex flex-col gap-1`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-1.5">
                      <span className="font-code-sm text-code-sm font-bold text-on-surface">
                        {lab.patientName} (#{lab.mrn})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${lab.flag === 'Critical' ? 'bg-[#e11d48] text-white' : 'bg-[#d97706] text-white'}`}>
                        {lab.flag} · {lab.priority}
                      </span>
                    </div>
                    <span className="font-title-md text-[13px] text-on-surface">{lab.testName}</span>
                    <div className="flex items-center justify-between font-code-sm text-code-sm mt-1">
                      <span className="text-error font-semibold">Result: {lab.resultValue}</span>
                      <span className="text-on-surface-variant">Ref: {lab.referenceRange}</span>
                    </div>
                  </div>
                ))}
                {criticalLabsList.length === 0 && (
                  <div className="p-6 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-1.5">
                    <span className="material-symbols-outlined text-[28px] text-emerald-600">check_circle</span>
                    <p className="font-title-md text-title-md text-on-surface">No Critical Alerts</p>
                    <p className="font-body-sm text-[12px] text-on-surface-variant">All patient biomarkers are within normal limits.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Appointments Queue */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Today&apos;s Appointments
                </h2>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="font-label-sm text-label-sm text-primary hover:underline"
                >
                  Full Schedule →
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {appointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt._id}
                    className="p-3 rounded-xl bg-surface-container-low flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="px-2 py-1 rounded-lg bg-primary text-on-primary font-code-sm text-code-sm font-bold">
                        {apt.tokenNumber || 'TKN'}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="font-title-md text-[13px] text-on-surface truncate">{apt.patientName}</span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">{apt.timeSlot} · {apt.visitType}</span>
                      </div>
                    </div>
                    <span className={`status-pill shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      apt.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'In-Consultation'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="py-6 text-center text-on-surface-variant font-body-sm">
                    No consultations scheduled for today.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. RECEPTION & ADMISSION DESK DASHBOARD
  // ==========================================
  if (isReception) {
    const availableBedsList = beds.filter((b) => b.status === 'Available');

    return (
      <div className="flex flex-col w-full gap-space-lg pb-12">
        {/* Banner */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></span>
                Front Desk &amp; Admissions
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface mt-1.5 tracking-tight">
              Reception Desk &amp; Token Board
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Outpatient intake, appointment token check-in, inpatient bed admissions, and visit billing receipts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              data-testid="reception-book-btn"
              onClick={() => onNavigate('appointments')}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              <span>Book / Check-In Token</span>
            </button>
            <button
              type="button"
              data-testid="reception-billing-btn"
              onClick={() => onNavigate('billing-and-invoices')}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Billing &amp; Cashier</span>
            </button>
          </div>
        </div>

        {/* 4 Front-Desk KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Today's Appointments */}
          <div
            onClick={() => onNavigate('appointments')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Today&apos;s Queue
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {stats.appointmentsToday ?? appointments.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-primary font-label-sm text-label-sm font-medium">
                <span>{stats.waitingAppointments ?? 0} Waiting in Lobby</span>
              </div>
            </div>
          </div>

          {/* Card 2: In-Consultation */}
          <div
            onClick={() => onNavigate('appointments')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                In Consultation
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">stethoscope</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-secondary tabular-nums">
                {stats.inConsultationAppointments ?? appointments.filter((a) => a.status === 'In-Consultation').length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>Active with physician</span>
              </div>
            </div>
          </div>

          {/* Card 3: Available Beds */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Available Beds
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-emerald-700">
                <span className="material-symbols-outlined text-[20px]">bed</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-emerald-700 tabular-nums">
                {stats.availableBeds ?? availableBedsList.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>Ready for inpatient admission</span>
              </div>
            </div>
          </div>

          {/* Card 4: Bed Occupancy Rate */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Hospital Occupancy
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-amber-700">
                <span className="material-symbols-outlined text-[20px]">domain</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {stats.bedOccupancyRate ?? 0}%
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>{stats.occupiedBeds ?? 0}/{stats.totalBeds ?? beds.length} Beds Occupied</span>
              </div>
            </div>
          </div>
        </section>

        {/* 12-Col Reception Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left 8 Cols: Live Outpatient Token Board */}
          <div className="xl:col-span-8 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Queue Board
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Live Outpatient Token Queue
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity self-start sm:self-auto flex items-center gap-1"
                >
                  <span>Open Appointments &amp; Queue</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                      <th className="py-2.5 px-3">Token #</th>
                      <th className="py-2.5 px-3">Patient Name / MRN</th>
                      <th className="py-2.5 px-3">Doctor &amp; Dept</th>
                      <th className="py-2.5 px-3">Time Slot</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                    {appointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-code-sm text-code-sm font-bold">
                            {apt.tokenNumber || 'TKN'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-title-md text-[14px] text-on-surface font-semibold">{apt.patientName}</span>
                            <span className="font-code-sm text-code-sm text-on-surface-variant">#{apt.mrn}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">{apt.doctorName}</span>
                            <span className="text-[12px] text-on-surface-variant">{apt.department}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-code-sm text-code-sm">
                          {apt.timeSlot}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`status-pill px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            apt.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'In-Consultation'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                          No appointments registered today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Bed Availability Matrix + Patient Registrations (Demographics Only) */}
          <div className="xl:col-span-4 flex flex-col gap-space-lg">
            {/* Bed Matrix */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Available Beds for Intake
                </h2>
                <span className="font-code-sm text-code-sm text-emerald-700 font-bold">
                  {availableBedsList.length} Ready
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {availableBedsList.slice(0, 6).map((bed) => (
                  <div key={bed._id} className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                    <div>
                      <div className="font-title-md text-[13px] font-semibold text-on-surface">{bed.bedNumber} · {bed.wardName}</div>
                      <div className="text-[11px] text-on-surface-variant">{bed.bedType} · {bed.floor}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                      Available
                    </span>
                  </div>
                ))}
                {availableBedsList.length === 0 && (
                  <p className="py-4 text-center text-on-surface-variant font-body-sm">
                    No beds available currently.
                  </p>
                )}
              </div>
            </div>

            {/* Patient Registration Demographics */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Patient Intake Registry
                </h2>
                <span className="text-[11px] text-on-surface-variant">Demographics Only</span>
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {patients.slice(0, 6).map((pt) => (
                  <div key={pt._id} className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-[13px] font-semibold text-on-surface">{pt.name}</span>
                      <span className="font-code-sm text-[11px] text-primary">#{pt.mrn}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>{pt.phone || 'No phone recorded'}</span>
                      <span>{pt.insuranceProvider || 'Self-Pay'}</span>
                    </div>
                  </div>
                ))}
                {patients.length === 0 && (
                  <p className="py-4 text-center text-on-surface-variant font-body-sm">
                    No patient records found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. PHARMACY HUB & DISPENSING DASHBOARD
  // ==========================================
  if (isPharmacy) {
    const pendingRxList = prescriptions.filter((p) => p.status === 'Pending');
    const lowStockBatches = inventory.filter((b) => b.status === 'Low Stock' || b.quantity <= b.minLevel);

    return (
      <div className="flex flex-col w-full gap-space-lg pb-12">
        {/* Banner */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                Pharmacy Hub &amp; Dispensing
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface mt-1.5 tracking-tight">
              MediCare Central Pharmacy Desk
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Prescription fulfillment queue, medication inventory batch control, and low stock threshold alerts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              data-testid="pharmacy-open-inventory"
              onClick={() => onNavigate('pharmacy-inventory')}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">medication</span>
              <span>Open Dispensing &amp; Inventory</span>
            </button>
          </div>
        </div>

        {/* 4 Pharmacy KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Pending Prescriptions */}
          <div
            onClick={() => onNavigate('pharmacy-inventory')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Pending Prescriptions
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-amber-700">
                <span className="material-symbols-outlined text-[20px]">prescriptions</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-amber-700 tabular-nums">
                {stats.pendingRx ?? pendingRxList.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>Awaiting pharmacist fulfillment</span>
              </div>
            </div>
          </div>

          {/* Card 2: Dispensed Prescriptions */}
          <div
            onClick={() => onNavigate('pharmacy-inventory')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Dispensed Today
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-emerald-700">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-emerald-700 tabular-nums">
                {stats.dispensedRx ?? prescriptions.filter((p) => p.status === 'Dispensed').length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>Completed dispensing orders</span>
              </div>
            </div>
          </div>

          {/* Card 3: Low Stock SKUs */}
          <div
            onClick={() => onNavigate('pharmacy-inventory')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
            <div className="flex items-center justify-between pl-1">
              <span className="font-label-sm text-label-sm text-error font-semibold uppercase tracking-wider">
                Low Stock SKUs
              </span>
              <div className="w-9 h-9 rounded-xl bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
            </div>
            <div className="mt-3 pl-1">
              <div className="font-headline-lg text-headline-lg text-error tabular-nums">
                {stats.lowStockCount ?? lowStockBatches.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-error font-label-sm text-label-sm">
                <span>Batches at or below minimum</span>
              </div>
            </div>
          </div>

          {/* Card 4: Total Inventory Batches */}
          <div
            onClick={() => onNavigate('pharmacy-inventory')}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Active Catalog Batches
              </span>
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {stats.totalBatches ?? inventory.length}
              </div>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                <span>Tracked medication batches</span>
              </div>
            </div>
          </div>
        </section>

        {/* 12-Col Pharmacy Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left 8 Cols: Pending Prescription Queue */}
          <div className="xl:col-span-8 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Fulfillment Desk
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Pending Prescription Queue
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate('pharmacy-inventory')}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity self-start sm:self-auto flex items-center gap-1"
                >
                  <span>Open Dispensing View</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {pendingRxList.map((rx) => (
                  <div
                    key={rx._id}
                    className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col gap-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary text-on-primary font-code-sm text-code-sm font-bold">
                          {rx.rxId}
                        </span>
                        <span className="font-title-md text-[14px] font-semibold text-on-surface">
                          {rx.patientName} (#{rx.mrn})
                        </span>
                        <span className="text-[12px] text-on-surface-variant">
                          · Dr. {rx.doctorName} ({rx.department})
                        </span>
                      </div>
                      <span className={`status-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rx.priority === 'STAT' ? 'bg-[#e11d48] text-white' : 'bg-[#d97706] text-white'
                      }`}>
                        {rx.priority || 'Routine'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                      {(rx.medications || []).map((med, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-col">
                          <span className="font-medium text-on-surface text-[13px]">{med.name}</span>
                          <span className="font-code-sm text-[11px] text-primary mt-0.5">{med.dosage} · Qty: {med.quantity}</span>
                          <span className="text-[11px] text-on-surface-variant mt-0.5">{med.frequency} · {med.duration}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => onNavigate('pharmacy-inventory')}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:opacity-90 font-label-sm text-label-sm flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Fulfill &amp; Dispense</span>
                      </button>
                    </div>
                  </div>
                ))}
                {pendingRxList.length === 0 && (
                  <div className="p-8 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-emerald-600">task_alt</span>
                    <p className="font-title-md text-title-md text-on-surface">All Prescriptions Dispensed</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">No pending prescriptions waiting in queue.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Low Stock Alerts + Dispensing Audit Ledger */}
          <div className="xl:col-span-4 flex flex-col gap-space-lg">
            {/* Low Stock Alerts */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Reorder Stock Alerts
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate('pharmacy-inventory')}
                  className="font-label-sm text-label-sm text-primary hover:underline"
                >
                  Inventory →
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {lowStockBatches.map((item) => (
                  <div key={item._id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-[13px] font-bold text-on-surface">{item.medicineName}</span>
                      <span className="font-code-sm text-[11px] text-error font-bold">{item.quantity} left</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-code-sm">
                      <span>Batch #{item.batchId}</span>
                      <span>Min threshold: {item.minLevel}</span>
                    </div>
                  </div>
                ))}
                {lowStockBatches.length === 0 && (
                  <div className="p-6 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-1.5">
                    <span className="material-symbols-outlined text-[28px] text-emerald-600">check_circle</span>
                    <p className="font-title-md text-title-md text-on-surface">Stock Levels Optimal</p>
                    <p className="font-body-sm text-[12px] text-on-surface-variant">All medication batches above minimum levels.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dispensing Ledger */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
              <div className="flex items-center justify-between mb-space-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Dispensing Ledger
                </h2>
                <span className="font-code-sm text-code-sm text-secondary">Verified</span>
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {auditLogs.slice(0, 6).map((log) => (
                  <div key={log._id} className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
                    <div className="flex items-center justify-between font-code-sm text-[11px]">
                      <span className="font-bold text-primary">[{log.timeStr}] {log.actionType}</span>
                      <span className="text-on-surface-variant">{log.actor}</span>
                    </div>
                    <p className="font-body-sm text-[12px] text-on-surface leading-snug">{log.summary}</p>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="py-4 text-center text-on-surface-variant font-body-sm">
                    No dispensing logs recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 6. ADMIN EXECUTIVE OPERATIONS DASHBOARD
  // ==========================================
  const criticalLabsList = labs.filter((l) => l.flag === 'Critical' || l.flag === 'High');

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Top Executive Operational Banner */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Executive Governance &amp; Administration
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface mt-1.5 tracking-tight">
            MediCare Executive Operations Center
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Hospital financial velocity, bed telemetry, staff credentialing, and immutable HIPAA security audit trails.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            type="button"
            data-testid="admin-billing-btn"
            onClick={() => onNavigate('billing-and-invoices')}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            <span>Billing &amp; Revenue</span>
          </button>
          <button
            type="button"
            data-testid="admin-wards-btn"
            onClick={() => onNavigate('ward-labs')}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">bed</span>
            <span>Wards &amp; Beds</span>
          </button>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Paid Revenue */}
        <div
          onClick={() => onNavigate('billing-and-invoices')}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Hospital Paid Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-headline-lg text-headline-lg text-emerald-700 font-code-sm tabular-nums">
              ${(stats.paidRevenue || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
              <span>Settled claims &amp; cashier receipts</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Claims */}
        <div
          onClick={() => onNavigate('billing-and-invoices')}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Pending EDI Claims
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-headline-lg text-headline-lg text-amber-700 font-code-sm tabular-nums">
              ${(stats.pendingRevenue || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span>Unsettled insurance &amp; patient balances</span>
            </div>
          </div>
        </div>

        {/* Card 3: Bed Occupancy */}
        <div
          onClick={() => onNavigate('ward-labs')}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Global Bed Occupancy
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">bed</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-headline-lg text-headline-lg text-secondary tabular-nums">
              {stats.bedOccupancyRate || 0}%
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span>{stats.occupiedBeds || 0}/{stats.totalBeds || beds.length} Beds Occupied</span>
            </div>
          </div>
        </div>

        {/* Card 4: Physicians on Duty */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Medical Staff On Duty
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-headline-lg text-headline-lg text-primary tabular-nums">
              {stats.doctorsOnDuty || 0}/{stats.totalDoctors || 10}
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span>Physicians on active clinical shift</span>
            </div>
          </div>
        </div>
      </section>

      {/* 12-Col Executive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left 8 Cols: Department Revenue & Patient Census */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* Patient Census */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Patient Roster
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Hospital Census &amp; Inpatient Distribution ({patients.length})
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                    <th className="py-2.5 px-3">Patient / MRN</th>
                    <th className="py-2.5 px-3">Department &amp; Bed</th>
                    <th className="py-2.5 px-3">Attending Physician</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                  {patients.slice(0, 8).map((pt) => (
                    <tr key={pt._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
                            {pt.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-title-md text-[13px] text-on-surface font-semibold">{pt.name}</div>
                            <div className="font-code-sm text-[11px] text-on-surface-variant">#{pt.mrn} · {pt.age}y {pt.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-on-surface">{pt.department}</span>
                        <div className="font-code-sm text-[11px] text-secondary">{pt.wardBed || 'Outpatient'}</div>
                      </td>
                      <td className="py-3 px-3 text-[13px] text-on-surface">
                        {pt.attendingDoctor || 'Unassigned'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="status-pill px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container-high text-on-surface">
                          {pt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                        No registered patients.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Live Security Audit Trail + Critical Diagnostic Alerts */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          {/* STAT Diagnostic Alerts */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Critical Lab Alerts
                </h2>
              </div>
              <button
                onClick={() => onNavigate('ward-labs')}
                className="font-label-sm text-label-sm text-primary hover:underline"
              >
                Lab Vault →
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {criticalLabsList.map((lab) => (
                <div
                  key={lab._id}
                  className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">{lab.patientName} (#{lab.mrn})</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#e11d48] text-white text-[10px] font-bold uppercase">{lab.flag}</span>
                  </div>
                  <span className="font-title-md text-[13px] text-on-surface">{lab.testName}</span>
                  <div className="flex items-center justify-between font-code-sm text-code-sm text-error font-semibold mt-0.5">
                    <span>Result: {lab.resultValue}</span>
                    <span className="text-on-surface-variant text-[11px] font-normal">Ref: {lab.referenceRange}</span>
                  </div>
                </div>
              ))}
              {criticalLabsList.length === 0 && (
                <div className="p-4 text-center text-on-surface-variant font-body-sm">
                  No critical diagnostic alerts recorded.
                </div>
              )}
            </div>
          </div>

          {/* Immutable HIPAA Audit Ledger */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">verified_user</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Security &amp; HIPAA Ledger
                </h2>
              </div>
              <span className="font-code-sm text-code-sm text-secondary">Immutable</span>
            </div>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log._id} className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
                  <div className="flex items-center justify-between font-code-sm text-[11px]">
                    <span className="font-bold text-primary">[{log.timeStr}] {log.actionType}</span>
                    <span className="text-on-surface-variant">{log.actor}</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface leading-snug">{log.summary}</p>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="p-6 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-1.5">
                  <span className="material-symbols-outlined text-[28px] text-outline">lock_clock</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No security audit logs recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
