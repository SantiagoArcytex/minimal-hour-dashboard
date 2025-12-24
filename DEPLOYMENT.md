# Deployment Guide

This guide covers deploying the Minimal Hour Dashboard application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A GitHub/GitLab/Bitbucket repository with your code
- An Airtable account with:
  - API key
  - Base ID
  - Tables: "Clients" and "Hours Log" configured as specified

## Step 1: Prepare Your Airtable Base

Ensure your Airtable base has the following structure:

### Clients Table
- **Name** (Single line text)
- **Company** (Single line text, optional)
- **GeneratedPageURL** (Single line text, initially empty)

### Hours Log Table
- **ClientID** (Link to Clients table)
- **Date** (Date)
- **Consultant** (Single line text)
- **Description** (Long text)
- **Status** (Single select: "Billable" or "Non-billable")
- **Hours** (Number)
- **Internal** (Checkbox)

## Step 2: Get Your Airtable Credentials

1. Go to [Airtable Account](https://airtable.com/account)
2. Navigate to "Developer" section
3. Create a new Personal Access Token (API key)
4. Copy your Base ID from the Airtable base URL:
   - URL format: `https://airtable.com/[BASE_ID]/...`
   - The Base ID is the string between `/` and the table name

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project

## Step 4: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AIRTABLE_API_KEY` | Your Airtable Personal Access Token | `patXXXXXXXXXXXXXX` |
| `AIRTABLE_BASE_ID` | Your Airtable Base ID | `appXXXXXXXXXXXXXX` |
| `NEXTAUTH_URL` | Your production URL | `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Secret for NextAuth (see below) | Generated secret |
| `ADMIN_ACCOUNTS` | Multiple admin accounts (recommended) | `admin1@domain.com:password1,admin2@domain.com:password2` |
| `ADMIN_EMAIL` | Single admin login email (legacy) | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Single admin login password (legacy) | `your_secure_password` |
| `NEXT_PUBLIC_BASE_URL` | Public base URL for client pages | `https://yourdomain.com` |

**Note:** Use either `ADMIN_ACCOUNTS` (for multiple admins) OR `ADMIN_EMAIL`/`ADMIN_PASSWORD` (for single admin). If both are set, `ADMIN_ACCOUNTS` takes precedence.

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

### Environment-Specific Variables

You can set different values for:
- **Production**: Your live site
- **Preview**: Preview deployments (optional)
- **Development**: Local development (optional)

## Step 5: Redeploy

After setting environment variables:

1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Or trigger a new deployment by pushing to your main branch

## Step 6: Verify Deployment

1. Visit your deployed URL (e.g., `https://yourproject.vercel.app`)
2. Test the admin login at `/admin`
3. Generate a client page URL
4. Visit the generated client dashboard URL

## Troubleshooting

### Common Issues

**"AIRTABLE_API_KEY environment variable is required"**
- Ensure you've set all environment variables in Vercel
- Redeploy after adding variables

**"Failed to fetch clients"**
- Verify your Airtable API key is correct
- Check that your Base ID matches the base you're accessing
- Ensure the table names match exactly: "Clients" and "Hours Log"

**"Unauthorized" when generating client page**
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set correctly
- Check that `NEXTAUTH_SECRET` is set

**Client pages return 404**
- Ensure `NEXT_PUBLIC_BASE_URL` is set to your production URL
- Check that the GeneratedPageURL in Airtable matches your domain

### Checking Logs

1. Go to your Vercel project dashboard
2. Click on a deployment
3. View **Logs** tab for runtime errors
4. Check **Functions** tab for API route errors

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to use your custom domain

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for `ADMIN_PASSWORD`
- Rotate `NEXTAUTH_SECRET` periodically
- Keep your Airtable API key secure
- Consider using Vercel's environment variable encryption

## Support

For issues specific to:
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Airtable**: [Airtable Support](https://support.airtable.com/)

