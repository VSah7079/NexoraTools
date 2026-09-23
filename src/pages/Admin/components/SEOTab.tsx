import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Plus,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import type { RouteSEOConfig, GlobalSEOSettings, CustomToolItem } from '../../../types/admin';

interface SEOTabProps {
  seoRoutes: Record<string, RouteSEOConfig>;
  globalSEO: GlobalSEOSettings;
  activeTools: CustomToolItem[];
  onUpdateRouteSEO: (path: string, config: RouteSEOConfig) => void;
  onDeleteRouteSEO: (path: string) => void;
  onUpdateGlobalSEO: (settings: Partial<GlobalSEOSettings>) => void;
}

export const SEOTab: React.FC<SEOTabProps> = ({
  seoRoutes,
  globalSEO,
  activeTools,
  onUpdateRouteSEO,
  onDeleteRouteSEO,
  onUpdateGlobalSEO,
}) => {
  const [search, setSearch] = useState('');
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<RouteSEOConfig>({
    path: '',
    title: '',
    description: '',
    keywords: '',
    canonicalUrl: '',
    robots: 'index, follow',
    categoryName: 'Online Tools',
    toolName: '',
  });

  // Sitemap Generator
  const generatedSitemapXML = useMemo(() => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const domain = 'https://nexoratools.com';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    Object.entries(seoRoutes).forEach(([path]) => {
      const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
      xml += `  <url>\n    <loc>${domain}${cleanPath}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${path === '/' ? '1.00' : '0.95'}</priority>\n  </url>\n`;
    });

    activeTools.forEach((t) => {
      if (!seoRoutes[t.path]) {
        xml += `  <url>\n    <loc>${domain}${t.path.startsWith('/') ? t.path : `/${t.path}`}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.90</priority>\n  </url>\n`;
      }
    });

    xml += `</urlset>`;
    return xml;
  }, [seoRoutes, activeTools]);

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(generatedSitemapXML);
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2500);
  };

  const handleDownloadSitemap = () => {
    const blob = new Blob([generatedSitemapXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredRoutes = useMemo(() => {
    return Object.entries(seoRoutes).filter(([path, conf]) => {
      return (
        path.toLowerCase().includes(search.toLowerCase()) ||
        conf.title.toLowerCase().includes(search.toLowerCase()) ||
        conf.description.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [seoRoutes, search]);

  const handleOpenAdd = () => {
    setForm({
      path: '',
      title: '',
      description: '',
      keywords: '',
      canonicalUrl: '',
      robots: 'index, follow',
      categoryName: 'Online Tools',
      toolName: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (path: string, config: RouteSEOConfig) => {
    setForm({ ...config, path });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.path || !form.title) return;
    onUpdateRouteSEO(form.path, form);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
              Dynamic SEO &amp; Search Engine Studio
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {Object.keys(seoRoutes).length} Routes
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Control search titles, snippet descriptions, Google SERP previews, and live XML sitemaps.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Route SEO</span>
          </button>
          <button
            onClick={handleCopySitemap}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSitemap ? 'Copied' : 'Copy Sitemap'}</span>
          </button>
          <button
            onClick={handleDownloadSitemap}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download XML</span>
          </button>
        </div>
      </div>

      {/* Global Verification & Analytics Credentials */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4 shadow-lg">
        <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Global Search Engine Verification &amp; Analytics Tokens</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Google Verification ID</label>
            <input
              type="text"
              value={globalSEO.googleVerificationId || ''}
              onChange={(e) => onUpdateGlobalSEO({ googleVerificationId: e.target.value })}
              placeholder="e.g. AbCdEf123456"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Bing Webmaster Token</label>
            <input
              type="text"
              value={globalSEO.bingVerificationId || ''}
              onChange={(e) => onUpdateGlobalSEO({ bingVerificationId: e.target.value })}
              placeholder="e.g. 7D8E9F01234"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">GA4 Measurement ID</label>
            <input
              type="text"
              value={globalSEO.ga4MeasurementId || ''}
              onChange={(e) => onUpdateGlobalSEO({ ga4MeasurementId: e.target.value })}
              placeholder="e.g. G-ABC123XYZ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Google AdSense Pub ID</label>
            <input
              type="text"
              value={globalSEO.adsensePubId || ''}
              onChange={(e) => onUpdateGlobalSEO({ adsensePubId: e.target.value })}
              placeholder="e.g. ca-pub-123456789"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter SEO mapped routes by URL path or Title (e.g. /bg-remover, /pdf-to-word)..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* SEO Route Cards List */}
      <div className="space-y-4">
        {filteredRoutes.map(([path, conf]) => (
          <div
            key={path}
            className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg space-y-4 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                  {path}
                </span>
                {conf.categoryName && (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] sm:text-[11px] font-semibold">
                    {conf.categoryName}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {conf.robots || 'index, follow'}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  to={path}
                  target="_blank"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Visit</span>
                </Link>
                <button
                  onClick={() => handleOpenEdit(path, conf)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                {path !== '/' && (
                  <button
                    onClick={() => onDeleteRouteSEO(path)}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer"
                    title="Delete SEO Mapping"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Google Search Live Preview */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-white/5 space-y-1.5 font-sans overflow-hidden">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                <span className="text-emerald-400 font-medium shrink-0">https://nexoratools.com</span>
                <span>›</span>
                <span className="text-slate-400 truncate">{path === '/' ? '' : path.slice(1)}</span>
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug break-words">
                {conf.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 break-words">
                {conf.description}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-1">
              <span className="font-semibold text-slate-300">Target Keywords:</span>
              <span className="break-words">{conf.keywords}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT SEO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm sm:text-base">
                    Configure Route SEO &amp; SERP Metadata
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Real-time snippet generator and search engine index controls
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Route Path URL *</label>
                <input
                  type="text"
                  required
                  value={form.path}
                  onChange={(e) => setForm({ ...form, path: e.target.value })}
                  placeholder="e.g. /bg-remover or /pdf-to-word"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Page Title (Search Snippet Title) *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Free AI Background Remover Online (HD Transparent & White Background)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className={form.title.length >= 50 && form.title.length <= 65 ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                    Length: {form.title.length} characters (Recommended: 50–65)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Meta Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="High-intent search description..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className={form.description.length >= 120 && form.description.length <= 160 ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                    Length: {form.description.length} characters (Recommended: 120–160)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Search Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder="e.g. bg remover, remove background online, background remover free"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Robots Indexing</label>
                  <select
                    value={form.robots || 'index, follow'}
                    onChange={(e) => setForm({ ...form, robots: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="index, follow">index, follow (Allow in Search)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Hide from Search)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Category Name (For Breadcrumbs)</label>
                  <input
                    type="text"
                    value={form.categoryName || ''}
                    onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                    placeholder="e.g. Photo Tools"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* LIVE PREVIEW INSIDE MODAL */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Google Search Snippet Preview:
                </span>
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-1 font-sans overflow-hidden">
                  <div className="text-[11px] text-emerald-400 truncate">
                    https://nexoratools.com{form.path}
                  </div>
                  <h4 className="text-sm sm:text-base text-[#8ab4f8] font-medium leading-snug break-words">
                    {form.title || 'Page Title Preview'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 break-words">
                    {form.description || 'Page meta description preview will show up here.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/25 cursor-pointer text-center"
                >
                  Save SEO Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
