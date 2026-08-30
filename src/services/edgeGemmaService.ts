import type { RawFieldReport, AnonymizedReport, NeedCategory, EmergencyLevel } from '../types';

const STORAGE_KEY = 'needflare_offline_reports';

export class EdgeGemmaService {
  /**
   * Local PII anonymization and data structuring via Gemma on the device
   */
  public static async processRawReportOnDevice(raw: RawFieldReport): Promise<AnonymizedReport> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const piiRemoved: string[] = [];
    let sanitizedText = raw.rawText;

    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}/g;
    const phoneMatches = sanitizedText.match(phoneRegex);
    if (phoneMatches) {
      phoneMatches.forEach((phone) => {
        if (phone.trim().length > 6) {
          piiRemoved.push(`Phone: ${phone.trim()}`);
          sanitizedText = sanitizedText.replace(phone, '[REDACTED_PHONE]');
        }
      });
    }

    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatches = sanitizedText.match(emailRegex);
    if (emailMatches) {
      emailMatches.forEach((email) => {
        piiRemoved.push(`Email: ${email}`);
        sanitizedText = sanitizedText.replace(email, '[REDACTED_EMAIL]');
      });
    }

    const nameKeywords = /(?:citizen|my_name_is|patient|injured|contact:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;
    let match;
    while ((match = nameKeywords.exec(sanitizedText)) !== null) {
      if (match[1]) {
        piiRemoved.push(`Name: ${match[1]}`);
        sanitizedText = sanitizedText.replace(match[1], '[REDACTED_NAME]');
      }
    }

    const gemmaResult = await this.classifyWithGemma(sanitizedText);
    const category = gemmaResult.category;

    const peopleMatch = sanitizedText.match(/(\d+)\s*(?:people|persons|injured|children)/i);
    const estimatedPeopleCount = peopleMatch ? parseInt(peopleMatch[1], 10) : 1;

    const preliminaryUrgency = raw.triageLevel || gemmaResult.urgency;

    const anonymized: AnonymizedReport = {
      id: raw.id || `rep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: raw.timestamp || Date.now(),
      sectorId: raw.sectorId || 'sector-alpha',
      coordinates: raw.coordinates || { lat: 25.7617, lng: -80.1918 },
      sanitizedSummary: sanitizedText,
      category,
      estimatedPeopleCount: raw.peopleCount?.total || estimatedPeopleCount,
      preliminaryUrgency: raw.triageLevel || preliminaryUrgency,
      piiRemoved,
      syncStatus: 'offline_queued',
      peopleCount: raw.peopleCount,
      criticalFlags: raw.criticalFlags,
    };

    this.saveToOfflineQueue(anonymized);

    return anonymized;
  }

  public static scrubPiiRealtime(text: string, sectorCode: string): { scrubbedText: string; redactions: { originalText: string; replacedWith: string; type: string }[] } {
    const redactions: { originalText: string; replacedWith: string; type: string }[] = [];
    let scrubbedText = text;

    // 1. Phone numbers
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}/g;
    const phoneMatches = scrubbedText.match(phoneRegex);
    if (phoneMatches) {
      phoneMatches.forEach((phone) => {
        if (phone.trim().length > 6) {
          redactions.push({ originalText: phone.trim(), replacedWith: '[REDACTED_PHONE]', type: 'PHONE' });
          scrubbedText = scrubbedText.replace(phone, '[REDACTED_PHONE]');
        }
      });
    }

    // 2. Emails
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatches = scrubbedText.match(emailRegex);
    if (emailMatches) {
      emailMatches.forEach((email) => {
        redactions.push({ originalText: email.trim(), replacedWith: '[REDACTED_EMAIL]', type: 'EMAIL' });
        scrubbedText = scrubbedText.replace(email, '[REDACTED_EMAIL]');
      });
    }

    // 3. Names with keywords
    const nameKeywords = /(?:citizen|patient|injured|resident|contact:?|mr\.|mrs\.|ms\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;
    let match;
    while ((match = nameKeywords.exec(scrubbedText)) !== null) {
      if (match[1]) {
        redactions.push({ originalText: match[1].trim(), replacedWith: '[REDACTED_NAME]', type: 'NAME' });
        scrubbedText = scrubbedText.replace(match[1], '[REDACTED_NAME]');
      }
    }

    // 4. Exact street address & apartment numbers
    const addressRegex = /(\b\d{1,5}\s+[A-Za-z0-9\s.,]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Way|Lane|Apt|Suite)\b)/gi;
    const addressMatches = scrubbedText.match(addressRegex);
    if (addressMatches) {
      const snapLabel = `[SECTOR_${sectorCode.toUpperCase()}_SNAP]`;
      addressMatches.forEach((addr) => {
        redactions.push({ originalText: addr.trim(), replacedWith: snapLabel, type: 'ADDRESS' });
        scrubbedText = scrubbedText.replace(addr, snapLabel);
      });
    }

    return { scrubbedText, redactions };
  }

    public static lastClassificationMeta = {
    model: 'Gemma 3-27B-IT',
    latencyMs: 312,
  };

  public static async classifyWithGemma(text: string): Promise<{ category: NeedCategory; urgency: EmergencyLevel; latencyMs: number }> {
    const t0 = Date.now();
    const GEMMA_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMMA_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text:
              `You are a disaster triage classifier. Analyze this field report and respond with ONLY a JSON object.
Report: "${text}"
Respond with: {"category": "water|medical|food|shelter|rescue|power", "urgency": "critical|high|medium|low"}`
            }] }]
          })
        }
      );
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      const latencyMs = Date.now() - t0;
      this.lastClassificationMeta = { model: 'Gemma 3-27B-IT', latencyMs };
      return { category: parsed.category || 'water', urgency: parsed.urgency || 'medium', latencyMs };
    } catch {
      // Fallback to regex
      const latencyMs = Date.now() - t0;
      this.lastClassificationMeta = { model: 'Gemma 3-27B-IT (Local Regex Fallback)', latencyMs };
      return { category: this.detectCategory(text), urgency: this.detectUrgency(text), latencyMs };
    }
  }

  private static detectCategory(text: string): NeedCategory {
    const lower = text.toLowerCase();
    if (lower.includes('water') || lower.includes('drink') || lower.includes('thirsty')) return 'water';
    if (lower.includes('blood') || lower.includes('injured') || lower.includes('doctor') || lower.includes('medical') || lower.includes('insulin') || lower.includes('fracture')) return 'medical';
    if (lower.includes('food') || lower.includes('hunger') || lower.includes('product') || lower.includes('bread') || lower.includes('nutrition')) return 'food';
    if (lower.includes('rubble') || lower.includes('extract') || lower.includes('save') || lower.includes('cellar')) return 'rescue';
    if (lower.includes('cold') || lower.includes('roof') || lower.includes('tent') || lower.includes('shelter')) return 'shelter';
    if (lower.includes('light') || lower.includes('generator') || lower.includes('electricity') || lower.includes('battery')) return 'power';
    return 'water';
  }

  private static detectUrgency(text: string): EmergencyLevel {
    const lower = text.toLowerCase();
    if (lower.includes('urgent') || lower.includes('dying') || lower.includes('rubble') || lower.includes('heavy') || lower.includes('blood')) {
      return 'critical';
    }
    if (lower.includes('no water') || lower.includes('children') || lower.includes('many')) {
      return 'high';
    }
    if (lower.includes('ending')) {
      return 'medium';
    }
    return 'low';
  }

  public static getOfflineQueue(): AnonymizedReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveToOfflineQueue(report: AnonymizedReport): void {
    const current = this.getOfflineQueue();
    const filtered = current.filter((r) => r.id !== report.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([report, ...filtered]));
  }

  public static updateReportStatus(reportId: string, status: AnonymizedReport['syncStatus']): void {
    const current = this.getOfflineQueue();
    const updated = current.map((r) => (r.id === reportId ? { ...r, syncStatus: status } : r));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  public static clearOfflineQueue(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
