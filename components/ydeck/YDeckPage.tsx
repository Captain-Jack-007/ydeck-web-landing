"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  FileBarChart,
  Headphones,
  Layers3,
  Menu,
  MessageCircleMore,
  MessagesSquare,
  PanelLeft,
  Radio,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { LandingReportTemplatesPayload } from "@/src/api/report-templates";
import { useAuth } from "@/src/providers/auth-provider";
import { contactHref } from "./constants";
import type { Locale } from "./types";
import { detectInitialLocale } from "./utils/locale";
import { localizedPath } from "./utils/routes";

type LandingCopy = {
  nav: {
    product: string;
    salesAgent: string;
    operator: string;
    agents: string;
    enterprise: string;
    pricing: string;
    signIn: string;
    tryYDeck: string;
    goToConsole: string;
    openMenu: string;
    closeMenu: string;
    language: string;
  };
  hero: {
    label: string;
    title: string;
    body: string;
    starting: string;
    primary: string;
    secondary: string;
    note: string;
  };
  firstAgent: {
    intro: string;
    title: string;
    body: string;
    agentTitle: string;
    agentBody: string;
    agentFeatures: string[];
    operatorTitle: string;
    operatorBody: string;
    operatorFeatures: string[];
    relationship: string;
  };
  model: {
    title: string;
    body: string;
    customer: string;
    channels: string;
    agent: string;
    operator: string;
    team: string;
    points: string[];
  };
  workspace: {
    title: string;
    body: string;
    label: string;
    modules: string[];
  };
  agents: {
    title: string;
    body: string;
    available: string;
    coming: string;
    cards: Array<{ name: string; body: string }>;
  };
  channels: {
    title: string;
    body: string;
    beta: string;
    coming: string;
    note: string;
  };
  control: {
    title: string;
    body: string;
    lead: string;
    visibility: string[];
    dashboardTitle: string;
    dashboardBody: string;
  };
  enterprise: {
    title: string;
    body: string;
    roles: Array<{ name: string; body: string }>;
    pricingTitle: string;
    pricingBody: string;
    pricingCta: string;
  };
  vision: {
    title: string;
    body: string;
    available: string;
    coming: string;
  };
  outputs: {
    title: string;
    body: string;
    items: string[];
    note: string;
  };
  final: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  footer: {
    line: string;
    product: string;
    company: string;
    legal: string;
    copyright: string;
  };
};

const copy: Record<Locale, LandingCopy> = {
  en: {
    nav: {
      product: "Product",
      salesAgent: "Sales Agent",
      operator: "Sales Operator",
      agents: "Agents",
      enterprise: "Enterprise",
      pricing: "Pricing",
      signIn: "Sign in",
      tryYDeck: "Try YDeck",
      goToConsole: "Go to console",
      openMenu: "Open navigation",
      closeMenu: "Close navigation",
      language: "Language",
    },
    hero: {
      label: "AI agent workspace for companies",
      title: "AI agents that work with your team.",
      body: "Deploy AI workers, connect your business channels, and supervise their work from one company workspace.",
      starting: "Starting with Sales Agent.",
      primary: "Try Sales Agent",
      secondary: "Request a demo",
      note: "Connect customer channels. Let the agent handle sales conversations. Keep your team in control with Sales Operator.",
    },
    firstAgent: {
      intro: "Available today",
      title: "Meet your first YDeck agent.",
      body: "Sales Agent handles incoming work. Sales Operator gives your team the visibility and controls around it.",
      agentTitle: "Sales Agent",
      agentBody: "An AI sales worker that handles incoming customer conversations, understands intent, answers questions, qualifies leads, and helps move opportunities forward.",
      agentFeatures: [
        "Respond to incoming customer conversations",
        "Understand customer intent and maintain context",
        "Answer approved product or service questions",
        "Qualify potential customers",
        "Help move leads toward conversion",
        "Work across connected channels",
      ],
      operatorTitle: "Sales Operator",
      operatorBody: "The command center for your sales team. Monitor connected channels, review agent activity, intervene when needed, and manage the operation from one workspace.",
      operatorFeatures: [
        "See connected customer channels",
        "Inspect leads and conversation context",
        "Review agent activity",
        "Manage automated reply controls",
        "Pause, test, or disconnect a channel",
        "Keep human intervention available",
      ],
      relationship: "Agent does the work. Operator gives your team control.",
    },
    model: {
      title: "More than another chatbot.",
      body: "YDeck is the operating layer between customer channels, AI agents, and the people accountable for customer relationships.",
      customer: "Customer",
      channels: "Customer channels",
      agent: "Sales Agent",
      operator: "Sales Operator",
      team: "Sales team / manager",
      points: ["Agents operate", "Humans supervise", "Conversations centralize", "Actions stay coordinated"],
    },
    workspace: {
      title: "One workspace for your company’s AI agents.",
      body: "YDeck provides the environment where companies deploy, manage, supervise, and work with specialized AI agents.",
      label: "YDeck workspace",
      modules: ["Agents", "Operators", "Conversations", "Channels", "Leads", "Analytics", "Permissions", "Business integrations"],
    },
    agents: {
      title: "Specialized agents, introduced honestly.",
      body: "YDeck starts with Sales Agent and expands into a workspace for focused company agents. Future agents are shown as direction—not released software.",
      available: "Available",
      coming: "Coming soon",
      cards: [
        { name: "Sales Agent", body: "Customer conversations, lead qualification, and sales workflows." },
        { name: "Reporting Agent", body: "Business analysis, reports, presentations, and management reporting." },
        { name: "1C Agents", body: "Specialized workflows connected to company accounting and 1C systems." },
        { name: "SAP Agents", body: "Enterprise data validation, reporting, administration, and operational workflows." },
        { name: "Finance Agent", body: "Finance analysis, reviews, alerts, and recurring team workflows." },
      ],
    },
    channels: {
      title: "Meet customers where they already are.",
      body: "Connect customer communication channels to YDeck and manage AI-assisted sales conversations from one workspace.",
      beta: "Beta",
      coming: "Coming soon",
      note: "Instagram business messaging is the connection flow available in the current Sales Operator beta. Other channel rollouts are not yet presented as live.",
    },
    control: {
      title: "Automation without losing control.",
      body: "AI should not operate as an invisible black box. Sales Operator keeps channel status, agent controls, and the need for human intervention visible.",
      lead: "Let the agent handle repetitive sales work while your team stays in control of important customer relationships.",
      visibility: ["What the agent can do", "Which channels are active", "Conversation and lead context", "When a person should step in"],
      dashboardTitle: "Connected customer channels",
      dashboardBody: "Test connections, review health, pause automation, and keep automated replies off until the team explicitly enables them.",
    },
    enterprise: {
      title: "Built for real company workflows.",
      body: "YDeck is designed around accountable teams, shared workspaces, permissions, and customer-facing operations—not a personal chatbot session.",
      roles: [
        { name: "Sales teams", body: "Handle incoming conversations and qualify leads." },
        { name: "Managers", body: "See customer activity and agent performance." },
        { name: "Customer-facing teams", body: "Centralize conversations from multiple channels." },
        { name: "Operations", body: "Coordinate AI agents and human workflows from one workspace." },
      ],
      pricingTitle: "Enterprise rollout",
      pricingBody: "Pricing is scoped to the workspace, enabled channels, and rollout requirements. Talk with YDeck about a controlled Sales Agent deployment.",
      pricingCta: "Discuss pricing",
    },
    vision: {
      title: "Sales is only the beginning.",
      body: "YDeck is being built as the workspace where companies run specialized AI agents across sales, reporting, finance, enterprise systems, and operations.",
      available: "Available",
      coming: "Coming soon",
    },
    outputs: {
      title: "Agents don’t just chat. They deliver work.",
      body: "The long-term value of a company agent is the business outcome it produces—not the number of messages it sends.",
      items: ["Customer responses", "Lead information", "Reports", "Presentations", "Analysis", "Alerts", "Executive summaries", "Recommendations"],
      note: "Output types depend on the agent and its release status. Reporting and presentation work remains part of the platform direction, not YDeck’s primary identity.",
    },
    final: {
      title: "Start with your first AI Sales Agent.",
      body: "Connect your customer channels, let Sales Agent handle conversations, and manage everything through Sales Operator.",
      primary: "Try Sales Agent",
      secondary: "Request enterprise demo",
    },
    footer: {
      line: "AI agent workspace for companies. Starting with sales.",
      product: "Product",
      company: "Company",
      legal: "Legal",
      copyright: "Copyright 2026 GLOBANCE GROUP LIMITED. YDeck. All rights reserved.",
    },
  },
  ru: {
    nav: {
      product: "Продукт", salesAgent: "Sales Agent", operator: "Sales Operator", agents: "Агенты", enterprise: "Для компаний", pricing: "Цены", signIn: "Войти", tryYDeck: "Попробовать YDeck", goToConsole: "Перейти в консоль", openMenu: "Открыть навигацию", closeMenu: "Закрыть навигацию", language: "Язык",
    },
    hero: {
      label: "Рабочее пространство ИИ-агентов для компаний",
      title: "ИИ-агенты, которые работают вместе с вашей командой.",
      body: "Подключайте ИИ-сотрудников и бизнес-каналы, управляйте их работой из единого пространства компании.",
      starting: "Начните с Sales Agent.",
      primary: "Попробовать Sales Agent", secondary: "Запросить демо",
      note: "Подключите каналы клиентов. Поручите агенту продажи в переписке. Сохраняйте контроль команды через Sales Operator.",
    },
    firstAgent: {
      intro: "Доступно сейчас", title: "Познакомьтесь с первым агентом YDeck.", body: "Sales Agent выполняет входящую работу. Sales Operator дает команде прозрачность и контроль.",
      agentTitle: "Sales Agent", agentBody: "ИИ-сотрудник по продажам: ведет входящие диалоги, понимает намерение клиента, отвечает на вопросы, квалифицирует лиды и помогает двигать сделки вперед.",
      agentFeatures: ["Отвечает на входящие сообщения", "Понимает намерение и сохраняет контекст", "Отвечает по утвержденной базе знаний", "Квалифицирует потенциальных клиентов", "Помогает вести лид к конверсии", "Работает в подключенных каналах"],
      operatorTitle: "Sales Operator", operatorBody: "Командный центр отдела продаж. Следите за подключенными каналами и работой агента, подключайтесь при необходимости и управляйте процессом из одного места.",
      operatorFeatures: ["Показывает подключенные каналы", "Дает контекст лидов и диалогов", "Отображает работу агента", "Управляет автоответами", "Позволяет остановить или проверить канал", "Сохраняет возможность вмешательства человека"],
      relationship: "Агент выполняет работу. Оператор дает команде контроль.",
    },
    model: {
      title: "Больше, чем чат-бот.", body: "YDeck — операционный слой между клиентскими каналами, ИИ-агентами и людьми, ответственными за отношения с клиентами.", customer: "Клиент", channels: "Каналы клиентов", agent: "Sales Agent", operator: "Sales Operator", team: "Отдел продаж / руководитель", points: ["Агенты работают", "Люди контролируют", "Диалоги централизованы", "Действия скоординированы"],
    },
    workspace: {
      title: "Единое пространство ИИ-агентов вашей компании.", body: "YDeck создает среду, где компании запускают специализированных ИИ-агентов, управляют ими и работают вместе с ними.", label: "Рабочее пространство YDeck", modules: ["Агенты", "Операторы", "Диалоги", "Каналы", "Лиды", "Аналитика", "Права доступа", "Бизнес-интеграции"],
    },
    agents: {
      title: "Специализированные агенты — без ложных обещаний.", body: "YDeck начинает с Sales Agent и постепенно становится пространством для агентов компании. Будущие агенты показаны как направление, а не готовый продукт.", available: "Доступен", coming: "Скоро", cards: [
        { name: "Sales Agent", body: "Диалоги с клиентами, квалификация лидов и процессы продаж." },
        { name: "Reporting Agent", body: "Бизнес-анализ, отчеты, презентации и управленческая отчетность." },
        { name: "1C Agents", body: "Специализированные процессы для учета и систем 1C." },
        { name: "SAP Agents", body: "Проверка данных, отчетность, администрирование и операционные процессы." },
        { name: "Finance Agent", body: "Финансовый анализ, проверки, уведомления и регулярные процессы." },
      ],
    },
    channels: {
      title: "Работайте там, где уже находятся клиенты.", body: "Подключайте каналы общения с клиентами к YDeck и управляйте продажами с участием ИИ из одного места.", beta: "Бета", coming: "Скоро", note: "Подключение бизнес-аккаунтов Instagram доступно в текущей бете Sales Operator. Остальные каналы пока не обозначены как работающие.",
    },
    control: {
      title: "Автоматизация без потери контроля.", body: "ИИ не должен работать как невидимый черный ящик. Sales Operator показывает состояние каналов, управление агентом и моменты, когда нужен человек.", lead: "Передайте агенту повторяющуюся работу, сохраняя важные отношения с клиентами под контролем команды.", visibility: ["Что может делать агент", "Какие каналы активны", "Контекст диалогов и лидов", "Когда должен подключиться человек"], dashboardTitle: "Подключенные каналы клиентов", dashboardBody: "Проверяйте соединения и их состояние, ставьте автоматизацию на паузу и включайте автоответы только осознанно.",
    },
    enterprise: {
      title: "Для реальных процессов компании.", body: "YDeck строится вокруг ответственных команд, общих пространств, прав доступа и клиентских операций, а не личного чата.", roles: [
        { name: "Отделы продаж", body: "Обрабатывают входящие диалоги и квалифицируют лиды." }, { name: "Руководители", body: "Видят активность клиентов и работу агента." }, { name: "Клиентские команды", body: "Объединяют диалоги из разных каналов." }, { name: "Операции", body: "Координируют работу ИИ-агентов и людей." },
      ], pricingTitle: "Корпоративный запуск", pricingBody: "Цена зависит от рабочего пространства, каналов и требований запуска. Обсудите контролируемое внедрение Sales Agent с командой YDeck.", pricingCta: "Обсудить цену",
    },
    vision: { title: "Продажи — только начало.", body: "YDeck создается как пространство специализированных ИИ-агентов для продаж, отчетности, финансов, корпоративных систем и операций.", available: "Доступен", coming: "Скоро" },
    outputs: { title: "Агенты не только общаются. Они выполняют работу.", body: "Ценность корпоративного агента определяется бизнес-результатом, а не числом отправленных сообщений.", items: ["Ответы клиентам", "Данные о лидах", "Отчеты", "Презентации", "Анализ", "Уведомления", "Резюме для руководства", "Рекомендации"], note: "Типы результатов зависят от агента и статуса выпуска. Отчеты и презентации остаются частью направления платформы, но не основной идентичностью YDeck." },
    final: { title: "Начните с первого ИИ-агента продаж.", body: "Подключите каналы клиентов, поручите Sales Agent обработку диалогов и управляйте процессом через Sales Operator.", primary: "Попробовать Sales Agent", secondary: "Запросить корпоративное демо" },
    footer: { line: "Рабочее пространство ИИ-агентов для компаний. Начните с продаж.", product: "Продукт", company: "Компания", legal: "Документы", copyright: "Copyright 2026 GLOBANCE GROUP LIMITED. YDeck. Все права защищены." },
  },
  uz: {
    nav: {
      product: "Mahsulot", salesAgent: "Sales Agent", operator: "Sales Operator", agents: "Agentlar", enterprise: "Kompaniyalar", pricing: "Narxlar", signIn: "Kirish", tryYDeck: "YDeck’ni sinash", goToConsole: "Konsolga o‘tish", openMenu: "Navigatsiyani ochish", closeMenu: "Navigatsiyani yopish", language: "Til",
    },
    hero: {
      label: "Kompaniyalar uchun AI agentlar ish maydoni", title: "Jamoangiz bilan ishlaydigan AI agentlar.", body: "AI xodimlarini ishga tushiring, biznes kanallarini ulang va ularning ishini yagona kompaniya maydonidan boshqaring.", starting: "Sales Agent’dan boshlang.", primary: "Sales Agent’ni sinash", secondary: "Demo so‘rash", note: "Mijoz kanallarini ulang. Savdo suhbatlarini agentga topshiring. Sales Operator orqali jamoa nazoratini saqlang.",
    },
    firstAgent: {
      intro: "Hozir mavjud", title: "Birinchi YDeck agentingiz bilan tanishing.", body: "Sales Agent kiruvchi ishni bajaradi. Sales Operator jamoangizga ko‘rinish va boshqaruv beradi.", agentTitle: "Sales Agent", agentBody: "Kiruvchi mijoz suhbatlarini olib boradigan, niyatni tushunadigan, savollarga javob beradigan, lidlarni saralaydigan va imkoniyatlarni oldinga siljitishga yordam beradigan AI savdo xodimi.", agentFeatures: ["Kiruvchi mijoz suhbatlariga javob beradi", "Niyatni tushunadi va kontekstni saqlaydi", "Tasdiqlangan mahsulot savollariga javob beradi", "Potensial mijozlarni saralaydi", "Lidlarni konversiyaga yaqinlashtiradi", "Ulangan kanallarda ishlaydi"], operatorTitle: "Sales Operator", operatorBody: "Savdo jamoangizning boshqaruv markazi. Kanallar va agent ishini kuzating, kerak bo‘lsa aralashing va operatsiyani bir joydan boshqaring.", operatorFeatures: ["Ulangan kanallarni ko‘rsatadi", "Lid va suhbat kontekstini beradi", "Agent faoliyatini ko‘rsatadi", "Avtojavoblarni boshqaradi", "Kanalni to‘xtatadi yoki tekshiradi", "Inson aralashuvini saqlaydi"], relationship: "Agent ishni bajaradi. Operator jamoaga nazorat beradi.",
    },
    model: { title: "Oddiy chatbotdan ko‘proq.", body: "YDeck — mijoz kanallari, AI agentlar va mijoz munosabatlari uchun javobgar odamlar orasidagi operatsion qatlam.", customer: "Mijoz", channels: "Mijoz kanallari", agent: "Sales Agent", operator: "Sales Operator", team: "Savdo jamoasi / menejer", points: ["Agentlar ishlaydi", "Odamlar nazorat qiladi", "Suhbatlar markazlashadi", "Harakatlar muvofiqlashadi"] },
    workspace: { title: "Kompaniyangiz AI agentlari uchun yagona maydon.", body: "YDeck kompaniyalarga maxsus AI agentlarni ishga tushirish, boshqarish va ular bilan ishlash muhitini beradi.", label: "YDeck ish maydoni", modules: ["Agentlar", "Operatorlar", "Suhbatlar", "Kanallar", "Lidlar", "Analitika", "Ruxsatlar", "Biznes integratsiyalar"] },
    agents: { title: "Maxsus agentlar — aniq holat bilan.", body: "YDeck Sales Agent’dan boshlanadi va kompaniya agentlari uchun ish maydoniga aylanadi. Kelajak agentlari tayyor mahsulot sifatida ko‘rsatilmaydi.", available: "Mavjud", coming: "Tez kunda", cards: [
      { name: "Sales Agent", body: "Mijoz suhbatlari, lidlarni saralash va savdo jarayonlari." }, { name: "Reporting Agent", body: "Biznes tahlili, hisobotlar, taqdimotlar va boshqaruv hisoboti." }, { name: "1C Agents", body: "Buxgalteriya va 1C tizimlariga ulangan maxsus jarayonlar." }, { name: "SAP Agents", body: "Ma’lumot tekshiruvi, hisobot, boshqaruv va operatsion jarayonlar." }, { name: "Finance Agent", body: "Moliyaviy tahlil, tekshiruvlar, bildirishnomalar va takroriy ishlar." },
    ] },
    channels: { title: "Mijozlar bor joyda ishlang.", body: "Mijoz aloqa kanallarini YDeck’ga ulang va AI yordamidagi savdo suhbatlarini bir joydan boshqaring.", beta: "Beta", coming: "Tez kunda", note: "Instagram biznes xabarlari hozirgi Sales Operator betasida ulanishi mumkin. Boshqa kanallar hali ishlaydigan deb ko‘rsatilmaydi." },
    control: { title: "Nazoratni yo‘qotmasdan avtomatlashtirish.", body: "AI ko‘rinmas qora quti bo‘lib ishlamasligi kerak. Sales Operator kanal holati, agent boshqaruvi va inson kerak bo‘lgan paytni ko‘rsatadi.", lead: "Takroriy savdo ishlarini agentga bering, muhim mijoz munosabatlarini jamoa nazoratida saqlang.", visibility: ["Agent nima qila oladi", "Qaysi kanallar faol", "Suhbat va lid konteksti", "Qachon odam aralashishi kerak"], dashboardTitle: "Ulangan mijoz kanallari", dashboardBody: "Ulanishlarni tekshiring, avtomatlashtirishni to‘xtating va avtojavoblarni faqat jamoa ruxsat berganda yoqing." },
    enterprise: { title: "Haqiqiy kompaniya jarayonlari uchun.", body: "YDeck shaxsiy chat emas, balki mas’ul jamoalar, umumiy ish maydonlari, ruxsatlar va mijoz operatsiyalari atrofida quriladi.", roles: [
      { name: "Savdo jamoalari", body: "Kiruvchi suhbatlarni olib boradi va lidlarni saralaydi." }, { name: "Menejerlar", body: "Mijoz faolligi va agent ishini ko‘radi." }, { name: "Mijoz bilan ishlovchi jamoalar", body: "Turli kanallardagi suhbatlarni markazlashtiradi." }, { name: "Operatsiyalar", body: "AI agentlar va inson ishini muvofiqlashtiradi." },
    ], pricingTitle: "Korporativ joriy etish", pricingBody: "Narx ish maydoni, yoqilgan kanallar va joriy etish talablariga bog‘liq. Sales Agent’ni nazoratli ishga tushirishni muhokama qiling.", pricingCta: "Narxni muhokama qilish" },
    vision: { title: "Savdo — faqat boshlanishi.", body: "YDeck savdo, hisobot, moliya, korporativ tizimlar va operatsiyalar bo‘yicha maxsus AI agentlar ish maydoni sifatida qurilmoqda.", available: "Mavjud", coming: "Tez kunda" },
    outputs: { title: "Agentlar faqat gaplashmaydi. Ular ishni yetkazadi.", body: "Kompaniya agentining qiymati yuborgan xabarlar sonida emas, yaratgan biznes natijasida.", items: ["Mijoz javoblari", "Lid ma’lumotlari", "Hisobotlar", "Taqdimotlar", "Tahlil", "Bildirishnomalar", "Rahbar xulosalari", "Tavsiyalar"], note: "Natija turlari agent va uning chiqarilish holatiga bog‘liq. Hisobot va taqdimotlar platforma yo‘nalishining bir qismi, YDeck’ning asosiy identifikatsiyasi emas." },
    final: { title: "Birinchi AI savdo agentingizdan boshlang.", body: "Mijoz kanallarini ulang, suhbatlarni Sales Agent’ga topshiring va hammasini Sales Operator orqali boshqaring.", primary: "Sales Agent’ni sinash", secondary: "Korporativ demo so‘rash" },
    footer: { line: "Kompaniyalar uchun AI agentlar ish maydoni. Savdodan boshlang.", product: "Mahsulot", company: "Kompaniya", legal: "Huquqiy", copyright: "Copyright 2026 GLOBANCE GROUP LIMITED. YDeck. Barcha huquqlar himoyalangan." },
  },
};

const languageOptions: Array<{ locale: Locale; label: string }> = [
  { locale: "en", label: "EN" },
  { locale: "ru", label: "RU" },
  { locale: "uz", label: "UZ" },
];

const demoHref = `${contactHref}?subject=${encodeURIComponent("YDeck enterprise demo")}`;

const channelData: Array<{ name: string; icon: LucideIcon; tone: string; beta: boolean }> = [
  { name: "Instagram", icon: Camera, tone: "instagram", beta: true },
  { name: "Telegram", icon: Send, tone: "telegram", beta: false },
  { name: "WhatsApp", icon: MessageCircleMore, tone: "whatsapp", beta: false },
  { name: "Facebook Messenger", icon: MessagesSquare, tone: "messenger", beta: false },
];

function Status({ children, tone = "future" }: { children: React.ReactNode; tone?: "available" | "beta" | "future" }) {
  return <span className={`agent-status agent-status--${tone}`}>{children}</span>;
}

function BrandMark() {
  return (
    <span className="agent-brand-mark" aria-hidden="true">
      <Image src="/ydeck.png" alt="" width={22} height={28} priority />
    </span>
  );
}

function HeroWorkspace({ content }: { content: LandingCopy }) {
  return (
    <div className="agent-hero-workspace" aria-label="YDeck Sales Agent operating model">
      <div className="agent-window-bar">
        <span className="agent-window-brand"><BrandMark /><strong>YDeck</strong></span>
        <span className="agent-workspace-name"><Building2 size={14} /> Company workspace</span>
        <span className="agent-avatar">YK</span>
      </div>
      <div className="agent-window-layout">
        <aside className="agent-window-sidebar">
          <div className="agent-window-product"><Bot size={18} /><span><small>ydeck.sales-operator</small><strong>Sales Operator</strong></span></div>
          <div className="agent-window-worker"><MessageCircleMore size={16} /><span><small>sales.operator.v1</small><strong>Sales Agent</strong></span></div>
          <span className="agent-sidebar-label">Channels</span>
          <span className="active"><Radio size={15} /> All channels</span>
          <span><Camera size={15} /> Instagram <b>Beta</b></span>
          <span><Send size={15} /> Telegram</span>
          <span><MessagesSquare size={15} /> Messenger</span>
        </aside>
        <div className="agent-window-main">
          <div className="agent-window-title">
            <div><small>Sales Operator / Workspace</small><strong>How work moves through YDeck</strong></div>
            <Status tone="available">Sales Agent · {content.agents.available}</Status>
          </div>
          <div className="agent-flow-grid">
            <div className="agent-flow-channels">
              <span className="agent-flow-label">Customer channels</span>
              {channelData.map(({ name, icon: Icon, beta }) => (
                <div key={name} className={beta ? "active" : "planned"}>
                  <Icon size={17} /><strong>{name}</strong><small>{beta ? content.channels.beta : content.channels.coming}</small>
                </div>
              ))}
            </div>
            <div className="agent-flow-arrow"><ArrowRight size={18} /></div>
            <div className="agent-flow-core">
              <div className="agent-core-node agent-core-node--agent"><span><Bot size={18} /></span><div><small>Available agent</small><strong>Sales Agent</strong><p>Handles incoming customer conversations</p></div></div>
              <ArrowDown size={17} />
              <div className="agent-core-node"><span><PanelLeft size={18} /></span><div><small>Team workspace</small><strong>Sales Operator</strong><p>Supervise, review, and intervene</p></div></div>
            </div>
          </div>
          <div className="agent-window-output" aria-label="Workspace outputs">
            {["Leads", "Conversations", "Actions", "Analytics"].map((item, index) => <span key={item} className={index === 0 ? "active" : ""}>{index === 0 ? <UserRoundCheck size={14} /> : index === 1 ? <MessagesSquare size={14} /> : index === 2 ? <Settings2 size={14} /> : <BarChart3 size={14} />}{item}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, body, align = "left" }: { title: string; body: string; align?: "left" | "center" }) {
  return <div className={`agent-section-heading agent-section-heading--${align}`}><h2>{title}</h2><p>{body}</p></div>;
}

function FeatureList({ items }: { items: string[] }) {
  return <ul className="agent-feature-list">{items.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>;
}

type YDeckPageProps = {
  initialLocale?: Locale;
  initialReportTemplates?: LandingReportTemplatesPayload;
  onJoinWaitlist?: (locale: Locale) => void;
};

export function YDeckPage({ initialLocale = "en" }: YDeckPageProps) {
  const { status: authStatus } = useAuth();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const content = copy[locale];
  const isAuthenticated = authStatus === "authenticated";
  const showGuestActions = authStatus === "unauthenticated" || authStatus === "error";

  useEffect(() => {
    const detected = detectInitialLocale();
    if (detected !== locale) setLocale(detected);
    // Sync once with the persisted browser preference after hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("ydeck-locale", locale);
  }, [locale]);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function handleLocaleChange(nextLocale: Locale) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    window.history.replaceState({}, "", url);
    setLocale(nextLocale);
  }

  const navLinks = [
    [content.nav.product, "#product"],
    [content.nav.salesAgent, "#sales-agent"],
    [content.nav.operator, "#sales-operator"],
    [content.nav.agents, "#agents"],
    [content.nav.enterprise, "#enterprise"],
    [content.nav.pricing, "#pricing"],
  ];

  return (
    <main id="main-content" className="agent-site">
      <a className="agent-skip-link" href="#main-content">Skip to content</a>
      <nav className="agent-nav" aria-label="Primary navigation">
        <div className="agent-nav-inner">
          <a className="agent-brand" href={localizedPath("/", locale)} aria-label="YDeck home"><BrandMark /><strong>YDeck</strong><span>Agent Workspace</span></a>
          <div className="agent-nav-links">
            {navLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </div>
          <div className="agent-nav-actions">
            <div className="agent-language" aria-label={content.nav.language}>{languageOptions.map((option) => <button key={option.locale} type="button" aria-pressed={locale === option.locale} onClick={() => handleLocaleChange(option.locale)}>{option.label}</button>)}</div>
            {isAuthenticated ? (
              <a className="agent-button agent-button--small" href="/workspace">{content.nav.goToConsole}<ArrowRight size={14} /></a>
            ) : showGuestActions ? (
              <>
                <a className="agent-sign-in" href="/auth/sign-in">{content.nav.signIn}</a>
                <a className="agent-button agent-button--small" href="/sales-operator/channels">{content.nav.tryYDeck}<ArrowRight size={14} /></a>
              </>
            ) : null}
            <button ref={menuButtonRef} className="agent-menu-button" type="button" aria-label={menuOpen ? content.nav.closeMenu : content.nav.openMenu} aria-controls="agent-mobile-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
        {menuOpen ? <div id="agent-mobile-nav" className="agent-mobile-nav">{navLinks.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<ChevronRight size={16} /></a>)}{isAuthenticated ? <a href="/workspace" onClick={() => setMenuOpen(false)}>{content.nav.goToConsole}<ChevronRight size={16} /></a> : showGuestActions ? <a href="/auth/sign-in" onClick={() => setMenuOpen(false)}>{content.nav.signIn}<ChevronRight size={16} /></a> : null}</div> : null}
      </nav>

      <header className="agent-hero">
        <div className="agent-hero-grid">
          <div className="agent-hero-copy">
            <div className="agent-hero-label"><span /><strong>YDeck</strong> — {content.hero.label}</div>
            <h1>{content.hero.title}</h1>
            <p className="agent-hero-body">{content.hero.body}</p>
            <p className="agent-hero-starting"><Sparkles size={17} />{content.hero.starting}</p>
            <div className="agent-hero-actions">
              <a className="agent-button" href="/sales-operator/channels">{content.hero.primary}<ArrowRight size={17} /></a>
              <a className="agent-button agent-button--secondary" href={demoHref}>{content.hero.secondary}</a>
            </div>
            <p className="agent-hero-note">{content.hero.note}</p>
          </div>
          <HeroWorkspace content={content} />
        </div>
      </header>

      <section id="product" className="agent-section agent-first-agent">
        <div className="agent-container">
          <div className="agent-first-intro"><span>{content.firstAgent.intro}</span><SectionHeading title={content.firstAgent.title} body={content.firstAgent.body} /></div>
          <div className="agent-product-pair">
            <article id="sales-agent" className="agent-product-panel agent-product-panel--primary">
              <div className="agent-product-panel-header"><span className="agent-product-icon"><Bot size={22} /></span><Status tone="available">{content.agents.available}</Status></div>
              <h3>{content.firstAgent.agentTitle}</h3><p>{content.firstAgent.agentBody}</p><FeatureList items={content.firstAgent.agentFeatures} />
            </article>
            <div className="agent-product-connector"><ArrowRight size={22} /><span>{content.firstAgent.relationship}</span></div>
            <article id="sales-operator" className="agent-product-panel">
              <div className="agent-product-panel-header"><span className="agent-product-icon"><PanelLeft size={22} /></span><span className="agent-panel-meta">Team control</span></div>
              <h3>{content.firstAgent.operatorTitle}</h3><p>{content.firstAgent.operatorBody}</p><FeatureList items={content.firstAgent.operatorFeatures} />
            </article>
          </div>
          <p className="agent-relationship-line">{content.firstAgent.relationship}</p>
        </div>
      </section>

      <section className="agent-section agent-model-section">
        <div className="agent-container agent-model-layout">
          <SectionHeading title={content.model.title} body={content.model.body} />
          <div className="agent-operating-flow" aria-label="YDeck operating model">
            <div><CircleUserRound size={20} /><strong>{content.model.customer}</strong></div><ArrowRight size={18} />
            <div className="wide"><MessagesSquare size={20} /><span><strong>{content.model.channels}</strong><small>Telegram · Instagram · WhatsApp · Messenger</small></span></div><ArrowRight size={18} />
            <div className="active"><Bot size={20} /><strong>{content.model.agent}</strong></div><ArrowRight size={18} />
            <div><PanelLeft size={20} /><strong>{content.model.operator}</strong></div><ArrowRight size={18} />
            <div><UsersRound size={20} /><strong>{content.model.team}</strong></div>
          </div>
          <div className="agent-model-points">{content.model.points.map((point) => <span key={point}><Check size={14} />{point}</span>)}</div>
        </div>
      </section>

      <section className="agent-section agent-workspace-section">
        <div className="agent-container agent-workspace-layout">
          <SectionHeading title={content.workspace.title} body={content.workspace.body} />
          <div className="agent-architecture">
            <div className="agent-architecture-top"><BrandMark /><span><small>{content.workspace.label}</small><strong>Company workspace</strong></span><Status tone="available">Multi-agent foundation</Status></div>
            <div className="agent-architecture-modules">
              {content.workspace.modules.map((module, index) => { const icons = [Bot, PanelLeft, MessagesSquare, Radio, UserRoundCheck, BarChart3, ShieldCheck, Layers3]; const Icon = icons[index]; return <div key={module}><Icon size={18} /><span>{module}</span></div>; })}
            </div>
            <div className="agent-architecture-line"><span />Shared company context, controls, and accountability<span /></div>
          </div>
        </div>
      </section>

      <section id="agents" className="agent-section agent-agents-section">
        <div className="agent-container">
          <SectionHeading title={content.agents.title} body={content.agents.body} />
          <div className="agent-roster">
            {content.agents.cards.map((card, index) => <article key={card.name} className={index === 0 ? "available" : "future"}><div><span className="agent-roster-index">0{index + 1}</span><Status tone={index === 0 ? "available" : "future"}>{index === 0 ? content.agents.available : content.agents.coming}</Status></div><h3>{card.name}</h3><p>{card.body}</p>{index === 0 ? <a href="/sales-operator/channels">Open Sales Operator <ArrowRight size={14} /></a> : <span className="agent-future-lock">Planned for the YDeck workspace</span>}</article>)}
          </div>
        </div>
      </section>

      <section className="agent-section agent-channels-section">
        <div className="agent-container agent-channels-layout">
          <SectionHeading title={content.channels.title} body={content.channels.body} />
          <div className="agent-channel-list">
            {channelData.map(({ name, icon: Icon, tone, beta }) => <article key={name}><span className={`agent-channel-icon agent-channel-icon--${tone}`}><Icon size={22} /></span><div><h3>{name}</h3><Status tone={beta ? "beta" : "future"}>{beta ? content.channels.beta : content.channels.coming}</Status></div></article>)}
          </div>
          <p className="agent-truth-note"><ShieldCheck size={17} />{content.channels.note}</p>
        </div>
      </section>

      <section className="agent-section agent-control-section">
        <div className="agent-container agent-control-layout">
          <div><SectionHeading title={content.control.title} body={content.control.body} /><p className="agent-control-lead">{content.control.lead}</p><FeatureList items={content.control.visibility} /></div>
          <div className="agent-operator-dashboard">
            <div className="agent-dashboard-heading"><div><small>Sales Operator / Channels</small><strong>{content.control.dashboardTitle}</strong><p>{content.control.dashboardBody}</p></div><button type="button" disabled><Camera size={15} /> Connect Instagram</button></div>
            <div className="agent-dashboard-card"><div className="agent-dashboard-channel"><span className="agent-channel-icon agent-channel-icon--instagram"><Camera size={18} /></span><div><small>Instagram</small><strong>Business messaging</strong></div><Status tone="beta">{content.channels.beta}</Status></div><div className="agent-dashboard-states"><span><small>Connection</small><strong>Team controlled</strong></span><span><small>Automated replies</small><strong>Off by default</strong></span><span><small>Human handoff</small><strong>Available</strong></span></div><div className="agent-dashboard-controls"><span><Radio size={14} /> Test connection</span><span><Settings2 size={14} /> Pause</span><span className="toggle"><i /> Automated replies</span></div></div>
          </div>
        </div>
      </section>

      <section id="enterprise" className="agent-section agent-enterprise-section">
        <div className="agent-container">
          <SectionHeading title={content.enterprise.title} body={content.enterprise.body} />
          <div className="agent-role-list">{content.enterprise.roles.map((role, index) => { const icons = [Headphones, BarChart3, MessagesSquare, Settings2]; const Icon = icons[index]; return <article key={role.name}><Icon size={21} /><div><h3>{role.name}</h3><p>{role.body}</p></div></article>; })}</div>
          <div id="pricing" className="agent-pricing-callout"><div><span>Pricing</span><h3>{content.enterprise.pricingTitle}</h3><p>{content.enterprise.pricingBody}</p></div><a className="agent-button agent-button--secondary" href={demoHref}>{content.enterprise.pricingCta}<ArrowRight size={15} /></a></div>
        </div>
      </section>

      <section className="agent-section agent-vision-section">
        <div className="agent-container agent-vision-layout">
          <SectionHeading title={content.vision.title} body={content.vision.body} />
          <div className="agent-vision-map"><div className="agent-vision-now"><Bot size={20} /><span><small>{content.vision.available}</small><strong>Sales Agent</strong></span></div><ArrowRight size={20} /><div className="agent-vision-future"><span>{content.vision.coming}</span>{["Reporting Agent", "1C Agents", "SAP Agents", "Finance Agent", "Operations Agent"].map((name) => <strong key={name}>{name}</strong>)}</div></div>
        </div>
      </section>

      <section className="agent-section agent-outputs-section">
        <div className="agent-container agent-outputs-layout">
          <div><SectionHeading title={content.outputs.title} body={content.outputs.body} /><p className="agent-truth-note"><ShieldCheck size={17} />{content.outputs.note}</p></div>
          <div className="agent-output-cloud">{content.outputs.items.map((item, index) => { const icons = [MessageCircleMore, UserRoundCheck, FileBarChart, WalletCards, BarChart3, Radio, Building2, Sparkles]; const Icon = icons[index]; return <span key={item}><Icon size={16} />{item}</span>; })}</div>
        </div>
      </section>

      <section className="agent-final-section">
        <div className="agent-final-inner"><BrandMark /><h2>{content.final.title}</h2><p>{content.final.body}</p><div><a className="agent-button" href="/sales-operator/channels">{content.final.primary}<ArrowRight size={17} /></a><a className="agent-button agent-button--secondary" href={demoHref}>{content.final.secondary}</a></div></div>
      </section>

      <footer className="agent-footer">
        <div className="agent-footer-top"><div><a className="agent-brand" href={localizedPath("/", locale)}><BrandMark /><strong>YDeck</strong></a><p>{content.footer.line}</p></div><div><strong>{content.footer.product}</strong><a href="#sales-agent">Sales Agent</a><a href="#sales-operator">Sales Operator</a><a href="#agents">Agents</a></div><div><strong>{content.footer.company}</strong><a href="#enterprise">Enterprise</a><a href="#pricing">Pricing</a><a href={demoHref}>Contact</a></div><div><strong>{content.footer.legal}</strong><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/security">Security</a><a href="/data-deletion">Data deletion</a></div></div>
        <div className="agent-footer-bottom"><span>{content.footer.copyright}</span><span>YDeck — AI Agent Workspace for Companies</span></div>
      </footer>
    </main>
  );
}
