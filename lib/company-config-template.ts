/**
 * Default Company Configuration Template
 * Used as fallback and as template for new NBFC companies
 */

export const defaultCompany = {
  // Basic Company Information
  name: 'Your NBFC Name',
  fullName: 'Your NBFC Full Legal Name',
  tagline: 'Your Trusted Financial Partner',
  
  // Branding
  logo: {
    text: 'YN',
    icon: 'banknote',
  },
  
  // Contact Information
  contact: {
    email: 'support@yournbfc.com',
    phone: '+91-1800-000-0000',
    address: '123 Business District, City, State 000000',
  },
  
  // Theme Colors
  theme: {
    primary: 'blue',
    primaryHover: 'blue-800',
    primaryBg: 'blue-900',
    primaryLight: 'blue-100',
    primaryText: 'blue-600',
    secondary: 'emerald',
  },
  
  // License & Registration
  registration: {
    rbiLicense: 'NBFC-XXXXX',
    cin: 'UXXXXXXXXXXXXXX',
  },
  
  // Social Links
  social: {
    website: 'https://www.yournbfc.com',
    linkedin: 'https://linkedin.com/company/yournbfc',
    twitter: 'https://twitter.com/yournbfc',
  },
  
  // Currency Settings
  currency: {
    symbol: '₹',
    code: 'INR',
    locale: 'en-IN',
  },
  
  // Interest Types
  interestTypes: {
    flat: 'Flat Rate',
    reducing_balance: 'Reducing Balance',
    annuity: 'Annuity',
  },
  
  // Application Settings
  application: {
    minCreditScore: 650,
    maxProcessingDays: 7,
    workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM',
  },
  
  // SaaS Settings
  saas: {
    subdomain: null, // Will be set dynamically
    isActive: true,
    plan: 'starter', // starter, professional, enterprise
  },
} as const;

// Alias for backwards compatibility
export const companyConfig = defaultCompany;
export type CompanyConfig = typeof defaultCompany;