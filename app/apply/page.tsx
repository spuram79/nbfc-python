import Link from 'next/link';
import { loanProducts } from '@/lib/loan-products';
import { Banknote, Car, Home, Briefcase, Gem, PlusCircle } from 'lucide-react';

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

export default function ApplyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold">NBFC Loan Lending</Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Choose Your Loan Product
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Select from our wide range of loan products tailored to your needs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loanProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-200"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-blue-600 p-3 bg-blue-50 rounded-lg">{iconMap[product.id]}</div>
                <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
              </div>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Range:</span>
                  <span className="font-medium">₹{product.min_amount.toLocaleString()} - ₹{product.max_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tenure:</span>
                  <span className="font-medium">{product.min_tenure} - {product.max_tenure} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Interest Type:</span>
                  <span className="font-medium capitalize">{product.interest_type.replace('_', ' ')}</span>
                </div>
              </div>
              <Link
                href={`/apply/${product.id}`}
                className="mt-6 inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply for {product.name}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}