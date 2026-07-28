import React, { useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, getCompanies, initDatabase } from './services/dbService';
import { User, Company } from './types';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ContactsPage } from './components/ContactsPage';
import { VisitsAndRemindersTab } from './components/VisitsAndRemindersTab';
import { CalculatorsTab } from './components/CalculatorsTab';
import { VouchersTab } from './components/VouchersTab';
import { HRAttendanceModule } from './components/HRAttendanceModule';
import { CompanyProfileView } from './components/CompanyProfileView';
import { CompanyForm } from './components/CompanyForm';
import { ContactForm } from './components/ContactForm';
import { VisitRecordForm } from './components/VisitRecordForm';
import { AdminApprovalPanel } from './components/AdminApprovalPanel';
import { AddNewModal } from './components/AddNewModal';
import { BottomNav, MainTabType } from './components/BottomNav';

export default function App() {
  const [currentUser, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);

  // Main View Mode
  const [currentView, setCurrentView] = useState<'dashboard' | 'company_profile' | 'company_form' | 'contact_form' | 'visit_form'>('dashboard');

  // Bottom Nav Main Page Tab
  const [mainTab, setMainTab] = useState<MainTabType>('contacts');

  // Selected Entity State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [prefilledCompanyIdForContact, setPrefilledCompanyIdForContact] = useState<string | null>(null);
  const [prefilledCompanyIdForVisit, setPrefilledCompanyIdForVisit] = useState<string | null>(null);

  useEffect(() => {
    initDatabase();
    const active = getCurrentUser();
    if (active) {
      setUser(active);
    } else {
      setIsAuthModalOpen(true);
    }
  }, []);

  const handleSignOut = () => {
    setCurrentUser(null);
    setUser(null);
    setIsAuthModalOpen(true);
  };

  const handleSelectCompany = (comp: Company) => {
    setSelectedCompany(comp);
    setCurrentView('company_profile');
  };

  const handleSelectCompanyById = (companyId: string) => {
    const companies = getCompanies();
    const comp = companies.find(c => c.id === companyId);
    if (comp) {
      setSelectedCompany(comp);
      setCurrentView('company_profile');
    }
  };

  const handleStartNewCompany = () => {
    setEditingCompany(null);
    setCurrentView('company_form');
  };

  const handleCompanySaved = (newComp: Company) => {
    setSelectedCompany(newComp);
    setPrefilledCompanyIdForContact(newComp.id);
    setCurrentView('contact_form'); // Upon saving new company, redirect immediately to Contact Form
  };

  const handleAddPersonToCompany = (companyId: string) => {
    setPrefilledCompanyIdForContact(companyId);
    setCurrentView('contact_form');
  };

  const handleLogVisitForCompany = (companyId: string) => {
    setPrefilledCompanyIdForVisit(companyId);
    setCurrentView('visit_form');
  };

  const handleAddNewOptionSelect = (option: 'company' | 'contact' | 'visit') => {
    if (option === 'company') {
      handleStartNewCompany();
    } else if (option === 'contact') {
      setPrefilledCompanyIdForContact(null);
      setCurrentView('contact_form');
    } else if (option === 'visit') {
      setPrefilledCompanyIdForVisit(null);
      setCurrentView('visit_form');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased relative">
      
      {/* App Header */}
      <Header
        user={currentUser}
        onSignOut={handleSignOut}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Content Area - includes padding bottom so content isn't obscured by fixed bottom nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28 sm:pb-24 space-y-6">
        
        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div>
            {/* 1. CONTACTS (Search & Directory, Unlinked Contacts, All Contacts for Admin) */}
            {mainTab === 'contacts' && (
              <ContactsPage
                currentUser={currentUser}
                onSelectCompany={handleSelectCompany}
                onRegisterNewCompany={handleStartNewCompany}
                onOpenAdminAuth={() => setIsAdminPanelOpen(true)}
                onSelectCompanyById={handleSelectCompanyById}
              />
            )}

            {/* 2. VISITS & FOLLOW-UPS */}
            {mainTab === 'visits' && (
              <VisitsAndRemindersTab
                onLogNewVisit={() => setCurrentView('visit_form')}
              />
            )}

            {/* 3. CALCULATORS */}
            {mainTab === 'calculators' && <CalculatorsTab />}

            {/* 4. VOUCHERS */}
            {mainTab === 'vouchers' && <VouchersTab />}

            {/* 5. HR & FIELD OPS */}
            {mainTab === 'hr' && <HRAttendanceModule />}
          </div>
        )}

        {/* COMPANY PROFILE VIEW */}
        {currentView === 'company_profile' && selectedCompany && (
          <CompanyProfileView
            company={selectedCompany}
            onBack={() => setCurrentView('dashboard')}
            onAddContact={handleAddPersonToCompany}
            onLogVisit={handleLogVisitForCompany}
          />
        )}

        {/* NEW COMPANY FORM */}
        {currentView === 'company_form' && (
          <CompanyForm
            initialCompany={editingCompany}
            onSavedSuccess={handleCompanySaved}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {/* CONTACT FORM */}
        {currentView === 'contact_form' && (
          <ContactForm
            prefilledCompanyId={prefilledCompanyIdForContact}
            onFinished={() => setCurrentView('dashboard')}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {/* VISIT FORM */}
        {currentView === 'visit_form' && (
          <VisitRecordForm
            prefilledCompanyId={prefilledCompanyIdForVisit || undefined}
            onSaved={() => setCurrentView('dashboard')}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR (PAGES AT BOTTOM, NOT ON TOP) */}
      <BottomNav
        activeTab={mainTab}
        onChangeTab={(tab) => {
          setMainTab(tab);
          setCurrentView('dashboard');
        }}
        onOpenAddNew={() => setIsAddNewModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onLoginSuccess={(u) => {
          setUser(u);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Admin Panel Modal Overlay */}
      <AdminApprovalPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      {/* Add New Record Overlay Modal */}
      <AddNewModal
        isOpen={isAddNewModalOpen}
        onClose={() => setIsAddNewModalOpen(false)}
        onSelectOption={handleAddNewOptionSelect}
      />
    </div>
  );
}
