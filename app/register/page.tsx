import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold">NBFC Loan Lending</Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Create Your Account
          </h2>

          <form className="space-y-6" action={`/api/auth/register`} method="POST">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input type="text" name="first_name" required className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input type="text" name="last_name" required className="w-full p-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input type="email" name="email" required className="w-full p-2 border rounded-lg" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number *</label>
              <input type="tel" name="mobile" required className="w-full p-2 border rounded-lg" placeholder="10-digit mobile number" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input type="password" name="password" required className="w-full p-2 border rounded-lg" placeholder="Min 8 characters" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth *</label>
              <input type="date" name="dob" required className="w-full p-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <textarea name="address" required className="w-full p-2 border rounded-lg" rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input type="text" name="city" required className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <select name="state" required className="w-full p-2 border rounded-lg">
                  <option value="">Select State</option>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                  <option>Uttar Pradesh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode *</label>
                <input type="text" name="pincode" required className="w-full p-2 border rounded-lg" />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">KYC Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Aadhaar Card *</label>
                  <input type="file" name="aadhaar" required accept="image/*,.pdf" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PAN Card *</label>
                  <input type="file" name="pan" required accept="image/*,.pdf" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Proof *</label>
                  <input type="file" name="address_proof" required accept="image/*,.pdf" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Photo *</label>
                  <input type="file" name="photo" required accept="image/*" className="w-full p-2 border rounded-lg" />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input type="checkbox" required className="mt-1" />
              <label className="text-sm text-gray-600">
                I agree to the Terms & Conditions and Privacy Policy. I consent to NBFC collecting my personal data for loan processing.
              </label>
            </div>

            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Register & Continue to KYC Verification
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-medium">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}