import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Brand & Slogans
  brandTitle: {
    en: 'High-Speed Photo, Document, ID & Print Workstation',
    hi: 'हाई-स्पीड फोटो, डॉक्यूमेंट, आईडी और प्रिंट वर्कस्टेशन',
  },
  brandSubtitle: {
    en: 'The ultra-fast digital suite crafted for Cyber Cafes, Photo Studios, students, and job applicants.',
    hi: 'साइबर कैफे, फोटो स्टूडियो, छात्रों और आवेदकों के लिए तैयार किया गया सुपरफास्ट डिजिटल टूल।',
  },
  freeForever: {
    en: '100% Free Forever',
    hi: '100% मुफ्त व हमेशा के लिए',
  },
  zeroWatermark: {
    en: 'Zero Watermarks',
    hi: 'बिना किसी वॉटरमार्क',
  },
  inBrowserRam: {
    en: 'In-Browser RAM Engine',
    hi: 'ब्राउज़र रैम में सुरक्षित प्रोसेसिंग',
  },

  // Navigation
  searchTools: {
    en: 'Search tools...',
    hi: 'टूल्स खोजें...',
  },
  navPhotos: {
    en: 'Photo Tools',
    hi: 'फोटो टूल्स',
  },
  navIdCards: {
    en: 'ID Cards',
    hi: 'आईडी कार्ड्स',
  },
  navPdf: {
    en: 'PDF Suite',
    hi: 'पीडीएफ टूल्स',
  },
  navPrint: {
    en: 'Passport Sheet',
    hi: 'पासपोर्ट शीट',
  },
  navQr: {
    en: 'QR Studio',
    hi: 'क्यूआर स्टूडियो',
  },
  navScanner: {
    en: 'Doc Scanner',
    hi: 'डॉक्यूमेंट स्कैनर',
  },
  navBatch: {
    en: 'Batch Tools',
    hi: 'बैच प्रोसेसिंग',
  },

  // Popular Tools
  passportMaker: {
    en: 'Passport Photo Maker',
    hi: 'पासपोर्ट फोटो मेकर',
  },
  bgRemover: {
    en: 'AI Background Remover',
    hi: 'एआई बैकग्राउंड रिमूवर',
  },
  exactCompress: {
    en: 'Exact KB Compressor',
    hi: 'सटीक KB कंप्रेसर',
  },
  idMerger: {
    en: 'ID Card Merger (Front + Back)',
    hi: 'आईडी कार्ड मर्जर (आगे + पीछे)',
  },
  aadhaarMerger: {
    en: 'Aadhaar Card A4 Sheet',
    hi: 'आधार कार्ड A4 शीट',
  },
  imageToPdf: {
    en: 'Image to PDF Converter',
    hi: 'फोटो से पीडीएफ कनवर्टर',
  },
  pdfToImage: {
    en: 'PDF to High-Res Image',
    hi: 'पीडीएफ से फोटो कनवर्टर',
  },
  pdfWatermark: {
    en: 'PDF Watermark & Stamping',
    hi: 'पीडीएफ वॉटरमार्क व मुहर',
  },
  qrStudio: {
    en: 'QR Code & UPI Standee',
    hi: 'क्यूआर कोड व यूपीआई स्टैंडी',
  },

  // Common Actions
  uploadPhoto: {
    en: 'Upload Photo or Document',
    hi: 'फोटो या डॉक्यूमेंट अपलोड करें',
  },
  liveCamera: {
    en: 'Live Camera Shot',
    hi: 'कैमरा से फोटो खींचें',
  },
  downloadImage: {
    en: 'Download Image',
    hi: 'इमेज डाउनलोड करें',
  },
  sendToPrint: {
    en: 'Send to Print Sheet (4×6 / A4)',
    hi: 'प्रिंट शीट पर भेजें (4×6 / A4)',
  },
  installApp: {
    en: 'Install App',
    hi: 'ऐप इंस्टॉल करें',
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('nexora_lang');
    if (saved === 'en' || saved === 'hi') return saved;
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('nexora_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][language] || TRANSLATIONS[key]['en'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
