# AESTrak v2 - Project Context Document

> **Project Vision**: A streamlined PO tracking application for construction companies to monitor spending against purchase order authorizations through Excel data imports, featuring proactive alerts and professional dashboards.

---

## Executive Summary

AESTrak v2 is a simplified, focused SaaS application for construction companies to track Purchase Order (PO) spending through Quantity Survey (QS) imports. The primary objective is to prevent QS values from exceeding PO authorization limits through real-time monitoring and proactive alerting.

### Key Business Value

- **Time Savings**: Automated PO vs QS reconciliation instead of manual Excel calculations
- **Risk Prevention**: Proactive alerts when spending approaches or exceeds PO limits
- **Professional Dashboard**: Executive-level visibility into spending patterns and utilization
- **Compliance**: Audit trail and organized financial tracking

---

## Core Architecture

### Technology Stack

```yaml
Framework: Next.js 15 (App Router) + TypeScript
Database: Supabase PostgreSQL with Row Level Security
Authentication: Supabase Auth with multi-tenant support
Payments: Stripe subscriptions with webhook synchronization
Styling: Tailwind CSS + shadcn/ui components
Email: React Email with Resend delivery
File Processing: Excel parsing with openpyxl/pandas equivalents
Hosting: Vercel with analytics
```

### Project Structure

```
src/
├── app/                    # Next.js 15 app router
├── components/ui/          # Reusable shadcn/ui components
├── features/              # Feature-based organization
│   ├── auth/              # Authentication & user management
│   ├── organizations/     # Organization management
│   ├── purchase-orders/   # PO viewing and management
│   ├── quantity-surveys/  # QS viewing and management
│   ├── imports/           # Excel file processing
│   ├── dashboard/         # Analytics and reporting
│   └── alerts/            # Notification system
├── libs/                  # Shared utilities
└── types/                 # TypeScript definitions
```

---

## Data Model & Excel Integration

### Purchase Orders (2,557 records from export)

Based on `DOWREAD-ICS.orders.xlsx`:

```typescript
interface PurchaseOrder {
  // Core identification
  purchase_order_no: string; // Primary identifier
  status: string; // Order status
  company: string; // Client company (e.g., "Dow Chemical")

  // Financial data
  order_value: number; // Total PO authorization amount
  total_spent: number; // Calculated from QS imports
  remaining_budget: number; // order_value - total_spent
  utilization_percent: number; // (total_spent / order_value) * 100

  // Descriptive information
  order_short_text: string; // Brief description
  vendor_id: string; // Vendor identifier
  vendor_short_term: string; // Vendor name
  work_coordinator_name: string; // Project coordinator

  // Dates and tracking
  start_date: string;
  completion_date: string;
  created_at: timestamp;
  updated_at: timestamp;

  // Organization scoping
  organization_id: uuid; // Multi-tenant isolation
}
```

### Quantity Surveys (193,317 records from export)

Based on `DOWREAD-ICS.QS.xlsx`:

```typescript
interface QuantitySurvey {
  // Linking to POs
  purchase_order_no: string; // Links to PO (foreign key)
  qs_number: string; // Unique QS identifier

  // Financial data
  total: number; // QS billing amount

  // Descriptive information
  quantity_survey_short_text: string;
  contractor_contact: string;
  vendor_id: string;

  // Processing dates
  created_date: string; // When QS was created
  transfer_date: string; // When submitted
  accepted_date: string; // When approved

  // Invoice tracking
  invoice_number: string;
  invoice_date: string;
  accounting_document: string;

  // Organization scoping
  organization_id: uuid; // Multi-tenant isolation
}
```

### Critical Business Logic

```typescript
// Core calculation functions
calculateUtilization(orderValue: number, totalSpent: number): number {
  return orderValue > 0 ? (totalSpent / orderValue) * 100 : 0
}

getAlertStatus(utilization: number): AlertLevel {
  if (utilization >= 100) return 'over_budget'    // Red - Immediate action
  if (utilization >= 90) return 'critical'        // Orange - Review required
  if (utilization >= 75) return 'warning'         // Yellow - Monitor closely
  return 'on_track'                               // Green - Normal
}
```

---

## Feature Requirements (MVP)

### 1. Dashboard Overview

**Professional executive dashboard matching mockup design:**

- Critical alerts bar (always visible when issues exist)
- Key metrics cards: Active POs, Total Authorization, Submitted Billings, At Risk, Daily Billing Rate
- Risk distribution visualization (bar chart with utilization buckets)
- Spending trend chart (7D/30D/90D periods)
- Top billing POs list with utilization percentages
- Recent QS submissions table
- Quick action buttons (Export Excel, PDF, Search, Settings)

### 2. Data Import System

**Manual Excel upload with validation:**

- Upload PO file (`DOWREAD-ICS.orders.xlsx` format)
- Upload QS file (`DOWREAD-ICS.QS.xlsx` format)
- Data validation and error reporting
- Import preview before processing
- Historical data override (latest wins)
- Import audit logging

### 3. Purchase Order Management

**View-only with advanced filtering:**

- List view with pagination (handle 2,500+ records efficiently)
- Advanced filtering: Status, Vendor, Coordinator, Value Range, Utilization %
- Sorting by any column
- Search across PO numbers, descriptions, vendors
- Detailed PO view with QS breakdown
- Utilization alerts and visual indicators

### 4. Quantity Survey Tracking

**QS records linked to POs:**

- QS list view with PO association
- Filter by PO, date ranges, status
- QS detail view with invoice information
- Running totals per PO
- Orphaned QS detection (no matching PO)

### 5. Alerting System

**Proactive threshold monitoring:**

- Real-time utilization calculations
- Alert thresholds: 75% (warning), 90% (critical), 100% (over budget)
- In-app notifications with bell icon counter
- Email alerts (daily summary + critical immediate)
- Alert history and acknowledgment
- Custom alert settings per organization

### 6. Export & Reporting

**Professional reporting capabilities:**

- Excel export with multiple sheets (POs, QSs, Summary)
- PDF executive summary reports
- Spending trend analysis
- Variance reports (budget vs actual)
- Custom date range reporting

---

## User Management & Permissions

### Organization Structure

**One organization per customer, multiple users per organization:**

- Each organization = one construction company
- Organization-scoped data (complete isolation)
- Single subscription per organization

### User Roles

```typescript
interface User {
  id: uuid;
  email: string;
  organization_id: uuid; // Fixed - no switching
  role: 'admin' | 'viewer';
  created_at: timestamp;
}

// Permission matrix
const permissions = {
  admin: {
    upload_data: true,
    view_all_data: true,
    export_data: true,
    manage_users: true,
    billing_management: true,
    alert_configuration: true,
  },
  viewer: {
    upload_data: true, // All users can upload
    view_all_data: true, // All users can view
    export_data: true, // All users can export
    manage_users: false,
    billing_management: false,
    alert_configuration: false,
  },
};
```

### Authentication Flow

1. User signs up with organization name
2. First user becomes Admin automatically
3. Admin can invite additional users (Admin or Viewer role)
4. Email verification required
5. Password reset capability
6. Audit logging for all user actions

---

## Design System

### Color Palette

Based on dashboard mockup and existing Tailwind config:

```css
/* Primary Colors */
--primary: #3b82f6 /* Blue - primary actions, links */ --primary-foreground: #ffffff
  /* Alert Colors (matching dashboard mockup) */ --success: #10b981 /* Green - on track (<75%) */
  --warning: #f59e0b /* Yellow - monitor (75-89%) */ --critical: #fb923c
  /* Orange - critical (90-99%) */ --danger: #ef4444 /* Red - over budget (≥100%) */
  /* Neutral Colors */ --background: #f8fafc /* Light gray background */ --foreground: #1e293b
  /* Dark text */ --card: #ffffff /* Card backgrounds */ --border: #e2e8f0 /* Subtle borders */
  --muted: #64748b /* Secondary text */;
```

### Component Standards

**Based on shadcn/ui with custom extensions:**

- Consistent spacing (Tailwind spacing scale)
- Rounded corners (0.5rem default radius)
- Professional animations (subtle, purposeful)
- Accessible contrast ratios (WCAG AA compliant)
- Mobile-first responsive design

### Dashboard Layout

**Professional construction industry aesthetic:**

- Clean, data-dense layout
- Prominent alert system at top
- Card-based metric displays
- Interactive charts and visualizations
- Consistent typography hierarchy
- Efficient use of screen real estate

---

## Security & Compliance

### Multi-Tenant Architecture

```sql
-- Row Level Security patterns
CREATE POLICY "organization_isolation" ON purchase_orders
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- All tables with organization_id use similar RLS policies
-- Automatic organization context in all queries
-- No manual filtering required in application code
```

### Data Security

- All data encrypted at rest (Supabase default)
- TLS encryption in transit
- Row Level Security enforces data isolation
- No cross-organization data leakage possible
- Supabase audit logs for database access
- Application audit logs for user actions

### GDPR/Privacy Compliance

- User data export capability
- Account deletion with data removal
- Privacy policy and terms of service
- Cookie consent management
- Data retention policies

---

## Development Workflow

### Environment Setup

```bash
# Core development
npm run dev                    # Start development server
npm run build                  # Production build
npm run lint                   # ESLint checking
npm run test                   # Run test suite

# Database management
npm run db:generate-types      # Generate Supabase types
npm run db:migrate             # Run pending migrations via Supabase CLI
```

### Project Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Testing**: TDD approach - write tests first
- **Code Quality**: ESLint + Prettier + Husky pre-commit
- **Git Workflow**: Feature branches, PR reviews required
- **Documentation**: Inline comments for complex business logic

### Performance Requirements

- Page load times: <3 seconds for dashboard
- Excel import: <30 seconds for 200k records
- Search/filter response: <500ms
- Database queries: Proper indexing on filtered fields
- Large dataset pagination: Efficient cursor-based pagination

---

## Implementation Priorities

### Phase 1: Core MVP (Weeks 1-4)

1. **Authentication & Organization Setup**
   - Supabase Auth integration
   - Organization creation and user management
   - Role-based permissions

2. **Data Foundation**
   - Database schema for POs and QSs
   - Excel import processing
   - Basic CRUD operations

3. **Essential UI**
   - Dashboard layout
   - PO listing and detail views
   - Basic filtering and search

### Phase 2: Advanced Features (Weeks 5-8)

1. **Dashboard Analytics**
   - Metrics calculations
   - Chart integrations
   - Risk distribution visualization

2. **Alert System**
   - Threshold monitoring
   - Email notifications
   - Alert management UI

3. **Export System**
   - Excel export functionality
   - PDF report generation
   - Custom report templates

### Phase 3: Polish & Optimization (Weeks 9-12)

1. **Performance Optimization**
   - Large dataset handling
   - Query optimization
   - Caching strategies

2. **User Experience**
   - Advanced filtering
   - Bulk operations
   - Mobile responsiveness

3. **Billing & Deployment**
   - Stripe integration
   - Production deployment
   - Monitoring and logging

---

## Success Metrics

### Technical KPIs

- Dashboard load time: <3 seconds
- Excel import success rate: >95%
- Alert delivery time: <5 minutes
- Search response time: <500ms
- System uptime: >99.5%

### Business KPIs

- Time to identify over-budget POs: <1 day (vs weeks manually)
- User adoption rate: >80% monthly active users
- Customer support tickets: <5/month/organization
- User satisfaction score: >4.5/5

### User Feedback Targets

- "Dashboard gives me everything I need at a glance"
- "Excel import saves us 10+ hours per week"
- "Alerts caught our budget overrun before it became a problem"
- "Clean, professional interface our executives love"

---

## Technical Debt Prevention

### Code Organization

- Feature-based folder structure
- Clear separation of concerns (models, services, controllers)
- Consistent naming conventions
- Comprehensive TypeScript types

### Testing Strategy

- Unit tests for business logic
- Integration tests for API endpoints
- Contract tests for external services
- Performance tests for large datasets

### Documentation

- API documentation (OpenAPI spec)
- Database schema documentation
- User guides and training materials
- Deployment and operations runbooks

---

_This document serves as the single source of truth for AESTrak v2 development. Update as requirements evolve and new insights emerge._
