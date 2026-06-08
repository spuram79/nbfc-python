/**
 * Company Configuration for NBFC Application
 * Easily customize this file to rebrand the application for any NBFC company
 * 
 * Multi-Tenant Support: Each company can have its own configuration
 */

// Default company configuration for NBFC
const DEFAULT_COMPANY_CONFIG = {
  // Basic Company Information
  name: 'NBFC Company',
  fullName: 'NBFC Financial Services Limited',
  tagline: 'Your Trusted Financial Partner',
  
  // Branding
  logo: {
    text: 'NC', // Short text for logo (can be replaced with logo image)
    icon: 'banknote', // lucide-react icon name
  },
  
  // Contact Information
  contact: {
    email: 'support@nbfccompany.com',
    phone: '+91-1800-123-4567',
    address: '123 Financial District, Mumbai, Maharashtra 400001',
  },
  
  // Theme Colors (Tailwind CSS classes)
  theme: {
    primary: 'blue',     // Options: blue, indigo, purple, green, teal, etc.
    primaryHover: 'blue-800',
    primaryBg: 'blue-900',
    primaryLight: 'blue-100',
    primaryText: 'blue-600',
    secondary: 'emerald',
  },
  
  // License & Registration
  registration: {
    rbiLicense: 'NBFC-XXXXX',
    cin: 'U671D00MHXXXXXXX',
  },
  
  // Social Links
  social: {
    website: 'https://www.nbfccompany.com',
    linkedin: 'https://linkedin.com/company/nbfccompany',
    twitter: 'https://twitter.com/nbfccompany',
  },
  
  // Loan Settings
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
} as const;

// Export the config as a function for dynamic company lookups
export const companyConfig = DEFAULT_COMPANY_CONFIG;
export const defaultCompany = DEFAULT_COMPANY_CONFIG;
export type CompanyConfig = typeof companyConfig;

// Multi-company configurations mapping
export const companyConfigs: Record<string, CompanyConfig> = {
  'nbfc': DEFAULT_COMPANY_CONFIG,
  'fintrust': DEFAULT_COMPANY_CONFIG,
  'default': DEFAULT_COMPANY_CONFIG,
};

// Get company configuration by company ID
export function getCompanyConfiguration(companyId: string): CompanyConfig {
  const normalizedId = companyId.toLowerCase();
  if (companyConfigs[normalizedId]) {
    return companyConfigs[normalizedId];
  }
  // Return default if company not found
  return DEFAULT_COMPANY_CONFIG;
}

// Helper to get theme classes
export function getThemeClasses(color: 'primary' | 'secondary' = 'primary', config: CompanyConfig = companyConfig) {
  const baseColor = config.theme[color];
  return {
    bg: `bg-${baseColor}-900`,
    bgLight: `bg-${baseColor}-100`,
    text: `text-${baseColor}-600`,
    textHover: `hover:bg-${baseColor}-800`,
    button: `bg-${baseColor}-600 hover:bg-${baseColor}-700`,
    border: `border-${baseColor}-200`,
  };
}

// Company branding helper for dynamic theming
export function getBrandingConfig(companyId: string) {
  const config = getCompanyConfiguration(companyId);
  return {
    name: config.name,
    fullName: config.fullName,
    tagline: config.tagline,
    logo: config.logo,
    contact: config.contact,
    registration: config.registration,
    social: config.social,
  };
}