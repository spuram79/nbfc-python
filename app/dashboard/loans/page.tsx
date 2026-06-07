import Link from 'next/link';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { companyConfig } from '@/lib/company-config';

export default async function LoansPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string }> 
}) {
  const { status } = await searchParams;
  const statusFilter = status || 'all';

  // Mock loan applications
  const loans = [
    { id: 'LA-00123', customer: 'Rajesh Kumar', product: 'Personal Loan', amount: 500000, status: 'submitted', date: '2026-06-05', score: null },
    { id: 'LA-00122', customer: 'Priya Sharma', product: 'Home Loan', amount: 2500000, status: 'approved', date: '2026-06-04', score: 85 },
    { id: 'LA-00121', customer: 'Amit Patel', product: 'Gold Loan', amount: 300000, status: 'disbursed', date: '2026-06-03', score: 78 },
    { id: 'LA-00120', customer: 'Sneha Reddy', product: 'MSME Loan', amount: 1500000, status: 'under_review', date: '2026-06-02', score: 65 },
    { id: 'LA-00119', customer: 'Ramesh Gupta', product: 'Vehicle Loan', amount: 800000, status: 'rejected', date: '2026-06-01', score: 42 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">{companyConfig.name}</Link>
          <nav className="flex space-x-4">
            <Link href="/dashboard" className="px-3 py-1 rounded hover:bg-blue-800 transition">
              Dashboard
            </Link>
            <Link href="/dashboard/loans" className="px-3 py-1 rounded hover:bg-blue-800 transition">
              Loans
            </Link>
            <Link href="/dashboard/customers" className="px-3 py-1 rounded hover:bg-blue-800 transition">
              Customers
            </Link>
            <Link href="/dashboard/reports" className="px-3 py-1 rounded hover:bg-blue-800 transition">
              Reports
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">
            Loan Applications
          </h2>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                className="border rounded-lg px-3 py-2"
                defaultValue={statusFilter}
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="disbursed">Disbursed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loan Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4">App ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Score</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Applied On</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{loan.id}</td>
                    <td className="py-3 px-4">{loan.customer}</td>
                    <td className="py-3 px-4">{loan.product}</td>
                    <td className="py-3 px-4">{companyConfig.currency.symbol}{loan.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {loan.score ? (
                        <span className={`px-2 py-1 rounded font-medium ${
                          loan.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {loan.score}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        loan.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                        loan.status === 'disbursed' ? 'bg-blue-100 text-blue-800' :
                        loan.status === 'under_review' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">{loan.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:underline text-xs">View</button>
                        {loan.status === 'submitted' && (
                          <button className="text-green-600 hover:underline text-xs">Approve</button>
                        )}
                        {loan.status === 'approved' && (
                          <button className="text-indigo-600 hover:underline text-xs">Disburse</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}