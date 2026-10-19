import React, { useState, useEffect, useCallback } from 'react';
import DashboardView from './components/DashboardView.jsx';
import AppointmentsView from './components/AppointmentsView.jsx';
import PatientWorkspaceView from './components/PatientWorkspaceView.jsx';
import PharmacyView from './components/PharmacyView.jsx';
import WardAndLabView from './components/WardAndLabView.jsx';
import BillingAdminView from './components/BillingAdminView.jsx';

const CLINICAL_MODULES = [
  { id: 'dashboard', label: 'Overview', icon: 'grid_view' },
  { id: 'patient-workspace', label: 'Patient Records & EHR', icon: 'personal_injury' },
  { id: 'appointments', label: 'Appointments & Queue', icon: 'calendar_clock' },
  { id: 'pharmacy-inventory', label: 'Pharmacy & Dispensing', icon: 'medication' },
  { id: 'ward-labs', label: 'Wards & Diagnostics', icon: 'bed' },
  { id: 'billing-and-invoices', label: 'Billing & Administration', icon: 'receipt_long' }
];

const ROLES = [
  { id: 'Doctor', defaultModuleId: 'patient-workspace', sub: 'Clinical workspace' },
  { id: 'Patient', defaultModuleId: 'dashboard', sub: 'Patient portal' },
  { id: 'Reception', defaultModuleId: 'appointments', sub: 'Appointments & admissions' },
  { id: 'Pharmacy', defaultModuleId: 'pharmacy-inventory', sub: 'Pharmacy operations' },
  { id: 'Admin', defaultModuleId: 'dashboard', sub: 'System administration' }
];

const ROLE_MODULE_IDS = {
  Doctor: ['dashboard', 'patient-workspace', 'appointments', 'ward-labs'],
  Patient: ['dashboard'],
  Reception: ['dashboard', 'appointments', 'billing-and-invoices'],
  Pharmacy: ['dashboard', 'pharmacy-inventory'],
  Admin: ['dashboard', 'appointments', 'pharmacy-inventory', 'ward-labs', 'billing-and-invoices']
};

const DEPARTMENT_OPTIONS = [
  'Cardiology Wing',
  'Neurology Dept',
  'Surgical Services',
  'Emergency & Trauma',
  'Pediatrics & PICU',
  'ICU & Critical Care',
  'Oncology & Infusion',
  'Inpatient Ward & Beds',
  'Pharmacy & Dispensing',
  'Radiology & PACS'
];

function normalizeRole(role) {
  const normalizedRole = String(role || '').toLowerCase();
  if (normalizedRole === 'admin') return 'Admin';
  if (normalizedRole === 'reception' || normalizedRole === 'receptionist') return 'Reception';
  if (normalizedRole === 'pharmacy' || normalizedRole === 'pharmacist') return 'Pharmacy';
  if (normalizedRole === 'patient') return 'Patient';
  return 'Doctor';
}

export default function App() {
  const [activeModuleId, setActiveModuleId] = useState('patient-workspace');
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medicare_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname === '/register' ? 'register' : 'login';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerRole, setRegisterRole] = useState('patient');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [newConsultData, setNewConsultData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    phone: '',
    doctorName: '',
    department: DEPARTMENT_OPTIONS[0],
    priority: 'Routine',
    chiefComplaint: ''
  });

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3800);
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      const dashRes = await fetch('/api/dashboard', {
        headers: { 'x-user-role': currentUser.role }
      });
      if (!dashRes.ok) return;
      const dashJson = await dashRes.json();
      setDashboardData(dashJson);
      if (!selectedPatient && dashJson.patients?.length > 0) {
        setSelectedPatient(dashJson.patients[0]);
      } else if (selectedPatient && dashJson.patients?.length > 0) {
        const refreshed = dashJson.patients.find((p) => p._id === selectedPatient._id);
        if (refreshed) setSelectedPatient(refreshed);
      }
    } catch (err) {
      console.error('Error loading MediCare data:', err);
    }
  }, [currentUser, selectedPatient]);

  useEffect(() => {
    if (currentUser) fetchAllData();
  }, [currentUser, fetchAllData]);

  useEffect(() => {
    if (currentUser) {
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        window.history.replaceState({}, '', '/');
      }
      return undefined;
    }

    const path = window.location.pathname;
    if (path !== '/login' && path !== '/register') {
      window.history.replaceState({}, '', '/login');
      setAuthMode('login');
    } else {
      setAuthMode(path === '/register' ? 'register' : 'login');
    }

    const handleAuthHistoryChange = () => {
      setAuthMode(window.location.pathname === '/register' ? 'register' : 'login');
      setAuthError('');
    };
    window.addEventListener('popstate', handleAuthHistoryChange);
    return () => window.removeEventListener('popstate', handleAuthHistoryChange);
  }, [currentUser]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('globalEhrSearchInput');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeModule = CLINICAL_MODULES.find((module) => module.id === activeModuleId) || CLINICAL_MODULES[0];
  const activeRole = normalizeRole(currentUser?.role);
  const currentRoleInfo = ROLES.find((r) => r.id === activeRole) || ROLES[0];
  const allowedModuleIds = ROLE_MODULE_IDS[activeRole] || ROLE_MODULE_IDS.Patient;

  useEffect(() => {
    if (!currentUser || allowedModuleIds.includes(activeModuleId)) return;
    setActiveModuleId(currentRoleInfo.defaultModuleId);
  }, [currentUser, activeModuleId, allowedModuleIds, currentRoleInfo]);

  const handleNavigate = (moduleId) => {
    if (!allowedModuleIds.includes(moduleId)) return;
    setActiveModuleId(moduleId);
    setIsAlertsOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthPage = (mode) => {
    const path = mode === 'register' ? '/register' : '/login';
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setAuthMode(mode);
    setAuthError('');
    setAuthSuccess('');
  };

  const activateSession = (data) => {
    const user = data.user || data;
    localStorage.setItem('medicare_user', JSON.stringify(user));
    if (data.token) localStorage.setItem('medicare_token', data.token);
    setCurrentUser(user);
    const mappedRole = normalizeRole(user.role || data.role);
    const roleInfo = ROLES.find((r) => r.id === mappedRole);
    if (roleInfo) setActiveModuleId(roleInfo.defaultModuleId);
    window.history.replaceState({}, '', '/');
    showToast(`Welcome, ${user.name || 'User'}! (${mappedRole} Session Active)`);
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || data.message || 'Invalid email or password');
        return;
      }
      activateSession(data);
    } catch (err) {
      setAuthError('Network error connecting to auth service');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (registerPassword !== registerPasswordConfirm) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName.trim(),
          email: loginEmail.trim(),
          password: registerPassword,
          phone: registerPhone.trim(),
          role: registerRole
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || data.message || 'Unable to create your account.');
        return;
      }
      if (registerRole === 'doctor') {
        setAuthSuccess('Doctor application submitted. Your account is pending administrator verification. You can sign in after approval.');
        setRegisterName('');
        setLoginEmail('');
        setRegisterPhone('');
        setRegisterPassword('');
        setRegisterPasswordConfirm('');
      } else {
        activateSession(data);
      }
    } catch (err) {
      setAuthError('Network error connecting to auth service');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('medicare_user');
    localStorage.removeItem('medicare_token');
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
    setIsAlertsOpen(false);
    openAuthPage('login');
    showToast('Signed out of MediCare session');
  };

  const handleCreateNewConsultation = async (e) => {
    e.preventDefault();
    if (!newConsultData.patientName.trim()) {
      showToast('Patient name is required.');
      return;
    }

    const selectedDoctor = dashboardData?.doctors?.find((doctor) => doctor.name === newConsultData.doctorName);
    if (!selectedDoctor) {
      showToast('Select an available attending physician.');
      return;
    }

    try {
      let pt = dashboardData?.patients?.find((p) => p.name.toLowerCase() === newConsultData.patientName.toLowerCase());
      if (!pt) {
        const ptRes = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newConsultData.patientName,
            age: Number(newConsultData.age) || 42,
            gender: newConsultData.gender || 'Male',
            phone: newConsultData.phone || '+1 (555) 010-2030',
            department: newConsultData.department,
            attendingDoctor: selectedDoctor.name,
            status: 'Active Consult'
          })
        });
        const patientResult = await ptRes.json();
        if (!ptRes.ok) {
          showToast(patientResult.error || 'Unable to register patient.');
          return;
        }
        pt = patientResult;
      }

      const slotStart = new Date();
      slotStart.setMinutes(Math.ceil((slotStart.getMinutes() + 1) / 30) * 30, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

      const appointmentRes = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: pt?._id,
          patientName: newConsultData.patientName,
          mrn: pt?.mrn,
          doctorId: selectedDoctor._id,
          doctorName: newConsultData.doctorName,
          department: newConsultData.department,
          date: slotStart.toISOString().slice(0, 10),
          slotStart: slotStart.toISOString(),
          slotEnd: slotEnd.toISOString(),
          timeSlot: slotStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          visitType: 'New Consultation',
          priority: newConsultData.priority,
          reason: newConsultData.chiefComplaint || 'Initial consultation intake',
          status: 'Checked-In'
        })
      });

      const appointmentResult = await appointmentRes.json();
      if (!appointmentRes.ok) {
        showToast(appointmentResult.error || 'Unable to create appointment.');
        return;
      }

      await fetchAllData();
      if (pt) setSelectedPatient(pt);
      setIsNewConsultationOpen(false);
      handleNavigate('patient-workspace');
      showToast(`Consultation registered for ${newConsultData.patientName}!`);
      setNewConsultData({
        patientName: '',
        age: '',
        gender: 'Male',
        phone: '',
        doctorName: '',
        department: DEPARTMENT_OPTIONS[0],
        priority: 'Routine',
        chiefComplaint: ''
      });
    } catch (error) {
      console.error('Consultation registration failed:', error);
      showToast('Unable to register consultation. Please try again.');
    }
  };

  const searchResults =
    globalSearch.trim().length > 1
      ? (dashboardData?.patients || []).filter((p) => {
          const search = globalSearch.toLowerCase();
          return (
            p.name.toLowerCase().includes(search) ||
            p.mrn.toLowerCase().includes(search) ||
            (p.diagnosis && p.diagnosis.toLowerCase().includes(search))
          );
        })
      : [];

  const clinicalAlerts = [
    ...(dashboardData?.labs || [])
      .filter((lab) => lab.flag === 'Critical' || lab.flag === 'High')
      .map((lab) => ({
        id: lab._id,
        title: `${lab.testName} ${lab.flag} alert`,
        detail: `${lab.patientName || 'Patient'} · ${lab.mrn || 'Unknown MRN'}`,
        module: 'ward-labs',
        severity: lab.flag === 'Critical' ? 'Critical' : 'High'
      })),
    ...(dashboardData?.inventory || [])
      .filter((item) => item.status === 'Low Stock' || item.quantity <= item.minLevel)
      .map((item) => ({
        id: item._id,
        title: `${item.medicineName} stock low`,
        detail: `${item.quantity} units remaining`,
        module: 'pharmacy-inventory',
        severity: item.status === 'Quarantine' ? 'Critical' : 'High'
      }))
  ].slice(0, 5);

  const renderModuleContent = () => {
    switch (activeModuleId) {
      case 'appointments':
        return <AppointmentsView data={dashboardData} onRefresh={fetchAllData} showToast={showToast} />;
      case 'patient-workspace':
        return (
          <PatientWorkspaceView
            data={dashboardData}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            onRefresh={fetchAllData}
            showToast={showToast}
          />
        );
      case 'pharmacy-inventory':
        return <PharmacyView data={dashboardData} onRefresh={fetchAllData} showToast={showToast} />;
      case 'ward-labs':
        return <WardAndLabView data={dashboardData} onRefresh={fetchAllData} showToast={showToast} />;
      case 'billing-and-invoices':
        return <BillingAdminView data={dashboardData} onRefresh={fetchAllData} showToast={showToast} />;
      case 'dashboard':
      default:
        return (
          <DashboardView
            data={dashboardData}
            onNavigate={handleNavigate}
            onSelectPatient={setSelectedPatient}
            onRefresh={fetchAllData}
          />
        );
    }
  };

  const authDisabled = !currentUser;

  return (
    <div className="app-shell min-h-screen antialiased">
      {isMobileMenuOpen && <div className="fixed inset-0 z-30 bg-on-surface/50 backdrop-blur-xs lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-on-surface text-white px-4 py-3 shadow-lg font-label-sm text-label-sm">
          {toast}
        </div>
      )}

      <div className="flex min-h-screen">
        {!authDisabled && (
          <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] lg:w-[290px] bg-surface-container-lowest border-r border-surface-container-highest shadow-lg overflow-y-auto transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="flex items-center justify-between border-b border-surface-container-highest p-4">
              <div>
                <div className="font-title-lg text-title-lg text-on-surface">MediCare</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Clinical operations</div>
              </div>
              <button type="button" data-testid="close-mobile-navigation" aria-label="Close navigation" className="lg:hidden material-symbols-outlined text-[20px] text-on-surface-variant" onClick={() => setIsMobileMenuOpen(false)}>close</button>
            </div>

            <div className="p-3 border-b border-surface-container-highest">
              <label className="text-[11px] text-on-surface-variant uppercase tracking-wide block mb-2">Patient search</label>
              <input
                id="globalEhrSearchInput"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search patient / MRN"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
              {searchResults && searchResults.length > 0 && (
                <div className="mt-2 rounded-xl border border-surface-container-highest bg-surface-container-low p-2 space-y-1">
                  {searchResults.slice(0, 4).map((patient) => (
                    <button
                      key={patient._id}
                      type="button"
                      onClick={() => { setSelectedPatient(patient); setGlobalSearch(''); }}
                      className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-surface-container text-on-surface"
                    >
                      <div className="font-label-sm text-label-sm">{patient.name}</div>
                      <div className="font-code-sm text-[11px] text-on-surface-variant">#{patient.mrn}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="p-3 space-y-2">
              {CLINICAL_MODULES.filter((module) => allowedModuleIds.includes(module.id)).map((module) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => handleNavigate(module.id)}
                  aria-current={activeModuleId === module.id ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    activeModuleId === module.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{module.icon}</span>
                  <span className="font-label-md text-label-md">{module.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto border-t border-surface-container-highest p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">
                  {(currentUser?.name || 'User').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="font-label-md text-label-md text-on-surface truncate">{currentUser?.name || 'Not signed in'}</div>
                  <div className="font-code-sm text-[11px] text-on-surface-variant">{activeRole} · {currentRoleInfo.sub}</div>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface hover:bg-surface-container">Sign out</button>
            </div>
          </aside>
        )}

        <div className={`flex-1 min-w-0 ${authDisabled ? '' : 'lg:pl-[290px]'}`}>
          {!authDisabled && (
            <header className="sticky top-0 z-20 border-b border-surface-container-highest bg-surface-container-lowest/90 backdrop-blur-sm">
              <div className="app-header-content flex items-center justify-between gap-3 px-3 sm:px-space-md py-3">
                <div className="flex items-center gap-3">
                  <button type="button" data-testid="open-mobile-navigation" aria-label="Open navigation" className="lg:hidden material-symbols-outlined text-[24px] text-on-surface-variant" onClick={() => setIsMobileMenuOpen(true)}>menu</button>
                  <div>
                    <div className="font-label-sm text-[11px] uppercase tracking-wide text-on-surface-variant">Current module</div>
                    <div className="font-title-md text-title-md text-on-surface">{activeModule.label}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" data-testid="header-alerts-button" aria-label="Notifications" onClick={() => setIsAlertsOpen((prev) => !prev)} className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface border border-outline-variant">
                    <span className="material-symbols-outlined text-[18px]">notifications</span>
                    {clinicalAlerts.length > 0 && <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-error"></span>}
                  </button>
                  <button type="button" data-testid="header-new-consultation-button" onClick={() => setIsNewConsultationOpen(true)} className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-primary text-on-primary px-3 font-label-md text-label-md shadow-sm">New consultation</button>
                </div>
              </div>
              {isAlertsOpen && clinicalAlerts.length > 0 && (
                <div className="border-t border-surface-container-highest px-3 py-3 bg-surface-container-lowest">
                  <div className="space-y-2">
                    {clinicalAlerts.map((alert) => (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => handleNavigate(alert.module)}
                        className="w-full rounded-xl border border-surface-container-highest bg-surface-container-low p-3 text-left"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-label-sm text-label-sm text-on-surface">{alert.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${alert.severity === 'Critical' ? 'bg-error-container text-error' : 'bg-warning-container text-warning'}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{alert.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </header>
          )}

          {authDisabled ? (
            <div className="flex min-h-screen items-center justify-center bg-surface-container-lowest p-4">
              <div className="w-full max-w-md rounded-2xl border border-surface-container-highest bg-surface-container p-6 shadow-xl">
                <div className="mb-6">
                  <div className="font-headline-md text-headline-md text-on-surface">MediCare HMS</div>
                  <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    {authMode === 'register'
                      ? registerRole === 'doctor' ? 'Apply for a doctor account' : 'Create your secure patient account'
                      : 'Sign in to your secure healthcare portal'}
                  </div>
                </div>
                {authSuccess && <div data-testid="auth-success-message" role="status" className="mb-4 rounded-xl border border-tertiary/30 bg-tertiary-container px-3 py-2 font-body-sm text-body-sm text-on-tertiary-container">{authSuccess}</div>}
                <div className="mb-5 grid grid-cols-2 rounded-xl bg-surface-container-low p-1" role="tablist" aria-label="Authentication options">
                  <button
                    type="button"
                    data-testid="auth-login-tab"
                    role="tab"
                    aria-selected={authMode === 'login'}
                    onClick={() => openAuthPage('login')}
                    className={`rounded-lg px-3 py-2 font-label-md text-label-md ${authMode === 'login' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    data-testid="auth-register-tab"
                    role="tab"
                    aria-selected={authMode === 'register'}
                    onClick={() => openAuthPage('register')}
                    className={`rounded-lg px-3 py-2 font-label-md text-label-md ${authMode === 'register' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}
                  >
                    Create account
                  </button>
                </div>
                {authMode === 'register' ? (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="register-name" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Full name</label>
                      <input id="register-name" data-testid="register-name-input" type="text" autoComplete="name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required maxLength={100} className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-on-surface focus:border-primary outline-none" placeholder="Your full name" />
                    </div>
                    <div>
                      <label htmlFor="auth-email" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Email</label>
                      <input id="auth-email" data-testid="auth-email-input" type="email" autoComplete="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-on-surface focus:border-primary outline-none" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label htmlFor="register-role" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Account type</label>
                      <select id="register-role" data-testid="register-role-select" value={registerRole} onChange={(e) => setRegisterRole(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-on-surface focus:border-primary outline-none">
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor application</option>
                      </select>
                      <p className="mt-1 font-body-sm text-[12px] text-on-surface-variant">
                        {registerRole === 'doctor'
                          ? 'Doctor accounts require administrator verification before sign-in.'
                          : 'Reception, pharmacy, and administrator accounts are created by an administrator.'}
                      </p>
                    </div>
                    <div>
                      <label htmlFor="register-phone" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Phone</label>
                      <input id="register-phone" data-testid="register-phone-input" type="tel" autoComplete="tel" value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} required maxLength={30} className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-on-surface focus:border-primary outline-none" placeholder="Your phone number" />
                    </div>
                    <div>
                      <label htmlFor="register-password" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Password</label>
                      <input id="register-password" data-testid="register-password-input" type="password" autoComplete="new-password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-on-surface focus:border-primary outline-none" placeholder="At least 8 characters" />
                    </div>
                    <div>
                      <label htmlFor="register-password-confirm" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Confirm password</label>
                      <input id="register-password-confirm" data-testid="register-password-confirm-input" type="password" autoComplete="new-password" value={registerPasswordConfirm} onChange={(e) => setRegisterPasswordConfirm(e.target.value)} required minLength={8} className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-on-surface focus:border-primary outline-none" placeholder="Re-enter your password" />
                    </div>
                    {authError && <div data-testid="auth-error-message" role="alert" className="rounded-xl bg-error-container px-3 py-2 font-body-sm text-body-sm text-error">{authError}</div>}
                    <button type="submit" data-testid="auth-submit-button" disabled={authLoading} className="w-full rounded-xl bg-primary py-3 font-label-md text-label-md text-on-primary shadow-sm disabled:opacity-60">
                      {authLoading ? 'Creating account...' : registerRole === 'doctor' ? 'Submit doctor application' : 'Create patient account'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="auth-email" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Email</label>
                      <input id="auth-email" data-testid="auth-email-input" type="email" autoComplete="username" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-on-surface focus:border-primary outline-none" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label htmlFor="auth-password" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Password</label>
                      <input id="auth-password" data-testid="auth-password-input" type="password" autoComplete="current-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-on-surface focus:border-primary outline-none" placeholder="Enter password" />
                    </div>
                    {authError && <div data-testid="auth-error-message" role="alert" className="rounded-xl bg-error-container px-3 py-2 font-body-sm text-body-sm text-error">{authError}</div>}
                    <button type="submit" data-testid="auth-submit-button" disabled={authLoading} className="w-full rounded-xl bg-primary py-3 font-label-md text-label-md text-on-primary shadow-sm disabled:opacity-60">
                      {authLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <main className="content-panel w-full min-w-0 min-h-screen px-3 sm:px-space-md lg:px-space-lg py-3 sm:py-space-md lg:py-space-lg">
              {renderModuleContent()}
            </main>
          )}
        </div>
      </div>

      {isNewConsultationOpen && (
        <div className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setIsNewConsultationOpen(false)}>
          <div className="modal-content bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-space-lg shadow-2xl border border-outline-variant animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container mb-4">
              <div>
                <h3 className="font-title-md text-title-md text-on-surface font-bold">New Patient Consultation Intake</h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant">Directly syncs to EHR & queue engine</p>
              </div>
              <button type="button" onClick={() => setIsNewConsultationOpen(false)} className="text-on-surface-variant hover:text-on-surface"> <span className="material-symbols-outlined text-[20px]">close</span> </button>
            </div>
            <form onSubmit={handleCreateNewConsultation} className="flex flex-col gap-3 font-body-sm text-body-sm">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">Patient Full Name</label>
                <input type="text" required value={newConsultData.patientName} onChange={(e) => setNewConsultData({ ...newConsultData, patientName: e.target.value })} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">Age</label>
                  <input type="number" min="1" max="115" required value={newConsultData.age} onChange={(e) => setNewConsultData({ ...newConsultData, age: e.target.value })} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">Gender</label>
                  <select required value={newConsultData.gender} onChange={(e) => setNewConsultData({ ...newConsultData, gender: e.target.value })} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all cursor-pointer">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">Patient Phone</label>
                <input type="tel" required value={newConsultData.phone} onChange={(e) => setNewConsultData({ ...newConsultData, phone: e.target.value })} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">Clinical Department</label>
                  <select required value={newConsultData.department} onChange={(e) => setNewConsultData({ ...newConsultData, department: e.target.value })} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all cursor-pointer">
                    {DEPARTMENT_OPTIONS.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">Triage Priority</label>
                  <select value={newConsultData.priority} onChange={(e) => setNewConsultData({ ...newConsultData, priority: e.target.value })} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all cursor-pointer">
                    <option value="Urgent">Urgent / STAT</option>
                    <option value="Routine">Routine Outpatient</option>
                    <option value="Critical">Critical Triage</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">Attending Physician</label>
                <select required value={newConsultData.doctorName} onChange={(e) => setNewConsultData({ ...newConsultData, doctorName: e.target.value })} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all cursor-pointer">
                  <option value="">Select physician</option>
                  {(dashboardData?.doctors || []).map((doc) => (
                    <option key={doc._id} value={doc.name}>{doc.name} ({doc.specialty})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">Chief Complaint / Clinical Presentation</label>
                <textarea rows="3" placeholder="e.g. Provoked chest heaviness and palpitations upon exertion..." value={newConsultData.chiefComplaint} onChange={(e) => setNewConsultData({ ...newConsultData, chiefComplaint: e.target.value })} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none" />
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-surface-container">
                <button type="button" onClick={() => setIsNewConsultationOpen(false)} className="px-space-md py-2 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container">Cancel</button>
                <button type="submit" className="px-space-md py-2 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md shadow-sm transition-opacity">Start Consultation & Check-In</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}