'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { CompanyTenant, getCompanyBySubdomain } from '@/lib/company-store';
import { defaultCompany } from '@/lib/company-config-template';

interface CompanyContextType {
  company: CompanyTenant | null;
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  loading: false,
  error: null,
});

export function CompanyProvider({ 
  children, 
  subdomain 
}: { 
  children: ReactNode;
  subdomain?: string | null;
}) {
  const [company, setCompany] = useState<CompanyTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        
        if (subdomain) {
          const tenant = getCompanyBySubdomain(subdomain);
          if (tenant) {
            setCompany(tenant);
          } else {
            setError(`Company "${subdomain}" not found`);
          }
        } else {
          // Default to first active company or use default template
          const companies = Object.values((await import('@/lib/company-store')).companies);
          const firstActive = companies.find(c => c.config.saas.isActive);
          if (firstActive) {
            setCompany(firstActive);
          } else {
            // Fallback to default company structure
            setCompany({
              id: 'default',
              subdomain: 'default',
              config: {
                ...defaultCompany,
                saas: { subdomain: 'default', isActive: true, plan: 'starter' },
              },
            });
          }
        }
      } catch (err) {
        setError('Failed to load company configuration');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [subdomain]);

  return (
    <CompanyContext.Provider value={{ company, loading, error }}>
      {children}
    </CompanyContext.Provider>
  );
}

// Use a simple config type that excludes company-specific fields
export type SimpleCompanyConfig = typeof defaultCompany;

export function useCompany(): SimpleCompanyConfig {
  const context = useContext(CompanyContext);
  
  // For backwards compatibility, return default config if no company loaded
  if (!context.company) {
    // Return default company config synchronously
    return defaultCompany;
  }
  
  // Return company config without saas-specific typing issues
  return context.company.config as SimpleCompanyConfig;
}

export function useCompanyTenant(): CompanyTenant | null {
  return useContext(CompanyContext).company;
}