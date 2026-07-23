import type {
  ReportOutputStatus,
  ReportTemplateCta,
  ReportTemplateStatus,
  ReportTemplateSummary,
} from '@/src/api/report-templates';

import type { Locale } from '../types';
import { toReportTemplateLocale } from '@/src/api/report-templates';

type LocalizedFallbackTemplate = {
  slug: string;
  status: ReportTemplateStatus;
  statusLabel: Record<Locale, string>;
  industry: Record<Locale, string>;
  category: Record<Locale, string>;
  name: Record<Locale, string>;
  shortDescription: Record<Locale, string>;
  inputSummary: Record<Locale, string[]>;
  reportSections: Record<Locale, string[]>;
  outputFormats: Array<{
    format: 'pptx' | 'pdf';
    status: ReportOutputStatus;
  }>;
  ctaType: ReportTemplateCta;
  sortOrder: number;
  thumbnail: string;
};

const fallbackTemplates: LocalizedFallbackTemplate[] = [
  {
    slug: 'mining_monthly_operations',
    status: 'validation',
    statusLabel: {
      en: 'In validation',
      ru: 'На валидации',
      uz: 'Validatsiyada',
    },
    industry: {
      en: 'Mining',
      ru: 'Горнодобывающая отрасль',
      uz: 'Konchilik',
    },
    category: {
      en: 'Operations review',
      ru: 'Операционный обзор',
      uz: 'Operatsion tahlil',
    },
    name: {
      en: 'Monthly Operations Review',
      ru: 'Ежемесячный операционный обзор',
      uz: 'Oylik operatsion hisobot',
    },
    shortDescription: {
      en: 'Recurring production, downtime, safety, and site-performance reporting example.',
      ru: 'Пример регулярной отчетности по производству, простоям, безопасности и площадкам.',
      uz: 'Ishlab chiqarish, to‘xtashlar, xavfsizlik va uchastka natijalari bo‘yicha takroriy hisobot misoli.',
    },
    inputSummary: {
      en: ['Production export', 'Downtime log', 'Safety file'],
      ru: ['Выгрузка производства', 'Журнал простоев', 'Файл безопасности'],
      uz: ['Ishlab chiqarish eksporti', 'To‘xtashlar jurnali', 'Xavfsizlik fayli'],
    },
    reportSections: {
      en: ['Production', 'Downtime', 'Safety', 'Management commentary'],
      ru: ['Производство', 'Простои', 'Безопасность', 'Комментарий руководства'],
      uz: ['Ishlab chiqarish', 'To‘xtashlar', 'Xavfsizlik', 'Boshqaruv izohi'],
    },
    outputFormats: [
      { format: 'pptx', status: 'beta' },
      { format: 'pdf', status: 'planned' },
    ],
    ctaType: 'request_audit',
    sortOrder: 10,
    thumbnail: '/ydeck-report-template-thumbnails/mining-monthly-operations.svg?v=1',
  },
  {
    slug: 'production_plan_vs_actual',
    status: 'validation',
    statusLabel: {
      en: 'In validation',
      ru: 'На валидации',
      uz: 'Validatsiyada',
    },
    industry: {
      en: 'Industrial',
      ru: 'Промышленность',
      uz: 'Sanoat',
    },
    category: {
      en: 'Plan versus actual',
      ru: 'План-факт',
      uz: 'Reja-fakt',
    },
    name: {
      en: 'Production Plan Versus Actual',
      ru: 'Производство: план против факта',
      uz: 'Ishlab chiqarish reja-fakt',
    },
    shortDescription: {
      en: 'Variance-reporting example for planned output, actuals, and warning rules.',
      ru: 'Пример отчета по отклонениям между планом, фактом и правилами предупреждений.',
      uz: 'Reja, fakt va ogohlantirish qoidalari bo‘yicha og‘ish hisobotining misoli.',
    },
    inputSummary: {
      en: ['Plan data', 'Actual output', 'Variance rules'],
      ru: ['Плановые данные', 'Фактический выпуск', 'Правила отклонений'],
      uz: ['Reja ma’lumotlari', 'Fakt natijalar', 'Og‘ish qoidalari'],
    },
    reportSections: {
      en: ['Output', 'Variance', 'Warnings'],
      ru: ['Выпуск', 'Отклонения', 'Предупреждения'],
      uz: ['Natija', 'Og‘ish', 'Ogohlantirishlar'],
    },
    outputFormats: [
      { format: 'pptx', status: 'prototype' },
      { format: 'pdf', status: 'planned' },
    ],
    ctaType: 'apply_design_partner',
    sortOrder: 20,
    thumbnail: '/ydeck-report-template-thumbnails/production-plan-vs-actual.svg?v=1',
  },
  {
    slug: 'equipment_downtime',
    status: 'concept',
    statusLabel: {
      en: 'Concept',
      ru: 'Концепт',
      uz: 'Konsept',
    },
    industry: {
      en: 'Mining and industrial',
      ru: 'Добыча и промышленность',
      uz: 'Konchilik va sanoat',
    },
    category: {
      en: 'Equipment downtime',
      ru: 'Простои оборудования',
      uz: 'Uskuna to‘xtashlari',
    },
    name: {
      en: 'Equipment Downtime Report',
      ru: 'Отчет о простоях оборудования',
      uz: 'Uskuna to‘xtashlari hisoboti',
    },
    shortDescription: {
      en: 'Discovery example for downtime causes, lost hours, and corrective actions.',
      ru: 'Пример для изучения причин простоев, потерянных часов и корректирующих мер.',
      uz: 'To‘xtash sabablari, yo‘qotilgan soatlar va tuzatish choralari bo‘yicha o‘rganish misoli.',
    },
    inputSummary: {
      en: ['Downtime log', 'Cause codes', 'Action register'],
      ru: ['Журнал простоев', 'Коды причин', 'Реестр действий'],
      uz: ['To‘xtashlar jurnali', 'Sabab kodlari', 'Harakatlar reyestri'],
    },
    reportSections: {
      en: ['Lost hours', 'Causes', 'Actions'],
      ru: ['Потерянные часы', 'Причины', 'Действия'],
      uz: ['Yo‘qotilgan soatlar', 'Sabablar', 'Choralar'],
    },
    outputFormats: [
      { format: 'pptx', status: 'prototype' },
      { format: 'pdf', status: 'planned' },
    ],
    ctaType: 'request_audit',
    sortOrder: 30,
    thumbnail: '/ydeck-report-template-thumbnails/equipment-downtime.svg?v=1',
  },
  {
    slug: 'monthly_financial_management',
    status: 'validation',
    statusLabel: {
      en: 'In validation',
      ru: 'На валидации',
      uz: 'Validatsiyada',
    },
    industry: {
      en: 'Finance',
      ru: 'Финансы',
      uz: 'Moliya',
    },
    category: {
      en: 'Management reporting',
      ru: 'Управленческая отчетность',
      uz: 'Boshqaruv hisoboti',
    },
    name: {
      en: 'Monthly Financial Management Report',
      ru: 'Ежемесячный управленческий финансовый отчет',
      uz: 'Oylik moliyaviy boshqaruv hisoboti',
    },
    shortDescription: {
      en: 'Recurring P&L, cash-flow, budget-actual, and commentary reporting example.',
      ru: 'Пример регулярного отчета по P&L, денежному потоку, бюджету-факту и комментариям.',
      uz: 'P&L, pul oqimi, byudjet-fakt va izohlar bo‘yicha takroriy hisobot misoli.',
    },
    inputSummary: {
      en: ['P&L export', 'Cash-flow file', 'Budget actuals'],
      ru: ['Выгрузка P&L', 'Файл денежных потоков', 'Бюджет и факт'],
      uz: ['P&L eksporti', 'Pul oqimi fayli', 'Byudjet-fakt'],
    },
    reportSections: {
      en: ['P&L', 'Cash flow', 'Budget actuals'],
      ru: ['P&L', 'Денежный поток', 'Бюджет-факт'],
      uz: ['P&L', 'Pul oqimi', 'Byudjet-fakt'],
    },
    outputFormats: [
      { format: 'pptx', status: 'beta' },
      { format: 'pdf', status: 'planned' },
    ],
    ctaType: 'request_audit',
    sortOrder: 40,
    thumbnail: '/ydeck-report-template-thumbnails/monthly-financial-management.svg?v=1',
  },
  {
    slug: 'safety_incident',
    status: 'concept',
    statusLabel: {
      en: 'Concept',
      ru: 'Концепт',
      uz: 'Konsept',
    },
    industry: {
      en: 'Industrial',
      ru: 'Промышленность',
      uz: 'Sanoat',
    },
    category: {
      en: 'Safety reporting',
      ru: 'Отчетность по безопасности',
      uz: 'Xavfsizlik hisoboti',
    },
    name: {
      en: 'Safety and Incident Report',
      ru: 'Отчет по безопасности и инцидентам',
      uz: 'Xavfsizlik va hodisalar hisoboti',
    },
    shortDescription: {
      en: 'Discovery example for incident summaries, follow-up actions, and review notes.',
      ru: 'Пример для изучения сводок по инцидентам, последующих действий и заметок проверки.',
      uz: 'Hodisa xulosalari, keyingi choralar va tekshiruv qaydlari bo‘yicha o‘rganish misoli.',
    },
    inputSummary: {
      en: ['Incident log', 'Safety metrics', 'Action notes'],
      ru: ['Журнал инцидентов', 'Метрики безопасности', 'Заметки действий'],
      uz: ['Hodisa jurnali', 'Xavfsizlik metrikalari', 'Chora qaydlari'],
    },
    reportSections: {
      en: ['Incidents', 'Trends', 'Actions'],
      ru: ['Инциденты', 'Тренды', 'Действия'],
      uz: ['Hodisalar', 'Trendlar', 'Choralar'],
    },
    outputFormats: [
      { format: 'pptx', status: 'prototype' },
      { format: 'pdf', status: 'planned' },
    ],
    ctaType: 'apply_design_partner',
    sortOrder: 50,
    thumbnail: '/ydeck-report-template-thumbnails/safety-incident.svg?v=1',
  },
  {
    slug: 'executive_board_pack',
    status: 'design_partner_pilot',
    statusLabel: {
      en: 'Design partner pilot',
      ru: 'Пилот с дизайн-партнером',
      uz: 'Hamkor piloti',
    },
    industry: {
      en: 'Executive finance',
      ru: 'Финансы руководства',
      uz: 'Rahbariyat moliyasi',
    },
    category: {
      en: 'Board reporting',
      ru: 'Отчетность для совета директоров',
      uz: 'Kengash hisoboti',
    },
    name: {
      en: 'Executive Board Pack',
      ru: 'Пакет для совета директоров',
      uz: 'Kengash uchun hisobot paketi',
    },
    shortDescription: {
      en: 'Pilot example for executive packs that need editable PPTX and controlled PDF direction.',
      ru: 'Пилотный пример для руководящих пакетов, где нужны редактируемый PPTX и контролируемое PDF-направление.',
      uz: 'Tahrirlanadigan PPTX va nazoratli PDF yo‘nalishi kerak bo‘lgan rahbariyat paketi uchun pilot misol.',
    },
    inputSummary: {
      en: ['Executive KPIs', 'Finance exports', 'Review comments'],
      ru: ['KPI руководства', 'Финансовые выгрузки', 'Комментарии проверки'],
      uz: ['Rahbariyat KPI’lari', 'Moliya eksportlari', 'Tekshiruv izohlari'],
    },
    reportSections: {
      en: ['Executive summary', 'Financials', 'Risks'],
      ru: ['Резюме руководства', 'Финансы', 'Риски'],
      uz: ['Rahbariyat xulosasi', 'Moliyaviy natijalar', 'Risklar'],
    },
    outputFormats: [
      { format: 'pptx', status: 'beta' },
      { format: 'pdf', status: 'prototype' },
    ],
    ctaType: 'contact_sales',
    sortOrder: 60,
    thumbnail: '/ydeck-report-template-thumbnails/executive-board-pack.svg?v=1',
  },
];

export function getFallbackReportTemplates(locale: Locale): ReportTemplateSummary[] {
  const apiLocale = toReportTemplateLocale(locale);
  const now = '2026-07-01T00:00:00.000Z';

  return fallbackTemplates.map((template) => ({
    id: `fallback_${template.slug}`,
    slug: template.slug,
    name: template.name[locale],
    shortDescription: template.shortDescription[locale],
    industry: template.industry[locale],
    category: template.category[locale],
    status: template.status,
    statusLabel: template.statusLabel[locale],
    featured: true,
    sortOrder: template.sortOrder,
    outputFormats: template.outputFormats,
    inputSummary: template.inputSummary[locale],
    reportSections: template.reportSections[locale],
    thumbnail: {
      url: template.thumbnail,
      alt: template.name[locale],
      width: 1200,
      height: 675,
      mimeType: 'image/svg+xml',
    },
    previewImages: [],
    supportedLocales: [apiLocale],
    availability: { publiclyExecutable: false },
    ctaType: template.ctaType,
    updatedAt: now,
  }));
}
