# Collections Management Application Design

## Application Overview

The Collections Management Application is designed for collections managers, recovery agents, and legal teams. It provides tools for overdue account management, recovery strategies, and legal case handling.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| State Management | Redux Toolkit |
| Charts | Recharts |
| Maps | Mapbox/Leaflet |
| Data Grid | TanStack Data Table |

## Application Layout

### Collections Dashboard Structure
```
┌─────────────────────────────────────────┐
│ Header: Team Status, Alerts             │
├─────────────────────────────────────────┤
│ Collections Navigation                  │
│ ├─ Portfolio Analysis                  │
│ ├─ Recovery Workbench                  │
│ ├─ Settlement Management               │
│ ├─ Legal Cases                         │
│ └─ NPA Reporting                       │
├─────────────────────────────────────────┤
│ Main Content Area                       │
├─────────────────────────────────────────┤
│ Footer: Case Count, Updates             │
└─────────────────────────────────────────┘
```

## Core Features

### Feature 1: Portfolio Analysis

#### Dashboard Components
```typescript
interface PortfolioMetrics {
  totalOverdue: number;
  npaPercentage: number;
  recoveryRate: number;
  daysPastDueDistribution: {
    d1_30: number;
    d31_60: number;
    d61_90: number;
    d90_plus: number;
  };
  branchPerformance: BranchPerformance[];
}

const PortfolioAnalysis = () => {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  
  return (
    <div className="portfolio-analysis">
      <MetricsCards metrics={metrics} />
      <DPDPieChart data={metrics?.daysPastDueDistribution} />
      <BranchComparisonChart data={metrics?.branchPerformance} />
      <NPARadarChart />
    </div>
  );
};
```

#### NPA Trend Analysis
```typescript
const NPAReporting = () => {
  const [npaData, setNpaData] = useState<NPAData[]>([]);
  
  return (
    <div className="npa-reporting">
      <div className="filters">
        <DateRangePicker />
        <BranchSelector />
        <ProductTypeSelector />
      </div>
      <LineChart 
        data={npaData} 
        lines={[
          { key: 'grossNpa', color: '#ff0000' },
          { key: 'netNpa', color: '#ff6600' }
        ]}
      />
      <div className="export-buttons">
        <button onClick={() => exportPDF()}>Export PDF</button>
        <button onClick={() => exportExcel()}>Export Excel</button>
      </div>
    </div>
  );
};
```

### Feature 2: Recovery Workbench

#### Overdue Account List
```typescript
const RecoveryWorkbench = () => {
  const [accounts, setAccounts] = useState<OverdueAccount[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    tier: 'all',
    branch: 'all',
    priority: 'all'
  });
  
  return (
    <div className="recovery-workbench">
      <div className="toolbar">
        <SearchBox />
        <FilterPanel filters={filters} onChange={setFilters} />
        <BatchActions />
      </div>
      <DataTableRowSelection
        data={accounts}
        columns={accountColumns}
        onSelect={handleAccountSelect}
      />
      <Pagination />
    </div>
  );
};
```

#### Priority Scoring Display
```typescript
const AccountCard = ({ account }: { account: OverdueAccount }) => {
  const priorityColor = {
    high: 'bg-red-100 border-red-500',
    medium: 'bg-yellow-100 border-yellow-500',
    low: 'bg-green-100 border-green-500'
  };
  
  return (
    <div className={`account-card ${priorityColor[account.priority]}`}>
      <div className="card-header">
        <span className="customer-name">{account.customerName}</span>
        <span className="amount">₹{account.outstandingAmount.toLocaleString()}</span>
      </div>
      <div className="card-body">
        <div className="field">
          <span className="label">Days Past Due:</span>
          <span className="value">{account.daysPastDue}</span>
        </div>
        <div className="field">
          <span className="label">Priority Score:</span>
          <span className="value score">{account.priorityScore}/100</span>
        </div>
      </div>
      <div className="card-footer">
        <button onClick={() => handleCollect(account)}>Collect Payment</button>
        <button onClick={() => handleEscalate(account)}>Escalate</button>
      </div>
    </div>
  );
};
```

### Feature 3: Settlement Management

#### Settlement Proposal
```typescript
interface SettlementProposal {
  id: string;
  accountId: string;
  originalAmount: number;
  proposedAmount: number;
  discountPercent: number;
  installmentPlan: {
    enabled: boolean;
    months: number;
    emi: number;
  };
  reason: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

const SettlementModal = ({ account }: { account: OverdueAccount }) => {
  const [proposal, setProposal] = useState<SettlementProposal>({
    id: uuid(),
    accountId: account.id,
    originalAmount: account.outstandingAmount,
    proposedAmount: 0,
    discountPercent: 0,
    installmentPlan: { enabled: false, months: 0, emi: 0 },
    reason: '',
    status: 'draft'
  });
  
  return (
    <div className="settlement-modal">
      <h2>Settlement Proposal</h2>
      <div className="form-group">
        <label>Original Amount</label>
        <input type="number" value={proposal.originalAmount} readOnly />
      </div>
      <div className="form-group">
        <label>Proposed Settlement Amount</label>
        <input 
          type="number" 
          value={proposal.proposedAmount}
          onChange={e => setProposal({...proposal, proposedAmount: +e.target.value})}
        />
      </div>
      <div className="discount-calculator">
        <p>Discount: {proposal.discountPercent}%</p>
      </div>
      <div className="installment-option">
        <label>
          <input
            type="checkbox"
            checked={proposal.installmentPlan.enabled}
            onChange={e => setProposal({
              ...proposal,
              installmentPlan: {...proposal.installmentPlan, enabled: e.target.checked}
            })}
          />
          Offer in Installments
        </label>
      </div>
      <button onClick={sendProposal}>Send for Approval</button>
    </div>
  );
};
```

### Feature 4: Legal Integration

#### Legal Case Tracker
```typescript
interface LegalCase {
  id: string;
  caseId: string;
  accountIds: string[];
  customerName: string;
  filingDate: string;
  courtName: string;
  judgeName: string;
  nextHearingDate: string;
  status: 'filed' | 'acknowledged' | 'hearing' | 'disposed' | 'appealed';
  orderType: 'recovery' | 'installation' | 'admission';
  judgmentAmount: number;
}

const LegalCaseTracker = () => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  
  return (
    <div className="legal-tracker">
      <div className="case-filters">
        <StatusFilter />
        <DateRangeFilter />
        <CourtFilter />
      </div>
      <LegalCaseTimeline cases={cases} />
      <div className="case-details">
        <CaseDetailView />
        <DocumentUploader />
        <HearingScheduler />
      </div>
    </div>
  );
};
```

## Collections Workflow UI

### Tier Management
```typescript
const TierManager = () => {
  const tiers = [
    { level: 1, days: '1-15', action: 'Auto SMS/Email', team: 'System' },
    { level: 2, days: '16-30', action: 'CS Call', team: 'CS Team' },
    { level: 3, days: '31-60', action: 'Field Visit', team: 'Field Agent' },
    { level: 4, days: '61-90', action: 'Recovery Agency', team: 'External' },
    { level: 5, days: '90+', action: 'Legal Notice', team: 'Legal Team' }
  ];
  
  return (
    <div className="tier-manager">
      {tiers.map(tier => (
        <TierCard key={tier.level} tier={tier} />
      ))}
    </div>
  );
};
```

### Collection Activity Log
```typescript
interface CollectionActivity {
  id: string;
  type: 'call' | 'visit' | 'payment' | 'email' | 'escalation';
  timestamp: string;
  agent: string;
  outcome: string;
  nextAction?: string;
}

const ActivityTimeline = ({ activities }: { activities: CollectionActivity[] }) => {
  return (
    <div className="activity-timeline">
      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon">{getActivityIcon(activity.type)}</div>
          <div className="activity-details">
            <div className="activity-type">{activity.type}</div>
            <div className="activity-time">{formatTime(activity.timestamp)}</div>
            <div className="activity-outcome">{activity.outcome}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## Role-Based Views

### Team Lead Dashboard
```typescript
const TeamLeadDashboard = () => {
  const metrics = {
    teamPerformance: [
      { agent: 'Agent 1', collections: 50, amount: 500000 },
      { agent: 'Agent 2', collections: 45, amount: 450000 }
    ],
    pendingTasks: 25,
    overdueAccounts: 150,
    npaAccounts: 12
  };
  
  return (
    <div className="team-lead-dashboard">
      <TeamPerformanceChart data={metrics.teamPerformance} />
      <TaskQueue />
      <UrgentAlerts />
    </div>
  );
};
```

### Agent Dashboard
```typescript
const FieldAgentDashboard = () => {
  const [assignedAccounts, setAssignedAccounts] = useState<OverdueAccount[]>([]);
  const [todaysVisits, setTodaysVisits] = useState<CustomerVisit[]>([]);
  
  return (
    <div className="agent-dashboard">
      <div className="today-summary">
        <h3>Today's Schedule</h3>
        <p>{todaysVisits.length} visits planned</p>
      </div>
      <VisitList visits={todaysVisits} />
      <QuickActions>
        <button>Start GPS Navigation</button>
        <button>Sync Offline Data</button>
      </QuickActions>
    </div>
  );
};
```

## Data Visualization

### Charts & Graphs

#### Collections Funnel
```typescript
const CollectionsFunnel = ({ data }) => {
  return (
    <div className="collections-funnel">
      <FunnelChart data={data}>
        <Funnel dataKey="count" />
        <Tooltip />
        <Legend />
      </FunnelChart>
    </div>
  );
};
```

#### Recovery Rate Trend
```typescript
const RecoveryRateChart = ({ data }) => {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="recoveryRate" 
        stroke="#8884d8" 
        activeDot={{ r: 8 }} 
      />
    </LineChart>
  );
};
```

## Integration Points

### API Integration
```typescript
const collectionsApi = {
  getOverdueAccounts: (params) => api.get('/collections/overdue', { params }),
  recordPayment: (data) => api.post('/collections/payment', data),
  escalateAccount: (accountId, tier) => api.post(`/collections/${accountId}/escalate`, { tier }),
  getTeamPerformance: (teamId, dateRange) => api.get('/collections/team-performance', { params: { teamId, dateRange } })
};
```

### WebSocket for Real-time Updates
```typescript
const useCollectionUpdates = () => {
  const [updates, setUpdates] = useState<CollectionUpdate[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket('wss://api.company.com/collections/updates');
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUpdates(prev => [update, ...prev.slice(0, 49)]);
    };
  }, []);
  
  return updates;
};
```

## Reporting

### Custom Report Builder
```typescript
const ReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState({
    name: '',
   .dataSource: 'collections',
    fields: [],
    filters: [],
    groupBy: '',
    sortBy: ''
  });
  
  return (
    <div className="report-builder">
      <div className="config-panel">
        <FieldNameSelector onChange={field => addField(field)} />
        <FilterBuilder onChange={filters => setReportConfig({...reportConfig, filters})} />
        <GroupByIndexSelector onChange={group => setReportConfig({...reportConfig, groupBy: group})} />
      </div>
      <ReportPreview config={reportConfig} />
      <button onClick={saveReport}>Save Report</button>
    </div>
  );
};
```

## Performance Optimization

### Virtual Scrolling
```typescript
const VirtualCollectionList = ({ accounts }) => {
  const { rows, containerProps, wrapperProps } = useVirtual({
    count: accounts.length,
    overscan: 5,
    estimateSize: () => 200
  });
  
  return (
    <div {...containerProps}>
      <div {...wrapperProps}>
        {rows.map(row => (
          <div key={row.index} style={row.style}>
            <AccountCard account={accounts[row.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Mobile Responsiveness

### Mobile Adaptations
```css
@media (max-width: 768px) {
  .agent-dashboard {
    padding: 8px;
  }
  
  .account-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    flex-direction: row;
  }
}
```

## Security Features

### Role-Based Access Control
```typescript
const collectionsPermissions = {
  collector: [
    'accounts:view_assigned',
    'collections:record_payment',
    'customers:view_priority'
  ],
  team_lead: [
    'accounts:view_team',
    'collections:view_all',
    'reports:team_performance'
  ],
  manager: [
    'npa:manage',
    'legal:manage_cases',
    'reports:generate_all'
  ]
};
```

## Testing Strategy

### Integration Tests
```typescript
describe('Collections Workbench', () => {
  it('should display overdue accounts', async () => {
    cy.task('db:seed', 'overdue_accounts');
    cy.visit('/collections');
    cy.get('[data-testid="account-card"]').should('have.length', 10);
  });
  
  it('should record payment', () => {
    cy.visit('/collections/123');
    cy.get('[data-testid="payment-button"]').click();
    cy.get('[data-testid="amount-input"]').type('10000');
    cy.get('[data-testid="submit-payment"]').click();
    cy.contains('Payment recorded').should('be.visible');
  });
});
```