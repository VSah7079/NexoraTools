import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Printer,
  Copy,
  Check,
  Wifi,
  CreditCard,
  Globe,
  FileText,
  Sliders,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { incrementStat } from '../../services/analyticsTracker';

type QRType = 'upi' | 'wifi' | 'url' | 'text';

export const QRCodeStudio: React.FC = () => {
  const [qrType, setQrType] = useState<QRType>('upi');

  // UPI State
  const [upiId, setUpiId] = useState('shopname@upi');
  const [payeeName, setPayeeName] = useState('Nexora Digital Store');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiNote, setUpiNote] = useState('Payment');

  // WiFi State
  const [wifiSsid, setWifiSsid] = useState('CyberCafe_HighSpeed');
  const [wifiPassword, setWifiPassword] = useState('Internet123');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // URL / Text State
  const [urlValue, setUrlValue] = useState('https://nexoratools.com');
  const [textValue, setTextValue] = useState('Nexora Tools - 100% Free Cyber Station');

  // Customization State
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrSize, setQrSize] = useState<number>(512);
  const [includeMargin, setIncludeMargin] = useState(true);
  const [copied, setCopied] = useState(false);

  // Standee Frame Template
  const [standeeTitle, setStandeeTitle] = useState('SCAN & PAY HERE');
  const [standeeSubtitle, setStandeeSubtitle] = useState('Accepted on GPay, PhonePe, Paytm, BHIM & All UPI Apps');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const standeeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Build Payload String
  const getPayload = (): string => {
    if (qrType === 'upi') {
      let uri = `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(payeeName.trim())}`;
      if (upiAmount && parseFloat(upiAmount) > 0) {
        uri += `&am=${encodeURIComponent(upiAmount.trim())}&cu=INR`;
      }
      if (upiNote) {
        uri += `&tn=${encodeURIComponent(upiNote.trim())}`;
      }
      return uri;
    } else if (qrType === 'wifi') {
      const enc = wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption;
      return `WIFI:T:${enc};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
    } else if (qrType === 'url') {
      return urlValue.trim().startsWith('http') ? urlValue.trim() : `https://${urlValue.trim()}`;
    } else {
      return textValue;
    }
  };

  // Render standard QR Canvas
  useEffect(() => {
    const renderQR = async () => {
      if (!canvasRef.current) return;
      const payload = getPayload();

      try {
        await QRCode.toCanvas(canvasRef.current, payload, {
          width: qrSize,
          margin: includeMargin ? 2 : 0,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: 'H',
        });
        renderStandeeSheet();
      } catch (err) {
        console.error('QR rendering error:', err);
      }
    };

    renderQR();
  }, [
    qrType,
    upiId,
    payeeName,
    upiAmount,
    upiNote,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    urlValue,
    textValue,
    fgColor,
    bgColor,
    qrSize,
    includeMargin,
    standeeTitle,
    standeeSubtitle,
  ]);

  // Render Printable Standee Card (A4 / 4x6 tabletop frame)
  const renderStandeeSheet = () => {
    if (!standeeCanvasRef.current || !canvasRef.current) return;
    const sCanvas = standeeCanvasRef.current;
    const w = 1200;
    const h = 1600;
    sCanvas.width = w;
    sCanvas.height = h;
    const ctx = sCanvas.getContext('2d');
    if (!ctx) return;

    // Background Card with smooth gradient
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // Decorative Header Banner
    const gradient = ctx.createLinearGradient(0, 0, w, 320);
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(0.5, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, 280);

    // Header Title
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 54px Arial, sans-serif';
    ctx.fillText(standeeTitle.toUpperCase(), w / 2, 130);

    // Header Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '500 28px Arial, sans-serif';
    ctx.fillText(payeeName.toUpperCase(), w / 2, 210);

    // QR Code Container Box
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    const boxSize = 740;
    const boxX = (w - boxSize) / 2;
    const boxY = 340;
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 40);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Thin Border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw QR into box
    const qrInset = 50;
    ctx.drawImage(canvasRef.current, boxX + qrInset, boxY + qrInset, boxSize - qrInset * 2, boxSize - qrInset * 2);

    // UPI ID Pill or WiFi Info Box
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    const pillW = 680;
    const pillH = 90;
    const pillX = (w - pillW) / 2;
    const pillY = 1140;
    ctx.roundRect(pillX, pillY, pillW, pillH, 25);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px Arial, sans-serif';
    if (qrType === 'upi') {
      ctx.fillText(`UPI ID: ${upiId}`, w / 2, pillY + 56);
    } else if (qrType === 'wifi') {
      ctx.fillText(`Wi-Fi: ${wifiSsid} | Pass: ${wifiPassword}`, w / 2, pillY + 56);
    } else {
      ctx.fillText(urlValue.replace(/^https?:\/\//, ''), w / 2, pillY + 56);
    }

    // Supported Payment Badges / Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '600 24px Arial, sans-serif';
    ctx.fillText(standeeSubtitle, w / 2, 1310);

    // Bottom Powered By Nexora
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('100% SECURE DIRECT PROCESSING • PRINTED VIA NEXORA TOOLS', w / 2, 1520);
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_qr_${qrType}_${Date.now()}.png`;
    a.click();
    incrementStat('batch');
  };

  const handleDownloadStandee = () => {
    if (!standeeCanvasRef.current) return;
    const url = standeeCanvasRef.current.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_standee_card_${qrType}_${Date.now()}.jpg`;
    a.click();
    incrementStat('batch');
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(getPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="QR Code & UPI Standee Studio"
        description="Generate high-resolution vector QR codes for instant UPI payments (PhonePe, GPay, Paytm), Shop Wi-Fi, URLs, and print ready tabletop counter standees."
        categoryName="Utilities & Print"
        categoryPath="/tools/qr-generator"
        badge="UPI & Standee Ready"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Type Selector Tabs */}
          <div className="p-1.5 rounded-2xl bg-slate-900 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-1">
            <button
              onClick={() => setQrType('upi')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                qrType === 'upi'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>UPI Pay</span>
            </button>

            <button
              onClick={() => setQrType('wifi')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                qrType === 'wifi'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Wi-Fi</span>
            </button>

            <button
              onClick={() => setQrType('url')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                qrType === 'url'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
            </button>

            <button
              onClick={() => setQrType('text')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                qrType === 'text'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Plain Text</span>
            </button>
          </div>

          {/* Form Content Based on Type */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4 shadow-xl backdrop-blur-xl">
            {qrType === 'upi' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    UPI Payment Parameters
                  </h3>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    UPI VPA Address (Mandatory):
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@ybl, merchant@okhdfcbank"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Payee / Shop Business Name:
                  </label>
                  <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="e.g. Sharma Cyber Station"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Fixed Amount (Optional ₹):
                    </label>
                    <input
                      type="number"
                      value={upiAmount}
                      onChange={(e) => setUpiAmount(e.target.value)}
                      placeholder="Leave blank for any"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Note / Description:
                    </label>
                    <input
                      type="text"
                      value={upiNote}
                      onChange={(e) => setUpiNote(e.target.value)}
                      placeholder="e.g. Photocopy bill"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Wi-Fi Network Access
                  </h3>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Network Name (SSID):
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="e.g. CyberCafe_Guest"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Wi-Fi Password:
                  </label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="e.g. securepassword123"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-300 font-medium">Security:</label>
                    {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                      <label key={enc} className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="radio"
                          name="wifiEnc"
                          checked={wifiEncryption === enc}
                          onChange={() => setWifiEncryption(enc)}
                          className="accent-indigo-500"
                        />
                        <span>{enc === 'nopass' ? 'Open' : enc}</span>
                      </label>
                    ))}
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Hidden SSID</span>
                  </label>
                </div>
              </div>
            )}

            {qrType === 'url' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Website Link
                  </h3>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Destination Web URL:
                  </label>
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {qrType === 'text' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Plain Text / Notice
                  </h3>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Text Content:
                  </label>
                  <textarea
                    rows={4}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Type your notice or contact card info..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-medium"
                  />
                </div>
              </div>
            )}

            {/* Colors & Resolution Controls */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Styling &amp; Colors:
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-slate-300 font-medium">QR Color</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-slate-300 font-medium">Background</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Export Size:</span>
                    <span className="font-mono text-indigo-400">{qrSize}×{qrSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="1024"
                    step="128"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={includeMargin}
                    onChange={(e) => setIncludeMargin(e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Quiet Zone Margin</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview & Standee Card Area */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main QR Code Display */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-xl">
            <div className="p-6 rounded-3xl bg-white shadow-2xl shadow-indigo-950/40 border border-slate-200">
              <canvas ref={canvasRef} className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleDownloadPNG}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </button>

              <button
                onClick={handleCopyPayload}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied URI' : 'Copy Code Link'}</span>
              </button>
            </div>
          </div>

          {/* Shop Tabletop Standee Card Generator */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Counter Tabletop Standee Card
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Ready to Print
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Export an elegant, branded tabletop display frame with your QR code, business title, and UPI acceptance logos ready for direct 4×6" or A4 printing.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Standee Top Banner:</label>
                <input
                  type="text"
                  value={standeeTitle}
                  onChange={(e) => setStandeeTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Bottom Subtitle:</label>
                <input
                  type="text"
                  value={standeeSubtitle}
                  onChange={(e) => setStandeeSubtitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleDownloadStandee}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Download Printable Standee Sheet (300 DPI)</span>
            </button>

            {/* Hidden canvas for high-res standee rendering */}
            <canvas ref={standeeCanvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};
