import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { loanProducts } from '@/lib/loan-products';

export default async function ApplyLoanPage({ 
  params 
}: { 
  params: Promise<{ loanType: string }>
}) {
  const { loanType } = await params;
  const product = loanProducts.find(p => p.id === loanType);
  
  if (!product) {
    notFound();
  }

  const renderSpecificFields = () => {
    switch (product.id) {
      case 'vehicle-2w':
      case 'vehicle-4w':
      case 'vehicle-ev':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                <select className="w-full p-2 border rounded-lg" defaultValue={product.id === 'vehicle-2w' ? '2wheeler' : product.id === 'vehicle-4w' ? '4wheeler' : 'ev'}>
                  <option value="2wheeler">Two Wheeler</option>
                  <option value="4wheeler">Four Wheeler</option>
                  <option value="ev">Electric Vehicle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <input type="text" className="w-full p-2 border rounded-lg" placeholder="e.g., Honda, Toyota" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input type="text" className="w-full p-2 border rounded-lg" placeholder="e.g., Activa, Innova" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input type="number" className="w-full p-2 border rounded-lg" placeholder="2023" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Number</label>
                <input type="text" className="w-full p-2 border rounded-lg" placeholder="MH-01-AB-1234" />
              </div>
            </div>
          </div>
        );
      
      case 'gold':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Gold Details</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Ornament Type</label>
              <select className="w-full p-2 border rounded-lg">
                <option>Gold Chain</option>
                <option>Gold Bangle</option>
                <option>Gold Ring</option>
                <option>Gold Necklace</option>
                <option>Other Ornaments</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Weight (grams)</label>
                <input type="number" className="w-full p-2 border rounded-lg" placeholder="Enter weight" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purity</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>24K</option>
                  <option>22K</option>
                  <option>18K</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Our gold valuer will assess the ornaments and determine the loan amount based on current gold rates.
            </p>
          </div>
        );
      
      case 'msme':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name</label>
                <input type="text" className="w-full p-2 border rounded-lg" placeholder="Business Name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Manufacturing</option>
                  <option>Trading</option>
                  <option>Services</option>
                  <option>Retail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Annual Turnover</label>
                <input type="number" className="w-full p-2 border rounded-lg" placeholder="₹ Annual Turnover" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years in Business</label>
                <input type="number" className="w-full p-2 border rounded-lg" placeholder="Number of years" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST Number (Optional)</label>
                <input type="text" className="w-full p-2 border rounded-lg" placeholder="GSTIN" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Address</label>
                <textarea className="w-full p-2 border rounded-lg" placeholder="Full business address" />
              </div>
            </div>
          </div>
        );
      
      case 'home':
      case 'mortgage':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Property Type</label>
              <select className="w-full p-2 border rounded-lg">
                <option>Residential Flat/Apartment</option>
                <option>Independent House</option>
                <option>Villa</option>
                <option>Plot</option>
                <option>Commercial Property</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property Value (₹)</label>
                <input type="number" className="w-full p-2 border rounded-lg" placeholder="Estimated property value" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Property Address</label>
                <textarea className="w-full p-2 border rounded-lg" placeholder="Full property address" />
              </div>
            </div>
            {product.id === 'mortgage' && (
              <div>
                <label className="block text-sm font-medium mb-1">Occupancy Status</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Self-Occupied</option>
                  <option>Rented</option>
                  <option>Vacant</option>
                </select>
              </div>
            )}
          </div>
        );
      
      case 'topup':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Loan Details</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Existing Loan Account Number</label>
              <input type="text" className="w-full p-2 border rounded-lg" placeholder="Loan account number" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Outstanding Balance (₹)</label>
              <input type="number" className="w-full p-2 border rounded-lg" placeholder="Current outstanding amount" />
            </div>
            <p className="text-sm text-gray-500">
              Top-up loans are available for existing customers with good repayment history.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold">NBFC Loan Lending</Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/apply" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">
            Apply for {product.name}
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 mb-6">{product.description}</p>

          <form className="space-y-6" action={`/api/loans`} method="POST">
            {/* Personal Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input type="text" name="first_name" required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input type="text" name="last_name" required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input type="email" name="email" required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile *</label>
                  <input type="tel" name="mobile" required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                  <input type="date" name="dob" required className="w-full p-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <textarea name="address" required className="w-full p-2 border rounded-lg" />
              </div>
            </div>

            {/* Loan Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Loan Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Requested Amount (₹) *</label>
                  <input 
                    type="number" 
                    name="amount" 
                    required 
                    min={product.min_amount}
                    max={product.max_amount}
                    className="w-full p-2 border rounded-lg" 
                  />
                  <p className="text-xs text-gray-500">
                    Min: ₹{product.min_amount.toLocaleString()} | Max: ₹{product.max_amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tenure (months) *</label>
                  <input 
                    type="number" 
                    name="tenure_months" 
                    required 
                    min={product.min_tenure}
                    max={product.max_tenure}
                    className="w-full p-2 border rounded-lg" 
                  />
                  <p className="text-xs text-gray-500">
                    {product.min_tenure} - {product.max_tenure} months
                  </p>
                </div>
              </div>
              <input type="hidden" name="product_id" value={product.id} />
            </div>

            {/* Specific Fields */}
            {renderSpecificFields()}

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ID Proof (Aadhaar/PAN) *</label>
                  <input type="file" name="id_proof" required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Proof *</label>
                  <input type="file" name="address_proof" required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Income Proof *</label>
                  <input type="file" name="income_proof" required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Statement (3 months) *</label>
                  <input type="file" name="bank_statement" required className="w-full p-2 border rounded-lg" />
                </div>
                {['vehicle-2w', 'vehicle-4w', 'vehicle-ev'].includes(product.id) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Vehicle RC *</label>
                    <input type="file" name="vehicle_rc" required className="w-full p-2 border rounded-lg" />
                  </div>
                )}
                {['home', 'mortgage'].includes(product.id) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Property Documents *</label>
                    <input type="file" name="property_docs" required className="w-full p-2 border rounded-lg" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Link href="/apply" className="flex-1 text-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                Back to Products
              </Link>
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}