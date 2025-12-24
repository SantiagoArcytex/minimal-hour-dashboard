# Vercel Deployment Checklist

## ✅ Environment Variables to Set in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add these:

### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `AIRTABLE_API_KEY` | `patXXXXXXXXXXXXXX` | Your Airtable Personal Access Token |
| `AIRTABLE_BASE_ID` | `appXXXXXXXXXXXXXX` | Your Airtable Base ID (from the URL) |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Your production URL (Vercel will provide this) |
| `NEXTAUTH_SECRET` | `ctanRJjNqBoNjpIC7dBs/uWElEKUtcv0I4ga4GwDi30=` | Generated secret (or generate your own) |
| `ADMIN_EMAIL` | `your-admin@email.com` | Email for admin login |
| `ADMIN_PASSWORD` | `your-secure-password` | Password for admin login |
| `NEXT_PUBLIC_BASE_URL` | `https://your-project.vercel.app` | Same as NEXTAUTH_URL (for client page URLs) |

### Generate Your Own NEXTAUTH_SECRET (Optional)

If you want to generate a new secret:
```bash
openssl rand -base64 32
```

### Important Notes:
- Set all variables for **Production** environment
- You can optionally set different values for **Preview** and **Development** environments
- After adding variables, you must **Redeploy** for them to take effect

---

## ✅ Code Changes Needed

**Good news: No code changes are required!** 

The codebase is already production-ready. However, you may want to verify:

1. ✅ NextAuth configuration is correct (already uses `NEXTAUTH_SECRET`)
2. ✅ Environment variables are properly referenced
3. ✅ Airtable client is server-side only (already implemented)

---

## ✅ What to Add

**Nothing additional is required!** The project is ready to deploy.

However, you can optionally add:

### Optional: Create `vercel.json` (if needed for custom config)

The project should work without this, but if you need custom routing or headers:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**Note:** Vercel auto-detects Next.js projects, so this is usually not needed.

---

## 🚀 Deployment Steps

1. **Connect Repository to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import `SantiagoArcytex/minimal-hour-dashboard`
   - Framework Preset: **Next.js** (auto-detected)
   - Click "Deploy"

2. **Set Environment Variables:**
   - After first deployment, go to **Settings** → **Environment Variables**
   - Add all 7 variables listed above
   - Make sure to set them for **Production** environment

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

4. **Verify:**
   - Visit your deployed URL
   - Test admin login at `/admin`
   - Generate a client page URL
   - Test the client dashboard

---

## 🔍 Quick Reference

### Get Your Airtable Credentials:
1. **API Key:** [Airtable Account](https://airtable.com/account) → Developer → Personal Access Tokens
2. **Base ID:** From your Airtable base URL: `https://airtable.com/[BASE_ID]/...`

### After Deployment:
- Your site will be at: `https://your-project.vercel.app`
- Admin login: `https://your-project.vercel.app/admin`
- Client pages: `https://your-project.vercel.app/client/[clientId]`

---

## ⚠️ Common Issues

1. **"AIRTABLE_API_KEY environment variable is required"**
   - Solution: Add all env vars and redeploy

2. **"Unauthorized" when generating client page**
   - Solution: Check `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `NEXTAUTH_SECRET` are set

3. **Client pages return 404**
   - Solution: Ensure `NEXT_PUBLIC_BASE_URL` matches your Vercel URL

4. **Build fails**
   - Solution: Check Vercel logs for specific errors
   - Ensure all dependencies are in `package.json`

---

## 📝 Summary

- **Environment Variables:** 7 required variables (see table above)
- **Code Changes:** None needed ✅
- **Additional Files:** None required ✅
- **Ready to Deploy:** Yes! 🚀

