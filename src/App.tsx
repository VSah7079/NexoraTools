import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
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
// PDF Tools
import { ImageToPDF } from './pages/PDFTools/ImageToPDF';
import { PDFToImage } from './pages/PDFTools/PDFToImage';
import { MergePDF } from './pages/PDFTools/MergePDF';
import { SplitPDF } from './pages/PDFTools/SplitPDF';
import { CompressPDF } from './pages/PDFTools/CompressPDF';
// Scanner & Batch
import { DocumentScanner } from './pages/Scanner/DocumentScanner';
import { BatchTools } from './pages/BatchProcessing/BatchTools';
// Admin & Info
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { PrivacyPolicy } from './pages/Info/PrivacyPolicy';
import { HowItWorks } from './pages/Info/HowItWorks';
import { TermsOfService } from './pages/Info/TermsOfService';
import { Contact } from './pages/Info/Contact';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-300">
          <Navbar />

          <main className="flex-1 pt-4 sm:pt-6 pb-16 lg:pb-8">
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

              {/* PDF Suite */}
              <Route path="/pdf/image-to-pdf" element={<ImageToPDF />} />
              <Route path="/pdf/pdf-to-image" element={<PDFToImage />} />
              <Route path="/pdf/merge" element={<MergePDF />} />
              <Route path="/pdf/split" element={<SplitPDF />} />
              <Route path="/pdf/compress" element={<CompressPDF />} />

              {/* Scanner & Batch */}
              <Route path="/scanner" element={<DocumentScanner />} />
              <Route path="/batch" element={<BatchTools />} />

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
    </ThemeProvider>
  );
};

export default App;
