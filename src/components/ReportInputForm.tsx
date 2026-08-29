import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Zap,
  Users,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Radio,
  CheckCircle,
} from 'lucide-react';
import { EdgeGemmaService } from '../services/edgeGemmaService';
import type { EmergencyLevel, NeedCategory } from '../types';

export interface FormReportPayload {
  sectorId: string;
  rawText: string;
  triageLevel: EmergencyLevel;
  category: NeedCategory;
  peopleCount: {
    total: number;
    infants: number;
    elderly: number;
    mobilityImpaired: number;
  };
  criticalFlags: string[];
}

interface ReportInputFormProps {
  onSubmitReport: (payload: FormReportPayload) => void;
  isProcessing: boolean;
}

const PRESET_TEMPLATES = [
  {
    label: '🩺 Resuscitation T1 (Trauma)',
    triage: 'critical' as EmergencyLevel,
    category: 'medical' as NeedCategory,
    flags: ['Critical Bleeding', 'Ventilator / Oxygen Failure'],
    text: 'Citizen Marcus Vance, phone +1-555-019-2834, 442 River St. Arterial wound, 2 people trapped under debris, immediate tourniquet & resuscitation needed.',
    sector: 'sector-alpha',
    people: { total: 2, infants: 0, elderly: 1, mobilityImpaired: 1 },
  },
  {
    label: '💊 Insulin + Infant T1',
    triage: 'critical' as EmergencyLevel,
    category: 'medical' as NeedCategory,
    flags: ['Insulin < 4 Hours', 'Infant without Formula'],
    text: 'Patient Elena Rostova, 14 Elm St Apt 5B, tel 89163334455. Diabetic patient without insulin, 6-month-old infant out of sterile milk formula.',
    sector: 'sector-bravo',
    people: { total: 3, infants: 1, elderly: 0, mobilityImpaired: 1 },
  },
  {
    label: '💧 Water 10+ people T2',
    triage: 'high' as EmergencyLevel,
    category: 'water' as NeedCategory,
    flags: ['No Water > 48h', 'Bedridden Elderly'],
    text: 'School basement shelter, contact Arthur Pendelton at +1-555-492-1100. 14 people including children cut off from potable water, urgently require 100L clean drinking water.',
    sector: 'sector-delta',
    people: { total: 14, infants: 2, elderly: 5, mobilityImpaired: 2 },
  },
];

const PRESET_FLAGS = [
  'Critical Bleeding',
  'Ventilator / Oxygen Failure',
  '1st-2nd Floor Flooding',
  'Insulin < 4 Hours',
  'Infant without Formula',
  'Bedridden Elderly',
  'Risk of Roof Collapse',
  'No Water > 48h',
  'Hypothermia / Cold Shock',
];

export const ReportInputForm: React.FC<ReportInputFormProps> = ({
  onSubmitReport,
  isProcessing,
}) => {
  const [sectorId, setSectorId] = useState<string>('sector-alpha');
  const [triageLevel, setTriageLevel] = useState<EmergencyLevel>('critical');
  const [category, setCategory] = useState<NeedCategory>('medical');

  const [totalPeople, setTotalPeople] = useState<number>(3);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [elderlyCount, setElderlyCount] = useState<number>(1);
  const [mobilityImpairedCount, setMobilityImpairedCount] = useState<number>(1);

  const [selectedFlags, setSelectedFlags] = useState<string[]>(['Critical Bleeding']);
  const [rawText, setRawText] = useState<string>(
    'Citizen Johnathan Miller, phone: +1-555-019-2834, 442 River St Apt 12. Basement flooded, 6 people trapped including 2 toddlers, urgently need clean drinking water and purification tablets.'
  );

  const [showPiiDiff, setShowPiiDiff] = useState<boolean>(true);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);

  // Live real-time PII Scrubber evaluation
  const piiResult = useMemo(() => {
    return EdgeGemmaService.scrubPiiRealtime(rawText, sectorId);
  }, [rawText, sectorId]);

  const toggleFlag = (flag: string) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleApplyTemplate = (tpl: (typeof PRESET_TEMPLATES)[0]) => {
    setTriageLevel(tpl.triage);
    setCategory(tpl.category);
    setSelectedFlags(tpl.flags);
    setRawText(tpl.text);
    setSectorId(tpl.sector);
    setTotalPeople(tpl.people.total);
    setInfantsCount(tpl.people.infants);
    setElderlyCount(tpl.people.elderly);
    setMobilityImpairedCount(tpl.people.mobilityImpaired);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || isProcessing) return;

    onSubmitReport({
      sectorId,
      rawText,
      triageLevel,
      category,
      peopleCount: {
        total: Math.max(1, totalPeople),
        infants: infantsCount,
        elderly: elderlyCount,
        mobilityImpaired: mobilityImpairedCount,
      },
      criticalFlags: selectedFlags,
    });

    setJustSubmitted(true);
    setTimeout(() => {
      setJustSubmitted(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Title Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            EMERGENCY FIELD INTAKE FROM THE GROUND
          </h3>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#10b98115',
            border: '1px solid #10b98140',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#34d399',
          }}
        >
          <ShieldCheck size={16} />
          <span>ON-DEVICE PII SANITIZATION (PII-SCRUBBER ACTIVE)</span>
        </div>
      </div>

      {/* Quick Templates for Disaster Intake */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Zap size={14} color="#f59e0b" />
          <span>QUICK DISASTER TEMPLATES:</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {PRESET_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Triage Level / Medical Urgency (START Protocol Matrix) */}
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '6px' }}>
          1. TRIAGE LEVEL / MEDICAL URGENCY (START PROTOCOL):
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          {/* T1 IMMEDIATE */}
          <button
            type="button"
            onClick={() => setTriageLevel('critical')}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: triageLevel === 'critical' ? '#ef4444' : '#ef444440',
              background: triageLevel === 'critical' ? '#ef444425' : '#0f172a',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '74px',
              boxShadow: triageLevel === 'critical' ? '0 0 12px rgba(239, 68, 68, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f87171' }}>T1 IMMEDIATE</span>
              <span style={{ fontSize: '0.65rem', background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>RED</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.3' }}>
              Immediate life threat. Bleeding, shock, asphyxia, diabetic crisis.
            </p>
          </button>

          {/* T2 URGENT */}
          <button
            type="button"
            onClick={() => setTriageLevel('high')}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: triageLevel === 'high' ? '#f59e0b' : '#f59e0b40',
              background: triageLevel === 'high' ? '#f59e0b25' : '#0f172a',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '74px',
              boxShadow: triageLevel === 'high' ? '0 0 12px rgba(245, 158, 11, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fbbf24' }}>T2 URGENT</span>
              <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>YELLOW</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.3' }}>
              Urgent help in 2-4 hours. Children without water/formula, fractures.
            </p>
          </button>

          {/* T3 DELAYED */}
          <button
            type="button"
            onClick={() => setTriageLevel('medium')}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: triageLevel === 'medium' ? '#eab308' : '#eab30840',
              background: triageLevel === 'medium' ? '#eab30825' : '#0f172a',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '74px',
              boxShadow: triageLevel === 'medium' ? '0 0 12px rgba(234, 179, 8, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fde047' }}>T3 DELAYED</span>
              <span style={{ fontSize: '0.65rem', background: '#eab308', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>ORANGE</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.3' }}>
              Moderate help. Warming, dry rations, minor soft-tissue wounds.
            </p>
          </button>

          {/* T4 STABLE */}
          <button
            type="button"
            onClick={() => setTriageLevel('low')}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: triageLevel === 'low' ? '#10b981' : '#10b98140',
              background: triageLevel === 'low' ? '#10b98125' : '#0f172a',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '74px',
              boxShadow: triageLevel === 'low' ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#34d399' }}>T4 STABLE</span>
              <span style={{ fontSize: '0.65rem', background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>GREEN</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.3' }}>
              Stable status / registration for scheduled general evacuation.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Sector & 3. Category */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '6px' }}>
            2. DISASTER SECTOR (TACTICAL GRID):
          </label>
          <select
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#fff',
              border: '1px solid #334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
            }}
          >
            <option value="sector-alpha">ALPHA - Coastal Area / Biscayne Bay</option>
            <option value="sector-bravo">BRAVO - Downtown Emergency Medical Clinic</option>
            <option value="sector-delta">DELTA - North Industrial &amp; Waterworks</option>
          </select>
          <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#ef4444" />
            <span>Sector coordinates: 25.7617°N, -80.1918°W (protected with ~250m privacy fuzzing)</span>
          </p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '6px' }}>
            3. PRIMARY NEED CATEGORY:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NeedCategory)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#fff',
              border: '1px solid #334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
            }}
          >
            <option value="medical">🩺 Trauma / Resuscitation [CRITICAL]</option>
            <option value="water">💧 Potable Drinking Water [CRITICAL]</option>
            <option value="food">🍞 Food &amp; Emergency Rations</option>
            <option value="rescue">🛟 Search &amp; Evacuation Rescue</option>
            <option value="shelter">⛺ Thermal Blankets &amp; Shelter</option>
            <option value="power">⚡ Emergency Power &amp; Generators</option>
          </select>
        </div>
      </div>

      {/* 4. Headcount & Vulnerability Counters (Big Buttons) */}
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="#38bdf8" />
            4. AFFECTED PEOPLE / CLAIMANTS COUNT:
          </span>
          <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px' }}>
            TOTAL: {totalPeople} PERS.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {/* Total */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Total Count:</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setTotalPeople((p) => Math.max(1, p - 1))}
                style={{ width: '28px', height: '28px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800 }}
              >
                -
              </button>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>{totalPeople}</span>
              <button
                type="button"
                onClick={() => setTotalPeople((p) => p + 1)}
                style={{ width: '28px', height: '28px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800 }}
              >
                +
              </button>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
              <button
                type="button"
                onClick={() => setTotalPeople((p) => p + 5)}
                style={{ flex: 1, background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, padding: '2px 0', cursor: 'pointer' }}
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => setTotalPeople((p) => p + 10)}
                style={{ flex: 1, background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, padding: '2px 0', cursor: 'pointer' }}
              >
                +10
              </button>
            </div>
          </div>

          {/* Infants */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171' }}>Infants (0-3y):</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setInfantsCount((c) => Math.max(0, c - 1))}
                style={{ width: '28px', height: '28px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800 }}
              >
                -
              </button>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f87171' }}>{infantsCount}</span>
              <button
                type="button"
                onClick={() => setInfantsCount((c) => c + 1)}
                style={{ width: '28px', height: '28px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800 }}
              >
                +
              </button>
            </div>
          </div>

          {/* Elderly */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24' }}>Elderly (65+):</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setElderlyCount((c) => Math.max(0, c - 1))}
                style={{ width: '28px', height: '28px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800 }}
              >
                -
              </button>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{elderlyCount}</span>
              <button
                type="button"
                onClick={() => setElderlyCount((c) => c + 1)}
                style={{ width: '28px', height: '28px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800 }}
              >
                +
              </button>
            </div>
          </div>

          {/* Mobility Impaired */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa' }}>Mobility Impaired:</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setMobilityImpairedCount((c) => Math.max(0, c - 1))}
                style={{ width: '28px', height: '28px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800 }}
              >
                -
              </button>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a78bfa' }}>{mobilityImpairedCount}</span>
              <button
                type="button"
                onClick={() => setMobilityImpairedCount((c) => c + 1)}
                style={{ width: '28px', height: '28px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800 }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Critical Factors & Threats (One-Touch Chips) */}
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '6px' }}>
          5. CRITICAL FACTORS &amp; THREATS (ONE-TOUCH CHIPS):
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {PRESET_FLAGS.map((flag) => {
            const isSelected = selectedFlags.includes(flag);
            return (
              <button
                key={flag}
                type="button"
                onClick={() => toggleFlag(flag)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: isSelected ? '#f59e0b' : '#334155',
                  background: isSelected ? '#f59e0b20' : '#0f172a',
                  color: isSelected ? '#fbbf24' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected ? '✓ ' : '+ '}
                {flag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Volunteer Field Notes & Live PII Scrubbing Visualizer */}
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} color="#34d399" />
            6. VOLUNTEER FIELD NOTES (PII SCRUBBED ON-DEVICE):
          </label>
          <button
            type="button"
            onClick={() => setShowPiiDiff((v) => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {showPiiDiff ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPiiDiff ? 'Hide PII Inspector' : 'Show PII Inspector'}
          </button>
        </div>

        <textarea
          rows={3}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Type raw field observations: names, phone numbers, exact door codes, trapped victims..."
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            resize: 'vertical',
            fontSize: '0.85rem',
            lineHeight: '1.4',
            outline: 'none',
          }}
        />

        {/* Real-time Scrubbing Visualizer Diff */}
        {showPiiDiff && (
          <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                DE-IDENTIFICATION OUTPUT (SENT TO GOOGLE CLOUD):
              </span>
              <span
                style={{
                  background: piiResult.redactions.length > 0 ? '#10b98120' : '#334155',
                  color: piiResult.redactions.length > 0 ? '#34d399' : '#94a3b8',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                {piiResult.redactions.length > 0
                  ? `Detected & Redacted PII: ${piiResult.redactions.length} items`
                  : 'Zero Direct PII Detected'}
              </span>
            </div>

            {/* Scrubbed text preview */}
            <div
              style={{
                background: '#090d16',
                border: '1px solid #1e293b',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: '#fde047',
                lineHeight: '1.4',
              }}
            >
              {piiResult.scrubbedText || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Awaiting notes...</span>}
            </div>

            {/* Redacted badges breakdown */}
            {piiResult.redactions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                {piiResult.redactions.map((red, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      background: '#ef444420',
                      border: '1px solid #ef444450',
                      color: '#fca5a5',
                      padding: '2px 7px',
                      borderRadius: '4px',
                    }}
                  >
                    <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{red.originalText}</span>
                    <span>➔</span>
                    <strong style={{ color: '#fff' }}>{red.replacedWith}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Big Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isProcessing || !rawText.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: 'none',
            background: justSubmitted ? '#10b981' : isProcessing ? '#64748b' : '#f59e0b',
            color: justSubmitted ? '#fff' : '#000',
            fontWeight: 900,
            fontSize: '1rem',
            cursor: isProcessing || !rawText.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          {justSubmitted ? (
            <>
              <CheckCircle size={22} />
              <span>RECORDED &amp; QUEUED IN OFFLINE STORAGE!</span>
            </>
          ) : (
            <>
              <Radio size={20} />
              <span>((o)) RECORD &amp; QUEUE IN OFFLINE BUFFER</span>
            </>
          )}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', margin: '8px 0 0 0' }}>
          Report is encrypted and placed in local store &amp; forward buffer. When network becomes available, Cloud AI automatically builds a logistics route.
        </p>
      </div>
    </form>
  );
};
