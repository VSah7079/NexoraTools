import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { Home } from './pages/Home';
// Photo Tools
import { PassportPhotoMaker } from './pages/PhotoTools/PassportPhotoMaker';
import { BackgroundRemover } from './pages/PhotoTools/BackgroundRemover';
import { ImageCompress } from './pages/PhotoTools/ImageCompress';
import { ImageResize } from './pages/PhotoTools/ImageResize';
import { ImageCropRotate } from './pages/PhotoTools/ImageCropRotate';
import { SignatureTool } from './pages/PhotoTools/SignatureTool';
// ID Card Tools
import { IDMerger } from './pages/IDCardTools/IDMerger';
import { AadhaarMerger } from './pages/IDCardTools/AadhaarMerger';
// Print Studio
import { PassportPhotoSheet } from './pages/PrintStudio/PassportPhotoSheet';
import { PrintStudio } from './pages/PrintStudio/PrintStudio';
// PDF & Document Office Tools
import { PDFHub } from './pages/PDFTools/PDFHub';
import { ImageToPDF } from './pages/PDFTools/ImageToPDF';
import { PDFToImage } from './pages/PDFTools/PDFToImage';
import { MergePDF } from './pages/PDFTools/MergePDF';
import { SplitPDF } from './pages/PDFTools/SplitPDF';
import { OrganizePDF } from './pages/PDFTools/OrganizePDF';
import { CompressPDF } from './pages/PDFTools/CompressPDF';
import { RepairPDF } from './pages/PDFTools/RepairPDF';
import { OCRPDF } from './pages/PDFTools/OCRPDF';
import { PDFWatermark } from './pages/PDFTools/PDFWatermark';
import { RotatePDF } from './pages/PDFTools/RotatePDF';
import { PDFPageNumbers } from './pages/PDFTools/PDFPageNumbers';
import { CropPDF } from './pages/PDFTools/CropPDF';
import { EditPDF } from './pages/PDFTools/EditPDF';
import { PDFForms } from './pages/PDFTools/PDFForms';
import { ProtectPDF } from './pages/PDFTools/ProtectPDF';
import { UnlockPDF } from './pages/PDFTools/UnlockPDF';
import { SignPDF } from './pages/PDFTools/SignPDF';
import { RedactPDF } from './pages/PDFTools/RedactPDF';
import { ComparePDF } from './pages/PDFTools/ComparePDF';
import { PDFIntelligence } from './pages/PDFTools/PDFIntelligence';
import { PDFToWord } from './pages/PDFTools/PDFToWord';
import { WordToPDF } from './pages/PDFTools/WordToPDF';
import { ExcelToPDF } from './pages/PDFTools/ExcelToPDF';
import { PDFToExcel } from './pages/PDFTools/PDFToExcel';
import { PDFToText } from './pages/PDFTools/PDFToText';
import { PowerpointToPDF } from './pages/PDFTools/PowerpointToPDF';
import { PDFToPowerpoint } from './pages/PDFTools/PDFToPowerpoint';
import { HTMLToPDF } from './pages/PDFTools/HTMLToPDF';
import { PDFToPDFA } from './pages/PDFTools/PDFToPDFA';
// Scanner & Batch & QR
import { DocumentScanner } from './pages/Scanner/DocumentScanner';
import { BatchTools } from './pages/BatchProcessing/BatchTools';
import { QRCodeStudio } from './pages/Utilities/QRCodeStudio';
// Admin & Info
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { PrivacyPolicy } from './pages/Info/PrivacyPolicy';
import { HowItWorks } from './pages/Info/HowItWorks';
import { TermsOfService } from './pages/Info/TermsOfService';
import { Contact } from './pages/Info/Contact';
import { NotFound } from './pages/NotFound';

// Automatic smooth scroll to top on page navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-300 relative overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-subtle" />
          <div className="fixed top-1/3 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed bottom-10 left-1/3 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

          <Navbar />

          <main className="flex-1 w-full pt-4 sm:pt-6 pb-24 sm:pb-28 lg:pb-10 relative z-10">
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />

              {/* Photo Suite */}
              <Route path="/photo/passport" element={<PassportPhotoMaker />} />
              <Route path="/photo/bg-remover" element={<BackgroundRemover />} />
              <Route path="/photo/compress" element={<ImageCompress />} />
              <Route path="/photo/resize" element={<ImageResize />} />
              <Route path="/photo/crop-rotate" element={<ImageCropRotate />} />
              <Route path="/photo/signature" element={<SignatureTool />} />

              {/* ID Card Suite */}
              <Route path="/id/merger" element={<IDMerger />} />
              <Route path="/id/aadhaar" element={<AadhaarMerger />} />

              {/* Print Studio */}
              <Route path="/print/passport-sheet" element={<PassportPhotoSheet />} />
              <Route path="/print/studio" element={<PrintStudio />} />

              {/* PDF Master Hub */}
              <Route path="/pdf" element={<PDFHub />} />
              <Route path="/pdf-tools" element={<PDFHub />} />

              {/* 1. Organize PDF */}
              <Route path="/pdf/merge" element={<MergePDF />} />
              <Route path="/pdf/split" element={<SplitPDF />} />
              <Route path="/pdf/organize" element={<OrganizePDF />} />
              <Route path="/pdf/remove-pages" element={<OrganizePDF />} />
              <Route path="/pdf/extract-pages" element={<SplitPDF />} />
              <Route path="/pdf/scan" element={<DocumentScanner />} />

              {/* 2. Optimize PDF */}
              <Route path="/pdf/compress" element={<CompressPDF />} />
              <Route path="/pdf/repair" element={<RepairPDF />} />
              <Route path="/pdf/ocr" element={<OCRPDF />} />

              {/* 3. Convert to PDF */}
              <Route path="/pdf/image-to-pdf" element={<ImageToPDF />} />
              <Route path="/pdf/word-to-pdf" element={<WordToPDF />} />
              <Route path="/pdf/powerpoint-to-pdf" element={<PowerpointToPDF />} />
              <Route path="/pdf/excel-to-pdf" element={<ExcelToPDF />} />
              <Route path="/pdf/html-to-pdf" element={<HTMLToPDF />} />

              {/* 4. Convert from PDF */}
              <Route path="/pdf/pdf-to-image" element={<PDFToImage />} />
              <Route path="/pdf/pdf-to-word" element={<PDFToWord />} />
              <Route path="/pdf/pdf-to-powerpoint" element={<PDFToPowerpoint />} />
              <Route path="/pdf/pdf-to-excel" element={<PDFToExcel />} />
              <Route path="/pdf/pdf-to-pdfa" element={<PDFToPDFA />} />
              <Route path="/pdf/pdf-to-text" element={<PDFToText />} />

              {/* 5. Edit PDF */}
              <Route path="/pdf/rotate" element={<RotatePDF />} />
              <Route path="/pdf/page-numbers" element={<PDFPageNumbers />} />
              <Route path="/pdf/watermark" element={<PDFWatermark />} />
              <Route path="/pdf/crop" element={<CropPDF />} />
              <Route path="/pdf/edit" element={<EditPDF />} />
              <Route path="/pdf/forms" element={<PDFForms />} />

              {/* 6. PDF Security */}
              <Route path="/pdf/unlock" element={<UnlockPDF />} />
              <Route path="/pdf/protect" element={<ProtectPDF />} />
              <Route path="/pdf/sign" element={<SignPDF />} />
              <Route path="/pdf/redact" element={<RedactPDF />} />
              <Route path="/pdf/compare" element={<ComparePDF />} />

              {/* 7. PDF Intelligence */}
              <Route path="/pdf/ai-summary" element={<PDFIntelligence />} />
              <Route path="/pdf/translate" element={<PDFIntelligence />} />
              <Route path="/pdf/to-markdown" element={<PDFIntelligence />} />

              {/* Scanner, Batch & QR */}
              <Route path="/scanner" element={<DocumentScanner />} />
              <Route path="/batch" element={<BatchTools />} />
              <Route path="/tools/qr-generator" element={<QRCodeStudio />} />

              {/* Admin & Info */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
          <MobileNav />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
