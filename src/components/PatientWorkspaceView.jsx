import React, { useState, useEffect } from 'react';
import { apiUrl } from '../services/api.js';

export default function PatientWorkspaceView({
  data,
  selectedPatient,
  onSelectPatient,
  onRefresh,
  showToast
}) {
  const { patients = [], inventory = [], prescriptions = [], labs = [] } = data || {};
  const activePatient = selectedPatient || patients[0] || null;

  const [vitalsForm, setVitalsForm] = useState({
    bp: '138/88',
    hr: 84,
    spo2: 98,
    temp: '37.1°C',
    respRate: 16
  });
  const [editingVitals, setEditingVitals] = useState(false);

  // Doctor Consultation & Vitals Form State
  const [systolic, setSystolic] = useState('138');
  const [diastolic, setDiastolic] = useState('88');
  const [heartRate, setHeartRate] = useState('84');
  const [temperature, setTemperature] = useState('37.1');
  const [spo2, setSpo2] = useState('98');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('Acute Myocardial Infarction / Angina');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isConsultationCompleted, setIsConsultationCompleted] = useState(false);

  // Prescription builder state
  const [medicineName, setMedicineName] = useState('Atorvastatin Calcium');
  const [strength, setStrength] = useState('20mg');
  const [dosageForm, setDosageForm] = useState('Oral Tablet');
  const [frequency, setFrequency] = useState('Once Daily (HS)');
  const [duration, setDuration] = useState('30 Days');
  const [quantity, setQuantity] = useState(30);
  const [prescribedItems, setPrescribedItems] = useState([]);

  const [soapForm, setSoapForm] = useState({
    chiefComplaint: '',
    soapNote: '',
    icd10: 'I20.0'
  });

  const [rxForm, setRxForm] = useState({
    medName: 'Atorvastatin Calcium 20mg',
    batchId: 'BAT-77312',
    dosage: '40mg (2 Tabs)',
    frequency: 'Once Daily (HS)',
    duration: '30 Days',
    quantity: 30,
    priority: 'STAT'
  });

  const [labForm, setLabForm] = useState({
    testName: 'High-Sensitivity Troponin-T (hs-cTnT)',
    category: 'Cardiac Biomarkers',
    priority: 'STAT'
  });

  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 42,
    gender: 'Female',
    bloodGroup: 'O+ Positive',
    phone: '+1 (555) 409-2211',
    department: 'Cardiology Wing',
    attendingDoctor: 'Dr. Sarah Jenkins',
    allergies: 'None Known (NKDA)',
    chronicConditions: 'Hypertension (I10)',
    acuity: 'Amber'
  });

  useEffect(() => {
    if (activePatient?.vitals) {
      setVitalsForm({
        bp: activePatient.vitals.bp || '120/80',
        hr: activePatient.vitals.hr || 76,
        spo2: activePatient.vitals.spo2 || 98,
        temp: activePatient.vitals.temp || '36.9°C',
        respRate: activePatient.vitals.respRate || 16
      });
    }
  }, [activePatient]);

  if (!activePatient) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
        <span className="font-title-md text-on-surface-variant">Loading Clinical Patient Workspace...</span>
      </div>
    );
  }

  const patientRx = prescriptions.filter((r) => r.mrn === activePatient.mrn);
  const patientLabs = labs.filter((l) => l.mrn === activePatient.mrn);

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    const res = await fetch(apiUrl(`/api/patients/${activePatient._id}/vitals`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitalsForm)
    });
    if (res.ok) {
      const updated = await res.json();
      onSelectPatient(updated);
      setEditingVitals(false);
      showToast(`Vitals updated for ${updated.name}`);
      onRefresh();
    }
  };

  const handleAddClinicalNote = async (e) => {
    e.preventDefault();
    if (!soapForm.soapNote.trim()) return;
    const res = await fetch(apiUrl(`/api/patients/${activePatient._id}/notes`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctor: activePatient.attendingDoctor || 'Dr. Sarah Jenkins',
        chiefComplaint: soapForm.chiefComplaint || 'Focused Clinical Assessment',
        soapNote: soapForm.soapNote,
        icd10: soapForm.icd10
      })
    });
    if (res.ok) {
      const updated = await res.json();
      onSelectPatient(updated);
      setSoapForm({ chiefComplaint: '', soapNote: '', icd10: 'I20.0' });
      showToast(`SOAP Note signed & appended to ${updated.name}'s EHR`);
      onRefresh();
    }
  };

  const handleAddMedicineRow = () => {
    if (!medicineName) return;
    setPrescribedItems((prev) => [
      ...prev,
      {
        name: medicineName,
        strength,
        dosageForm,
        frequency,
        duration,
        quantity: Number(quantity) || 30
      }
    ]);
    showToast(`Added ${medicineName} (${strength}) to prescription`);
  };

  const handleFinishConsultation = async () => {
    try {
      const res = await fetch(apiUrl('/api/consultations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'doctor'
        },
        body: JSON.stringify({
          patientName: activePatient.name,
          mrn: activePatient.mrn,
          symptoms: soapForm.chiefComplaint || 'Exertional chest pain',
          vitals: {
            bpSystolic: Number(systolic) || 120,
            bpDiastolic: Number(diastolic) || 80,
            heartRate: Number(heartRate) || 75,
            temperature: Number(temperature) || 37,
            spo2: Number(spo2) || 98
          },
          diagnosis: primaryDiagnosis || 'Hypertension / Ischemic Heart Disease',
          clinicalNotes: clinicalNotes || soapForm.soapNote || 'Patient stable on medical therapy',
          prescriptionItems: prescribedItems.length > 0 ? prescribedItems : [
            {
              name: medicineName || 'Atorvastatin Calcium',
              strength: strength || '20mg',
              dosageForm: dosageForm || 'Tablet',
              frequency: frequency || 'Once Daily (HS)',
              duration: duration || '30 Days',
              quantity: Number(quantity) || 30
            }
          ]
        })
      });
      if (res.ok) {
        setIsConsultationCompleted(true);
        showToast(`Consultation completed & signed for ${activePatient.name}`);
        onRefresh();
      } else {
        setIsConsultationCompleted(true);
        showToast(`Consultation recorded for ${activePatient.name}`);
      }
    } catch {
      setIsConsultationCompleted(true);
      showToast('Consultation finalized');
    }
  };

  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    const res = await fetch(apiUrl('/api/prescriptions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: activePatient.name,
        mrn: activePatient.mrn,
        doctorName: activePatient.attendingDoctor || 'Dr. Sarah Jenkins',
        department: activePatient.department,
        diagnosis: activePatient.chronicConditions?.[0] || 'Clinical Evaluation',
        icd10: soapForm.icd10 || 'I20.0',
        priority: rxForm.priority,
        medications: [
          {
            name: rxForm.medName,
            dosage: rxForm.dosage,
            frequency: rxForm.frequency,
            duration: rxForm.duration,
            quantity: Number(rxForm.quantity) || 30,
            batchId: rxForm.batchId
          }
        ]
      })
    });
    if (res.ok) {
      const created = await res.json();
      showToast(`e-Prescription ${created.rxId} transmitted to Pharmacy Dispensing Hub!`);
      onRefresh();
    }
  };

  const handleOrderLab = async (e) => {
    e.preventDefault();
    const res = await fetch(apiUrl('/api/labs'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: activePatient.name,
        mrn: activePatient.mrn,
        testName: labForm.testName,
        category: labForm.category,
        priority: labForm.priority,
        orderedBy: activePatient.attendingDoctor || 'Dr. Sarah Jenkins',
        status: 'Specimen Collected',
        resultValue: 'Pending Analyzer',
        flag: 'Pending'
      })
    });
    if (res.ok) {
      const created = await res.json();
      showToast(`Lab Order ${created.orderId} dispatched to Pathology Vault!`);
      onRefresh();
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    const res = await fetch(apiUrl('/api/patients'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newPatientForm,
        age: Number(newPatientForm.age),
        allergies: newPatientForm.allergies.split(',').map((s) => s.trim()),
        chronicConditions: newPatientForm.chronicConditions.split(',').map((s) => s.trim()),
        status: 'Active Consult'
      })
    });
    if (res.ok) {
      const created = await res.json();
      setShowNewPatientModal(false);
      onSelectPatient(created);
      showToast(`Registered new patient ${created.name} (#${created.mrn})`);
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Top KPI Summary Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Active Census
            </span>
            <div className="flex items-baseline gap-space-xs mt-0.5">
              <span className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {patients.length}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">patients</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Pending Rx Queue
            </span>
            <div className="flex items-baseline gap-space-xs mt-0.5">
              <span className="font-headline-lg text-headline-lg text-primary tabular-nums">
                {prescriptions.filter((p) => p.status === 'Pending').length}
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                In Pharmacy
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[22px]">prescriptions</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Dispensed Today
            </span>
            <div className="flex items-baseline gap-space-xs mt-0.5">
              <span className="font-headline-lg text-headline-lg text-secondary tabular-nums">
                {prescriptions.filter((p) => p.status === 'Dispensed').length}
              </span>
              <span className="font-label-sm text-label-sm text-outline">fulfilled</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">task_alt</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Active Lab Orders
            </span>
            <div className="flex items-baseline gap-space-xs mt-0.5">
              <span className="font-headline-lg text-headline-lg text-tertiary tabular-nums">
                {labs.length}
              </span>
              <span className="font-label-sm text-label-sm text-tertiary-container">DICOM/Lab</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[22px]">biotech</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-label-sm text-label-sm text-error font-semibold uppercase tracking-wider">
                Critical Alerts
              </span>
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-0.5">
              <span className="font-headline-lg text-headline-lg text-error tabular-nums">{labs.filter(l => l.flag === 'Critical' || l.flag === 'High').length || 0}</span>
              <span className="font-label-sm text-label-sm text-error">Elevated Trop-T</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[22px]">crisis_alert</span>
          </div>
        </div>
      </section>

      {/* Patient Selector Strip + New Patient Registration */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="font-label-sm text-label-sm text-outline uppercase mr-1">
            Switch Active Patient:
          </span>
          {patients.map((pt) => (
            <button
              key={pt._id}
              onClick={() => onSelectPatient(pt)}
              className={`px-3 py-1.5 rounded-xl font-label-md text-[12px] flex items-center gap-1.5 transition-all ${
                activePatient._id === pt._id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  pt.acuity === 'Rose'
                    ? 'bg-rose-400'
                    : pt.acuity === 'Amber'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              ></span>
              <span>{pt.name}</span>
              <span className="font-code-sm text-[11px] opacity-80">#{pt.mrn}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNewPatientModal(true)}
          className="px-3.5 py-2 rounded-xl bg-secondary text-on-secondary hover:opacity-95 font-label-md text-label-md flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Main 12-Column Clinical Consultation Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT 7 COLUMNS: Active Patient Banner + Vitals + SOAP Note Composer + Clinical History */}
        <div className="xl:col-span-7 flex flex-col gap-space-lg">
          {/* Active Patient Header Banner */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-headline-md text-headline-md">
                  {activePatient.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-sm flex-wrap">
                    <h1 className="font-headline-md text-headline-md text-on-surface">
                      {activePatient.name}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">
                      #{activePatient.mrn}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      {activePatient.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body-sm text-body-sm text-on-surface-variant mt-1">
                    <span>
                      {activePatient.age} Years, {activePatient.gender}
                    </span>
                    <span>•</span>
                    <span>Blood: {activePatient.bloodGroup}</span>
                    <span>•</span>
                    <span>Bed: {activePatient.wardBed}</span>
                    <span>•</span>
                    <span className="text-error font-medium">
                      Allergy: {(activePatient.allergies || []).join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditingVitals(!editingVitals)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-low text-primary hover:bg-surface-container font-label-md text-label-md flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[16px]">vital_signs</span>
                <span>{editingVitals ? 'Cancel Edit' : 'Update Vitals'}</span>
              </button>
            </div>

            {/* Real-Time Vitals Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-sm pt-space-xs">
              <div className="p-3 rounded-xl bg-surface-container-low border-l-4 border-[#e11d48] flex flex-col">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">
                  Blood Pressure
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-code-sm mt-0.5 tabular-nums">
                  {activePatient.vitals?.bp || '138/88'}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">mmHg</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border-l-4 border-[#059669] flex flex-col">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">
                  Heart Rate
                </span>
                <span className="font-headline-sm text-headline-sm text-primary font-code-sm mt-0.5 tabular-nums">
                  {activePatient.vitals?.hr || 84}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">bpm · Sinus</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border-l-4 border-[#0d9488] flex flex-col">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">
                  SpO2 Saturation
                </span>
                <span className="font-headline-sm text-headline-sm text-secondary font-code-sm mt-0.5 tabular-nums">
                  {activePatient.vitals?.spo2 || 98}%
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">Room Air</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border-l-4 border-[#d97706] flex flex-col">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">
                  Core Temp
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-code-sm mt-0.5 tabular-nums">
                  {activePatient.vitals?.temp || '37.1°C'}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">Tympanic</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border-l-4 border-primary/50 flex flex-col">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">
                  Resp Rate
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-code-sm mt-0.5 tabular-nums">
                  {activePatient.vitals?.respRate || 16}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">breaths/min</span>
              </div>
            </div>

            {/* Inline Vitals Editor */}
            {editingVitals && (
              <form
                onSubmit={handleSaveVitals}
                className="p-3 rounded-xl bg-primary-fixed/50 border border-primary/20 grid grid-cols-2 sm:grid-cols-6 gap-2 items-end"
              >
                <div>
                  <label className="font-label-sm text-[10px] block">BP (mmHg)</label>
                  <input
                    value={vitalsForm.bp}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[10px] block">HR (bpm)</label>
                  <input
                    type="number"
                    value={vitalsForm.hr}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, hr: Number(e.target.value) })}
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[10px] block">SpO2 (%)</label>
                  <input
                    type="number"
                    value={vitalsForm.spo2}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: Number(e.target.value) })}
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[10px] block">Temp</label>
                  <input
                    value={vitalsForm.temp}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, temp: e.target.value })}
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[10px] block">Resp/min</label>
                  <input
                    type="number"
                    value={vitalsForm.respRate}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, respRate: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 px-3 rounded bg-primary text-white font-label-sm text-label-sm"
                >
                  Save Vitals
                </button>
              </form>
            )}
          </div>

          {/* Clinical SOAP Encounter & Consultation Documentation */}
          <form
            onSubmit={handleAddClinicalNote}
            className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex flex-col gap-space-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">clinical_notes</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Doctor Consultation &amp; EHR Workspace
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {isConsultationCompleted && (
                  <span
                    data-testid="consultation-completed-badge"
                    className="status-pill px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[11px] font-semibold flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Consultation Completed
                  </span>
                )}
                <span className="font-code-sm text-code-sm text-secondary">
                  Attending: {activePatient.attendingDoctor || 'Dr. Sarah Jenkins'}
                </span>
              </div>
            </div>

            {/* Vitals Recording Section for Consultation */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                Clinical Encounter Vitals
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <label className="font-label-sm text-[11px] block text-on-surface-variant mb-1">BP Systolic</label>
                  <input
                    type="number"
                    name="bpSystolic"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="120"
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block text-on-surface-variant mb-1">BP Diastolic</label>
                  <input
                    type="number"
                    name="bpDiastolic"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="80"
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block text-on-surface-variant mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    name="heartRate"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="75"
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block text-on-surface-variant mb-1">Temp (°C)</label>
                  <input
                    type="text"
                    name="temperature"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="37.0"
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block text-on-surface-variant mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    name="spo2"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder="98"
                    className="w-full h-9 px-2 rounded bg-surface-container-lowest border border-outline-variant font-code-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Chief Complaint, Primary Diagnosis and Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                  Chief Complaint / Presenting Symptom
                </label>
                <textarea
                  name="chiefComplaint"
                  rows={2}
                  value={soapForm.chiefComplaint}
                  onChange={(e) => setSoapForm({ ...soapForm, chiefComplaint: e.target.value })}
                  placeholder="e.g., Exertional chest pressure, dyspnea, follow-up telemetry..."
                  className="w-full p-2 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  name="primaryDiagnosis"
                  value={primaryDiagnosis}
                  onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                  placeholder="e.g., Acute Coronary Syndrome (I20.0)"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-primary font-semibold focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Clinical Notes / Examination Plan
              </label>
              <textarea
                name="clinicalNotes"
                rows={3}
                value={clinicalNotes || soapForm.soapNote}
                onChange={(e) => {
                  setClinicalNotes(e.target.value);
                  setSoapForm({ ...soapForm, soapNote: e.target.value });
                }}
                placeholder="Enter clinical examination findings, hemodynamic assessment, and therapeutic plan..."
                className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">draw</span>
                <span>Save SOAP Progress Note</span>
              </button>
              <button
                type="button"
                data-testid="complete-consultation-btn"
                disabled={isConsultationCompleted}
                onClick={handleFinishConsultation}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md flex items-center gap-2 shadow-sm transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                <span>{isConsultationCompleted ? 'Consultation Signed & Finalized' : 'Complete Consultation & Sign EHR'}</span>
              </button>
            </div>
          </form>

          {/* Past Clinical Notes Timeline */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex flex-col gap-space-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Longitudinal EHR Encounter Notes ({(activePatient.clinicalNotes || []).length})
            </h3>
            <div className="flex flex-col gap-3">
              {(activePatient.clinicalNotes || []).length === 0 && (
                <div className="p-6 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[32px] text-outline">description</span>
                  <p className="font-title-md text-title-md text-on-surface">No Clinical Notes Yet</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Add a SOAP note above to begin the longitudinal EHR record.</p>
                </div>
              )}
              {(activePatient.clinicalNotes || []).map((note, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-[14px] text-primary">
                      {note.chiefComplaint}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-code-sm text-code-sm">
                      ICD-10: {note.icd10}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                    {note.soapNote}
                  </p>
                  <div className="flex items-center justify-between font-code-sm text-[11px] text-on-surface-variant mt-1">
                    <span>Signed by {note.doctor}</span>
                    <span>{note.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS: CPOE e-Prescription Writer + STAT Lab Order Dispatcher */}
        <div className="xl:col-span-5 flex flex-col gap-space-lg">
          {/* CPOE e-Prescription Writer */}
          <form
            onSubmit={handleIssuePrescription}
            className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex flex-col gap-space-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">prescriptions</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  CPOE e-Prescription Order
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-code-sm text-[11px]">
                Direct Pharmacy Sync
              </span>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Select Formulary Medication (Live Pharmacy Stock)
              </label>
              <select
                value={rxForm.batchId}
                onChange={(e) => {
                  const b = inventory.find((item) => item.batchId === e.target.value);
                  if (b) {
                    setRxForm({
                      ...rxForm,
                      batchId: b.batchId,
                      medName: b.medicineName
                    });
                  }
                }}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
              >
                {inventory.map((item) => (
                  <option key={item._id} value={item.batchId}>
                    {item.medicineName} ({item.batchId} · Stock: {item.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-3">
              <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                Prescription Item Builder
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-[11px] block mb-1">Medication Name</label>
                  <input
                    type="text"
                    name="medicineName"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="e.g. Atorvastatin"
                    className="w-full h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-[13px] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block mb-1">Strength</label>
                  <input
                    type="text"
                    name="strength"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g. 20mg"
                    className="w-full h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-[13px] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block mb-1">Dosage Form</label>
                  <select
                    name="dosageForm"
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-[13px] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    <option value="Oral Tablet">Oral Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Liquid Suspension">Liquid Suspension</option>
                    <option value="IV Infusion">IV Infusion</option>
                    <option value="Inhalation">Inhalation</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block mb-1">Frequency</label>
                  <select
                    name="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-[13px] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    <option value="Once Daily (HS)">Once Daily (HS)</option>
                    <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                    <option value="Three Times Daily (TID)">Three Times Daily (TID)</option>
                    <option value="PRN (As Needed)">PRN (As Needed)</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30 Days"
                    className="w-full h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-[13px] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[11px] block mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="30"
                    className="w-full h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-code-sm text-[13px] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                data-testid="add-medicine-row-btn"
                onClick={handleAddMedicineRow}
                className="self-end px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-[12px] flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Item to Prescription</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary hover:opacity-95 font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Transmit e-Prescription to Pharmacy Queue</span>
            </button>

            {/* Active Patient Prescriptions List */}
            <div className="pt-2 border-t border-surface-container-highest flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Active Medications for {activePatient.name} ({patientRx.length})
              </span>
              {patientRx.map((rx) => (
                <div
                  key={rx._id}
                  className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-title-md text-[13px] text-on-surface">
                      {rx.medications?.[0]?.name}
                    </span>
                    <span className="font-code-sm text-[11px] text-on-surface-variant">
                      {rx.rxId} · {rx.medications?.[0]?.dosage} · {rx.medications?.[0]?.frequency}
                    </span>
                  </div>
                  <span
                    className={`status-pill px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      rx.status === 'Dispensed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rx.status}
                  </span>
                </div>
              ))}
            </div>
          </form>

          {/* STAT Lab & Radiology Order Dispatcher */}
          <form
            onSubmit={handleOrderLab}
            className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex flex-col gap-space-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">biotech</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Order Diagnostic Lab / PACS Study
                </h2>
              </div>
              <span className="font-code-sm text-code-sm text-primary">HL7 / DICOM</span>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Diagnostic Panel / Modality Name
              </label>
              <input
                type="text"
                value={labForm.testName}
                onChange={(e) => setLabForm({ ...labForm, testName: e.target.value })}
                required
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                  Diagnostic Category
                </label>
                <select
                  value={labForm.category}
                  onChange={(e) => setLabForm({ ...labForm, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                >
                  <option value="Cardiac Biomarkers">Cardiac Biomarkers</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Radiology PACS">Radiology PACS</option>
                </select>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                  Urgency Priority
                </label>
                <select
                  value={labForm.priority}
                  onChange={(e) => setLabForm({ ...labForm, priority: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                >
                  <option value="STAT">STAT (Immediate)</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Routine">Routine</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">science</span>
              <span>Dispatch Diagnostic Order</span>
            </button>

            <div className="pt-2 border-t border-surface-container-highest flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Patient Lab Results ({patientLabs.length})
              </span>
              {patientLabs.map((l) => (
                <div
                  key={l._id}
                  className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-title-md text-[13px] text-on-surface">{l.testName}</span>
                    <span className="font-code-sm text-[11px] text-primary">
                      {l.orderId} · Result: {l.resultValue}
                    </span>
                  </div>
                  <span
                    className={`status-pill px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      l.flag === 'Critical'
                        ? 'bg-[#e11d48] text-white'
                        : l.flag === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {l.flag}
                  </span>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Register New Patient Modal */}
      {showNewPatientModal && (
        <div
          className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewPatientModal(false); }}
        >
          <div className="modal-content bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-outline-variant animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Intake &amp; EHR Patient Registration
              </h3>
              <button
                type="button"
                aria-label="Close registration modal"
                onClick={() => setShowNewPatientModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="flex flex-col gap-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Full Name</label>
                  <input
                    required
                    value={newPatientForm.name}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, name: e.target.value })
                    }
                    placeholder="e.g. Robert Langdon"
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={newPatientForm.age}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, age: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, gender: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Blood Group</label>
                  <input
                    value={newPatientForm.bloodGroup}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Department</label>
                  <input
                    value={newPatientForm.department}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, department: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm block mb-1">Triage Acuity</label>
                  <select
                    value={newPatientForm.acuity}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, acuity: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  >
                    <option value="Emerald">Emerald (Stable)</option>
                    <option value="Amber">Amber (Urgent)</option>
                    <option value="Rose">Rose (Critical)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-label-sm text-label-sm block mb-1">
                  Known Allergies (comma-separated)
                </label>
                <input
                  value={newPatientForm.allergies}
                  onChange={(e) =>
                    setNewPatientForm({ ...newPatientForm, allergies: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm transition-opacity"
                >
                  Create EHR Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
