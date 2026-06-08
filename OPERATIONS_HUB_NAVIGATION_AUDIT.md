# Operations Hub Navigation Structure

**Last Updated:** 2026-05-29  
**Status:** ✅ Complete & Tested

## Overview

The Operations Hub has been restructured as a unified **Operations + Compliance Knowledge & Process Centre**. The hub serves as the operational command centre, with clear tab separation for different user needs.

---

## Tab Structure (7 Tabs)

### 1. **Overview** (Default Landing Page)
- **Icon:** LayoutDashboard
- **Sort Order:** 1
- **Purpose:** Operational command centre
- **Content:**
  - Hub Tools (8 featured operational tools)
  - Quick Launch (8 popular quick links)
  - Resources/Enablement Library (6 key documents)
  - Recent Activity Feed
  - Announcements Panel
  - Calendar Widget
  - Notifications
  - Upcoming Reviews/Audits

**Primary User Question:** "What's happening in operations today?"

---

### 2. **SOPs & Processes**
- **Icon:** BookOpen
- **Sort Order:** 2
- **Purpose:** Operational knowledge centre
- **Content:**
  - SOP Library (12 SOPs)
  - Process Documents
  - Process Maps
  - SOP Tasks
  - SOP Updates
  - SOP Search (AI-powered)

**Widgets:** 6 configured
- Resource Library (SOP Library)
- Resource Library (Process Documents)
- Resource Library (Process Maps)
- Tasks widget
- Announcements widget
- AI Knowledge Search

**Primary User Question:** "How do I do this?"

---

### 3. **Compliance**
- **Icon:** Shield
- **Sort Order:** 3
- **Purpose:** Compliance knowledge centre
- **Content:**
  - Policy Library
  - DBS Eligibility Guidance
  - Data Protection Policies
  - GDPR Documents
  - Right to Work Guidance
  - BPSS Guidance
  - Audit Requirements
  - Compliance Updates

**Widgets:** 9 configured
- Compliance Status
- KPI: Compliance Score
- Expiring Certifications
- Policy Acknowledgements
- Audit Actions
- Training Due Soon
- Announcements
- Resource Library
- AI Knowledge Search

**Primary User Question:** "What are the rules?"

**Future Features:**
- Policy acknowledgement tracking
- Review tracking
- Compliance workflows

---

### 4. **Documents**
- **Icon:** FileText
- **Sort Order:** 4
- **Purpose:** General document library
- **Content:**
  - Shared Documents
  - Forms
  - Downloads
  - Checklists
  - Reference Guides
  - Operational Resources
  - PDFs
  - Supporting Documentation

**Widgets:** 5 configured
- Document Library (large)
- Activity Feed
- Quick Links
- Document Search
- Calendar

**Primary User Question:** "I need a file."

---

### 5. **Templates**
- **Icon:** Layout
- **Sort Order:** 5
- **Purpose:** Template library (future-focused)
- **Content:** Coming Soon
- **Future Templates:**
  - Policy Templates
  - Audit Templates
  - Risk Templates
  - Process Templates
  - Meeting Templates
  - Investigation Templates
  - Operational Templates

**Widgets:** 1 configured
- Coming Soon placeholder

---

### 6. **Operations Tools**
- **Icon:** Zap
- **Sort Order:** 6
- **Purpose:** Central operational tools directory
- **Note:** This is the FULL tool directory. The Overview page shows only featured tools.

**Current Tools (12):**
1. SOP Builder
2. Policy Builder
3. Audit Tracker
4. Risk Register
5. Review Scheduler
6. Process Mapper
7. Document Library
8. Compliance Checker
9. Action Tracker
10. Document Generator
11. Improvement Suggestions
12. Operations AI

**Widgets:** 2 configured
- All Operations Tools (quick_links grid)
- Tool Status (operational_alerts)

**Future Tools:**
- Policy Builder enhancements
- Risk Register advanced features
- Audit Tracker workflows
- Review Scheduler automations
- Process Mapper visualizations
- Improvement Tracker
- Compliance Checker advanced rules
- Action Tracker integrations
- Document Generator templates

---

### 7. **AI Assistant**
- **Icon:** Sparkles
- **Sort Order:** 7
- **Purpose:** Operational Copilot
- **Content:** Full-page AI interface

**Capabilities:**
- Find Documents
- Explain SOPs
- Explain Policies
- Explain DBS Guidance
- Summarise Documents
- Recommend Training
- Answer Operational Questions
- Guide Staff Through Processes
- Locate Resources

**Widgets:** 4 configured
- AI Assistant (main)
- AI Knowledge Search
- AI Recommended
- AI Suggested Actions

---

## Quick Launch Items (8)

Displayed on Overview tab:

1. SOP Library (cyan)
2. Policy Library (green)
3. Document Library (blue)
4. Audit Tracker (purple)
5. Risk Register (amber)
6. Process Mapper (pink)
7. SOP Builder (blue, Featured badge)
8. Compliance Checker (green)

---

## Hub Tools (Featured on Overview)

8 featured tools displayed in the Overview grid:

1. **SOP Builder** (cyan)
   - Create and manage Standard Operating Procedures

2. **Policy Builder** (green)
   - Draft and publish company policies

3. **Audit Tracker** (purple)
   - Track audit actions and compliance deadlines

4. **Risk Register** (amber)
   - Log, assess, and mitigate operational risks

5. **Review Scheduler** (blue)
   - Schedule document and policy reviews

6. **Process Mapper** (pink)
   - Map and visualise operational workflows

7. **Document Library** (cyan)
   - Search and browse all operational documents

8. **Compliance Checker** (green)
   - Verify compliance with policies and regulations

---

## Admin Configuration

### Seeding Function
**Function:** `seedOperationsHub` (functions/seedOperationsHub)

**Responsibilities:**
- Creates/updates 7 tabs with correct configuration
- Seeds quick links (8 items)
- Seeds hub tools (12 items)
- Seeds enablement resources (6 items)
- Seeds widgets per tab:
  - Overview: 12 widgets
  - SOPs & Processes: 6 widgets
  - Compliance: 9 widgets
  - Documents: 5 widgets
  - Templates: 1 widget (Coming Soon)
  - Operations Tools: 2 widgets
  - AI Assistant: 4 widgets

**Total: 39 widgets**

**Cleanup:**
- Automatically removes old "processes" tab and its widgets
- Refreshes templates tab with new Coming Soon state
- Only creates missing items (idempotent)

---

## Design Specifications

- **Dark SaaS Styling:** ✅ Glassmorphism design maintained
- **Consistency:** ✅ Matches Sales Hub layout and styling
- **Scalability:** ✅ Structure ready for future tool expansion
- **No Duplication:** ✅ Clear separation between tabs
- **Dashboard Disabled:** ✅ Operations Hub has no dashboard embed
- **Theme Support:** ✅ Full dark mode support with accent colors

---

## Key Changes from Previous Version

| Item | Previous | New |
|------|----------|-----|
| Tab Count | 7 (mixed structure) | 7 (clear purpose) |
| "Processes" tab | "Processes" | "SOPs & Processes" |
| Templates tab | Various widgets | Coming Soon placeholder |
| Operations Tools | Limited featured | Full directory (12 tools) |
| Dashboard | Shown | Hidden (showDashboard=false) |
| Quick Links | 8 items | 8 items (updated) |

---

## Testing Checklist

- [x] All 7 tabs display correctly
- [x] Tab navigation works
- [x] Overview tab shows all sections (Tools, Quick Launch, Resources, Activity, Announcements, Calendar)
- [x] SOPs & Processes tab loads correctly
- [x] Compliance tab loads with all widgets
- [x] Documents tab loads
- [x] Templates tab shows Coming Soon state
- [x] Operations Tools tab shows full directory
- [x] AI Assistant tab loads
- [x] Sidebar displays (Calendar, Notifications, Recently Updated, Upcoming)
- [x] Dashboard is hidden from Overview
- [x] Admin panel reflects new structure
- [x] Seed function is idempotent
- [x] Old widgets cleaned up properly

---

## Navigation Hierarchy

```
Operations Hub (/)
├── Overview (default) 
├── SOPs & Processes
├── Compliance
├── Documents
├── Templates (Coming Soon)
├── Operations Tools
└── AI Assistant
```

---

## Future Enhancements

1. **Templates Tab** - Populate with policy, audit, risk templates
2. **Operations Tools** - Add more specialized tools as needed
3. **Compliance Workflows** - Add approval and review workflows
4. **Policy Acknowledgements** - Track staff policy read confirmations
5. **Advanced Analytics** - Add compliance and process analytics
6. **Integration with DBS** - Connect to DBS checking workflows
7. **Audit Trail** - Track compliance activities and changes
8. **Training Assignments** - Link training to policy requirements

---

## Entity References

**Main Entities:**
- `SalesHubTabConfig` - Stores tab configuration
- `HubContentItem` - Stores all content (tools, quick links, widgets, enablement)
- `HubConfiguration` - Stores branding and hub-level settings

**Seeding:**
- `seedOperationsHub` - Main seed function (backend)
- Runs idempotently, only creates missing items
- Can be safely re-run multiple times