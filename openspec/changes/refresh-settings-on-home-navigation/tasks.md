## Implementation Tasks

### 1. Settings Service Enhancement
- [ ] 1.1 Add a public `refreshSettings()` method to `SettingsService` that clears cache and fetches fresh data
- [ ] 1.2 Test the refresh method in isolation

### 2. Home Screen Integration
- [ ] 2.1 Update `HomeScreen` to call `refreshSettings()` on initialization
- [ ] 2.2 Add loading state handling (show loading indicator while settings refresh)
- [ ] 2.3 Handle error cases gracefully with fallback to cached/mock settings
- [ ] 2.4 Test home screen navigation and settings refresh flow

### 3. Integration Testing
- [ ] 3.1 Test full flow: navigate to home → settings refresh → data updates
- [ ] 3.2 Test error handling: failed refresh → fallback to cache/mocks
- [ ] 3.3 Verify no performance regression from repeated refreshes
