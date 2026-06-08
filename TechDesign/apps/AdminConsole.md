# Admin Console Design

## Application Overview

The Admin Console is the enterprise administration application for system administrators, super admins, and compliance officers. It provides system-wide configuration, user management, and compliance oversight.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| State Management | Redux Toolkit |
| Routing | React Router v6 |
| Charts | Recharts |
| Data Tables | TanStack Table |
| Form Library | React Hook Form |

## Application Layout

### Admin Dashboard Structure
```
┌─────────────────────────────────────────┐
│ Header: User Menu, Notifications        │
├─────────────────────────────────────────┤
│ Sidebar Navigation                      │
│ ├─ Dashboard                            │
│ ├─ Master Data                          │
│ │  ├─ Products                         │
│ │  ├─ Branches                         │
│ │  └─ Users/Roles                      │
│ ├─ System Configuration                 │
│ ├─ Audit & Compliance                   │
│ ├─ Reports                              │
│ └─ Settings                             │
├─────────────────────────────────────────┤
│ Main Content Area                       │
├─────────────────────────────────────────┤
│ Footer: Version, Status                 │
└─────────────────────────────────────────┘
```

## Module Designs

### Module 1: Master Data Management

#### Product Management
```typescript
interface LoanProduct {
  id: string;
  code: string;
  name: string;
  category: 'personal' | 'home' | 'vehicle' | 'gold' | 'msme';
  description: string;
  interestRateType: 'fixed' | 'floating';
  interestRate: number;
  minInterestRate: number;
  maxInterestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minTenure: number;
  maxTenure: number;
  processingFee: number;
  prepaymentFee: number;
  isAvailable: boolean;
  eligibilityCriteria: any;
  createdAt: string;
  updatedAt: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <div className="product-management">
      <div className="header">
        <h1>Loan Products</h1>
        <button onClick={() => setModalOpen(true)}>Add Product</button>
      </div>
      <DataTable data={products} columns={productColumns} />
      <ProductForm open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
```

#### Branch Management
```typescript
interface Branch {
  id: string;
  code: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  managerId: string;
  staffCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const BranchManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  
  return (
    <div className="branch-management">
      <BranchMap branches={branches} />
      <BranchList branches={branches} />
    </div>
  );
};
```

### Module 2: User & Access Management

#### Role Management
```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
}

interface Permission {
  id: string;
  resource: string;
  action: string[];
  scope: 'own' | 'branch' | 'tenant' | 'system';
}

const RoleManager = () => {
  const permissionTemplates = [
    {
      resource: 'customers',
      actions: ['create', 'read', 'update', 'delete', 'verify_kyc']
    },
    {
      resource: 'loans',
      actions: ['create', 'read', 'process', 'approve', 'reject']
    }
  ];
  
  return (
    <div className="role-manager">
      <PermissionBuilder 
        templates={permissionTemplates}
        onSelect={handlePermissionSelect}
      />
    </div>
  );
};
```

#### User Lifecycle
```typescript
interface UserLifecycle {
  userId: string;
  status: 'invited' | 'active' | 'suspended' | 'deactivated';
  invitedAt: string;
  activatedAt: string;
  lastLoginAt: string;
  failedAttempts: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserLifecycle[]>([]);
  
  const inviteUser = async (email: string, role: string) => {
    await api.post('/users/invite', { email, role });
  };
  
  const suspendUser = async (userId: string, reason: string) => {
    await api.put(`/users/${userId}/suspend`, { reason });
  };
  
  return (
    <div className="user-management">
      <UserInviteForm onSubmit={inviteUser} />
      <UserList users={users} onSuspend={suspendUser} />
    </div>
  );
};
```

### Module 3: System Monitoring

#### Health Dashboard
```typescript
interface SystemHealth {
  services: ServiceStatus[];
  database: {
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    connections: number;
  };
  cache: {
    status: 'healthy' | 'degraded' | 'down';
    memoryUsage: number;
  };
  queues: QueueStatus[];
}

const SystemMonitor = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      api.get('/monitor/health').then(setHealth);
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="system-monitor">
      <ServiceStatusGrid services={health?.services} />
      <DatabaseStatus status={health?.database} />
      <CacheStatus status={health?.cache} />
      <QueueStatus queues={health?.queues} />
    </div>
  );
};
```

#### Alert Management
```typescript
interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  message: string;
  details: any;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

const AlertCenter = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  return (
    <div className="alert-center">
      <AlertFilters />
      <AlertList alerts={alerts} onAcknowledge={acknowledgeAlert} />
      <AlertAnalytics />
    </div>
  );
};
```

### Module 4: Compliance & Audit

#### KYC Verification Dashboard
```typescript
const KYCVerification = () => {
  const [pendingKYC, setPendingKYC] = useState<KYCRecord[]>([]);
  
  return (
    <div className="kyc-verification">
      <KYCFilterBar />
      <KYCVerificationTable 
        records={pendingKYC}
        onVerify={verifyKYC}
        onReject={rejectKYC}
      />
    </div>
  );
};
```

#### Audit Trail
```typescript
interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

const AuditTrail = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    dateRange: { start: '', end: '' }
  });
  
  return (
    <div className="audit-trail">
      <AuditFilters filters={filters} onChange={setFilters} />
      <AuditTable logs={logs} />
      <AuditExport onExport={exportLogs} />
    </div>
  );
};
```

### Module 5: Report Generation

#### Report Scheduler
```typescript
interface ScheduledReport {
  id: string;
  name: string;
  type: string;
  format: 'pdf' | 'excel' | 'csv';
  recipients: string[];
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  parameters: any;
  lastRun: string;
  nextRun: string;
}

const ReportScheduler = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  
  return (
    <div className="report-scheduler">
      <ScheduledReportList reports={reports} />
      <ScheduleReportForm onSubmit={scheduleReport} />
    </div>
  );
};
```

## Dashboard Components

### Key Metrics Display
```typescript
const AdminDashboard = () => {
  const metrics = {
    totalCustomers: 15420,
    activeLoans: 8750,
    portfolioValue: 2500000000,
    npaPercentage: 2.5,
    collectionEfficiency: 94.2
  };
  
  return (
    <div className="admin-dashboard">
      <MetricsGrid metrics={metrics} />
      <SystemHealthChart />
      <RecentActivity />
      <QuickActions />
    </div>
  );
};
```

### Metrics Cards
```typescript
const MetricCard = ({ title, value, change, trend }: MetricCardProps) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3>{title}</h3>
        <TrendIndicator value={change} positive={trend === 'up'} />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-change">{change}% from last month</div>
    </div>
  );
};
```

## Role-Based Access

### Permission Matrix
```typescript
const adminPermissions = {
  super_admin: {
    can: ['*'],  // All permissions
    cannot: []
  },
  system_admin: {
    can: [
      'users.manage',
      'systems.configure',
      'audit.view',
      'reports.generate'
    ],
    cannot: ['tenant.delete']
  },
  compliance_officer: {
    can: [
      'kyc.verify',
      'aml.screen',
      'audit.view',
      'compliance.reports'
    ],
    cannot: ['users.delete', 'systems.modify']
  }
};
```

## Security Features

### Two-Factor Authentication
```typescript
const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  useEffect(() => {
    api.post('/auth/2fa/setup').then(response => {
      setQrCode(response.qrCode);
      setBackupCodes(response.backupCodes);
    });
  }, []);
  
  return (
    <div className="two-factor-setup">
      <img src={qrCode} alt="QR Code" />
      <div className="backup-codes">
        {backupCodes.map((code, index) => (
          <code key={index}>{code}</code>
        ))}
      </div>
    </div>
  );
};
```

### IP Whitelist
```typescript
const IPWhitelist = () => {
  const [whitelist, setWhitelist] = useState<string[]>([]);
  
  const addIP = async (ip: string) => {
    await api.post('/security/ip-whitelist', { ip });
    setWhitelist([...whitelist, ip]);
  };
  
  return (
    <div className="ip-whitelist">
      <IPInput onAdd={addIP} />
      <IPList ips={whitelist} onRemove={removeIP} />
    </div>
  );
};
```

## Configuration Management

### Environment Settings
```yaml
adminSettings:
  session:
    timeout: 30  # minutes
    maxConcurrent: 3
  notifications:
    email: true
    sms: false
    slack: true
  backup:
    schedule: "0 2 * * *"  # Daily at 2 AM
    retention: 30  # days
  maintenance:
    window: "02:00-04:00"
    timezone: "Asia/Kolkata"
```

## Error Handling

### Error Boundaries
```typescript
class AdminErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback on Retry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
```

## Testing Strategy

### Jest Tests
```typescript
describe('AdminDashboard', () => {
  it('should display key metrics', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('15,420')).toBeInTheDocument();
    expect(screen.getByText('₹2,500 Cr')).toBeInTheDocument();
  });
  
  it('should handle user suspension', () => {
    const mockUser = { id: '1', name: 'John' };
    render(<UserManagement />);
    fireEvent.click(screen.getByText('Suspend'));
    expect(screen.getByText('Reason required')).toBeInTheDocument();
  });
});
```