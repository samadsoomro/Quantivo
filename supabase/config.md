# Supabase Configuration Notes

## Google OAuth Display Name

**USER ACTION REQUIRED:**
If the Google OAuth popup shows the Supabase URL instead of "Quantivo", you must update this in Google Cloud Console. This cannot be fixed in code.

1. Go to console.cloud.google.com → project `quantivo-500405`
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Change the **"App name"** field to **"Quantivo"**
4. Save your changes. The Google popup will then show "Continue to Quantivo".
