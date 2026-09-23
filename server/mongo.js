import mongoose from 'mongoose';
import { Tool } from './models/Tool.js';
import { SEORoute } from './models/SEORoute.js';
import { SiteSettings } from './models/SiteSettings.js';
import { Analytics } from './models/Analytics.js';
import { AuditLog } from './models/AuditLog.js';

let isConnected = false;
let connectionError = null;

export async function connectMongoDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexoratools';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    connectionError = null;
    console.log(`🍃 [MongoDB Database] Successfully connected to: ${mongoUri}`);

    // Seed database if empty
    await seedMongoDatabaseIfEmpty();

    return { connected: true, uri: mongoUri };
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.warn(`⚠️ [MongoDB Database] Could not connect to ${mongoUri}: ${err.message}`);
    console.warn(`⚡ [Fallback Store] Running resilient hybrid storage while attempting reconnect.`);
    return { connected: false, error: err.message };
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
  connectionError = null;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  connectionError = err.message;
});

export function getMongoStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateStr = states[mongoose.connection.readyState] || 'unknown';
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    state: stateStr,
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexoratools',
    error: connectionError,
  };
}

/**
 * Seed MongoDB collections if they are empty
 */
async function seedMongoDatabaseIfEmpty() {
  try {
    // 1. Seed Site Settings
    const settingsCount = await SiteSettings.countDocuments();
    if (settingsCount === 0) {
      await SiteSettings.create({
        key: 'global_config',
        admin_pin: 'nexora2026',
        global_seo: {
          siteName: 'Nexora Tools',
          titleTemplate: '%s • Nexora Tools',
          defaultDescription:
            '100% Free online workstation for passport photo maker (35×45mm), Aadhaar & ID card front+back merger on A4 sheet, exact 20KB/50KB image compressor, AI background remover, and PDF security tools. Runs in browser RAM with zero server uploads.',
          defaultKeywords:
            'passport photo maker online, bg remover, remove background free, pdf to jpg, jpg to pdf, merge pdf, compress pdf, id card merger a4, exact 20kb image compressor, signature resize, cyber cafe tools, csc center printing tools, nexora tools',
          robotsTxtContent: 'User-agent: *\nAllow: /\nSitemap: https://nexoratools.com/sitemap.xml',
        },
        announcement: {
          enabled: true,
          message:
            '🚀 All-New PDF to Word (.DOCX) & AI Background Remover are live with 100% Client-Side RAM Processing!',
          type: 'promo',
          linkText: 'Try PDF to Word →',
          linkUrl: '/pdf-to-word',
          closable: true,
          badgeText: 'New Update',
        },
        branding: {
          siteName: 'Nexora Tools',
          tagline: 'Client-Side Cyber Cafe & Document Workstation',
          contactEmail: 'support@nexoratools.com',
          copyrightText: `© ${new Date().getFullYear()} Nexora Tools. Zero Cloud Retention • High-Speed Client RAM.`,
        },
      });
      console.log('🍃 [MongoDB Seeder] Initialized SiteSettings collection');
    }

    // 2. Seed Tools Catalog
    const toolsCount = await Tool.countDocuments();
    if (toolsCount === 0) {
      const defaultTools = [
        {
          id: 'passport-maker',
          name: 'Passport Photo Maker',
          shortName: 'Passport Photo',
          description: 'Create compliant 35×45mm, 2×2", 30×40mm passport photos with custom background colors and print guides.',
          category: 'photo',
          path: '/photo/passport',
          iconName: 'UserCheck',
          badge: 'Most Popular',
          popular: true,
          color: 'from-blue-500 to-indigo-600',
          enabled: true,
        },
        {
          id: 'bg-remover',
          name: 'AI Background Remover & Replacer',
          shortName: 'Remove Background',
          description: 'Remove photo backgrounds automatically and replace with transparent, solid white, sky blue, or studio colors.',
          category: 'photo',
          path: '/photo/bg-remover',
          iconName: 'Sparkles',
          badge: 'AI Powered',
          popular: true,
          color: 'from-purple-500 to-pink-600',
          enabled: true,
        },
        {
          id: 'image-compress',
          name: 'Image Compressor (Exact KB)',
          shortName: 'Compress Image',
          description: 'Compress photos to exact target file sizes (20KB, 50KB, 100KB, 200KB) for government and job portal uploads.',
          category: 'photo',
          path: '/photo/compress',
          iconName: 'Minimize2',
          popular: true,
          color: 'from-emerald-500 to-teal-600',
          enabled: true,
        },
        {
          id: 'image-resize',
          name: 'Image Resizer & DPI Converter',
          shortName: 'Resize Image',
          description: 'Resize image dimensions by pixels, mm, cm, or inches with aspect ratio lock and 300 DPI support.',
          category: 'photo',
          path: '/photo/resize',
          iconName: 'Maximize2',
          color: 'from-amber-500 to-orange-600',
          enabled: true,
        },
        {
          id: 'image-crop-rotate',
          name: 'Crop, Rotate & Enhance',
          shortName: 'Crop & Rotate',
          description: 'Quick freeform or preset aspect-ratio cropping, 90° flip/rotate, brightness and contrast tuning.',
          category: 'photo',
          path: '/photo/crop-rotate',
          iconName: 'Crop',
          color: 'from-cyan-500 to-blue-600',
          enabled: true,
        },
        {
          id: 'signature-tool',
          name: 'Signature Resizer & Enhancer',
          shortName: 'Signature Tool',
          description: 'Clean paper backgrounds, darken pen ink, crop, and compress signature to 10-20KB for online forms.',
          category: 'photo',
          path: '/photo/signature',
          iconName: 'PenTool',
          badge: 'Govt Form Ready',
          color: 'from-rose-500 to-red-600',
          enabled: true,
        },
        {
          id: 'id-merger',
          name: 'ID Card Merger (Front + Back)',
          shortName: 'Merge ID Cards',
          description: 'Merge front & back of Aadhaar, Voter ID, PAN, Driving Licence, or Student IDs into a single horizontal or vertical sheet.',
          category: 'id-card',
          path: '/id/merger',
          iconName: 'CreditCard',
          badge: 'Cyber Cafe Essential',
          popular: true,
          color: 'from-indigo-500 to-violet-600',
          enabled: true,
        },
        {
          id: 'aadhaar-merger',
          name: 'Aadhaar Card Merger (A4 Print)',
          shortName: 'Aadhaar Merger',
          description: 'Specifically formatted for Aadhaar cards with official CR80 card dimensions on an A4 print-ready layout.',
          category: 'id-card',
          path: '/id/aadhaar',
          iconName: 'FileCheck2',
          color: 'from-sky-500 to-cyan-600',
          enabled: true,
        },
        {
          id: 'passport-sheet',
          name: 'Passport Photo Print Sheet',
          shortName: 'Passport Sheet',
          description: 'Arrange 4, 6, 8, 12, 16, or 32 passport photos on 4×6 inch, A4, or A5 photo paper with cutting guidelines.',
          category: 'print',
          path: '/print/passport-sheet',
          iconName: 'Printer',
          badge: 'Instant Print',
          popular: true,
          color: 'from-indigo-500 to-purple-600',
          enabled: true,
        },
        {
          id: 'print-studio',
          name: 'Print Layout Studio',
          shortName: 'Print Studio',
          description: 'Multi-image grid arranging for quick printing on standard paper sizes with alignment guides.',
          category: 'print',
          path: '/print/studio',
          iconName: 'Layers',
          color: 'from-pink-500 to-rose-600',
          enabled: true,
        },
        {
          id: 'pdf-hub',
          name: 'PDF Master Hub',
          shortName: 'PDF Tools',
          description: 'Complete all-in-one PDF toolkit: Merge, split, compress, convert, sign, lock, unlock, and organize PDF documents.',
          category: 'pdf',
          path: '/pdf',
          iconName: 'FileText',
          badge: 'All-In-One Hub',
          popular: true,
          color: 'from-red-500 to-rose-600',
          enabled: true,
        },
        {
          id: 'pdf-merge',
          name: 'Merge PDF Files',
          shortName: 'Merge PDF',
          description: 'Combine multiple PDF files into one clean document with drag-and-drop page ordering.',
          category: 'pdf',
          path: '/pdf/merge',
          iconName: 'Layers',
          popular: true,
          color: 'from-blue-500 to-indigo-600',
          enabled: true,
        },
        {
          id: 'pdf-split',
          name: 'Split PDF & Extract Pages',
          shortName: 'Split PDF',
          description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
          category: 'pdf',
          path: '/pdf/split',
          iconName: 'Scissors',
          color: 'from-purple-500 to-pink-600',
          enabled: true,
        },
        {
          id: 'pdf-compress',
          name: 'Compress PDF File',
          shortName: 'Compress PDF',
          description: 'Reduce PDF file size while maintaining optimum document clarity for email and portal uploads.',
          category: 'pdf',
          path: '/pdf/compress',
          iconName: 'Minimize2',
          popular: true,
          color: 'from-emerald-500 to-teal-600',
          enabled: true,
        },
        {
          id: 'pdf-to-word',
          name: 'PDF to Word (.docx)',
          shortName: 'PDF to Word',
          description: 'Convert PDF documents into editable Microsoft Word files with layout preservation.',
          category: 'pdf',
          path: '/pdf/pdf-to-word',
          iconName: 'FileText',
          badge: 'New',
          popular: true,
          color: 'from-blue-600 to-cyan-600',
          enabled: true,
        },
        {
          id: 'jpg-to-pdf',
          name: 'JPG to PDF Converter',
          shortName: 'JPG to PDF',
          description: 'Convert JPG, PNG, WEBP and multiple images into clean vector PDF documents in seconds.',
          category: 'pdf',
          path: '/pdf/image-to-pdf',
          iconName: 'FileText',
          popular: true,
          color: 'from-amber-500 to-orange-600',
          enabled: true,
        },
        {
          id: 'pdf-to-jpg',
          name: 'PDF to JPG Converter',
          shortName: 'PDF to JPG',
          description: 'Extract high-resolution images or save each page as a separate JPG or PNG image.',
          category: 'pdf',
          path: '/pdf/pdf-to-image',
          iconName: 'Sparkles',
          popular: true,
          color: 'from-cyan-500 to-blue-600',
          enabled: true,
        },
        {
          id: 'doc-scanner',
          name: 'Document Camera Scanner',
          shortName: 'Doc Scanner',
          description: 'Scan physical papers, bills, and certificates using webcam/phone camera with auto-edge detection and PDF export.',
          category: 'scanner',
          path: '/scanner',
          iconName: 'Scan',
          badge: 'HD Cam Scanner',
          popular: true,
          color: 'from-teal-500 to-emerald-600',
          enabled: true,
        },
        {
          id: 'qr-studio',
          name: 'QR Code Studio',
          shortName: 'QR Generator',
          description: 'Generate high-res vector QR codes for URLs, WiFi credentials, UPI payments, and contact vCards.',
          category: 'scanner',
          path: '/qr-generator',
          iconName: 'QrCode',
          badge: 'Instant Vector',
          color: 'from-indigo-500 to-blue-600',
          enabled: true,
        },
        {
          id: 'batch-tools',
          name: 'Batch Processing Hub',
          shortName: 'Batch Tools',
          description: 'Bulk compress, convert, watermark, and rename hundreds of photos and documents in parallel.',
          category: 'batch',
          path: '/batch',
          iconName: 'Zap',
          badge: 'High Performance',
          popular: true,
          color: 'from-purple-500 to-indigo-600',
          enabled: true,
        },
      ];

      await Tool.insertMany(defaultTools);
      console.log(`🍃 [MongoDB Seeder] Inserted ${defaultTools.length} default tools into MongoDB`);
    }

    // 3. Seed SEO Routes
    const seoCount = await SEORoute.countDocuments();
    if (seoCount === 0) {
      const defaultRoutes = [
        {
          path: '/',
          title: 'Free Photo, ID Card, PDF & Print Workstation (No Watermark)',
          description:
            '100% Free online workstation for passport photo maker (35×45mm), Aadhaar & ID card front+back merger on A4, exact 20KB/50KB image compressor, and PDF tools.',
          keywords:
            'passport photo maker online, aadhaar card merge front back, id card merger a4, image compressor 20kb 50kb upsc ssc, ai background remover free, pdf watermark free, image to pdf, signature resizer',
          canonicalUrl: 'https://nexoratools.com/',
          robots: 'index, follow',
          categoryName: 'General',
        },
        {
          path: '/bg-remover',
          title: 'Free AI Background Remover Online (Transparent & White Background HD)',
          description:
            'Instantly remove and change image backgrounds to transparent PNG, studio white, sky blue, or custom solid colors. 100% free, fast, zero watermark.',
          keywords:
            'bg remover, remove background online, background remover free, photo background changer, ai background eraser, passport white background, transparent png',
          canonicalUrl: 'https://nexoratools.com/bg-remover',
          robots: 'index, follow',
          categoryName: 'Photo Tools',
          toolName: 'AI Background Remover',
        },
        {
          path: '/passport-photo-maker',
          title: 'Free Passport Photo Maker Online (35×45mm, 2×2", Govt Exam Presets)',
          description:
            'Create compliant 35×45mm, 2×2 inch, 30×40mm passport size photos with smart auto-framing, no head cutoff, white/blue background replacer, and exact 20KB-50KB compressor.',
          keywords:
            'passport photo maker, passport size photo creator, 35x45mm photo online, 2x2 passport photo, govt exam photo resizer, ssc upsc photo maker free',
          canonicalUrl: 'https://nexoratools.com/passport-photo-maker',
          robots: 'index, follow',
          categoryName: 'Photo Tools',
          toolName: 'Passport Photo Maker',
        },
        {
          path: '/id-card-merger',
          title: 'ID Card Merger Online Free - Combine Front & Back on Single A4 Sheet',
          description:
            'Merge front and back sides of Aadhaar, Voter ID, Driving Licence, PAN, or School IDs into one print-ready A4 page with CR80 dimensions.',
          keywords:
            'id card merger, merge front and back id card, aadhaar front back merge a4, voter id print single page, csc id card printing tool free',
          canonicalUrl: 'https://nexoratools.com/id-card-merger',
          robots: 'index, follow',
          categoryName: 'ID Card Tools',
          toolName: 'ID Card Merger',
        },
        {
          path: '/pdf-to-word',
          title: 'PDF to Word Converter Online Free - Convert PDF to DOCX (100% Editable)',
          description:
            'Convert PDF files into fully editable Microsoft Word (.docx) documents with structured paragraphs, headings, and clean formatting.',
          keywords:
            'pdf to word, convert pdf to word docx, free pdf to word converter editable, pdf to docx online, extract word from pdf',
          canonicalUrl: 'https://nexoratools.com/pdf-to-word',
          robots: 'index, follow',
          categoryName: 'PDF Tools',
          toolName: 'PDF to Word Converter',
        },
        {
          path: '/image-compress',
          title: 'Image Compressor to Exact KB (20KB, 50KB, 100KB, 200KB) - Free Online',
          description:
            'Compress photos and documents to exact target file sizes in KB for government job portals (UPSC, SSC, IBPS, State PSC).',
          keywords:
            'image compressor exact kb, compress photo to 20kb, photo compress to 50kb online, compress image for upsc ssc form, reduce image size in kb',
          canonicalUrl: 'https://nexoratools.com/image-compress',
          robots: 'index, follow',
          categoryName: 'Photo Tools',
          toolName: 'Image Compressor',
        },
      ];

      await SEORoute.insertMany(defaultRoutes);
      console.log(`🍃 [MongoDB Seeder] Inserted ${defaultRoutes.length} SEO routes into MongoDB`);
    }

    // 4. Seed Analytics
    const analyticsCount = await Analytics.countDocuments();
    if (analyticsCount === 0) {
      await Analytics.create({
        key: 'global_metrics',
        totalProcessed: 142,
        passportPhotosCreated: 58,
        idCardsMerged: 42,
        pdfsGenerated: 26,
        scansCompleted: 16,
        batchItemsProcessed: 0,
        lastActive: new Date().toISOString(),
      });
      console.log('🍃 [MongoDB Seeder] Initialized Analytics collection');
    }
  } catch (err) {
    console.error('Error seeding MongoDB collections:', err);
  }
}
