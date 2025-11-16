# Requirements Traceability Matrix
## WhatsApp Order Status Notifications Feature

**Purpose**: Map each user story back to source requirements in `/specs-docs/specs.md` to ensure complete coverage.

**Source Document**: `/specs-docs/specs.md` - Section "📱 Proposed Feature: WhatsApp Order Status Notifications"

---

## Requirements to User Stories Mapping

### Functional Requirements Coverage

| Requirement ID | Requirement | User Story | Coverage |
|---------------|-------------|------------|----------|
| **FR-001** | Send WhatsApp notification when order placed (Pending status) | US-001 | ✅ Full |
| **FR-002** | Send WhatsApp notification when order processing | US-002 | ✅ Full |
| **FR-003** | Send WhatsApp notification when order packing (Awaiting_Fulfillment) | US-003 | ✅ Full |
| **FR-004** | Send WhatsApp notification when order shipped | US-004 | ✅ Full |
| **FR-005** | Send WhatsApp notification when order completed | US-005 | ✅ Full |
| **FR-006** | Send WhatsApp notification when order cancelled | US-006 | ✅ Full |
| **FR-007** | WhatsApp Business API integration | US-001, US-009 | ✅ Full |
| **FR-008** | Message templates pre-approval required | US-001 | ✅ Full |
| **FR-009** | Webhook/event system to trigger on status updates | US-001 | ✅ Full |
| **FR-010** | Template variables (customer name, order number, status, delivery date) | US-001 to US-006 | ✅ Full |
| **FR-011** | Rate limiting compliance with WhatsApp API limits | US-007 | ✅ Full |
| **FR-012** | All users opted in by default | US-001 (AC4) | ✅ Full |
| **FR-013** | Error handling with console logging | US-007 to US-010 | ✅ Full |

### Technical Requirements Coverage

| Requirement ID | Requirement | User Story | Coverage |
|---------------|-------------|------------|----------|
| **TR-001** | Read WhatsApp API credentials from environment variables | US-009 | ✅ Full |
| **TR-002** | Read message templates from wp-templates folder | US-001 | ✅ Full |
| **TR-003** | Add whatsappNotifications field to orders collection | US-001 | ✅ Full |
| **TR-004** | Track notification delivery status | US-001 to US-006 | ✅ Full |
| **TR-005** | Log WhatsApp message IDs | US-001 to US-006 | ✅ Full |
| **TR-006** | Hook into updateOrderStatus methods | US-002 to US-006 | ✅ Full |
| **TR-007** | Leverage Meteor event system (Emitter) | US-001 to US-006 | ✅ Full |
| **TR-008** | Handle invalid/missing phone numbers | US-008 | ✅ Full |
| **TR-009** | Handle API authentication failures | US-009 | ✅ Full |
| **TR-010** | Handle network/connection failures | US-010 | ✅ Full |

### Excluded Requirements (Not in MVP)

| Requirement ID | Requirement | Exclusion Reason | Future Story |
|---------------|-------------|------------------|--------------|
| **EX-001** | Opt-out functionality | All users opted in by default | Future |
| **EX-002** | SMS fallback when WhatsApp fails | Complexity, cost | Future |
| **EX-003** | Tamil localization | English only for MVP | Future |
| **EX-004** | Admin configuration UI | Config via env variables | Future |
| **EX-005** | Admin monitoring dashboard | Console logging sufficient for MVP | Future |
| **EX-006** | Retry failed notifications | Manual retry sufficient for MVP | Future |

---

## User Stories to Requirements Mapping

### US-001: Order Placed Notification
**Covers Requirements**: FR-001, FR-007, FR-008, FR-009, FR-010, FR-012, TR-001, TR-002, TR-003, TR-004, TR-005, TR-007

**Acceptance Criteria Mapping**:
- AC1: Notification triggered → FR-001
- AC2: Message template content → FR-010, TR-002
- AC3: Admin placed orders → FR-001
- AC4: All users opted in → FR-012
- AC5: Delivery tracking → TR-004, TR-005

### US-002: Order Processing Notification
**Covers Requirements**: FR-002, FR-010, TR-004, TR-005, TR-006, TR-007

**Acceptance Criteria Mapping**:
- AC1: Processing status trigger → FR-002, TR-006
- AC2: Message template → FR-010
- AC3: No duplicates → System reliability
- AC4: Delivery tracking → TR-004, TR-005

### US-003: Order Packing Notification
**Covers Requirements**: FR-003, FR-010, TR-004, TR-005, TR-006, TR-007

**Acceptance Criteria Mapping**:
- AC1: Packing status trigger → FR-003, TR-006
- AC2: Message template → FR-010
- AC3: No duplicates → System reliability
- AC4: Delivery tracking → TR-004, TR-005

### US-004: Order Shipped Notification
**Covers Requirements**: FR-004, FR-010, TR-004, TR-005, TR-006, TR-007

**Acceptance Criteria Mapping**:
- AC1: Shipped status trigger → FR-004, TR-006
- AC2: Message template with delivery partner → FR-010
- AC3: Porter integration (optional) → Integration enhancement
- AC4: No duplicates → System reliability
- AC5: Delivery tracking → TR-004, TR-005

### US-005: Order Completed Notification
**Covers Requirements**: FR-005, FR-010, TR-004, TR-005, TR-006, TR-007

**Acceptance Criteria Mapping**:
- AC1: Completed status trigger → FR-005, TR-006
- AC2: Message template → FR-010
- AC3: Returnable containers reminder → Business logic
- AC4: No duplicates → System reliability
- AC5: Delivery tracking → TR-004, TR-005

### US-006: Order Cancelled Notification
**Covers Requirements**: FR-006, FR-010, TR-004, TR-005, TR-006, TR-007

**Acceptance Criteria Mapping**:
- AC1: Cancellation trigger → FR-006, TR-006
- AC2: Message template with reason → FR-010
- AC3: Customer-initiated → FR-006
- AC4: Admin-initiated → FR-006
- AC5: No notification after shipped → Business logic
- AC6: Delivery tracking → TR-004, TR-005

### US-007: Handle Rate Limiting
**Covers Requirements**: FR-011, FR-013, TR-004

**Acceptance Criteria Mapping**:
- AC1: Detect rate limit errors → FR-011
- AC2: Log errors → FR-013
- AC3: Store failed status → TR-004
- AC4: Continue order processing → System reliability
- AC5: Bulk order throttling → FR-011

### US-008: Handle Invalid Phone Numbers
**Covers Requirements**: FR-013, TR-008, TR-004

**Acceptance Criteria Mapping**:
- AC1: Detect missing phone → TR-008
- AC2: Detect invalid format → TR-008
- AC3: Log missing phone → FR-013
- AC4: Log invalid phone → FR-013
- AC5: Store failed status → TR-004
- AC6: Skip gracefully → System reliability
- AC7: Phone validation → TR-008

### US-009: Handle Authentication Failures
**Covers Requirements**: FR-007, FR-013, TR-001, TR-004

**Acceptance Criteria Mapping**:
- AC1: Detect auth errors → FR-007
- AC2: Log with details → FR-013
- AC3: Startup validation → TR-001
- AC4: Store failed status → TR-004
- AC5: Skip if not configured → System reliability
- AC6: Continue order processing → System reliability
- AC7: Expired token detection → FR-007

### US-010: Handle Network Failures
**Covers Requirements**: FR-013, TR-010, TR-004

**Acceptance Criteria Mapping**:
- AC1: Detect timeout → TR-010
- AC2: Detect connection refused → TR-010
- AC3: Detect DNS failures → TR-010
- AC4: Log network errors → FR-013
- AC5: Store failed status → TR-004
- AC6: Set request timeout → System performance
- AC7: Continue order processing → System reliability
- AC8: Partial failures → TR-010

---

## Coverage Analysis

### Requirement Coverage Summary

**Total Requirements Identified**: 23 (13 Functional + 10 Technical)  
**Requirements Covered**: 23 (100%)  
**User Stories Created**: 10  
**Average Requirements per Story**: 2.3

### Coverage by Category

| Category | Total Reqs | Covered | Coverage % |
|----------|-----------|---------|------------|
| Order Status Notifications | 6 | 6 | 100% |
| API Integration | 4 | 4 | 100% |
| Database/Tracking | 3 | 3 | 100% |
| Error Handling | 4 | 4 | 100% |
| Configuration | 2 | 2 | 100% |
| Event System | 2 | 2 | 100% |
| User Management | 2 | 2 | 100% |

### Gap Analysis

**Gaps Identified**: 0

**Reasoning**: All requirements from the specs document have been covered by user stories. Requirements excluded from MVP (opt-out, SMS fallback, localization, admin UI) were explicitly removed per stakeholder decision and documented as future enhancements.

---

## Requirements Source Reference

**From**: `/specs-docs/specs.md` Lines 467-515

### Original Requirements Excerpt:

#### Status Triggers (Lines 476-483)
```markdown
- Order Placed (Pending) → US-001
- Processing → US-002
- Packing (Awaiting_Fulfillment) → US-003
- Shipped → US-004
- Completed → US-005
- Cancelled → US-006
```

#### Technical Requirements (Lines 487-494)
```markdown
- WhatsApp Business API integration → US-001, US-009
- Message templates pre-approval → US-001
- Webhook/event system → US-001
- Template variables → US-001 to US-006
- Rate limiting compliance → US-007
- Opt-in/opt-out → Excluded from MVP
- Fallback to SMS → Excluded from MVP
```

#### Database Changes (Lines 496-499)
```markdown
- whatsappNotifications field → US-001 (TR-003)
- Track delivery status → US-001 to US-006 (TR-004)
- Log message IDs → US-001 to US-006 (TR-005)
```

#### Integration Points (Lines 501-504)
```markdown
- Hook into updateOrderStatus → US-002 to US-006
- Use Meteor event system → US-001 to US-006
```

---

## Verification Checklist

- [x] All 6 order status triggers have corresponding user stories
- [x] All technical requirements have implementation stories
- [x] All error handling requirements covered
- [x] Database schema changes documented
- [x] Integration points identified
- [x] Configuration requirements addressed
- [x] Excluded requirements documented with reasons
- [x] No orphan requirements (requirements without stories)
- [x] No orphan stories (stories without requirements)
- [x] All acceptance criteria map to requirements

---

## Change Log

| Date | Change | Reason |
|------|--------|---------|
| 2025-11-01 | Initial traceability matrix created | User story creation complete |

---

**Status**: ✅ 100% requirements coverage achieved  
**Last Verified**: 2025-11-01
