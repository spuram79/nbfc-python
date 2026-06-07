import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function KYCPage({ 
  params 
}: { 
  params: Promise<{ customerId: string }>
}) {
  const { customerId } = await params;
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold">NBFC Loan Lending</Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/login" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">
            KYC Verification
          </h2>
        </div>
        <p className="text-gray-600 mb-6">
          Upload your documents for e-KYC verification
        </p>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* KYC Status */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                Status: <span className="font-bold">Pending Verification</span>
              </p>
            </div>

            {/* Document Upload */}
            <form className="space-y-4" action={`/api/customers/${customerId}/kyc`} method="POST">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Required Documents</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Aadhaar Card *</label>
                    <input 
                      type="file" 
                      name="aadhaar" 
                      required 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      className="w-full p-2 border rounded-lg" 
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF or image format, max 5MB</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">PAN Card *</label>
                    <input 
                      type="file" 
                      name="pan" 
                      required 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      className="w-full p-2 border rounded-lg" 
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF or image format, max 5MB</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address Proof *</label>
                    <input 
                      type="file" 
                      name="address_proof" 
                      required 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      className="w-full p-2 border rounded-lg" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Utility bill, passport, or bank statement (last 3 months)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Income Proof *</label>
                    <input 
                      type="file" 
                      name="income_proof" 
                      required 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      className="w-full p-2 border rounded-lg" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Salary slips (3 months) or bank statement</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Photograph *</label>
                    <input 
                      type="file" 
                      name="photo" 
                      required 
                      accept=".jpg,.jpeg,.png" 
                      className="w-full p-2 border rounded-lg" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Passport size photo, white background</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Link href="/" className="flex-1 text-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </Link>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}