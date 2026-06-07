import Link from 'next/link';
import { Banknote, Car, Home, Briefcase, Gem, PlusCircle } from 'lucide-react';
import { companyConfig } from '@/lib/company-config';
import { loanProducts } from '@/lib/loan-products';

const iconMap: Record<string, React.ReactNode> = {
  personal: <Banknote className="h-8 w-8" />,
  'vehicle-2w': <Car className="h-8 w-8" />,
  'vehicle-4w': <Car className="h-8 w-8" />,
  'vehicle-ev': <Car className="h-8 w-8" />,
  gold: <Gem className="h-8 w-8" />,
  msme: <Briefcase className="h-8 w-8" />,
  home: <Home className="h-8 w-8" />,
  mortgage: <Home className="h-8 w-8" />,
  topup: <PlusCircle className="h-8 w-8" />,
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Banknote className="h-8 w-8" />
            <h1 className="text-2xl font-bold">{companyConfig.name}</h1>
          </div>
          <nav className="flex space-x-4">
            <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-blue-800 transition">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {companyConfig.tagline}
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Quick approvals, competitive rates, and flexible terms across multiple loan products
          </p>
          <Link
            href="/apply"
            className="inline-block px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg text-lg hover:bg-gray-100 transition"
          >
            Apply for a Loan Now
          </Link>
        </div>
      </section>

      {/* Loan Products Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Our Loan Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loanProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-200"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-blue-600">{iconMap[product.id]}</div>
                <h4 className="text-xl font-semibold text-gray-800">{product.name}</h4>
              </div>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Amount: {companyConfig.currency.symbol}{product.min_amount.toLocaleString()} - {companyConfig.currency.symbol}{product.max_amount.toLocaleString()}</p>
                <p>Tenure: {product.min_tenure} - {product.max_tenure} months</p>
              </div>
              <Link
                href={`/apply/${product.id}`}
                className="mt-4 inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quick Approval</h4>
              <p className="text-gray-600">Get instant approval with minimal documentation</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM12 14c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4-4zM12 16c-3.313 0-6-2.687-6-6s2.687-6 6-6 6 2.687 6 6-2.687 6-6-6z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Competitive Rates</h4>
              <p className="text-gray-600">Best interest rates tailored to your profile</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A7.5 7.5 0 1112 19.98a7.5 7.5 0 01-5.618-4.016L12 12l2-2 4 4z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Secure & Reliable</h4>
              <p className="text-gray-600">RBI compliant with end-to-end encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2026 {companyConfig.fullName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}