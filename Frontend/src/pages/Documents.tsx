import { useState, useEffect, useRef } from 'react';
import { Upload, FolderOpen, Trash2, Download, Search, FileText, Image, File } from 'lucide-react';
import { documentService, projectService } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

function fileIcon(type: string) {
  if (type?.startsWith('image/')) return <Image className="w-5 h-5 text-indigo-500" />;
  if (type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-slate-400" />;
}

export default function Documents() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [d, p] = await Promise.all([documentService.getAll(), projectService.getAll()]);
    setDocs(d.data || []);
    setProjects(p.data || []);
    setLoading(false);
  }

  async function handleUpload(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    await documentService.upload(file, selectedProject, user.id);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    fetchAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return;
    await documentService.delete(id);
    fetchAll();
  }

  const filtered = docs.filter(d =>
    (!search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.projects?.name?.toLowerCase().includes(search.toLowerCase())) &&
    (!selectedProject || d.project_id === selectedProject)
  );

  function formatBytes(url: string) { return '—'; }
  function formatDate(ts: string) { return new Date(ts).toLocaleDateString(); }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Documents</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Plans, Contracts & Reports</p>
        </div>
        <label className={`flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Uploading...' : 'Upload File'}
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-2 max-w-xs shadow-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="bg-transparent text-xs w-full outline-none placeholder:text-slate-300" />
        </div>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Upload drop hint when no project selected */}
      {!selectedProject && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
          <FolderOpen className="w-4 h-4 shrink-0" />
          <span>Select a project before uploading to link the document.</span>
        </div>
      )}

      {/* Documents Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex items-start gap-3 hover:border-indigo-200 transition-colors group">
              <div className="shrink-0 p-2 bg-slate-50 rounded-lg border border-slate-100">
                {fileIcon(doc.type)}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{doc.projects?.name || 'No project'}</p>
                <p className="text-[10px] text-slate-300 font-mono mt-1">{formatDate(doc.created_at)}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
