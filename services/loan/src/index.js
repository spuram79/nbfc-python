const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.LOAN_SERVICE_PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage (replace with database in production)
const loans = [
  {
    id: 1,
    loanId: 'LOAN001',
    customerId: 'CUST001',
    customerIdRef: 1,
    amount: 10000,
    interestRate: 12.5,
    tenure: 12,
    status: 'active',
    disbursementDate: new Date('2023-03-15'),
    maturityDate: new Date('2024-03-15'),
    emi: 902.75,
    branchId: 1,
    createdAt: new Date('2023-03-01')
  },
  {
    id: 2,
    loanId: 'LOAN002',
    customerId: 'CUST002',
    customerIdRef: 2,
    amount: 15000,
    interestRate: 11.0,
    tenure: 18,
    status: 'active',
    disbursementDate: new Date('2023-04-20'),
    maturityDate: new Date('2024-10-20'),
    emi: 916.23,
    branchId: 1,
    createdAt: new Date('2023-04-01')
  }
];

// Routes
/**
 * @route GET /api/loans
 * @desc Get all loans (with pagination and filtering)
 */
app.get('/api/loans', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const customerId = req.query.customerId;
  
  let filteredLoans = [...loans];
  
  if (status) {
    filteredLoans = filteredLoans.filter(l => l.status === status);
  }
  
  if (customerId) {
    filteredLoans = filteredLoans.filter(l => l.customerId === customerId || l.customerIdRef === parseInt(customerId));
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const results = {};
  results.loans = filteredLoans.slice(startIndex, endIndex);
  results.currentPage = page;
  results.totalPages = Math.ceil(filteredLoans.length / limit);
  results.totalLoans = filteredLoans.length;
  
  res.json(results);
});

/**
 * @route GET /api/loans/:id
 * @desc Get loan by ID
 */
app.get('/api/loans/:id', (req, res) => {
  const loan = loans.find(l => l.id === parseInt(req.params.id) || l.loanId === req.params.id);
  if (!loan) {
    return res.status(404).json({ error: 'Loan not found' });
  }
  res.json(loan);
});

/**
 * @route POST /api/loans
 * @desc Create new loan application
 */
app.post('/api/loans', (req, res) => {
  const loan = {
    id: loans.length + 1,
    loanId: `LOAN${String(loans.length + 1).padStart(3, '0')}`,
    ...req.body,
    status: 'applied',
    createdAt: new Date()
  };
  loans.push(loan);
  res.status(201).json(loan);
});

/**
 * @route PUT /api/loans/:id/status
 * @desc Update loan status
 */
app.put('/api/loans/:id/status', (req, res) => {
  const index = loans.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Loan not found' });
  }
  
  loans[index].status = req.body.status || loans[index].status;
  loans[index].updatedAt = new Date();
  
  res.json(loans[index]);
});

/**
 * @route GET /api/loans/:id/schedule
 * @desc Get loan repayment schedule
 */
app.get('/api/loans/:id/schedule', (req, res) => {
  const loan = loans.find(l => l.id === parseInt(req.params.id));
  if (!loan) {
    return res.status(404).json({ error: 'Loan not found' });
  }
  
  const schedule = generateRepaymentSchedule(loan);
  res.json({ loanId: loan.loanId, schedule });
});

/**
 * @route GET /api/loans/customer/:customerId
 * @desc Get loans by customer ID
 */
app.get('/api/loans/customer/:customerId', (req, res) => {
  const customerLoans = loans.filter(l => l.customerId === req.params.customerId);
  res.json(customerLoans);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'loan-service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Loan Service running on port ${PORT}`);
});

/**
 * Generate repayment schedule
 */
function generateRepaymentSchedule(loan) {
  const schedule = [];
  const principal = loan.amount;
  const interestRate = loan.interestRate / 12 / 100;
  const emi = loan.emi;
  let remainingPrincipal = principal;
  
  const startDate = new Date(loan.disbursementDate);
  
  for (let i = 1; i <= loan.tenure; i++) {
    const interest = remainingPrincipal * interestRate;
    const principalRepayment = emi - interest;
    remainingPrincipal -= principalRepayment;
    
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    schedule.push({
      installment: i,
      dueDate: dueDate.toISOString().split('T')[0],
      principal: Math.round(principalRepayment * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(remainingPrincipal * 100) / 100,
      status: 'pending'
    });
  }
  
  return schedule;
}

module.exports = app;