# Real Data Debugging Guide

**Problem**: "Why am I still seeing mock products (Hyderabadi Biryani, Masala Dosa)?"

---

## Quick Diagnosis

### Step 1: Check Console Logs
When you run `flutter run`, look for:

```
✅ GOOD:
"✅ Using 12 real products from Meteor server"

⚠️ BAD:
"⚠️ No products from server, using mock data as fallback"
"Available collections: []"
```

---

## If You See Mock Data

### Checklist:

#### 1. Is Meteor Server Running?
```bash
# Check if localhost:3000 is responding
curl -s http://localhost:3000 | head -5
# Should see HTML content
```

#### 2. Does Meteor Have Products?
```bash
# In Meteor console or MongoDB:
db.products.find().count()
# Should return > 0
```

#### 3. Is the Publication Configured?
```bash
# Check server logs for:
"Meteor.publish('products.list', ...)"
```

#### 4. Does Flutter See the DDP Connection?
Look for in Flutter console:
```
Connecting to Meteor server at http://localhost:3000
Connected to Meteor server
Fetching products from Meteor: category=null, availableOnly=true
```

#### 5. Is DDP Subscription Activating?
The MeteorClient should log when subscription 'ready':
```
📨 ready: {subs: ['subscription-id']}
```

---

## Common Issues & Fixes

### Issue 1: "Available collections: []"
**Meaning**: DDP subscription established but NO documents received

**Causes**:
- Meteor products collection is empty
- Publication not returning any results
- Wrong publication name

**Fix**:
```javascript
// In Meteor console, check:
Products.find().count()
// If 0, add test products:
Products.insert({
  name: "Test Product",
  price: 100,
  category: "Test"
})
```

### Issue 2: No Connection Message
**Meaning**: WebSocket isn't connecting

**Causes**:
- Meteor not running on localhost:3000
- Firewall blocking WebSocket
- Wrong URL

**Fix**:
```bash
# Verify Meteor is running:
ps aux | grep meteor
# Should see: meteor run

# If not running:
meteor run
```

### Issue 3: Publications Not Found
**Meaning**: Meteor says it doesn't know about 'products.list'

**Causes**:
- Publication not defined in server code
- Server restart needed
- Wrong publication name

**Fix**:
```javascript
// In imports/api/Products/server/publications.js
// Should have:
Meteor.publish('products.list', () => {
  return Products.find({});
});
```

---

## Detailed Debugging

### Option A: Check MeteorClient State
Add this to your code temporarily:
```dart
// After ProductService connects:
print('Connected: ${productService.isConnected}');

// After fetching:
print('Collections: ${_meteorClient.collections.keys.toList()}');
print('Product docs: ${_meteorClient.getCollectionDocuments('products').length}');
```

### Option B: Monitor Network
In Flutter DevTools:
1. Open Network tab
2. Filter for WebSocket messages
3. Look for 'added' messages with product data

### Option C: Check Meteor Server
```bash
# SSH to server and check:
mongo
db.products.find().limit(3)
```

---

## Expected DDP Message Sequence

If everything is working, you should see:

```
1. Client → 'connect'
2. Server → 'connected'
3. Client → 'sub' (products.list)
4. Server → 'added' (product 1)
5. Server → 'added' (product 2)
6. Server → 'added' (product 3)
...
7. Server → 'ready'
```

If you don't see steps 4-6, that's the problem.

---

## Quick Fix Checklist

- [ ] Meteor server running (`meteor run`)
- [ ] Products exist in MongoDB (`db.products.find().count()`)
- [ ] Publication exists (`imports/api/Products/server/publications.js`)
- [ ] WebSocket connection logs appear
- [ ] DDP 'added' messages in logs
- [ ] 'ready' message received

---

## If Everything Is Fine But Still Mock Data

Then **mock data is actually the fallback behavior**, which is correct. The code prioritizes:
1. Real data if available
2. Mock data if subscription is empty

**This is intentional** - graceful degradation.

---

**Questions?** Check the DDP protocol logs or Meteor server output.
