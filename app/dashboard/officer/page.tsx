import Link from 'next/link';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { companyConfig } from '@/lib/company-config';

export default async function LoanOfficerDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string }> 
}) {
  const { status } = await searchParams;
  const statusFilter = status || 'submitted';

  const applications = [
    { id: 'LA-00123', customer: 'Rajesh Kumar', product: 'Personal Loan', amount: 500000, status: 'submitted', date: '2026-06-05' },
    { id: 'LA-00120', customer: 'Sneha Reddy', product: 'MSME Loan', amount: 1500000, status: 'submitted', date: '2026-06-02' },
    { id: 'LA-00118', customer: 'Neha Singh', product: 'Gold Loan', amount: 250000, status: 'under_review', date: '2026-06-01' },
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
              Applications
            </Link>
            <Link href="/dashboard/customers" className="px-3 py-1 rounded hover:bg-blue-800 transition">
              Customers
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
            Loan Officer Dashboard
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Applications Needing Review</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4">App ID</th>
                  <th className="text-left py-2 px-4">Customer</th>
                  <th className="text-left py-2 px-4">Product</th>
                  <th className="text-left py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{app.id}</td>
                    <td className="py-3 px-4">{app.customer}</td>
                    <td className="py-3 px-4">{app.product}</td>
                    <td className="py-3 px-4">{companyConfig.currency.symbol}{app.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        app.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:underline text-xs mr-2">View Details</button>
                      <button className="text-green-600 hover:underline text-xs mr-2">Approve</button>
                      <button className="text-red-600 hover:underline text-xs">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/apply" className="p-4 border rounded-lg text-center hover:bg-gray-50">
              <span className="text-sm font-medium">New Application</span>
            </Link>
            <Link href="/dashboard/loans?status=approved" className="p-4 border rounded-lg text-center hover:bg-gray-50">
              <span className="text-sm font-medium">Approved for Disbursement</span>
            </Link>
            <Link href="/dashboard/reports" className="p-4 border rounded-lg text-center hover:bg-gray-50">
              <span className="text-sm font-medium">Daily Reports</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}