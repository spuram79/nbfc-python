const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.CUSTOMER_SERVICE_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage (replace with database in production)
const customers = [
  {
    id: 1,
    customerId: 'CUST001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    dateOfBirth: '1985-06-15',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    crifScore: 750,
    kycStatus: 'verified',
    createdAt: new Date('2023-01-15'),
    branchId: 1
  },
  {
    id: 2,
    customerId: 'CUST002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0456',
    dateOfBirth: '1990-03-22',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    crifScore: 680,
    kycStatus: 'verified',
    createdAt: new Date('2023-02-20'),
    branchId: 1
  }
];

// Routes
/**
 * @route GET /api/customers
 * @desc Get all customers (with pagination)
 */
app.get('/api/customers', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const results = {};
  results.customers = customers.slice(startIndex, endIndex);
  results.currentPage = page;
  results.totalPages = Math.ceil(customers.length / limit);
  results.totalCustomers = customers.length;
  
  res.json(results);
});

/**
 * @route GET /api/customers/:id
 * @desc Get customer by ID
 */
app.get('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id) || c.customerId === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

/**
 * @route POST /api/customers
 * @desc Create new customer
 */
app.post('/api/customers', (req, res) => {
  const customer = {
    id: customers.length + 1,
    customerId: `CUST${String(customers.length + 1).padStart(3, '0')}`,
    ...req.body,
    createdAt: new Date(),
    kycStatus: 'pending'
  };
  customers.push(customer);
  res.status(201).json(customer);
});

/**
 * @route PUT /api/customers/:id
 * @desc Update customer
 */
app.put('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customers[index] = {
    ...customers[index],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json(customers[index]);
});

/**
 * @route DELETE /api/customers/:id
 * @desc Delete customer
 */
app.delete('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customers.splice(index, 1);
  res.status(204).send();
});

/**
 * @route GET /api/customers/:id/kyc
 * @desc Get customer KYC status
 */
app.get('/api/customers/:id/kyc', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  res.json({
    customerId: customer.customerId,
    kycStatus: customer.kycStatus,
    documents: [
      { type: 'aadhar', status: 'verified', verifiedAt: new Date() },
      { type: 'pancard', status: 'verified', verifiedAt: new Date() },
      { type: 'address_proof', status: 'pending' }
    ]
  });
});

/**
 * @route PUT /api/customers/:id/kyc
 * @desc Update KYC status
 */
app.put('/api/customers/:id/kyc', (req, res) => {
  const index = customers.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customers[index].kycStatus = req.body.status || 'pending';
  customers[index].updatedAt = new Date();
  
  res.json({
    customerId: customers[index].customerId,
    kycStatus: customers[index].kycStatus
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'customer-service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Customer Service running on port ${PORT}`);
});

module.exports = app;