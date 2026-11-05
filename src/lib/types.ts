export type ServiceCategory = "graphic_design" | "web_development" | "software_engineering";

export type BillingType = "monthly" | "per_project" | "hybrid";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "late_paid";

export type ProjectStatus = "in_progress" | "completed" | "on_hold";

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  business_name?: string;
  category: ServiceCategory;
  billing_type: BillingType;
  monthly_amount: number;
  cycle_reset_day: number; // 1 to 31
  status: "active" | "paused" | "archived";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectItem {
  id: string;
  project_id: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  client_name?: string;
  client_business?: string;
  title: string;
  category: ServiceCategory;
  description?: string;
  is_extra_project: number; // 1 or 0
  status: ProjectStatus;
  discount: number;
  discount_type: "fixed" | "percentage";
  total_amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  due_date?: string;
  paid_at?: string;
  items?: ProjectItem[];
  created_at: string;
  updated_at: string;
}

export interface MonthlyCycle {
  id: string;
  client_id: string;
  client_name?: string;
  client_business?: string;
  category?: ServiceCategory;
  cycle_reset_day?: number;
  period_start: string;
  period_end: string;
  amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  due_date: string;
  paid_at?: string;
  days_late: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItemSnapshot {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name?: string;
  client_business?: string;
  client_email?: string;
  client_phone?: string;
  client_category?: ServiceCategory;
  project_id?: string;
  project_title?: string;
  cycle_id?: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "partial" | "late_paid" | "overdue";
  subtotal: number;
  discount: number;
  grand_total: number;
  paid_amount: number;
  currency: string;
  show_breakdown: number; // 1 = show breakdown, 0 = summary only
  include_bank_info: number;
  include_monthly_retainer: number;
  items_json?: string;
  items?: InvoiceItemSnapshot[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  type: "cycle_reset" | "payment_due" | "payment_late" | "system";
  client_id?: string;
  title: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  tagline: string;
  email: string;
  whatsapp: string;
  instagram: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  easypaisa_title: string;
  easypaisa_number: string;
  currency: string;
  currency_symbol: string;
  updated_at: string;
}

export interface DashboardStats {
  totalEarnings: number;
  earnedThisMonth: number;
  paymentsDue: number;
  totalClients: number;
  activeClientsCount: number;
  categoryCounts: {
    graphic_design: number;
    web_development: number;
    software_engineering: number;
  };
  averageMonthlyEarning: number;
  averageDaysLate: number;
  overdueCyclesCount: number;
  activeProjectsCount: number;
  clientReliability: {
    client_id: string;
    client_name: string;
    business_name: string;
    category: ServiceCategory;
    cycle_reset_day?: number;
    average_days_late: number;
    max_days_late?: number;
    on_time_ratio: number;
    total_cycles_paid: number;
    status: "prompt" | "moderate" | "frequently_late";
  }[];
}
