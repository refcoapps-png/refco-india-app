import {
  User, Company, Contact, VisitRecord, DocumentAccessLog,
  ExpenseVoucher, MaterialVoucher, AttendanceRecord, SalaryRecord, ProductDataSheet
} from '../types';

const USERS_KEY = 'refco_users_v2';
const COMPANIES_KEY = 'refco_companies_v2';
const CONTACTS_KEY = 'refco_contacts_v2';
const VISITS_KEY = 'refco_visits_v2';
const ACCESS_LOGS_KEY = 'refco_access_logs_v2';
const EXPENSES_KEY = 'refco_expenses_v2';
const MATERIALS_VOUCHERS_KEY = 'refco_material_vouchers_v2';
const ATTENDANCE_KEY = 'refco_attendance_v2';
const SALARY_KEY = 'refco_salary_v2';
const CURRENT_USER_KEY = 'refco_current_user_v2';

// Helper to seed initial data if empty
export function initDatabase() {
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers: User[] = [
      {
        id: 'usr_admin',
        fullName: 'Master Admin',
        email: 'info@refcoindia.com',
        mobile: '9825001122',
        role: 'Admin',
        passwordHash: 'Ajay@1234',
        approvalStatus: 'Approved',
        accountStatus: 'Active',
        createdOn: new Date().toISOString()
      },
      {
        id: 'usr_sales_1',
        fullName: 'Rajesh Sharma',
        email: 'rajesh.sales@refcoindia.com',
        mobile: '9898123456',
        role: 'Sales Team',
        passwordHash: 'Sales@123',
        approvalStatus: 'Approved',
        accountStatus: 'Active',
        createdOn: new Date().toISOString()
      },
      {
        id: 'usr_accounts_1',
        fullName: 'Priya Patel',
        email: 'accounts@refcoindia.com',
        mobile: '9825456789',
        role: 'Accounts Team',
        passwordHash: 'Accounts@123',
        approvalStatus: 'Approved',
        accountStatus: 'Active',
        createdOn: new Date().toISOString()
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(COMPANIES_KEY)) {
    const defaultCompanies: Company[] = [
      {
        id: 'comp_1',
        companyName: 'Gujarat Steel & Galvanizing Works Ltd',
        industryType: 'Galvanizing',
        registeredAddress: {
          addressLine: 'Plot No. 45, GIDC Industrial Estate',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pinCode: '380015'
        },
        plants: [
          {
            id: 'plant_1',
            plantAddress: 'Phase 2 Extension, Vatva GIDC',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pinCode: '380015'
          }
        ],
        gstMappings: [
          { state: 'Gujarat', gstin: '24AAAAA0000A1Z5' }
        ],
        panNumber: 'AAAAA0000A',
        leadSource: 'Direct Visit / Cold Call',
        equipments: [
          { id: 'eq_1', equipmentName: 'Galvanizing Line', quantity: 2 },
          { id: 'eq_2', equipmentName: 'Acid Tank', quantity: 4 },
          { id: 'eq_3', equipmentName: 'Pickling Tank', quantity: 3 }
        ],
        acidSpecs: [
          { id: 'acid_1', acidName: 'HCl', remarks: 'Concentration 30%, Temp 45 C in Pickling Area' }
        ],
        acidSectionRemarks: 'Heavy acid bath fumes. Requires acid resistant tile lining with AR Epoxy Mortar.',
        productsMatrix: {
          refractoryInsulation: {
            ceramicFiberBlankets: true,
            ceramicFiberPaper: false,
            ceramicFiberBoards: true,
            ceramicFiberModules: false,
            others: false
          },
          refractoryBricks: {
            highAluminaBricks: true,
            insulationBricks: true,
            fireBricks: false,
            magnesiaBricks: false,
            magnesiteBricks: false,
            others: false
          },
          refractoryMaterials: {
            mortars: true,
            anchors: true,
            fireclay: false,
            asbestosMillBoard: false,
            others: false
          },
          acidResistantMaterials: {
            arBrick: true,
            arTile: true,
            arMortar: true,
            arEpoxyFloor: true,
            arEpoxyPaint: false,
            others: false
          },
          industrialTilesBricks: {
            industrialTiles: true,
            parkingTiles: false,
            floorTiles: false,
            adhesives: true,
            others: false
          },
          othersRemarks: 'High durability coating needed'
        },
        financialDocuments: [
          {
            id: 'doc_1',
            documentType: 'PO',
            documentNumber: 'PO/2026/GSG/089',
            documentDate: '2026-07-15',
            fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
            fileName: 'PO_GSG_July2026.pdf'
          }
        ],
        relationshipType: 'Client/Customer',
        accountStatus: 'Verified Active Customer',
        createdOn: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'comp_2',
        companyName: 'Surat Chemical Processing Hub',
        industryType: 'Chemical',
        registeredAddress: {
          addressLine: '88 Hazira Industrial Zone',
          city: 'Surat',
          state: 'Gujarat',
          pinCode: '395003'
        },
        plants: [],
        gstMappings: [
          { state: 'Gujarat', gstin: '24BBBBB1111B1Z2' }
        ],
        panNumber: 'BBBBB1111B',
        leadSource: 'Applicator',
        applicatorName: 'Shree Sai Insulation Services',
        equipments: [
          { id: 'eq_c1', equipmentName: 'Acid Tank', quantity: 6 }
        ],
        acidSpecs: [
          { id: 'acid_c1', acidName: 'H2SO4', remarks: 'Sulphuric acid storage' }
        ],
        acidSectionRemarks: 'Requires 38mm Acid Resistant Tiles with Silica Mortar.',
        productsMatrix: {
          refractoryInsulation: { ceramicFiberBlankets: false, ceramicFiberPaper: false, ceramicFiberBoards: false, ceramicFiberModules: false, others: false },
          refractoryBricks: { highAluminaBricks: false, insulationBricks: false, fireBricks: false, magnesiaBricks: false, magnesiteBricks: false, others: false },
          refractoryMaterials: { mortars: false, anchors: false, fireclay: false, asbestosMillBoard: false, others: false },
          acidResistantMaterials: { arBrick: true, arTile: true, arMortar: true, arEpoxyFloor: false, arEpoxyPaint: false, others: false },
          industrialTilesBricks: { industrialTiles: false, parkingTiles: false, floorTiles: false, adhesives: false, others: false },
          othersRemarks: 'Quotation sent for AR Brick lining'
        },
        financialDocuments: [],
        relationshipType: 'Client/Customer',
        accountStatus: 'Prospect',
        createdOn: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 'comp_3',
        companyName: 'Raw Materials & Minerals Supplier Co',
        industryType: 'Other',
        customIndustry: 'Mining & Minerals',
        registeredAddress: {
          addressLine: '102 Trade Tower, Near Express Highway',
          city: 'Vadodara',
          state: 'Gujarat',
          pinCode: '390001'
        },
        plants: [],
        gstMappings: [],
        panNumber: 'CCCCC2222C',
        leadSource: 'IndiaMart',
        equipments: [],
        acidSpecs: [],
        acidSectionRemarks: '',
        productsMatrix: {
          refractoryInsulation: { ceramicFiberBlankets: false, ceramicFiberPaper: false, ceramicFiberBoards: false, ceramicFiberModules: false, others: false },
          refractoryBricks: { highAluminaBricks: false, insulationBricks: false, fireBricks: false, magnesiaBricks: false, magnesiteBricks: false, others: false },
          refractoryMaterials: { mortars: true, anchors: false, fireclay: true, asbestosMillBoard: false, others: false },
          acidResistantMaterials: { arBrick: false, arTile: false, arMortar: false, arEpoxyFloor: false, arEpoxyPaint: false, others: false },
          industrialTilesBricks: { industrialTiles: false, parkingTiles: false, floorTiles: false, adhesives: false, others: false },
          othersRemarks: 'Raw Bauxite supplier'
        },
        financialDocuments: [],
        relationshipType: 'Vendor/Supplier',
        accountStatus: 'Prospect',
        createdOn: new Date(Date.now() - 60 * 86400000).toISOString()
      }
    ];
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(defaultCompanies));
  }

  if (!localStorage.getItem(CONTACTS_KEY)) {
    const defaultContacts: Contact[] = [
      {
        id: 'cnt_1',
        salutation: 'Mr.',
        fullName: 'Vikram Mehta',
        mobile1: { number: '9825123411', tag: 'Office' },
        mobile2: { number: '9426011223', tag: 'Personal' },
        landline: { number: '0792583001', tag: 'Office' },
        internationalNo: '',
        email1: 'vikram@gujaratsteel.com',
        email2: '',
        designation: 'Plant Head',
        currentCompanyId: 'comp_1',
        currentCompanyName: 'Gujarat Steel & Galvanizing Works Ltd',
        employmentStatus: 'Active',
        createdOn: new Date(Date.now() - 25 * 86400000).toISOString(),
        visitingCardFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=60',
        employmentHistory: [
          {
            id: 'h_1',
            companyName: 'Gujarat Steel & Galvanizing Works Ltd',
            companyId: 'comp_1',
            designation: 'Plant Head',
            startDate: new Date(Date.now() - 25 * 86400000).toISOString(),
            endDate: 'Present'
          }
        ]
      },
      {
        id: 'cnt_2',
        salutation: 'Er.',
        fullName: 'Anil Kumar Trivedi',
        mobile1: { number: '9898099887', tag: 'Office' },
        mobile2: { number: '', tag: 'Personal' },
        landline: { number: '', tag: 'Office' },
        internationalNo: '',
        email1: 'anil.trivedi@suratchem.org',
        email2: '',
        designation: 'Maintenance Engineer',
        currentCompanyId: 'comp_2',
        currentCompanyName: 'Surat Chemical Processing Hub',
        employmentStatus: 'Active',
        createdOn: new Date(Date.now() - 10 * 86400000).toISOString(),
        employmentHistory: [
          {
            id: 'h_2',
            companyName: 'Surat Chemical Processing Hub',
            companyId: 'comp_2',
            designation: 'Maintenance Engineer',
            startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
            endDate: 'Present'
          }
        ]
      },
      {
        id: 'cnt_unlinked_1',
        salutation: 'Mr.',
        fullName: 'Ramesh Varma',
        mobile1: { number: '9876543210', tag: 'Personal' },
        mobile2: { number: '', tag: 'Personal' },
        landline: { number: '', tag: 'Office' },
        internationalNo: '',
        email1: 'ramesh.varma@gmail.com',
        email2: '',
        designation: 'Purchase Manager',
        currentCompanyId: null,
        currentCompanyName: 'Unlinked',
        employmentStatus: 'Left Job',
        createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
        inactiveDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        employmentHistory: [
          {
            id: 'h_3',
            companyName: 'Reliance Industries Hazira Plant',
            companyId: 'comp_past_rel',
            designation: 'Purchase Manager',
            startDate: new Date(Date.now() - 90 * 86400000).toISOString(),
            endDate: new Date(Date.now() - 10 * 86400000).toISOString()
          }
        ]
      }
    ];
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(defaultContacts));
  }

  if (!localStorage.getItem(VISITS_KEY)) {
    const today = new Date().toISOString().split('T')[0];
    const defaultVisits: VisitRecord[] = [
      {
        id: 'v_1',
        visitDateTime: new Date().toISOString(),
        salespersonId: 'usr_sales_1',
        salespersonName: 'Rajesh Sharma',
        companyId: 'comp_1',
        companyName: 'Gujarat Steel & Galvanizing Works Ltd',
        contactPersonId: 'cnt_1',
        contactPersonName: 'Mr. Vikram Mehta',
        purpose: 'Quotation Discussion',
        discussionMOM: 'Discussed supply of 500 SQM Acid Resistant Tiles & 2 Tons High Alumina Mortar for Pickling tank maintenance. Client accepted technical parameters.',
        nextActionItem: 'Submit revised PO copy with payment terms',
        followUpDate: '28-Jul-2026',
        followUpStatus: 'Pending'
      }
    ];
    localStorage.setItem(VISITS_KEY, JSON.stringify(defaultVisits));
  }

  if (!localStorage.getItem(ACCESS_LOGS_KEY)) {
    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify([]));
  }
}

// Data Getters & Setters
export function getUsers(): User[] {
  initDatabase();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  const str = localStorage.getItem(CURRENT_USER_KEY);
  if (!str) {
    // Default logged in as master admin if no user stored
    const admin = getUsers().find(u => u.email === 'info@refcoindia.com');
    if (admin) setCurrentUser(admin);
    return admin || null;
  }
  return JSON.parse(str);
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCompanies(): Company[] {
  initDatabase();
  return JSON.parse(localStorage.getItem(COMPANIES_KEY) || '[]');
}

export function saveCompanies(companies: Company[]) {
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
}

export function getContacts(): Contact[] {
  initDatabase();
  return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
}

export function saveContacts(contacts: Contact[]) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export function getVisits(): VisitRecord[] {
  initDatabase();
  return JSON.parse(localStorage.getItem(VISITS_KEY) || '[]');
}

export function saveVisits(visits: VisitRecord[]) {
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
}

export function getAccessLogs(): DocumentAccessLog[] {
  initDatabase();
  return JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
}

export function logDocumentAccess(entry: Omit<DocumentAccessLog, 'id' | 'timestamp'>) {
  const logs = getAccessLogs();
  const newLog: DocumentAccessLog = {
    ...entry,
    id: 'log_' + Date.now(),
    timestamp: new Date().toLocaleString('en-IN')
  };
  logs.unshift(newLog);
  localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(logs));
}

export function getExpenses(): ExpenseVoucher[] {
  return JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]');
}

export function saveExpenses(expenses: ExpenseVoucher[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function getMaterialVouchers(): MaterialVoucher[] {
  return JSON.parse(localStorage.getItem(MATERIALS_VOUCHERS_KEY) || '[]');
}

export function saveMaterialVouchers(vouchers: MaterialVoucher[]) {
  localStorage.setItem(MATERIALS_VOUCHERS_KEY, JSON.stringify(vouchers));
}

export function getAttendanceRecords(): AttendanceRecord[] {
  return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
}

export function saveAttendanceRecords(records: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

export function getSalaryRecords(): SalaryRecord[] {
  return JSON.parse(localStorage.getItem(SALARY_KEY) || '[]');
}

export function saveSalaryRecords(records: SalaryRecord[]) {
  localStorage.setItem(SALARY_KEY, JSON.stringify(records));
}

// Custom Staff / Master Dropdown Entries
const MASTER_STAFF_KEY = 'refco_master_staff_v2';

export function getMasterStaffNames(): string[] {
  const stored = localStorage.getItem(MASTER_STAFF_KEY);
  if (!stored) {
    const defaultStaff = ['Sandeep', 'Akhil', 'Roli', 'Ajay', 'Refco India', 'Warehouse Incharge', 'Supervisor'];
    localStorage.setItem(MASTER_STAFF_KEY, JSON.stringify(defaultStaff));
    return defaultStaff;
  }
  return JSON.parse(stored);
}

export function addMasterStaffName(newName: string): string[] {
  const current = getMasterStaffNames();
  if (newName && !current.includes(newName.trim())) {
    const updated = [...current, newName.trim()];
    localStorage.setItem(MASTER_STAFF_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
}

// Product Datasheets Seed Data & LocalStorage Management
const DATASHEETS_KEY = 'refco_datasheets_v2';

export const REFCO_PRODUCT_DATASHEETS: ProductDataSheet[] = [
  {
    id: 'ds_1',
    title: 'Refco AR Ceramic Tiles & Bricks',
    category: 'Acid Resistant Materials',
    temperatureRating: 'Up to 900 °C',
    keyFeatures: [
      'Resistant to all industrial acids (HCl, H2SO4, HNO3) except hydrofluoric',
      'Water absorption < 0.5%',
      'High compressive strength (> 700 kg/cm2)',
      'Available in 15mm, 20mm, 25mm, 38mm thickness'
    ],
    description: 'Refco Acid Resistant Tiles and Bricks are manufactured from special grade non-vitrified clays and fired at high temperatures to provide maximum acid protection in pickling tanks, industrial flooring, and chimneys.'
  },
  {
    id: 'ds_2',
    title: 'Refco High Alumina Bricks (HA-70 & HA-80)',
    category: 'Refractory Bricks',
    temperatureRating: '1600 °C - 1750 °C',
    keyFeatures: [
      'Alumina content 70% to 80%',
      'High cold crushing strength',
      'Excellent thermal shock resistance',
      'Low thermal conductivity & creep'
    ],
    description: 'High Alumina refractory bricks designed for extreme temperatures in steel ladles, cement rotary kilns, glass furnace regenerators, and chemical incinerators.'
  },
  {
    id: 'ds_3',
    title: 'Refco Ceramic Fiber Blanket (1260°C & 1420°C)',
    category: 'Refractory Insulation',
    temperatureRating: '1260 °C / 1420 °C',
    keyFeatures: [
      'Lightweight thermal insulation',
      'High tensile strength & flexibility',
      'Low heat storage capacity',
      'Density: 64, 96, 128 kg/m3'
    ],
    description: 'Needled flexible insulation blankets made from pure spun alumina-silica fibers, widely used in furnace linings, boiler insulation, and pipe wrapping.'
  },
  {
    id: 'ds_4',
    title: 'Refco Potassium Silicate & Epoxy AR Mortar',
    category: 'Acid Resistant Mortars',
    temperatureRating: 'Up to 1000 °C (Silicate) / 120 °C (Epoxy)',
    keyFeatures: [
      '100% Acid proof jointing compound',
      'Two-component resin & powder system',
      'Fast setting with high bond strength',
      'Zero shrinkage in chemical environment'
    ],
    description: 'Specialty jointing mortar for laying Acid Resistant Bricks & Tiles in chemical processing units, pickling plants, and effluent treatment plants.'
  }
];

export function getProductDataSheets(): ProductDataSheet[] {
  const stored = localStorage.getItem(DATASHEETS_KEY);
  if (!stored) {
    localStorage.setItem(DATASHEETS_KEY, JSON.stringify(REFCO_PRODUCT_DATASHEETS));
    return REFCO_PRODUCT_DATASHEETS;
  }
  return JSON.parse(stored);
}

export function saveProductDataSheets(sheets: ProductDataSheet[]) {
  localStorage.setItem(DATASHEETS_KEY, JSON.stringify(sheets));
}
