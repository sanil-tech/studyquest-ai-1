import React, { useState } from 'react';
import { Image as ImageIcon, Video, Trash2, X, Plus } from 'lucide-react';
import { EngagementBlock, MediaAsset } from '../types/engagement';

interface EngagementBlockEditorProps {
  block: EngagementBlock;
  onUpdateBlock: (updated: EngagementBlock) => void;
}

export default function EngagementBlockEditor({ block, onUpdateBlock }: EngagementBlockEditorProps) {
  const [showMediaModal, setShowMediaModal] = useState<MediaAsset['type'] | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateBlock({ ...block, text_content: e.target.value });
  };

  const handleAddMedia = (type: MediaAsset['type']) => {
    if (!mediaUrlInput.trim()) return;
    onUpdateBlock({
      ...block,
      media: {
        type,
        url: mediaUrlInput.trim()
      }
    });
    setMediaUrlInput('');
    setShowMediaModal(null);
  };

  const handleRemoveMedia = () => {
    onUpdateBlock({ ...block, media: null });
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-stone-700">Teks Naratif (Suku Penyu)</label>
        <textarea
          value={block.text_content}
          onChange={handleTextChange}
          placeholder="Tuliskan penceritaan di sini..."
          className="w-full min-h-[120px] p-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-y text-stone-800"
        />
        {block.text_content.length < 5 && (
          <p className="text-xs text-rose-500 font-medium">Sila masukkan sekurang-kurangnya 5 aksara.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-stone-700">Media Sokongan</label>

        {!block.media ? (
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowMediaModal('IMAGE')}
              className="flex items-center gap-2 px-6 py-4 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold rounded-2xl border border-sky-200 transition-all active:scale-95"
            >
              <ImageIcon className="w-5 h-5" /> + Masukkan Imej
            </button>
            <button
              onClick={() => setShowMediaModal('VIDEO')}
              className="flex items-center gap-2 px-6 py-4 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-2xl border border-purple-200 transition-all active:scale-95"
            >
              <Video className="w-5 h-5" /> + Masukkan Video (10s)
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border-4 border-stone-100 group bg-stone-900 flex items-center justify-center">
            {block.media.type === 'VIDEO' ? (
              <video 
                src={block.media.url} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={block.media.url} 
                alt="Media Preview" 
                className="w-full h-full object-contain"
              />
            )}
            
            {/* Overlay Delete Button */}
            <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleRemoveMedia}
                className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                <Trash2 className="w-5 h-5" /> Buang Media
              </button>
            </div>
            
            <div className="absolute top-4 left-4 px-3 py-1 bg-stone-900/80 text-white text-xs font-bold rounded-lg uppercase tracking-wider backdrop-blur-md">
              {block.media.type}
            </div>
          </div>
        )}
      </div>

      {/* Inline Modal for URL Input */}
      {showMediaModal && (
        <div className="p-6 bg-stone-50 border border-stone-200 rounded-3xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-stone-800 flex items-center gap-2">
              {showMediaModal === 'VIDEO' ? <Video className="w-5 h-5 text-purple-600" /> : <ImageIcon className="w-5 h-5 text-sky-600" />}
              Masukkan URL {showMediaModal === 'VIDEO' ? 'Video' : 'Imej'}
            </h4>
            <button onClick={() => setShowMediaModal(null)} className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="url"
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              placeholder="https://contoh.com/media.mp4"
              className="flex-1 p-4 rounded-2xl border border-stone-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
            />
            <button
              onClick={() => handleAddMedia(showMediaModal)}
              disabled={!mediaUrlInput.trim()}
              className="px-8 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
