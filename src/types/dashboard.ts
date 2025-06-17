// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// Dashboard stats types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

// Common response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Filter types
export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Activity types
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  userId: string;
  createdAt: string;
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Settings types
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  timezone: string;
}

// Business Hours Type
export interface BusinessHours {
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  start: string;
  end: string;
}

// Notification Settings Type
export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  undefined: boolean;
}

// Client Settings Type
export interface ClientSettings {
  business_hours: BusinessHours;
  language: string;
  logo_url: string;
  notification_settings: NotificationSettings;
  theme_color: string;
  timezone: string;
}

// Client Type
export interface Client {
  id: string;
  name: string;
  legal_name: string;
  office_address: string;
  active: boolean;
  default_currency: string;
  default_tax_rate: number;
  settings: ClientSettings;
  created_at: string;
  updated_at: string;
}

// Legal Customer Type
export interface LegalCustomer {
  id: string;
  client_id: string;
  legal_name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

// TimeLog Type
export interface TimeLog {
  id: string;
  user_id: string;
  client_id: string;
  legal_customers_id: string;
  billable_hours: number | null;
  task_description: string;
  status: string;
  amount: number;
  date: string;
  created_at: string;
  updated_at: string;
}

// Invoice Type
export interface Invoice {
  id: string;
  client_id: string;
  customer_id: string;
  total: number;
  currency: string;
  date_generated: string;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

// Auth API Responses
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// User API Responses
export interface UserProfileResponse {
  user: User;
  settings: UserSettings;
  stats: {
    lastLogin: string;
    totalLogins: number;
    accountAge: string;
  };
}

export interface UpdateUserResponse {
  user: User;
  message: string;
}

// Dashboard API Responses
export interface DashboardOverviewResponse {
  stats: DashboardStats;
  recentActivities: Activity[];
  topUsers: Array<{
    user: User;
    activityCount: number;
  }>;
}

export interface ActivityLogResponse extends PaginatedResponse<Activity> {
  summary: {
    totalActivities: number;
    activitiesByType: Record<ActivityType, number>;
  };
}

// Analytics API Responses
export interface AnalyticsResponse {
  dailyStats: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
    revenue: number;
  }>;
  monthlyStats: Array<{
    month: string;
    activeUsers: number;
    newUsers: number;
    revenue: number;
  }>;
  topMetrics: {
    peakUsers: number;
    peakRevenue: number;
    averageSessionDuration: number;
  };
}

// Settings API Responses
export interface UpdateSettingsResponse {
  settings: UserSettings;
  message: string;
}

// Search API Responses
export interface SearchResponse<T> {
  results: T[];
  total: number;
  filters: {
    categories: string[];
    dateRange: {
      start: string;
      end: string;
    };
  };
}

// Notification API Responses
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse extends PaginatedResponse<Notification> {
  unreadCount: number;
}

// Export/Import API Responses
export interface ExportResponse {
  downloadUrl: string;
  expiresAt: string;
  fileSize: number;
}

export interface ImportResponse {
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
}

// Client API Responses
export interface ClientsResponse {
  clients: Client[];
}

// Legal Customer API Responses
export interface LegalCustomersResponse {
  legal_customers: LegalCustomer[];
}

export interface LegalCustomerResponse {
  legal_customer: LegalCustomer;
}

// Time Log API Responses
export interface TimeLogsResponse {
  work_logs: TimeLog[];
}

// Invoice API Responses
export interface InvoicesResponse {
  invoices: Invoice[];
} 