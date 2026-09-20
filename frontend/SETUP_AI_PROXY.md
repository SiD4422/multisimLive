# Setting up the Hosted AI Proxy

This guide explains how to set up the Vercel Edge Function proxy so users can use the AI Diagnosis feature without needing their own Gemini API key.

## Steps

1. Go to your **Vercel dashboard**
2. Navigate to your project -> **Settings** -> **Environment Variables**
3. Add a new variable:
   - Key: `GEMINI_API_KEY`
   - Value: (Your Gemini API key from Google AI Studio)
4. Save and **Redeploy** your project.

The proxy will be live at `https://your-domain.com/api/gemini` and automatically rate-limits users to 10 requests per day per IP.
