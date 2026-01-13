# Design: Mobile Profile Page Enhancement

## Context
The Flutter mobile application provides basic user profile management (name, email, phone), but lacks the comprehensive profile features available in the web client (dietary preferences, packing preferences, delivery address management, etc.). This design documents how to bridge that gap while reusing existing Meteor infrastructure and methods.

## Goals / Non-Goals

**Goals:**
- Achieve feature parity between mobile and web profile pages
- Reuse existing Meteor methods and subscriptions without modification
- Provide smooth, validated form UX on mobile
- Support all user preference settings

**Non-Goals:**
- Adding new profile fields beyond what exists in web client
- Creating new Meteor methods (reuse existing `users.editUserProfile`)
- Changing user data schema
- Implementing OAuth-specific flows (focus on password-based accounts)

## Decisions

### 1. Extend User Model
**Decision:** Add new optional fields to User model to match Meteor profile structure (salutation, preferences, delivery info)

**Rationale:** 
- Flutter app already uses User model as single source of truth
- Minimizes serialization/deserialization logic
- Consistent with AuthProvider pattern

**Alternatives considered:**
- Create separate PreferencesModel - adds complexity without benefit
- Store preferences only in Meteor - requires constant re-fetching

### 2. Reuse Meteor Methods
**Decision:** Use existing `users.editUserProfile` Meteor method without modification

**Rationale:**
- Method already handles all profile fields from web client
- Minimizes backend coupling
- Web client uses this method successfully

**Alternatives considered:**
- Create new mobile-specific method - violates DRY principle
- Use different method - increases backend maintenance burden

### 3. Form Layout
**Decision:** Use scrollable SingleChildScrollView with card-based field groupings

**Rationale:**
- Matches current UI pattern in mobile app
- Handles various device heights gracefully
- Clear visual separation of field groups

**Alternatives considered:**
- Tab-based interface - adds complexity
- Collapsible sections - UX overhead for linear form

### 4. Validation Strategy
**Decision:** Mirror web client validation: validate on blur, show errors inline

**Rationale:**
- User expects consistent validation across platforms
- Prevents confusion about required vs optional fields
- Early feedback improves UX

### 5. Constants Management
**Decision:** Create preferences constants file mirroring web client constants

**Rationale:**
- Single source of truth for valid preference values
- Easy to update when preferences change
- Prevents mismatch between mobile/web enums

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| User model gets complex with many fields | Clean optional fields, logical organization in UI |
| Form becomes too long on small screens | Scrollable container, group related fields |
| Preferences may not match Meteor schema | Reference web client Profile.js exactly; add unit tests |
| Password change conflicts with OAuth users | Check user auth type, only show password fields for password-based accounts |

## Migration Plan

1. **No schema migration needed** - Meteor backend already supports all fields
2. **Backward compatibility** - Optional fields won't break existing users
3. **Gradual rollout** - New fields appear automatically when user updates profile
4. **Fallback** - If user has no preferences set, form shows sensible defaults

## Open Questions

- Should we validate field lengths/formats for delivery address? (Proposed: No, let backend handle)
- Do we need address autocomplete? (Proposed: Out of scope, revisit if location services added)
- Should dietary preferences be multi-select? (Proposed: No, match web client single-select)
