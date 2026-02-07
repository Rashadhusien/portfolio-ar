# BookToker Media Kit Website

A professional, modern, and fully RTL-supported Arabic media kit website for BookTokers (book content creators). Built with Next.js 16, TypeScript, Tailwind CSS, and Sanity CMS.

## Features

✨ **Design & UX**
- Fully RTL (Right-to-Left) support for Arabic content
- Elegant dark academia aesthetic with warm earthy colors
- Smooth GSAP animations on scroll
- Responsive mobile-first design
- Professional portfolio showcase
- Stunning hero section with profile image

🎯 **Functionality**
- Dynamic content management via Sanity CMS
- SEO optimized with Next.js Metadata API
- Contact form integration
- Social media links (TikTok, Instagram, YouTube, WhatsApp)
- Pricing packages with feature highlights
- Services showcase
- About/Bio section with stats
- Portfolio gallery

🛠️ **Technology Stack**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- GSAP for animations
- Sanity CMS for content management
- next-sanity for Sanity integration
- Lucide React for icons

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd booktoker-media-kit
npm install
```

### 2. Set Up Sanity CMS

#### Option A: Using Existing Sanity Project
If you already have a Sanity project:

```bash
npm install -g @sanity/cli
sanity init --project-id YOUR_PROJECT_ID --dataset production
```

#### Option B: Create New Sanity Project

```bash
npm install -g @sanity/cli
sanity init
# Follow the prompts to create a new project
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Sanity details:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_SANITY_STUDIO_URL=https://your-project.sanity.studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
booktoker-media-kit/
├── app/
│   ├── layout.tsx          # Root layout with RTL config
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles & theme tokens
├── components/
│   ├── header.tsx          # Navigation header
│   ├── hero.tsx            # Hero section
│   ├── about.tsx           # About/Bio section
│   ├── services.tsx        # Services showcase
│   ├── portfolio.tsx       # Portfolio/Previous work
│   ├── pricing.tsx         # Pricing packages
│   ├── contact.tsx         # Contact section
│   ├── footer.tsx          # Footer
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── sanity.client.ts    # Sanity client setup
│   └── gsap.ts             # GSAP animations utilities
├── sanity.config.ts        # Sanity CMS configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.mjs         # Next.js configuration
├── .env.example            # Environment variables template
└── package.json            # Dependencies
```

## Customization

### Update Content

Edit content directly through the Sanity Studio:

```bash
npm run dev
# Visit: http://localhost:3000/studio
```

Or update component props in `app/page.tsx`.

### Modify Colors

Edit the CSS variables in `app/globals.css`:

```css
:root {
  --primary: 40 25% 40%;        /* Main brand color */
  --secondary: 140 35% 35%;     /* Accent color */
  --accent: 35 70% 55%;         /* Highlight color */
  /* ... other colors */
}
```

### Add Sections

Create new components in `/components` and add them to `app/page.tsx`:

```tsx
import { YourNewSection } from '@/components/your-section'

export default function Page() {
  return (
    <main>
      {/* ... existing sections */}
      <YourNewSection />
    </main>
  )
}
```

## Sanity CMS Schema

The website includes pre-configured schemas for:

- **Site Settings**: Profile info, social links, bio
- **About**: Bio content, highlights, stats
- **Services**: Service offerings with descriptions
- **Pricing Packages**: Pricing tiers with features
- **Portfolio**: Previous work/collaborations

Access Sanity Studio admin panel to manage these documents.

## Animations

GSAP animations are configured for:
- Hero section text reveal
- Scroll-triggered section reveals
- Hover effects on cards
- Smooth transitions

Animation utilities are in `lib/gsap.ts`. Customize by editing those functions.

## SEO Optimization

- Arabic meta tags configured
- Open Graph support
- Dynamic metadata via Next.js API
- Semantic HTML structure
- Image optimization with next/image

## Performance

- Code splitting via dynamic imports
- Image optimization with Next.js
- CSS-in-JS with Tailwind
- Server-side rendering where possible
- Optimized bundle size

## Deployment

### Deploy to Vercel

```bash
npm run build
vercel
```

### Other Platforms

```bash
npm run build
npm run start
```

## Troubleshooting

### Sanity Connection Issues

1. Verify environment variables are correct
2. Check that Sanity project is active
3. Ensure API token has proper permissions (if using authenticated requests)

### RTL Layout Issues

- The layout is set to RTL globally in `layout.tsx`
- Ensure all text is in Arabic for proper RTL rendering
- Use Tailwind's directional utilities (e.g., `ml-` for RTL becomes right margin)

### GSAP Animations Not Working

- Ensure GSAP is initialized only in client components (`'use client'`)
- Check browser console for animation errors
- Verify DOM elements have correct selectors

## Contributing

This is a custom project. For modifications:

1. Create a new branch
2. Make your changes
3. Test locally
4. Deploy to production

## License

This project is for personal use.

## Support

For issues or questions:
- Check the documentation above
- Review Sanity CMS docs: https://www.sanity.io/docs
- Check Next.js docs: https://nextjs.org/docs
- Visit Tailwind docs: https://tailwindcss.com/docs

---

**Built with ❤️ for BookTokers | Made with Next.js + Sanity CMS**
