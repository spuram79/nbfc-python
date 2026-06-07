/**
 * Multi-Tenant Company Registry for SaaS
 * This allows the platform to serve multiple NBFC companies
 */

import { defaultCompany, type CompanyConfig } from './company-config-template';

// In-memory company store (in production, use a database)
export interface CompanyTenant {
  id: string;
  subdomain: string;
  config: CompanyConfig;
}

// Pre-configured companies ready for SaaS
export const companies: Record<string, CompanyTenant> = {
  'fintrust': {
    id: 'fintrust',
    subdomain: 'fintrust',
    config: {
      ...defaultCompany,
      name: 'FinTrust NBFC',
      fullName: 'FinTrust Financial Services Limited',
      tagline: 'Your Trusted Financial Partner',
      logo: { text: 'FT', icon: 'banknote' },
      contact: {
        email: 'support@fintrustnbfc.com',
        phone: '+91-1800-123-4567',
        address: '123 Financial District, Mumbai, Maharashtra 400001',
      },
      registration: { rbiLicense: 'NBFC-12345', cin: 'U671D00MH2023PTC123456' },
      social: {
        website: 'https://www.fintrustnbfc.com',
        linkedin: 'https://linkedin.com/company/fintrustnbfc',
        twitter: 'https://twitter.com/fintrustnbfc',
      },
      saas: { subdomain: 'fintrust', isActive: true, plan: 'professional' },
    },
  },
  'quickfinance': {
    id: 'quickfinance',
    subdomain: 'quickfinance',
    config: {
      ...defaultCompany,
      name: 'QuickFinance NBFC',
      fullName: 'QuickFinance Limited',
      tagline: 'Fast Loans, Faster Approvals',
      logo: { text: 'QF', icon: 'zap' },
      contact: {
        email: 'care@quickfinance.com',
        phone: '+91-1800-999-8888',
        address: '456 Business Park, Delhi, NCT 110001',
      },
      registration: { rbiLicense: 'NBFC-67890', cin: 'U987D00DL2022PTC678901' },
      theme: { primary: 'green', primaryHover: 'green-800', primaryBg: 'green-900', primaryLight: 'green-100', primaryText: 'green-600', secondary: 'blue' },
      social: {
        website: 'https://www.quickfinance.com',
        linkedin: 'https://linkedin.com/company/quickfinance',
        twitter: 'https://twitter.com/quickfinance',
      },
      saas: { subdomain: 'quickfinance', isActive: true, plan: 'starter' },
    },
  },
  'trustline': {
    id: 'trustline',
    subdomain: 'trustline',
    config: {
      ...defaultCompany,
      name: 'TrustLine NBFC',
      fullName: 'TrustLine Financial Corporation',
      tagline: 'Building Trust Through Finance',
      logo: { text: 'TL', icon: 'shield' },
      contact: {
        email: 'info@trustlinefc.com',
        phone: '+91-1800-777-6666',
        address: '789 Secure Avenue, Bangalore, Karnataka 560001',
      },
      registration: { rbiLicense: 'NBFC-11223', cin: 'U555D00KA2021PTC112234' },
      theme: { primary: 'purple', primaryHover: 'purple-800', primaryBg: 'purple-900', primaryLight: 'purple-100', primaryText: 'purple-600', secondary: 'pink' },
      social: {
        website: 'https://www.trustlinefc.com',
        linkedin: 'https://linkedin.com/company/trustlinefc',
        twitter: 'https://twitter.com/trustlinefc',
      },
      saas: { subdomain: 'trustline', isActive: true, plan: 'enterprise' },
    },
  },
};

// Get company by subdomain (for SaaS routing)
export function getCompanyBySubdomain(subdomain: string): CompanyTenant | undefined {
  return companies[subdomain.toLowerCase()];
}

// Get company by ID
export function getCompanyById(id: string): CompanyTenant | undefined {
  return Object.values(companies).find(c => c.id === id);
}

// Get all active companies (for company directory)
export function getAllCompanies(): CompanyTenant[] {
  return Object.values(companies).filter(c => c.config.saas.isActive);
}

// Register a new company (SaaS onboarding)
export function registerCompany(id: string, subdomain: string, config: Partial<CompanyConfig>): CompanyTenant {
  const newCompany: CompanyTenant = {
    id,
    subdomain: subdomain.toLowerCase(),
    config: {
      ...defaultCompany,
      ...config,
      saas: { subdomain: subdomain.toLowerCase(), isActive: true, plan: config.saas?.plan || 'starter' },
    },
  };
  companies[id] = newCompany;
  return newCompany;
}

// Update company configuration
export function updateCompany(id: string, updates: Partial<CompanyConfig>): CompanyTenant | undefined {
  const company = companies[id];
  if (!company) return undefined;
  
  companies[id] = {
    ...company,
    config: { ...company.config, ...updates },
  };
  return companies[id];
}