import React, { useState } from 'react';
import {
  Key,
  Download,
  Upload,
  AlertTriangle,
  Check,
  RotateCcw,
} from 'lucide-react';

interface SecurityTabProps {
  onChangePin: (newPin: string) => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importStatus: { success?: boolean; message?: string } | null;
  onResetDefaults: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  onChangePin,
  onExportBackup,
  onImportBackup,
  importStatus,
  onResetDefaults,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 characters long');
      setPinSuccess('');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PIN confirmation does not match');
      setPinSuccess('');
      return;
    }
    onChangePin(newPin);
    setPinError('');
    setPinSuccess('Admin Master PIN changed successfully!');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
            Security, Backups &amp; System Maintenance
          </h2>
          <p className="text-xs text-slate-400">
            Manage admin credentials, export portable JSON backups, and maintain site configurations.
          </p>
        </div>
      </div>

      {/* Change PIN Card */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5 shadow-lg">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
            Change Master Admin PIN
          </h3>
        </div>

        <form onSubmit={handleChangePinSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">New Master PIN / Password</label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter new PIN (min 4 chars)"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Confirm New PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm new PIN"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {pinError && (
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          {pinSuccess && (
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pinSuccess}</span>
            </div>
          )}

          <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer text-center"
            >
              Update Master PIN
            </button>
            <span className="text-[11px] text-slate-400 text-center sm:text-right">
              Default Master PIN: <code className="text-indigo-300 font-mono font-bold">nexora2026</code>
            </span>
          </div>
        </form>
      </div>

      {/* JSON Backup & Migration */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5 shadow-lg">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
            Full Configuration Backup &amp; Migration (JSON)
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Export all active tools, custom routes, SEO metadata, announcements, and branding settings into a single portable JSON file. You can restore this backup anytime on any device.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onExportBackup}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (.JSON)</span>
          </button>

          <label className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Import Backup JSON File</span>
            <input type="file" accept=".json" onChange={onImportBackup} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {importStatus.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* Factory Reset Danger Zone */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-rose-500/20 backdrop-blur-xl space-y-4 shadow-lg">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-heading font-bold text-rose-300 uppercase tracking-wider">
            Reset Site Configuration to Factory Defaults
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Restore default catalog tools, default SEO route mappings, and default branding settings. Custom tools and custom meta modifications will be reset.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all cursor-pointer"
          >
            Reset to Factory Defaults...
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-3">
            <p className="text-xs font-bold text-rose-200">
              Are you sure you want to reset everything back to factory defaults?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onResetDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
