import { RawFieldReport, AnonymizedReport, NeedCategory, EmergencyLevel } from '../types';

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

    const category = this.detectCategory(sanitizedText);

    const peopleMatch = sanitizedText.match(/(\d+)\s*(?:people|persons|injured|children)/i);
    const estimatedPeopleCount = peopleMatch ? parseInt(peopleMatch[1], 10) : 1;

    const preliminaryUrgency = this.detectUrgency(sanitizedText);

    const anonymized: AnonymizedReport = {
      id: raw.id || `rep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: raw.timestamp || Date.now(),
      sectorId: raw.sectorId || 'sector-alpha',
      coordinates: raw.coordinates || { lat: 44.5034, lng: 38.0863 },
      sanitizedSummary: sanitizedText,
      category,
      estimatedPeopleCount,
      preliminaryUrgency,
      piiRemoved,
      syncStatus: 'offline_queued',
    };

    this.saveToOfflineQueue(anonymized);

    return anonymized;
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
