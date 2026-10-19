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
    invoices = []
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
  // 2. CLINICAL & HOSPITAL OPERATIONS DASHBOARD
  // (For Doctors, Receptionists, Pharmacists, Admins)
  // ==========================================
  const criticalLabsList = labs.filter((l) => l.flag === 'Critical' || l.flag === 'High');

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Top Executive Operational Banner */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
              Hospital Operations
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface mt-1.5 tracking-tight">
            MediCare Clinical &amp; Hospital Operations
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Review current patient care, appointments, diagnostics, pharmacy inventory, and billing activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            type="button"
            data-testid="dashboard-book-appointment"
            onClick={() => onNavigate('appointments')}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Summary Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-md">
        <div
          onClick={() => onNavigate('patient-workspace')}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex flex-wrap items-start justify-between gap-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Active Patients
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
              {stats.totalPatients || 0}
            </div>
            <div className="flex items-center gap-1 mt-1 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>{stats.activeInpatients || 0} Admitted Inpatients</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('appointments')}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Today&apos;s Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
              {stats.appointmentsToday || 0}
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="font-code-sm text-code-sm text-primary font-semibold">
                {stats.waitingAppointments || 0} Waiting
              </span>
              <span>· {stats.completedAppointments || 0} Done</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('ward-labs')}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Ward Bed Occupancy
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">bed</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="font-headline-lg text-headline-lg text-secondary tabular-nums">
              {stats.bedOccupancyRate || 0}%
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span>
                {stats.occupiedBeds || 0}/{stats.totalBeds || 0} Beds Occupied
              </span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('pharmacy-inventory')}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Pharmacy Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[20px]">medication</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
              {stats.pendingRx || 0}{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant">Rx Pending</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-amber-700 font-label-sm text-label-sm">
              <span>{stats.lowStockCount || 0} Low Stock SKUs</span>
            </div>
          </div>
        </div>

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
          <div className="mt-2 pl-1">
            <div className="font-headline-lg text-headline-lg text-error tabular-nums">
              {stats.criticalLabs ?? 0}
            </div>
            <div className="flex items-center gap-1 mt-1 text-error font-label-sm text-label-sm">
              <span>Elevated hs-Troponin-T</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 12-Column Clinical Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left 8 Columns: Active Patient Roster & Triage Queue + Bed Telemetry */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* Active Patient EHR Roster */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Electronic Health Records
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Active Patient Census &amp; Triage Acuity
                </h2>
              </div>
              <button
                onClick={() => onNavigate('patient-workspace')}
                className="px-3 py-1.5 rounded-xl bg-primary-fixed text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors self-start sm:self-auto flex items-center gap-1"
              >
                <span>Open Clinical Workspace</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                    <th className="py-2.5 px-3">Patient / MRN</th>
                    <th className="py-2.5 px-3">Department &amp; Bed</th>
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
                              {pt.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-title-md text-[14px] text-on-surface">
                                {pt.name}
                              </span>
                              <span className="font-code-sm text-code-sm text-on-surface-variant">
                                #{pt.mrn} · {pt.age}y {pt.gender}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">{pt.department}</span>
                            <span className="font-code-sm text-code-sm text-secondary">
                              {pt.wardBed} · {pt.attendingDoctor}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-code-sm text-code-sm tabular-nums">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface">
                              BP {pt.vitals?.bp || '120/80'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-surface-container-low text-primary">
                              HR {pt.vitals?.hr || 75}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-surface-container-low text-secondary">
                              {pt.vitals?.spo2 || 98}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}
                          >
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
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-[40px] text-outline">person_search</span>
                          <p className="font-title-md text-title-md text-on-surface">No Active Patients</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Register a patient to begin.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Critical Biomarker Alerts + Live Queue + Audit Trail */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          {/* STAT Diagnostic Alerts */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Critical Lab &amp; Biomarker Alerts
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
                    lab.flag === 'Critical'
                      ? 'border-[#e11d48] bg-[#fff1f2]/70'
                      : 'border-[#d97706] bg-[#fffbeb]/70'
                  } flex flex-col gap-1`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-1.5">
                    <span className="min-w-0 break-words font-code-sm text-code-sm font-bold text-on-surface">
                      {lab.patientName} (#{lab.mrn})
                    </span>
                    <span
                      className={`status-pill px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        lab.flag === 'Critical'
                          ? 'bg-[#e11d48] text-white'
                          : 'bg-[#d97706] text-white'
                      }`}
                    >
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
                <div className="p-6 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[32px] text-secondary">check_circle</span>
                  <p className="font-title-md text-title-md text-on-surface">No Critical Alerts</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">All biomarker values within normal reference ranges.</p>
                </div>
              )}
            </div>
          </div>

          {/* Live Appointment Queue Snapshot */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Live Reception Token Queue
              </h2>
              <button
                onClick={() => onNavigate('appointments')}
                className="font-label-sm text-label-sm text-primary hover:underline"
              >
                Full Queue →
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {appointments.slice(0, 4).map((apt) => (
                <div
                  key={apt._id}
                  className="p-3 rounded-xl bg-surface-container-low flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="px-2 py-1 rounded-lg bg-primary text-on-primary font-code-sm text-code-sm font-bold">
                      {apt.tokenNumber}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-title-md text-[13px] text-on-surface">
                        {apt.patientName}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {apt.doctorName} · {apt.timeSlot}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`status-pill shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      apt.status === 'In-Consultation'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : apt.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="p-6 rounded-xl bg-surface-container-low text-center">
                  <span className="material-symbols-outlined text-[32px] text-outline block mb-1">event_available</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No active appointment tokens.</p>
                </div>
              )}
            </div>
          </div>

          {/* Immutable Clinical Audit Ledger */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-highest">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  verified_user
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Live Clinical Audit Trail
                </h2>
              </div>
              <span className="font-code-sm text-code-sm text-secondary">HIPAA Sync</span>
            </div>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log._id}
                  className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-highest flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between font-code-sm text-[11px]">
                    <span className="font-bold text-primary">
                      [{log.timeStr}] {log.actionType}
                    </span>
                    <span className="text-on-surface-variant">{log.actor}</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface leading-snug">
                    {log.summary}
                  </p>
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
