import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Sparkles,
  LayoutGrid,
  List,
  Layers,
  X,
  UserCheck,
  CreditCard,
  FileText,
  Scan,
  Zap,
  Globe,
  PenTool,
  Printer,
  FileSpreadsheet,
  Crop,
  Maximize2,
  Minimize2,
  FileCheck2,
  Scissors,
  FileArchive,
  QrCode,
  Code,
} from 'lucide-react';
import type { CustomToolItem, ToolCategory } from '../../../types/admin';

export const AVAILABLE_ICONS: Record<string, any> = {
  UserCheck,
  Sparkles,
  Minimize2,
  Maximize2,
  Crop,
  PenTool,
  CreditCard,
  FileCheck2,
  Printer,
  FileText,
  FileSpreadsheet,
  Code,
  Layers,
  Scissors,
  FileArchive,
  Scan,
  Zap,
  QrCode,
  Globe,
};

export const COLOR_GRADIENTS = [
  { label: 'Blue to Indigo', value: 'from-blue-500 to-indigo-600' },
  { label: 'Purple to Pink', value: 'from-purple-500 to-pink-600' },
  { label: 'Emerald to Teal', value: 'from-emerald-500 to-teal-600' },
  { label: 'Amber to Orange', value: 'from-amber-500 to-orange-600' },
  { label: 'Cyan to Blue', value: 'from-cyan-500 to-blue-600' },
  { label: 'Rose to Red', value: 'from-rose-500 to-red-600' },
  { label: 'Indigo to Violet', value: 'from-indigo-500 to-violet-600' },
  { label: 'Sky to Cyan', value: 'from-sky-500 to-cyan-600' },
  { label: 'Orange to Red', value: 'from-orange-500 to-red-600' },
];

interface ToolsTabProps {
  tools: CustomToolItem[];
  onAddTool: (tool: CustomToolItem) => void;
  onUpdateTool: (id: string, tool: Partial<CustomToolItem>) => void;
  onDeleteTool: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({
  tools,
  onAddTool,
  onUpdateTool,
  onDeleteTool,
  onToggleStatus,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CustomToolItem, 'isCustom'>>({
    id: '',
    name: '',
    shortName: '',
    description: '',
    category: 'photo',
    path: '',
    iconName: 'Sparkles',
    badge: '',
    popular: false,
    color: 'from-indigo-500 to-purple-600',
    enabled: true,
  });

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'photo', label: 'Photo Suite' },
    { id: 'id-card', label: 'ID Cards' },
    { id: 'print', label: 'Print Studio' },
    { id: 'pdf', label: 'PDF Suite' },
    { id: 'scanner', label: 'Document Scanner' },
    { id: 'batch', label: 'Batch Processing' },
  ];

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      const isEnabled = tool.enabled !== false;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isEnabled) ||
        (statusFilter === 'disabled' && !isEnabled);
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.path.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [tools, categoryFilter, statusFilter, search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      id: `custom-tool-${Date.now()}`,
      name: '',
      shortName: '',
      description: '',
      category: 'photo',
      path: '/custom-tool',
      iconName: 'Sparkles',
      badge: 'New Tool',
      popular: false,
      color: 'from-indigo-500 to-purple-600',
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tool: CustomToolItem) => {
    setEditingId(tool.id);
    setForm({
      id: tool.id,
      name: tool.name,
      shortName: tool.shortName || '',
      description: tool.description,
      category: tool.category,
      path: tool.path,
      iconName: tool.iconName,
      badge: tool.badge || '',
      popular: tool.popular || false,
      color: tool.color,
      enabled: tool.enabled !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.path) return;

    if (editingId) {
      onUpdateTool(editingId, form);
    } else {
      onAddTool({
        ...form,
        isCustom: true,
      });
    }
    setIsModalOpen(false);
  };

  const PreviewIcon = AVAILABLE_ICONS[form.iconName] || Sparkles;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
              Tools &amp; Services Catalog
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {filteredTools.length} of {tools.length}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Enable or disable public visibility, edit labels and badges, or create custom utility routes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Tool</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools by title, route, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status & View Mode */}
          <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>

            <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const count =
              cat.id === 'all' ? tools.length : tools.filter((t) => t.category === cat.id).length;
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const IconComp = AVAILABLE_ICONS[tool.iconName] || Sparkles;
            const isEnabled = tool.enabled !== false;
            return (
              <div
                key={tool.id}
                className={`p-5 rounded-3xl border backdrop-blur-xl space-y-4 transition-all duration-200 ${
                  isEnabled
                    ? 'bg-slate-900/80 border-white/10 shadow-lg hover:border-indigo-500/30'
                    : 'bg-slate-950/60 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-md shrink-0`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-white text-sm truncate leading-snug">
                        {tool.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="font-mono text-indigo-300 truncate">{tool.path}</span>
                        {tool.isCustom && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold shrink-0">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => onToggleStatus(tool.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer shrink-0 ${
                      isEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-white/10'
                    }`}
                  >
                    {isEnabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    {tool.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {tool.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {tool.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={tool.path}
                      target="_blank"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Preview Tool Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(tool)}
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors cursor-pointer"
                      title="Edit Tool"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTool(tool.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Delete Tool"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-hidden rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Tool Name &amp; Icon</th>
                  <th className="py-3.5 px-4">Route Path</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Badge</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTools.map((tool) => {
                  const IconComp = AVAILABLE_ICONS[tool.iconName] || Sparkles;
                  const isEnabled = tool.enabled !== false;
                  return (
                    <tr key={tool.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shrink-0`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{tool.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {tool.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-300">{tool.path}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-semibold text-slate-400">
                        {tool.category}
                      </td>
                      <td className="py-3 px-4">
                        {tool.badge ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {tool.badge}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onToggleStatus(tool.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            isEnabled
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-white/10'
                          }`}
                        >
                          {isEnabled ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={tool.path}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(tool)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTool(tool.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT TOOL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm sm:text-base">
                    {editingId ? 'Edit Tool Properties' : 'Create Custom Tool Item'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Configure names, icons, paths, categories and visual styling
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

            {/* LIVE PREVIEW CARD */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Live Card Preview:
              </span>
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-3">
                <div
                  className={`w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-gradient-to-br ${form.color} flex items-center justify-center text-white shadow-md shrink-0`}
                >
                  <PreviewIcon className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                      {form.name || 'Tool Title Preview'}
                    </h4>
                    {form.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {form.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                    {form.description || 'Tool description preview will show up here.'}
                  </p>
                  <span className="text-[10px] font-mono text-indigo-300">
                    {form.path || '/tool-route'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Tool Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. AI Background Remover"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Route Path URL *</label>
                  <input
                    type="text"
                    required
                    value={form.path}
                    onChange={(e) => setForm({ ...form, path: e.target.value })}
                    placeholder="e.g. /bg-remover"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Clear description of tool capabilities..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ToolCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="photo">Photo Suite</option>
                    <option value="id-card">ID Cards</option>
                    <option value="print">Print Studio</option>
                    <option value="pdf">PDF Suite</option>
                    <option value="scanner">Document Scanner</option>
                    <option value="batch">Batch Processing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Badge Label (Optional)</label>
                  <input
                    type="text"
                    value={form.badge || ''}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. AI Fast, Popular, New"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Icon Selector Grid */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Select Icon</label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-28 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-white/5 scrollbar-thin">
                  {Object.entries(AVAILABLE_ICONS).map(([key, Icon]) => {
                    const isSel = form.iconName === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setForm({ ...form, iconName: key })}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                        title={key}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gradient Color Picker */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Select Gradient Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {COLOR_GRADIENTS.map((g) => {
                    const isSel = form.color === g.value;
                    return (
                      <button
                        type="button"
                        key={g.value}
                        onClick={() => setForm({ ...form, color: g.value })}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-[10px] text-white transition-all cursor-pointer ${
                          isSel ? 'border-indigo-500 bg-slate-950 ring-2 ring-indigo-500/30' : 'border-white/5 bg-slate-950/60'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${g.value}`} />
                        <span className="truncate">{g.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/25 cursor-pointer text-center"
                >
                  Save Tool Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
