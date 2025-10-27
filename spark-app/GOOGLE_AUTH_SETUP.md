# Google OAuth Setup Guide

This guide will walk you through setting up Google authentication for your Spark micro-learning app.

## Prerequisites

- A Supabase project (you already have this)
- A Google Cloud account (free to create)

## Step 1: Create Google Cloud OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name (e.g., "Spark Learning App")
   - Click "Create"

3. **Enable Google+ API** (may not be necessary for newer projects)
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable" (if not already enabled)

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type (unless you have Google Workspace)
   - Click "Create"
   - Fill in the required fields:
     - App name: "Spark Learning"
     - User support email: Your email
     - Developer contact information: Your email
   - Click "Save and Continue"
   - Skip adding scopes (default scopes are sufficient)
   - Click "Save and Continue"
   - Add test users if needed (during development)
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Name it: "Spark Web Client"
   - Add Authorized JavaScript origins:
     - For development: `http://localhost:3000`
     - For production: `https://your-domain.com`
   - Add Authorized redirect URIs:
     - `https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback`
     - Example: `https://abcdefghijk.supabase.co/auth/v1/callback`
   - Click "Create"
   - **Save your Client ID and Client Secret** - you'll need these next!

## Step 2: Configure Supabase

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com/
   - Select your Spark project

2. **Enable Google Provider**
   - Go to "Authentication" > "Providers"
   - Find "Google" in the list
   - Toggle it to "Enabled"

3. **Add OAuth Credentials**
   - Paste your **Client ID** from Google Cloud Console
   - Paste your **Client Secret** from Google Cloud Console
   - Click "Save"

4. **Get Your Callback URL**
   - On the same page, you'll see a "Callback URL (for OAuth)"
   - It should look like: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Make sure this matches what you added in Google Cloud Console

## Step 3: Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Visit the login page**
   - Go to: http://localhost:3000/login
   - You should see a "Sign in with Google" button

3. **Click the Google button**
   - You'll be redirected to Google's login page
   - Sign in with your Google account
   - Grant permissions to the app
   - You should be redirected back to `/dashboard`

4. **Check the database**
   - In Supabase, go to "Table Editor" > "profiles"
   - You should see a new profile created for your Google account

## Step 4: Production Setup

When deploying to production:

1. **Update Google Cloud Console**
   - Add your production domain to "Authorized JavaScript origins"
   - Add your production domain + `/auth/callback` to "Authorized redirect URIs"

2. **Update OAuth Consent Screen**
   - Publish your app (remove "Testing" status)
   - Or keep it in testing mode and add specific test users

3. **No environment variables needed!**
   - All OAuth configuration is handled by Supabase
   - No need to add anything to `.env.local`

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure your redirect URI in Google Cloud Console exactly matches the Supabase callback URL
- Check for typos, missing trailing slashes, or http vs https

### Users Not Creating Profiles
- Check if the `on_auth_user_created` trigger exists in your database
- You can verify this in Supabase SQL Editor with: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`

### "Invalid OAuth Client" Error
- Double-check that you copied the correct Client ID and Secret
- Make sure you saved the credentials in Supabase

### Google Sign-in Button Not Working
- Check the browser console for errors
- Make sure your callback route exists at `/auth/callback/route.ts`
- Verify that your Supabase credentials are correct in `.env.local`

## How It Works

1. User clicks "Sign in with Google"
2. They're redirected to Google's OAuth page
3. User authorizes the app
4. Google redirects back to Supabase with an authorization code
5. Supabase exchanges the code for user info and creates a session
6. User is redirected to `/auth/callback`
7. The callback route exchanges the code for a session
8. User is redirected to `/dashboard`
9. A profile is automatically created via database trigger

## Security Notes

- OAuth Client Secret should be kept secure in Supabase (not in your code)
- Users authenticated via Google will have their email verified by default
- Supabase handles all token management and security
- Sessions are stored in secure HTTP-only cookies

## Additional Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
