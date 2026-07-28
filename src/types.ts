export type Role = 'Admin' | 'Sales Team' | 'Accounts Team' | 'HR';
export type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected';
export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: Role;
  passwordHash: string;
  approvalStatus: ApprovalStatus;
  accountStatus: UserStatus;
  createdOn: string;
}

export type IndustryType = 'Steel' | 'Chemical' | 'Galvanizing' | 'Cement' | 'Power' | 'Other' | string;

export interface Address {
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface PlantAddress {
  id: string;
  plantAddress: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface GSTMapping {
  state: string;
  gstin: string;
}

export interface EquipmentItem {
  id: string;
  equipmentName: string;
  quantity: number;
}

export interface AcidSpec {
  id: string;
  acidName: string;
  remarks: string;
}

export interface ProductMatrix {
  refractoryInsulation: {
    ceramicFiberBlankets: boolean;
    ceramicFiberPaper: boolean;
    ceramicFiberBoards: boolean;
    ceramicFiberModules: boolean;
    others: boolean;
  };
  refractoryBricks: {
    highAluminaBricks: boolean;
    insulationBricks: boolean;
    fireBricks: boolean;
    magnesiaBricks: boolean;
    magnesiteBricks: boolean;
    others: boolean;
  };
  refractoryMaterials: {
    mortars: boolean;
    anchors: boolean;
    fireclay: boolean;
    asbestosMillBoard: boolean;
    others: boolean;
  };
  acidResistantMaterials: {
    arBrick: boolean;
    arTile: boolean;
    arMortar: boolean;
    arEpoxyFloor: boolean;
    arEpoxyPaint: boolean;
    others: boolean;
  };
  industrialTilesBricks: {
    industrialTiles: boolean;
    parkingTiles: boolean;
    floorTiles: boolean;
    adhesives: boolean;
    others: boolean;
  };
  othersRemarks: string;
}

export type DocumentType = 'PO' | 'PI' | 'Invoice';

export interface FinancialDocument {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  documentDate: string;
  fileUrl: string; // Base64 or object URL or photo
  fileName: string;
}

export type RelationshipType = 'Client/Customer' | 'Vendor/Supplier';
export type AccountStatus = 'Prospect' | 'Verified Active Customer';

export interface Company {
  id: string;
  companyName: string;
  industryType: IndustryType;
  customIndustry?: string;
  registeredAddress: Address;
  plants: PlantAddress[];
  gstMappings: GSTMapping[];
  panNumber: string;
  leadSource: string; // Customer Reference Source
  applicatorName?: string;
  otherReferenceDetails?: string;
  equipments: EquipmentItem[];
  acidSpecs: AcidSpec[];
  acidSectionRemarks: string;
  productsMatrix: ProductMatrix;
  financialDocuments: FinancialDocument[];
  relationshipType: RelationshipType;
  accountStatus: AccountStatus; // Derived: Prospect (Yellow) vs Verified Active Customer (Green) or Vendor (Blue)
  createdOn: string;
}

export type Salutation = 'Mr.' | 'Ms.' | 'Dr.' | 'Er.' | 'Shri';
export type PhoneTag = 'Personal' | 'Office' | 'Home' | 'Plant';
export type EmploymentStatus = 'Active' | 'Left Job' | 'Inactive' | 'Department Change';

export interface PhoneEntry {
  number: string;
  tag: PhoneTag;
}

export interface EmploymentHistoryEntry {
  id: string;
  companyName: string;
  companyId?: string;
  designation: string;
  startDate: string;
  endDate: string;
}

export interface Contact {
  id: string;
  salutation: Salutation;
  fullName: string;
  mobile1: PhoneEntry;
  mobile2: PhoneEntry;
  landline: PhoneEntry;
  internationalNo: string;
  email1: string;
  email2: string;
  designation: string;
  currentCompanyId: string | null; // NULL if unlinked
  currentCompanyName: string;
  employmentStatus: EmploymentStatus;
  createdOn: string;
  inactiveDate?: string;
  visitingCardFront?: string;
  visitingCardBack?: string;
  employmentHistory: EmploymentHistoryEntry[];
}

export type PurposeOfVisit = 'Cold Call' | 'Routine Visit' | 'Quotation Discussion' | 'Material Delivery' | 'Complaint Resolution' | 'Payment Collection' | string;

export interface VisitRecord {
  id: string;
  visitDateTime: string; // ISO string
  salespersonId: string;
  salespersonName: string;
  companyId: string;
  companyName: string;
  contactPersonId: string;
  contactPersonName: string;
  purpose: PurposeOfVisit;
  customPurpose?: string;
  discussionMOM: string;
  nextActionItem: string;
  followUpDate: string; // DD-MMM-YYYY format
  followUpStatus?: 'Pending' | 'Completed' | 'Rescheduled';
  followUpRescheduleRemarks?: string;
}

export interface DocumentAccessLog {
  id: string;
  userName: string;
  userEmail: string;
  companyName: string;
  documentNumber: string;
  documentType: DocumentType;
  timestamp: string;
}

// Vouchers & HR Types
export interface ExpenseItem {
  id: string;
  category: 'Travel' | 'Food' | 'Client Meeting' | 'Lodging' | 'Material Purchase' | 'Misc';
  amount: number;
  remarks: string;
  receiptImage?: string;
}

export interface ExpenseVoucher {
  id: string;
  voucherNo: string;
  date: string;
  submittedBy: string;
  salespersonMobile?: string;
  visitDetails?: string;
  items: ExpenseItem[];
  totalAmount: number;
  category?: string; // Backwards compatibility
  amount?: number;   // Backwards compatibility
  remarks?: string;  // Backwards compatibility
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface MaterialVoucherItem {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  price?: number;
  totalPrice?: number;
}

export interface MaterialVoucher {
  id: string;
  voucherNo: string;
  type: 'Loading' | 'Unloading';
  date: string;
  vehicleNo: string;
  transporterName: string;
  items: MaterialVoucherItem[];
  handledBy: string;
  paidBy: 'Sandeep' | 'Akhil' | 'Roli' | 'Ajay' | 'Refco India' | 'Others' | string;
  driverName: string;
  driverMobile?: string;
  remarks: string;
  totalQuantitySummary?: string;
  totalItemCount?: number;
  totalQuantity?: number;
  totalPrice?: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
  status: 'Present' | 'Half Day' | 'On Field Visit' | 'Absent';
  location?: string;
  selfieUrl?: string;
  notes?: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  monthYear: string; // e.g. "2026-07"
  baseSalary: number;
  workingDays: number;
  attendedDays: number;
  advanceTaken: number;
  netPayable: number;
  calculatedOn: string;
}

export interface ProductDataSheet {
  id: string;
  title: string;
  category: string;
  temperatureRating: string;
  keyFeatures: string[];
  pdfUrl?: string;
  pdfFileName?: string;
  description: string;
}
