# BookToker Media Kit - Complete Setup Guide

This guide will walk you through setting up your BookToker media kit website with Sanity CMS.

## Step 1: Project Files Ready ✅

All project files are already created and configured:
- ✅ Next.js app with RTL support
- ✅ All components built
- ✅ Tailwind CSS with custom color palette
- ✅ GSAP animations configured
- ✅ Sanity CMS schema ready
- ✅ Environment setup

## Step 2: Create Sanity Project

### Option A: Using Sanity.io Dashboard (Recommended)

1. Go to https://www.sanity.io/
2. Sign up or log in
3. Click "Create Project"
4. Fill in project details:
   - **Project Name**: BookToker Media Kit
   - **Dataset**: production
   - **Region**: Choose your region
5. Create the project
6. Note your **Project ID** (you'll need this)

### Option B: Using Sanity CLI

```bash
# Install Sanity CLI globally
npm install -g @sanity/cli

# Initialize Sanity in your project
sanity init

# Follow the prompts and create a new project
```

## Step 3: Connect to Your Project

1. Copy your **Project ID** from Sanity dashboard
2. Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

3. Edit `.env.local` and add:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_SANITY_STUDIO_URL=https://your-project.sanity.studio
```

4. Replace `your_project_id_here` with your actual Project ID

## Step 4: Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 16
- React 19
- Tailwind CSS
- GSAP
- Sanity CMS
- shadcn/ui components
- And more...

## Step 5: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 in your browser. You should see the website!

## Step 6: Access Sanity Studio

The Sanity Studio is available at:

```
http://localhost:3000/studio
```

Or navigate to your Sanity project dashboard directly.

## Step 7: Populate Content in Sanity CMS

In Sanity Studio, you'll find these document types:

### 1. Site Settings
- Profile title
- Description
- Profile image
- Bio
- Social links (TikTok, Instagram, YouTube, WhatsApp)

### 2. About Section
- Title
- Content (long text with formatting)
- Key highlights/stats

### 3. Services
Create documents for each service:
- Service name
- Description
- Icon

Default services included:
- مراجعة الكتب (Book Reviews)
- الترويج على وسائل التواصل (Social Media Promotion)
- تصوير Reels (Reels Production)
- التسويق الثقافي (Cultural Marketing)

### 4. Pricing Packages
Create pricing packages with:
- Package name
- Description
- Price (in SAR)
- Features list

Default packages included:
- مراجعة واحدة (Single Review) - 500 SAR
- باقة شهرية (Monthly Package) - 2000 SAR
- تعاون دور النشر (Publisher Collaboration) - 3500 SAR

### 5. Portfolio Items
Add your previous work:
- Title
- Description
- Image
- Link (to social media post)

## Step 8: Customize Content

### Update Hero Section
Edit in `/components/hero.tsx`:
```tsx
ctaButtons = [
  { text: 'تواصلي معي', href: '#contact', variant: 'default' },
  { text: 'اعرفي الأسعار', href: '#pricing', variant: 'outline' },
]
```

### Update Colors
Edit `/app/globals.css` in the `:root` section:
```css
--primary: 40 25% 40%;
--secondary: 140 35% 35%;
--accent: 35 70% 55%;
```

Colors use HSL format: `hue saturation lightness`

### Update Text Content
- Hard-coded content: Edit component files directly
- Dynamic content: Use Sanity Studio

## Step 9: Build for Production

```bash
npm run build
npm run start
```

## Step 10: Deploy to Vercel (Recommended)

### Automatic Deployment

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SANITY_API_VERSION`
   - `NEXT_PUBLIC_SANITY_STUDIO_URL`
6. Deploy!

### Manual Deployment

```bash
npm install -g vercel
vercel
```

## Troubleshooting

### Issue: "Cannot connect to Sanity"
**Solution:**
- Check environment variables in `.env.local`
- Verify Project ID is correct
- Restart dev server: `npm run dev`

### Issue: "RTL text not displaying correctly"
**Solution:**
- Ensure text is in Arabic
- Check that `dir="rtl"` is set in layout.tsx (it is)
- Clear browser cache

### Issue: "Images not showing"
**Solution:**
- Upload images to Sanity Studio
- Use Sanity image URLs in content
- Or add remote pattern to next.config.mjs for external images

### Issue: "Animations not working"
**Solution:**
- Check browser console for GSAP errors
- Ensure GSAP is imported correctly
- Clear browser cache and rebuild

## Next Steps

1. **Add more portfolio items** - Show your best work
2. **Customize colors** - Match your brand
3. **Add real images** - Replace placeholder images
4. **Update social links** - Point to your accounts
5. **Get a custom domain** - Make it professional
6. **Set up analytics** - Track visitors

## Useful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Sanity CMS Docs**: https://www.sanity.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **GSAP Documentation**: https://greensock.com/docs/
- **Arabic Web Design**: Consider RTL best practices

## Contact & Support

If you need help:
1. Check the main README.md
2. Review component files for customization options
3. Visit documentation links above
4. Check Sanity Studio error messages

---

**Your BookToker media kit website is ready to impress! 🚀**
