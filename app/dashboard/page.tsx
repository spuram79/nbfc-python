import Link from 'next/link';
import { 
  Banknote, 
  Users, 
  FileText, 
  BarChart3, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { companyConfig } from '@/lib/company-config';

export default function DashboardPage() {
  // Mock statistics
  const stats = {
    totalApplications: 1245,
    pendingApproval: 86,
    approved: 723,
    disbursed: 412,
    overduePayments: 23,
    npaLoans: 12,
    totalPortfolio: 45000000,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h2>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Loans</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disbursed</p>
                <p className="text-2xl font-bold">{stats.disbursed}</p>
              </div>
              <Banknote className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Payments</p>
                <p className="text-2xl font-bold text-red-600">{stats.overduePayments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NPA Loans</p>
                <p className="text-2xl font-bold text-red-600">{stats.npaLoans}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Portfolio</p>
                <p className="text-2xl font-bold">₹{(stats.totalPortfolio / 10000000).toFixed(1)} Cr</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/loans?status=submitted" className="p-4 border rounded-lg text-center hover:bg-gray-50 transition">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <span className="text-sm font-medium">Review Applications</span>
            </Link>
            <Link href="/dashboard/loans?status=approved" className="p-4 border rounded-lg text-center hover:bg-gray-50 transition">
              <Banknote className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <span className="text-sm font-medium">Process Disbursements</span>
            </Link>
            <Link href="/dashboard/customers" className="p-4 border rounded-lg text-center hover:bg-gray-50 transition">
              <Users className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <span className="text-sm font-medium">Manage Customers</span>
            </Link>
            <Link href="/dashboard/reports" className="p-4 border rounded-lg text-center hover:bg-gray-50 transition">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium">View Reports</span>
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Loan Applications</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Application ID</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Applied On</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'LA-00123', customer: 'Rajesh Kumar', product: 'Personal Loan', amount: 500000, status: 'submitted', date: '2026-06-05' },
                  { id: 'LA-00122', customer: 'Priya Sharma', product: 'Home Loan', amount: 2500000, status: 'approved', date: '2026-06-04' },
                  { id: 'LA-00121', customer: 'Amit Patel', product: 'Gold Loan', amount: 300000, status: 'disbursed', date: '2026-06-03' },
                ].map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{app.id}</td>
                    <td className="py-3">{app.customer}</td>
                    <td className="py-3">{app.product}</td>
                    <td className="py-3">₹{app.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        app.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'disbursed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3">{app.date}</td>
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