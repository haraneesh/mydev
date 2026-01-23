# Meteor Settings Configuration

**Version**: 1.0  
**Updated**: January 19, 2026  
**Purpose**: Configure Meteor backend for Namma Suvai Mobile App

---

## Overview

The Meteor backend requires specific settings in `settings.json` to support the Namma Suvai mobile app. This document outlines all required and optional configurations.

---

## File Structure

Meteor settings should be provided in a JSON file (typically `settings.json`) with the following structure:

```json
{
  "public": {
    // Public settings (accessible from mobile app)
  },
  "private": {
    // Private settings (server-only, not sent to app)
  }
}
```

---

## Required Settings

### PayTM Payment Gateway Configuration

The Payments feature requires Paytm configuration in Meteor settings.

#### Public Settings (Meteor.settings.public)

```json
{
  "public": {
    "PayTM": {
      "merchantId": "YOUR_PAYTM_MERCHANT_ID",
      "hostName": "securegw.paytm.in",
      "callbackUrl": "https://yourdomain.com/payment/callback",
      "websiteName": "YOUR_WEBSITE_NAME"
    }
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `merchantId` | String | ✅ Yes | Your Paytm merchant account ID |
| `hostName` | String | ✅ Yes | Paytm API endpoint |
| `callbackUrl` | String | ✅ Yes | URL for payment callbacks |
| `websiteName` | String | ✅ Yes | Website name registered with Paytm |

#### Private Settings (Meteor.settings.private)

```json
{
  "private": {
    "PayTM": {
      "merchantKey": "YOUR_PAYTM_MERCHANT_KEY",
      "websiteName": "YOUR_WEBSITE_NAME",
      "zoho_fund_deposit_account_id": "YOUR_ZOHO_ACCOUNT_ID"
    }
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `merchantKey` | String | ✅ Yes | Your Paytm merchant secret key |
| `websiteName` | String | ✅ Yes | Must match public websiteName |
| `zoho_fund_deposit_account_id` | String | ⚠️ Optional | Zoho account for deposits |

---

## Environment-Specific Configuration

### Staging Environment

Use these settings for testing:

```json
{
  "public": {
    "PayTM": {
      "merchantId": "TESTING123456",
      "hostName": "securegw-stage.paytm.in",
      "callbackUrl": "https://staging.yourdomain.com/payment/callback",
      "websiteName": "YOURSITE_STAGING"
    }
  },
  "private": {
    "PayTM": {
      "merchantKey": "YOUR_STAGING_KEY_HERE",
      "websiteName": "YOURSITE_STAGING",
      "zoho_fund_deposit_account_id": "STAGING_ACCOUNT_ID"
    }
  }
}
```

**Key Differences:**
- Use staging Paytm account credentials
- Use `securegw-stage.paytm.in` endpoint
- Use staging callback URL
- Use staging Zoho account (if applicable)

### Production Environment

```json
{
  "public": {
    "PayTM": {
      "merchantId": "PRODUCTION123456",
      "hostName": "securegw.paytm.in",
      "callbackUrl": "https://yourdomain.com/payment/callback",
      "websiteName": "YOURSITE_PROD"
    }
  },
  "private": {
    "PayTM": {
      "merchantKey": "YOUR_PRODUCTION_KEY_HERE",
      "websiteName": "YOURSITE_PROD",
      "zoho_fund_deposit_account_id": "PROD_ACCOUNT_ID"
    }
  }
}
```

**Key Differences:**
- Use production Paytm account credentials
- Use `securegw.paytm.in` endpoint
- Use production domain for callbacks
- Use production Zoho account

---

## Additional Settings (Optional)

### Zoho Integration

```json
{
  "private": {
    "Zoho": {
      "apiUrl": "https://www.zohoapis.com/books/v3",
      "authToken": "YOUR_ZOHO_AUTH_TOKEN",
      "organizationId": "YOUR_ZOHO_ORG_ID"
    }
  }
}
```

### Email Configuration

```json
{
  "private": {
    "Email": {
      "from": "noreply@nammasuvai.com",
      "paymentReceiptTemplate": "payment_receipt_template_id"
    }
  }
}
```

---

## Starting the Server

### With Settings File

```bash
# Development
meteor run --settings settings-dev.json

# Staging
meteor run --settings settings-staging.json

# Production
meteor run --settings settings-prod.json
```

### With Environment Variables

```bash
export PAYTM_MERCHANT_ID="YOUR_MERCHANT_ID"
export PAYTM_MERCHANT_KEY="YOUR_MERCHANT_KEY"
export PAYTM_WEBSITE_NAME="YOUR_WEBSITE_NAME"

meteor run
```

---

## Validating Configuration

### Check if Settings Are Loaded

On your Meteor server, add debugging:

```javascript
if (Meteor.isServer) {
  console.log('PayTM Settings:', Meteor.settings.public?.PayTM);
  console.log('Merchant Key loaded:', !!Meteor.settings.private?.PayTM?.merchantKey);
}
```

### Test Payment Endpoint

```bash
curl -X POST https://yourdomain.com/api/payment/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected response:
```json
{
  "status": "S",
  "message": "Configuration valid"
}
```

---

## Security Best Practices

### ✅ DO's

✅ **Store Keys Securely**
- Use environment variables for sensitive data
- Never commit keys to version control
- Use `.gitignore` for settings files

✅ **Rotate Keys Regularly**
- Change Paytm merchant key monthly
- Keep audit logs of key changes
- Document rotation dates

✅ **Limit Access**
- Restrict Meteor settings to admin only
- Use role-based access control
- Audit who accesses settings

✅ **Use HTTPS**
- All callbacks must use HTTPS
- Verify SSL certificates
- Redirect HTTP to HTTPS

✅ **Monitor Transactions**
- Log all payment attempts
- Set up alerts for failures
- Regular reconciliation with Paytm

### ❌ DON'Ts

❌ **Never Hardcode Keys**
- Always use environment variables
- Never commit keys to git
- Never log full keys

❌ **Don't Share Keys Unsecurely**
- Use secure channels only (encrypted email, password manager)
- Never share via messaging apps
- Never paste in chat/logs

❌ **Don't Use Test Keys in Production**
- Always use production merchant ID/key
- Verify environment before deployment
- Double-check staging vs production

❌ **Don't Disable SSL/HTTPS**
- Always use secure connections
- Never bypass certificate validation
- Enforce HTTPS everywhere

❌ **Don't Log Sensitive Data**
- Never log merchant key or full card details
- Never log transaction tokens
- Never log OTP or verification codes

---

## Troubleshooting

### Issue: "Configuration Error" on App

**Symptoms:**
- Payment initialization fails
- Error message: "Invalid Paytm configuration"
- Payments menu shows error

**Solutions:**
1. Verify settings file is loaded:
   ```bash
   meteor logs | grep -i paytm
   ```

2. Check if keys match:
   ```bash
   echo $PAYTM_MERCHANT_ID
   ```

3. Verify public/private split:
   - `merchantId` should be in `public`
   - `merchantKey` should be in `private`

4. Restart Meteor server:
   ```bash
   meteor stop
   meteor run --settings settings.json
   ```

### Issue: "Unauthorized" Payment Error

**Symptoms:**
- Payment fails with 401/403 error
- "Merchant not configured" message
- Invalid merchant ID error

**Solutions:**
1. Verify merchant ID is correct
2. Check Paytm account is active
3. Confirm credentials match Paytm console
4. Verify environment (staging vs production)

### Issue: "Callback URL Invalid"

**Symptoms:**
- Payment succeeds but callback fails
- Invoice status not updating
- Webhook errors in logs

**Solutions:**
1. Verify callback URL is reachable:
   ```bash
   curl https://yourdomain.com/payment/callback
   ```

2. Check firewall/DNS settings
3. Verify HTTPS certificate
4. Ensure URL matches Paytm registration

### Issue: "Zoho Sync Failed"

**Symptoms:**
- Payment succeeds but invoice not updated
- Error: "Failed to sync with Zoho"
- Invoice status mismatch

**Solutions:**
1. Verify Zoho settings in private config
2. Check Zoho API token validity
3. Verify Zoho account permissions
4. Check API rate limits

---

## Complete Example

### Minimal settings.json (Development)

```json
{
  "public": {
    "PayTM": {
      "merchantId": "TESTING123456",
      "hostName": "securegw-stage.paytm.in",
      "callbackUrl": "http://localhost:3000/payment/callback",
      "websiteName": "TESTSUVAI"
    }
  },
  "private": {
    "PayTM": {
      "merchantKey": "test_key_123456789",
      "websiteName": "TESTSUVAI",
      "zoho_fund_deposit_account_id": "dev_account_123"
    }
  }
}
```

### Complete settings.json (Production)

```json
{
  "public": {
    "PayTM": {
      "merchantId": "PROD_MERCHANT_ID_HERE",
      "hostName": "securegw.paytm.in",
      "callbackUrl": "https://nammasuvai.com/payment/callback",
      "websiteName": "SUVAIRETAIL"
    }
  },
  "private": {
    "PayTM": {
      "merchantKey": "prod_key_xyz789abc",
      "websiteName": "SUVAIRETAIL",
      "zoho_fund_deposit_account_id": "prod_zoho_account_123"
    },
    "Zoho": {
      "apiUrl": "https://www.zohoapis.com/books/v3",
      "authToken": "zoho_auth_token_here",
      "organizationId": "zoho_org_id_here"
    }
  }
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Paytm merchant account created
- [ ] Staging test account credentials obtained
- [ ] Production credentials obtained
- [ ] SSL certificate installed and valid
- [ ] Callback URL verified and whitelisted in Paytm
- [ ] settings.json secured and not in version control
- [ ] Environment variables configured on server
- [ ] Zoho account linked (if using)
- [ ] Email notifications configured
- [ ] Monitoring and alerting set up
- [ ] Payment testing in staging completed
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Team trained on settings management

---

## Support

### Getting Paytm Credentials

1. Log in to Paytm Merchant Dashboard
2. Navigate to Settings → Account Keys
3. Copy Merchant ID and Merchant Key
4. Note the Website Name

**Resources:**
- [Paytm Merchant Dashboard](https://dashboard.paytm.com/)
- [Paytm Integration Guide](https://developer.paytm.com/)
- [Paytm Support](https://support.paytm.com/)

### Getting Zoho Credentials

1. Log in to Zoho Books
2. Navigate to Settings → API
3. Generate new auth token
4. Note Organization ID

**Resources:**
- [Zoho Books API](https://www.zoho.com/books/api/)
- [Zoho Support](https://support.zoho.com/)

### Technical Support

For issues with Meteor settings:
- Email: dev-support@nammasuvai.com
- Slack: #payments-integration
- Hours: Mon-Fri 9AM-6PM IST

---

**Version**: 1.0  
**Last Updated**: January 19, 2026  
**Status**: Production Ready
