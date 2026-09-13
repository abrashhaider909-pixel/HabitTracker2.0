import React, { useState } from 'react';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  ExternalLink, 
  UploadCloud, 
  Code, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { SupabaseConfig, Habit, Transaction, CareerMilestone } from '../types';
import { testSupabaseConnection, syncAllToSupabase } from '../lib/supabase';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabaseSchema';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSaveConfig: (config: SupabaseConfig) => void;
  habits: Habit[];
  transactions: Transaction[];
  careerMilestones: CareerMilestone[];
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  habits,
  transactions,
  careerMilestones,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [activeTab, setActiveTab] = useState<'connect' | 'schema'>('connect');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, anonKey);
      setTestResult(res);
      if (res.success) {
        onSaveConfig({
          url,
          anonKey,
          isConnected: true,
          lastSyncedAt: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncAllToSupabase(habits, transactions, careerMilestones);
      setSyncResult(res);
      if (res.success) {
        onSaveConfig({
          ...config,
          url,
          anonKey,
          isConnected: true,
          lastSyncedAt: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      setSyncResult({ success: false, message: e.message || 'Sync failed' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'supabase_schema.sql';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Supabase SQL Database Integration
              </h3>
              <p className="text-xs text-slate-400">
                Persistent cloud storage with auto-sync and local storage fallback
              </p>
            </div>
          </div>
          <button
            id="close-supabase-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'border-emerald-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Connection & Credentials</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-emerald-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>1-Click SQL Schema</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'connect' ? (
            <div className="space-y-4">
              {/* Status banner */}
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                config.isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${config.isConnected ? 'bg-emerald-400 ring-4 ring-emerald-400/20' : 'bg-amber-400'}`} />
                <div className="text-xs">
                  <span className="font-bold">
                    {config.isConnected ? 'Connected to Supabase Project' : 'Running on Offline Local Storage (Zero Setup Required)'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {config.isConnected
                      ? `Last synced: ${config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString() : 'Just now'}`
                      : 'All habits, transactions, and career milestones are securely cached in your browser. Enter Supabase credentials below to sync across devices!'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    id="supabase-url-input"
                    type="url"
                    placeholder="https://xyzprojectid.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    id="supabase-anon-key-input"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Test Connection Results */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Sync Results */}
              {syncResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  syncResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {syncResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{syncResult.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  id="test-supabase-btn"
                  onClick={handleTestConnection}
                  disabled={isTesting || !url || !anonKey}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Test Connection</span>
                </button>

                <button
                  id="sync-supabase-btn"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing || !url || !anonKey}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  <span>Sync Local Data to Cloud</span>
                </button>
              </div>
            </div>
          ) : (
            /* Schema tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Run this SQL in your <span className="text-emerald-400 font-semibold">Supabase Dashboard &gt; SQL Editor</span> to provision the tables:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySchema}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSchema}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .sql</span>
                  </button>
                </div>
              </div>

              {/* Code snippet block */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 overflow-x-auto max-h-72 font-mono text-[11px] text-slate-300">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
