import Link from 'next/link';
import { ArrowLeft, BarChart3, Download, FileText } from 'lucide-react';
import { companyConfig } from '@/lib/company-config-template';

export default function ReportsPage() {
  // Mock reports data
  const portfolioStats = {
    totalLoanBook: 45000000,
    npaRatio: 2.3,
    collectionEfficiency: 94.5,
    avgProcessingTime: 2.5,
  };

  const loanTypeDistribution = [
    { type: 'Personal Loan', count: 420, amount: 12500000 },
    { type: 'Home Loan', count: 280, amount: 18500000 },
    { type: 'Vehicle Loan', count: 195, amount: 8200000 },
    { type: 'Gold Loan', count: 120, amount: 2800000 },
    { type: 'MSME Loan', count: 89, amount: 6500000 },
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
            Reports & Analytics
          </h2>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Loan Book</p>
                <p className="text-xl font-bold">₹{(portfolioStats.totalLoanBook / 10000000).toFixed(1)} Cr</p>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NPA Ratio</p>
                <p className="text-xl font-bold text-red-600">{portfolioStats.npaRatio}%</p>
              </div>
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collection Efficiency</p>
                <p className="text-xl font-bold text-green-600">{portfolioStats.collectionEfficiency}%</p>
              </div>
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-xl font-bold">{portfolioStats.avgProcessingTime} days</p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Loan Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Loan Type Distribution</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4">Loan Type</th>
                  <th className="text-left py-2 px-4">Applications</th>
                  <th className="text-left py-2 px-4">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {loanTypeDistribution.map((item) => (
                  <tr key={item.type} className="border-b">
                    <td className="py-3 px-4">{item.type}</td>
                    <td className="py-3 px-4">{item.count.toLocaleString()}</td>
                    <td className="py-3 px-4">₹{(item.amount / 100000).toFixed(1)} Lakh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RBI Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Regulatory Reports</h3>
          <div className="space-y-3">
            {[
              { id: 'MIS-1', name: 'Monthly MIS Report', period: 'May 2026', status: 'ready' },
              { id: 'CA-1', name: 'Capital Adequacy Report', period: 'Q1 2026', status: 'ready' },
              { id: 'GL-1', name: 'GL Return', period: 'May 2026', status: 'ready' },
              { id: 'CR-1', name: 'Credit Appraisal Report', period: 'May 2026', status: 'processing' },
            ].map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-gray-500">Period: {report.period}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    report.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  {report.status === 'ready' && (
                    <button className="flex items-center text-blue-600 hover:underline text-xs">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}