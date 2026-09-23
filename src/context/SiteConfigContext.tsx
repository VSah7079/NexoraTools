import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ALL_TOOLS } from '../data/toolsData';
import type {
  CustomToolItem,
  RouteSEOConfig,
  GlobalSEOSettings,
  AnnouncementConfig,
  BrandingConfig,
  SiteConfigState,
} from '../types/admin';
import { apiService } from '../services/apiService';

const STORAGE_KEY = 'nexora_site_config_v2';
const AUTH_KEY = 'nexora_admin_auth_v2';
const DEFAULT_PIN = 'nexora2026';

const DEFAULT_GLOBAL_SEO: GlobalSEOSettings = {
  siteName: 'Nexora Tools',
  titleTemplate: '%s • Nexora Tools',
  defaultDescription:
    '100% Free online workstation for passport photo maker (35×45mm), Aadhaar & ID card front+back merger on A4 sheet, exact 20KB/50KB image compressor, AI background remover, and PDF security tools. Runs in browser RAM with zero server uploads.',
  defaultKeywords:
    'passport photo maker online, bg remover, remove background free, pdf to jpg, jpg to pdf, merge pdf, compress pdf, id card merger a4, exact 20kb image compressor, signature resize, cyber cafe tools, csc center printing tools, nexora tools',
  googleVerificationId: '',
  bingVerificationId: '',
  ga4MeasurementId: '',
  adsensePubId: '',
  robotsTxtContent: `User-agent: *\nAllow: /\nSitemap: https://nexoratools.com/sitemap.xml`,
};

const DEFAULT_ANNOUNCEMENT: AnnouncementConfig = {
  enabled: true,
  message: '🚀 All-New PDF to Word (.DOCX) & AI Background Remover are live with 100% Client-Side RAM Processing!',
  type: 'promo',
  linkText: 'Try PDF to Word →',
  linkUrl: '/pdf-to-word',
  closable: true,
  badgeText: 'New Update',
};

const DEFAULT_BRANDING: BrandingConfig = {
  siteName: 'Nexora Tools',
  tagline: 'Client-Side Cyber Cafe & Document Workstation',
  contactEmail: 'support@nexoratools.com',
  copyrightText: `© ${new Date().getFullYear()} Nexora Tools. Zero Cloud Retention • High-Speed Client RAM.`,
  supportPhone: '',
  twitterUrl: 'https://twitter.com',
  githubUrl: 'https://github.com',
  telegramUrl: 'https://telegram.org',
  youtubeUrl: 'https://youtube.com',
};

const DEFAULT_SEO_ROUTES: Record<string, RouteSEOConfig> = {
  '/': {
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
  '/bg-remover': {
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
  '/passport-photo-maker': {
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
  '/passport-sheet': {
    path: '/passport-sheet',
    title: 'Passport Photo Print Sheet Studio (4×6", A4, A5 - 4/6/8/16/32 Photos)',
    description:
      'Arrange 4, 6, 8, 12, 16, 24, 32 passport photos on 4×6 inch photo paper or A4 sheets with cutting borders, alignment markers, and 1-click print.',
    keywords:
      'passport photo print sheet, 4x6 passport sheet maker, 8 passport photos on 4x6, 16 photos on a4, studio photo sheet generator free',
    canonicalUrl: 'https://nexoratools.com/passport-sheet',
    robots: 'index, follow',
    categoryName: 'Print Studio',
    toolName: 'Passport Photo Print Sheet',
  },
  '/jpg-to-pdf': {
    path: '/jpg-to-pdf',
    title: 'JPG to PDF Converter Online Free - Convert Images to PDF (A4/Fit)',
    description:
      'Convert JPG, PNG, WEBP and multiple images into clean vector PDF documents in seconds. Drag to reorder, custom margins, portrait & landscape.',
    keywords:
      'jpg to pdf, image to pdf, png to pdf, convert photo to pdf online, photo to pdf free, multiple images to one pdf, combine jpg to pdf',
    canonicalUrl: 'https://nexoratools.com/jpg-to-pdf',
    robots: 'index, follow',
    categoryName: 'PDF Tools',
    toolName: 'JPG to PDF Converter',
  },
  '/pdf-to-jpg': {
    path: '/pdf-to-jpg',
    title: 'PDF to JPG Converter Online Free - Extract High-Res Pages (300 DPI)',
    description:
      'Convert PDF pages into high-resolution JPG or PNG images with 300 DPI clarity. Fast client-side RAM extraction with zero server uploads.',
    keywords:
      'pdf to jpg, pdf to image, pdf to png, convert pdf to jpg online free, extract images from pdf, high resolution pdf to jpg 300 dpi',
    canonicalUrl: 'https://nexoratools.com/pdf-to-jpg',
    robots: 'index, follow',
    categoryName: 'PDF Tools',
    toolName: 'PDF to JPG Converter',
  },
  '/merge-pdf': {
    path: '/merge-pdf',
    title: 'Merge PDF Online Free - Combine Multiple PDF Files into One',
    description:
      'Fastest client-side PDF merger. Combine multiple PDF documents into a single organized file in seconds with custom page ordering.',
    keywords:
      'merge pdf, combine pdf, join pdf files online, free pdf merger, combine multiple pdf into one, merge pdf no watermark',
    canonicalUrl: 'https://nexoratools.com/merge-pdf',
    robots: 'index, follow',
    categoryName: 'PDF Tools',
    toolName: 'Merge PDF',
  },
  '/split-pdf': {
    path: '/split-pdf',
    title: 'Split PDF Online Free - Extract Specific Pages or Ranges',
    description:
      'Split PDF documents by custom page numbers or ranges (e.g. 1-5, 8, 11-14) or extract every single page into individual PDF files.',
    keywords:
      'split pdf, extract pdf pages, separate pdf pages online free, split pdf into multiple files, extract page ranges from pdf',
    canonicalUrl: 'https://nexoratools.com/split-pdf',
    robots: 'index, follow',
    categoryName: 'PDF Tools',
    toolName: 'Split PDF',
  },
  '/compress-pdf': {
    path: '/compress-pdf',
    title: 'Compress PDF Online Free - Reduce PDF File Size (Extreme / Recommended)',
    description:
      'Reduce PDF file size for email attachments and government job applications without losing visual clarity. 100% private in-browser compression.',
    keywords:
      'compress pdf, reduce pdf size, shrink pdf file online free, pdf size reducer 100kb, compress pdf for email portal',
    canonicalUrl: 'https://nexoratools.com/compress-pdf',
    robots: 'index, follow',
    categoryName: 'PDF Tools',
    toolName: 'Compress PDF',
  },
  '/id-card-merger': {
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
  '/pdf-to-word': {
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
  '/image-compress': {
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
};

const getInitialConfig = (): SiteConfigState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const existingIds = new Set((parsed.tools || []).map((t: CustomToolItem) => t.id));
      const mergedTools = [
        ...(parsed.tools || []),
        ...ALL_TOOLS.filter((t) => !existingIds.has(t.id)).map((t) => ({ ...t, enabled: true })),
      ];

      return {
        tools: mergedTools,
        seoRoutes: { ...DEFAULT_SEO_ROUTES, ...(parsed.seoRoutes || {}) },
        globalSEO: { ...DEFAULT_GLOBAL_SEO, ...(parsed.globalSEO || {}) },
        announcement: { ...DEFAULT_ANNOUNCEMENT, ...(parsed.announcement || {}) },
        branding: { ...DEFAULT_BRANDING, ...(parsed.branding || {}) },
        adminPin: parsed.adminPin || DEFAULT_PIN,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (e) {
    console.error('Failed to load site config from storage:', e);
  }

  return {
    tools: ALL_TOOLS.map((t) => ({ ...t, enabled: true })),
    seoRoutes: DEFAULT_SEO_ROUTES,
    globalSEO: DEFAULT_GLOBAL_SEO,
    announcement: DEFAULT_ANNOUNCEMENT,
    branding: DEFAULT_BRANDING,
    adminPin: DEFAULT_PIN,
    lastUpdated: new Date().toISOString(),
  };
};

interface SiteConfigContextType {
  state: SiteConfigState;
  tools: CustomToolItem[];
  activeTools: CustomToolItem[];
  isAuthenticated: boolean;
  isDbConnected: boolean;
  dbInfo?: { engine?: string; sizeBytes?: number };
  login: (pin: string) => Promise<boolean> | boolean;
  logout: () => void;
  changePin: (newPin: string) => void;
  addTool: (tool: Omit<CustomToolItem, 'isCustom'>) => void;
  updateTool: (id: string, updated: Partial<CustomToolItem>) => void;
  deleteTool: (id: string) => void;
  toggleToolStatus: (id: string) => void;
  updateRouteSEO: (path: string, seo: RouteSEOConfig) => void;
  deleteRouteSEO: (path: string) => void;
  updateGlobalSEO: (settings: Partial<GlobalSEOSettings>) => void;
  updateAnnouncement: (announcement: Partial<AnnouncementConfig>) => void;
  updateBranding: (branding: Partial<BrandingConfig>) => void;
  exportConfigJSON: () => string;
  importConfigJSON: (jsonString: string) => { success: boolean; error?: string };
  resetToDefaults: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SiteConfigState>(getInitialConfig);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [dbInfo, setDbInfo] = useState<{ engine?: string; sizeBytes?: number } | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  // Check Backend Database Connection and Sync State on Mount
  useEffect(() => {
    let isMounted = true;

    async function syncWithDatabase() {
      try {
        const health = await apiService.checkHealth();
        if (health.connected && isMounted) {
          setIsDbConnected(true);
          setDbInfo(health.database);

          // Fetch fresh config from backend database
          const remoteConfig = await apiService.fetchConfig();
          if (remoteConfig.success && remoteConfig.data) {
            setState((prev) => {
              const merged = {
                ...prev,
                ...remoteConfig.data,
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              return merged;
            });
          }
        } else if (isMounted) {
          setIsDbConnected(false);
        }
      } catch (err) {
        if (isMounted) setIsDbConnected(false);
      }
    }

    syncWithDatabase();

    // Re-check database heartbeat every 30 seconds
    const interval = setInterval(syncWithDatabase, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Save to localStorage as persistent offline backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save site config to storage:', e);
    }
  }, [state]);

  const login = async (pin: string): Promise<boolean> => {
    const cleanPin = pin.trim();
    if (cleanPin === state.adminPin.trim()) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      apiService.verifyPin(cleanPin).catch(() => {});
      return true;
    }

    try {
      const res = await apiService.verifyPin(cleanPin);
      if (res.success && res.authenticated) {
        setIsAuthenticated(true);
        sessionStorage.setItem(AUTH_KEY, 'true');
        setState((prev) => ({ ...prev, adminPin: cleanPin }));
        return true;
      }
    } catch {
      // Fallback failed
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
  };

  const changePin = (newPin: string) => {
    if (!newPin.trim()) return;
    const clean = newPin.trim();
    setState((prev) => ({
      ...prev,
      adminPin: clean,
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.changePin(clean).catch(() => {});
  };

  const addTool = (tool: Omit<CustomToolItem, 'isCustom'>) => {
    const newTool: CustomToolItem = {
      ...tool,
      isCustom: true,
      enabled: tool.enabled ?? true,
    };
    setState((prev) => ({
      ...prev,
      tools: [newTool, ...prev.tools],
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.addTool(tool).catch(() => {});
  };

  const updateTool = (id: string, updated: Partial<CustomToolItem>) => {
    setState((prev) => ({
      ...prev,
      tools: prev.tools.map((tool) => (tool.id === id ? { ...tool, ...updated } : tool)),
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.updateTool(id, updated).catch(() => {});
  };

  const deleteTool = (id: string) => {
    setState((prev) => ({
      ...prev,
      tools: prev.tools.filter((tool) => tool.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.deleteTool(id).catch(() => {});
  };

  const toggleToolStatus = (id: string) => {
    setState((prev) => ({
      ...prev,
      tools: prev.tools.map((tool) =>
        tool.id === id ? { ...tool, enabled: tool.enabled === false ? true : false } : tool
      ),
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.toggleTool(id).catch(() => {});
  };

  const updateRouteSEO = (path: string, seo: RouteSEOConfig) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const payload = {
      ...seo,
      path: cleanPath,
      lastUpdated: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      seoRoutes: {
        ...prev.seoRoutes,
        [cleanPath]: payload,
      },
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.saveSEORoute(cleanPath, payload).catch(() => {});
  };

  const deleteRouteSEO = (path: string) => {
    setState((prev) => {
      const next = { ...prev.seoRoutes };
      delete next[path];
      return {
        ...prev,
        seoRoutes: next,
        lastUpdated: new Date().toISOString(),
      };
    });
    // Sync with DB
    apiService.deleteSEORoute(path).catch(() => {});
  };

  const updateGlobalSEO = (settings: Partial<GlobalSEOSettings>) => {
    setState((prev) => ({
      ...prev,
      globalSEO: {
        ...prev.globalSEO,
        ...settings,
      },
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.updateBranding(undefined, settings).catch(() => {});
  };

  const updateAnnouncement = (announcement: Partial<AnnouncementConfig>) => {
    setState((prev) => ({
      ...prev,
      announcement: {
        ...prev.announcement,
        ...announcement,
      },
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.updateAnnouncement(announcement).catch(() => {});
  };

  const updateBranding = (branding: Partial<BrandingConfig>) => {
    setState((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        ...branding,
      },
      lastUpdated: new Date().toISOString(),
    }));
    // Sync with DB
    apiService.updateBranding(branding, undefined).catch(() => {});
  };

  const exportConfigJSON = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importConfigJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON configuration format' };
      }

      const importedState: SiteConfigState = {
        tools: Array.isArray(parsed.tools) ? parsed.tools : state.tools,
        seoRoutes: parsed.seoRoutes || state.seoRoutes,
        globalSEO: { ...state.globalSEO, ...(parsed.globalSEO || {}) },
        announcement: { ...state.announcement, ...(parsed.announcement || {}) },
        branding: { ...state.branding, ...(parsed.branding || {}) },
        adminPin: parsed.adminPin || state.adminPin,
        lastUpdated: new Date().toISOString(),
      };

      setState(importedState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importedState));

      // Sync with DB
      apiService.restoreBackup(parsed).catch(() => {});
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse JSON file' };
    }
  };

  const resetToDefaults = () => {
    const defaultState: SiteConfigState = {
      tools: ALL_TOOLS.map((t) => ({ ...t, enabled: true })),
      seoRoutes: DEFAULT_SEO_ROUTES,
      globalSEO: DEFAULT_GLOBAL_SEO,
      announcement: DEFAULT_ANNOUNCEMENT,
      branding: DEFAULT_BRANDING,
      adminPin: DEFAULT_PIN,
      lastUpdated: new Date().toISOString(),
    };
    setState(defaultState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));

    // Sync with DB
    apiService.resetDefaults().catch(() => {});
  };

  const activeTools = state.tools.filter((t) => t.enabled !== false);

  return (
    <SiteConfigContext.Provider
      value={{
        state,
        tools: state.tools,
        activeTools,
        isAuthenticated,
        isDbConnected,
        dbInfo,
        login,
        logout,
        changePin,
        addTool,
        updateTool,
        deleteTool,
        toggleToolStatus,
        updateRouteSEO,
        deleteRouteSEO,
        updateGlobalSEO,
        updateAnnouncement,
        updateBranding,
        exportConfigJSON,
        importConfigJSON,
        resetToDefaults,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = (): SiteConfigContextType => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};
