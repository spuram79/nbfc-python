import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold">NBFC Loan Lending</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Welcome Back
          </h2>

          <form className="space-y-6" action={`/api/auth/login`} method="POST">
            <div>
              <label className="block text-sm font-medium mb-1">Email or Username *</label>
              <input 
                type="text" 
                name="username" 
                required 
                className="w-full p-2 border rounded-lg" 
                placeholder="you@example.com" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full p-2 border rounded-lg" 
                placeholder="Your password" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">MFA Code (for admin/staff)</label>
              <input 
                type="text" 
                name="mfa_code" 
                className="w-full p-2 border rounded-lg" 
                placeholder="Enter 6-digit code" 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
              </div>
            </div>

            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Login
            </button>

            <p className="text-center text-sm text-gray-600">
              New to NBFC Loan Lending?{' '}
              <Link href="/register" className="text-blue-600 font-medium">
                Register here
              </Link>
            </p>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-500">Admin: admin@nbfc.com / admin123 / MFA: 123456</p>
          </div>
        </div>
      </main>
    </div>
  );
}