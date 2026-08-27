import React, { useState } from 'react';
import { Video, Radio, Sparkles, CheckCircle2, PlayCircle, Eye } from 'lucide-react';
import { VeoVisualGuide, NeedCategory } from '../types';
import { VeoService } from '../services/veoService';

interface VeoBroadcastGalleryProps {
  guides: VeoVisualGuide[];
  onAddGuide: (guide: VeoVisualGuide) => void;
  onToggleBroadcast: (id: string) => void;
}

export const VeoBroadcastGallery: React.FC<VeoBroadcastGalleryProps> = ({
  guides,
  onAddGuide,
  onToggleBroadcast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NeedCategory>('water');
  const [customPrompt, setCustomPrompt] = useState<string>(
    'Cinematic 4K instructional video, no text: Demonstrating how to use charcoal, fabric, and sand to purify floodwater step-by-step.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeGuideModal, setActiveGuideModal] = useState<VeoVisualGuide | null>(null);

  const handleGenerateVeo = async () => {
    setIsGenerating(true);
    const newGuide = await VeoService.generateNewVeoGuide(selectedCategory, customPrompt);
    onAddGuide(newGuide);
    setIsGenerating(false);
  };

  return (
    <div style={{ background: '#1e293b', color: '#f8fafc', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#8b5cf6', padding: '8px', borderRadius: '8px' }}>
            <Video size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Google Veo: Universal Visual Guides</h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Zero-Language Barrier Non-Verbal Instructions</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#a78bfa' }}>
          <Radio size={16} />
          <span>Active Broadcasts: {guides.filter((g) => g.isBroadcasting).length}</span>
        </div>
      </div>

      {/* Generator Box */}
      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>Trigger Google Veo Generation (Cloud Agent Mode)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as NeedCategory)}
            style={{ padding: '8px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}
          >
            <option value="water">Water Purification</option>
            <option value="medical">Wound Bandaging</option>
            <option value="shelter">Emergency Shelter</option>
            <option value="food">MRE Heating</option>
            <option value="power">Solar Charging</option>
          </select>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Veo non-verbal prompt description..."
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}
          />
          <button
            onClick={handleGenerateVeo}
            disabled={isGenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: isGenerating ? '#64748b' : '#8b5cf6',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
            }}
          >
            <Sparkles size={16} />
            {isGenerating ? 'Rendering...' : 'Generate Veo Video'}
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {guides.map((guide) => (
          <div
            key={guide.id}
            style={{
              background: '#0f172a',
              borderRadius: '8px',
              overflow: 'hidden',
              border: guide.isBroadcasting ? '1px solid #8b5cf6' : '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Thumbnail Header */}
            <div style={{ position: 'relative', height: '140px', background: '#020617' }}>
              <img
                src={guide.thumbnailUrl}
                alt={guide.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              />
              <button
                onClick={() => setActiveGuideModal(guide)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.4)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <PlayCircle size={42} />
              </button>
              {guide.isBroadcasting && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#8b5cf6',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Radio size={12} /> ON AIR
                </span>
              )}
            </div>

            {/* Content */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                  {guide.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  {guide.keyVisualSteps.slice(0, 3).map((step, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} color="#8b5cf6" /> {step}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                <button
                  onClick={() => setActiveGuideModal(guide)}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Eye size={14} /> Full Visual Steps
                </button>

                <button
                  onClick={() => onToggleBroadcast(guide.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: guide.isBroadcasting ? '#ef4444' : '#334155',
                    color: '#fff',
                  }}
                >
                  {guide.isBroadcasting ? 'Stop Broadcast' : 'Broadcast to Zone'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Step Viewer */}
      {activeGuideModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setActiveGuideModal(null)}
        >
          <div
            style={{
              background: '#0f172a',
              padding: '1.5rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid #8b5cf6',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc' }}>{activeGuideModal.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
              <strong>Veo Universal Non-Verbal Prompt:</strong> {activeGuideModal.generatedPrompt}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {activeGuideModal.keyVisualSteps.map((step, idx) => (
                <div key={idx} style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#f8fafc' }}>
                  {step}
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveGuideModal(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
