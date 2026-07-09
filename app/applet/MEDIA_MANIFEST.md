# 📸 Media Manifest & Asset Checklist

This document lists every location in the codebase where a placeholder exists and a real image, video, logo, or icon asset needs to be provided by the brand. 

Use this checklist to ensure the application is fully branded and ready for production.

---

## 🛠️ How to Update Assets

There are two primary ways assets are managed in this application:

### 1. Self-Served (Via Admin Dashboard)
Product photos are entirely dynamic. The business owner or admin can update these without needing a developer or AI Studio.
*   **How:** Log in with an Admin account -> Go to Dashboard -> Products. Edit an existing product or create a new one, and upload the image file(s) there. The system will handle resizing/cropping.

### 2. Code-Managed (Via AI Studio / Developer)
Structural branding assets like the main logo, favicons, homepage hero banners, and social icons are embedded in the application code.
*   **How:** These files must be uploaded to the `public/` directory (or provided via URL), and the corresponding code in the React components must be updated to point to the new asset file names. You will need to ask the AI Studio agent to "update the navbar logo with [file name]" or "add the favicon".

---

## 📋 Asset Checklist

### 1. Brand Identity & Global Assets

| File / Component | Asset Needed | Current State | Recommendation |
| :--- | :--- | :--- | :--- |
| `index.html` & `public/` | **Favicon / App Icon** | Not yet built (No `<link rel="icon">`) | PNG or SVG, 1:1 square (e.g., 512x512px). Needs to be added to `index.html`. |
| `src/components/Navbar.tsx` (Line 103) | **Main Brand Logo** | Text Placeholder ("Product Image") | SVG or PNG with transparent background. Approx. height: `50px`. |
| `src/components/Footer.tsx` (Line 14) | **Footer Brand Logo** | Text Placeholder ("Product Image") | SVG or PNG with transparent background. Approx. height: `40px`. (Often a monochrome or white version of the logo). |
| `src/components/Footer.tsx` (Lines 21-23) | **Social Icons (FB, IG, X)** | Generic `lucide-react` icons | Optional: Real brand-specific icon assets if custom styling is preferred over generic vectors. |
| `src/pages/Receipt.tsx` (Line 34) | **Receipt Print Logo** | Text Placeholder ("Logo") | A simple, high-contrast (preferably black & white) logo for printing. Code-managed. Recommended: 3:1 width-to-height ratio. |

### 2. Homepage (`src/pages/Home.tsx`)

| Location | Asset Needed | Current State | Recommendation |
| :--- | :--- | :--- | :--- |
| **Hero Section** (Line 67) | Main Hero Product Shot | Grey Placeholder box | High-resolution lifestyle shot or large product hero. Recommended: 16:9 or 4:3, min 1200px wide. |
| **Bento Grid** (Line 108, 121, 134) | 3x Background Banners | Transparent Overlay Placeholders | Thematic background imagery (e.g., spices, kitchens, farms). Recommended: 16:9 or Square depending on card size. |
| **Bento Grid** (Line 165) | Variant Thumbnails | Grey Placeholder box | Handled via product data (if linked to a specific product) or static image. |
| **Stats Background** (Line 194) | Background Image Overlay | Transparent Overlay Placeholder | Dark/moody thematic image to sit behind the statistics counter. |
| **Our Story Section** (Line 249) | Brand Story Image | Grey Placeholder box (300x300) | Authentic photo of the founders, kitchen, or original recipe making. Recommended: 1:1 Square, ~800x800px. |
| **Recipes/Blog Grid** (Line 298) | Recipe Thumbnail Image | Grey Placeholder box | Appetizing food shots for the "How to Enjoy" grid. Recommended: 4:3 or Square. |
| **Video Section** (Line 310) | **Brand Video** | Sample W3Schools video `mov_bbb.mp4` | A short, engaging brand story or recipe video. Recommended: 16:9 MP4 format. Provide a `poster` image as well. |

### 3. Story Page (`src/pages/Story.tsx`)

| Location | Asset Needed | Current State | Recommendation |
| :--- | :--- | :--- | :--- |
| **Hero Image** (Line 12) | "Our Story" Banner Image | Emoji Box (`🌶️👵🏽✨`) | A large, wide lifestyle shot (e.g., grandmother's kitchen, spice market). Recommended: 16:9 or wider, min 1200px wide. |

### 4. Recipes Page (`src/pages/Recipes.tsx`)

| Location | Asset Needed | Current State | Recommendation |
| :--- | :--- | :--- | :--- |
| **Recipe Video Section** (Line 35) | **Brand Recipe Video** | CSS pattern background with Play Button | A high-quality video showing the achar being served or cooked. Recommended: 16:9 MP4 or YouTube embed. Needs a thumbnail/poster image. |

### 5. Product & Checkout Flows (Self-Served via Admin)

*Note: These assets should be uploaded through the Admin Dashboard for each product. The system handles the cropping & resizing.*

| Component | Asset Needed | Current State | Recommendation |
| :--- | :--- | :--- | :--- |
| `src/pages/Admin.tsx` | Product Images (Upload) | Working upload system | 1:1 Square aspect ratio is enforced by the cropper. |
| `src/pages/ProductDetail.tsx` | Main Gallery & Thumbnails | Renders from `product.images[]` | Admin uploaded. Will fallback to grey placeholder if none exist. |
| `src/components/ProductCard.tsx` | Grid Thumbnails | Renders from `product.images[0]` | Admin uploaded. |
| `src/components/CartDrawer.tsx` | Cart Item Thumbnails | Renders from `item.images[0]` | Admin uploaded. |
| `src/pages/Checkout.tsx` | Checkout Summary Thumbs | Renders from `item.images[0]` | Admin uploaded. |
