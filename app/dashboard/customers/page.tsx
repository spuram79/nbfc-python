import Link from 'next/link';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { companyConfig } from '@/lib/company-config-template';

export default function CustomersPage() {
  // Mock customers
  const customers = [
    { id: 'CU-001', name: 'Rajesh Kumar', mobile: '9876543210', email: 'rajesh@example.com', kyc: 'verified', loans: 2 },
    { id: 'CU-002', name: 'Priya Sharma', mobile: '9876543211', email: 'priya@example.com', kyc: 'verified', loans: 1 },
    { id: 'CU-003', name: 'Amit Patel', mobile: '9876543212', email: 'amit@example.com', kyc: 'pending', loans: 0 },
    { id: 'CU-004', name: 'Sneha Reddy', mobile: '9876543213', email: 'sneha@example.com', kyc: 'verified', loans: 3 },
    { id: 'CU-005', name: 'Ramesh Gupta', mobile: '9876543214', email: 'ramesh@example.com', kyc: 'rejected', loans: 0 },
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
            Customers
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
                  placeholder="Search customers..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select className="border rounded-lg px-3 py-2">
                <option>All KYC Status</option>
                <option>Verified</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4">Customer ID</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Mobile</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">KYC Status</th>
                  <th className="text-left py-3 px-4">Active Loans</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{customer.id}</td>
                    <td className="py-3 px-4">{customer.name}</td>
                    <td className="py-3 px-4">{customer.mobile}</td>
                    <td className="py-3 px-4">{customer.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        customer.kyc === 'verified' ? 'bg-green-100 text-green-800' :
                        customer.kyc === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {customer.kyc}
                      </span>
                    </td>
                    <td className="py-3 px-4">{customer.loans}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:underline text-xs">View</button>
                        <button className="text-green-600 hover:underline text-xs">Edit</button>
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