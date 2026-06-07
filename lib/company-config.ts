/**
 * Company Configuration for NBFC Application
 * Easily customize this file to rebrand the application for any NBFC company
 */

export const companyConfig = {
  // Basic Company Information
  name: 'FinTrust NBFC',
  fullName: 'FinTrust Financial Services Limited',
  tagline: 'Your Trusted Financial Partner',
  
  // Branding
  logo: {
    text: 'FT', // Short text for logo (can be replaced with logo image)
    icon: 'banknote', // lucide-react icon name
  },
  
  // Contact Information
  contact: {
    email: 'support@fintrustnbfc.com',
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
    rbiLicense: 'NBFC-12345',
    cin: 'U671D00MH2023PTC123456',
  },
  
  // Social Links
  social: {
    website: 'https://www.fintrustnbfc.com',
    linkedin: 'https://linkedin.com/company/fintrustnbfc',
    twitter: 'https://twitter.com/fintrustnbfc',
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

export type CompanyConfig = typeof companyConfig;

// Helper to get theme classes
export function getThemeClasses(color: 'primary' | 'secondary' = 'primary') {
  const baseColor = companyConfig.theme[color];
  return {
    bg: `bg-${baseColor}-900`,
    bgLight: `bg-${baseColor}-100`,
    text: `text-${baseColor}-600`,
    textHover: `hover:bg-${baseColor}-800`,
    button: `bg-${baseColor}-600 hover:bg-${baseColor}-700`,
    border: `border-${baseColor}-200`,
  };
}