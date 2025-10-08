# Deployment Guide for Netlify

## Environment Variables Required

Add these environment variables in your Netlify dashboard:

### Required Variables:
```
TRON_NETWORK=shasta
TRON_PRIVATE_KEY=c11d680ad95dcb9913389c924a5608497e31af32b33bce2e00598f5701088b4c
CONTRACT_ADDRESS=TAYVYDTXA11rpRzqu8jQb5aGmbJAr1RnQo
```

### Optional Variables (for email notifications):
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Build Configuration:
```
Build Command: npm run build
Publish Directory: .next
Node Version: 18.x
```

## How to Add Environment Variables in Netlify:

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Click "Add variable"
5. Add each variable with its value
6. Redeploy your site

## Build Settings:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18.x` (or latest LTS)

## Notes:
- The app uses file-based storage (no database required)
- TronWeb types are now properly configured
- All blockchain functionality will work in production
