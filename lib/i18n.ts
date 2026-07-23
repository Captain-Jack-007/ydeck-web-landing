export const locales = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'uz', label: 'UZ', name: 'O‘zbek' },
] as const;

export type Locale = (typeof locales)[number]['code'];

export const defaultLocale: Locale = 'en';
export const localePreferenceKey = 'ydeck-locale-preference';

const centralAsiaCountryCodes = new Set(['KZ', 'KG', 'TJ', 'TM', 'UZ']);
const chinaCountryCodes = new Set(['CN']);
const centralAsiaTimeZones = new Set([
  'Asia/Almaty',
  'Asia/Aqtau',
  'Asia/Aqtobe',
  'Asia/Ashgabat',
  'Asia/Astana',
  'Asia/Atyrau',
  'Asia/Bishkek',
  'Asia/Dushanbe',
  'Asia/Oral',
  'Asia/Qostanay',
  'Asia/Qyzylorda',
  'Asia/Samarkand',
  'Asia/Tashkent',
]);
const chinaTimeZones = new Set(['Asia/Shanghai', 'Asia/Urumqi']);

export function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'ru' || value === 'uz';
}

export function localeFromCountryCode(
  countryCode: string | null | undefined
): Locale | null {
  if (!countryCode) {
    return null;
  }

  const normalizedCountryCode = countryCode.toUpperCase();

  if (chinaCountryCodes.has(normalizedCountryCode)) {
    return 'en';
  }

  if (centralAsiaCountryCodes.has(normalizedCountryCode)) {
    return 'ru';
  }

  return 'en';
}

export function localeFromTimeZone(
  timeZone: string | null | undefined
): Locale | null {
  if (!timeZone) {
    return null;
  }

  if (chinaTimeZones.has(timeZone)) {
    return 'en';
  }

  if (centralAsiaTimeZones.has(timeZone)) {
    return 'ru';
  }

  return 'en';
}

export function resolveRegionLocale({
  countryCode,
  timeZone,
}: {
  countryCode?: string | null;
  timeZone?: string | null;
}): Locale {
  return (
    localeFromCountryCode(countryCode) ??
    localeFromTimeZone(timeZone) ??
    defaultLocale
  );
}

export const translations = {
  en: {
    nav: {
      language: 'Language',
    },
    pilot: {
      highlightTitle: 'Design-partner reporting audit',
      highlightText:
        'We review the recurring report pack, source data, rules, and approvals behind it.',
      summaryCards: [
        [
          'Recurring pack review',
          'Bring the report pack your team rebuilds every cycle.',
        ],
        [
          'Source and rule check',
          'We trace numbers, thresholds, and template rules back to the source.',
        ],
        [
          'Pilot-fit conversation',
          'Qualified teams can move into the design-partner flow.',
        ],
      ],
      extraLine:
        'Submitting the form does not guarantee pilot access. YDeck invites teams based on fit, readiness, and capacity.',
    },
    modal: {
      close: 'Close reporting audit form',
      eyebrow: 'Reporting audit',
      title: 'Request a YDeck reporting-process audit',
      text: 'Tell us which recurring report you rebuild, what sources support it, and who reviews the final version.',
    },
    waitlistPage: {
      eyebrow: 'Design-partner pilot',
      title: 'Request a Reporting Process Audit',
      text: 'Apply as a design partner if your team rebuilds the same management report every cycle. We review the pack, source data, templates, and review rules before inviting a pilot.',
      trust:
        'YDeck drafts the report, links facts to sources, and keeps human approval in the loop.',
    },
    waitlistForm: {
      progress: 'Reporting audit form progress',
      fields: {
        name: 'Full name',
        email: 'Work email',
        company: 'Company',
        role: 'Role',
        contact: 'Preferred contact',
        presentationType: 'Recurring report workflow',
        preferredMode: 'Final report format',
        volume: 'Reporting frequency',
      },
      placeholders: {
        name: 'Your name',
        email: 'you@company.com',
        company: 'Company name',
        role: 'CFO, Head of FP&A, Operations lead...',
        contact: 'Email, phone, or LinkedIn',
      },
      presentationTypes: [
        'Mining monthly operations review',
        'Production versus plan report',
        'Safety or incident report',
        'Monthly financial management report',
        'Budget versus actual report',
        'Board or client financial pack',
        'Other recurring report',
      ],
      modes: ['PowerPoint', 'PDF', 'PowerPoint and PDF'],
      volumes: ['Weekly', 'Monthly', 'Quarterly', 'Other'],
      continue: 'Continue',
      back: 'Back',
      submit: 'Request Reporting Audit',
      submitting: 'Sending...',
      submitted: 'Request Received',
      success:
        'Your request was received. We will review the reporting workflow and follow up if it fits the current design-partner pilot.',
      errorDuplicate:
        'This email is already on our list. We will use your latest context when we follow up.',
      errorGeneric: 'We could not send the request. Please try again.',
    },
  },
  ru: {
    nav: {
      language: 'Язык',
    },
    pilot: {
      highlightTitle: 'Аудит отчетного процесса для дизайн-партнеров',
      highlightText:
        'Мы изучаем повторяющийся пакет отчета, исходные данные, правила и утверждения за ним.',
      summaryCards: [
        [
          'Разбор пакета',
          'Покажите пакет отчета, который команда пересобирает каждый цикл.',
        ],
        [
          'Проверка источников и правил',
          'Мы связываем цифры, пороги и шаблонные правила с исходными файлами.',
        ],
        [
          'Разговор о пилоте',
          'Подходящие команды могут перейти в сценарий дизайн-партнера.',
        ],
      ],
      extraLine:
        'Отправка формы не гарантирует доступ к пилоту. YDeck приглашает команды с учетом соответствия, готовности и доступной емкости.',
    },
    modal: {
      close: 'Закрыть форму аудита',
      eyebrow: 'Аудит отчетности',
      title: 'Запросить аудит отчетного процесса YDeck',
      text: 'Расскажите, какой регулярный отчет вы пересобираете, какие источники его поддерживают и кто утверждает финальную версию.',
    },
    waitlistPage: {
      eyebrow: 'Пилот с дизайн-партнером',
      title: 'Запросить аудит отчетного процесса',
      text: 'Подайте заявку как дизайн-партнер, если ваша команда каждый цикл пересобирает один и тот же управленческий отчет. Мы изучаем пакет, исходные данные, шаблоны и правила проверки до приглашения в пилот.',
      trust:
        'YDeck готовит черновики отчетов, связывает факты с источниками и оставляет финальное утверждение человеку.',
    },
    waitlistForm: {
      progress: 'Прогресс формы аудита',
      fields: {
        name: 'Имя и фамилия',
        email: 'Рабочий email',
        company: 'Компания',
        role: 'Роль',
        contact: 'Предпочтительный контакт',
        presentationType: 'Регулярный отчетный процесс',
        preferredMode: 'Финальный формат отчета',
        volume: 'Частота отчетности',
      },
      placeholders: {
        name: 'Ваше имя',
        email: 'you@company.com',
        company: 'Название компании',
        role: 'CFO, руководитель FP&A, операционный директор...',
        contact: 'Email, телефон или LinkedIn',
      },
      presentationTypes: [
        'Ежемесячный операционный обзор для добычи',
        'Отчет производство против плана',
        'Отчет по безопасности или инцидентам',
        'Ежемесячный управленческий финансовый отчет',
        'Отчет бюджет против факта',
        'Финансовый пакет для совета директоров или клиента',
        'Другой регулярный отчет',
      ],
      modes: ['PowerPoint', 'PDF', 'PowerPoint and PDF'],
      volumes: ['Еженедельно', 'Ежемесячно', 'Ежеквартально', 'Другое'],
      continue: 'Далее',
      back: 'Назад',
      submit: 'Запросить аудит отчетности',
      submitting: 'Отправка...',
      submitted: 'Заявка получена',
      success:
        'Заявка получена. Мы изучим отчетный процесс и свяжемся, если он подходит для текущего пилота с дизайн-партнерами.',
      errorDuplicate:
        'Этот email уже есть в списке. Мы учтем актуальный контекст при следующем контакте.',
      errorGeneric: 'Не удалось отправить заявку. Попробуйте еще раз.',
    },
  },
  uz: {
    nav: {
      language: 'Til',
    },
    pilot: {
      highlightTitle: 'Design partnerlar uchun hisobot auditi',
      highlightText:
        'Biz takrorlanadigan hisobot paketi, manba ma’lumotlari, qoidalar va uning ortidagi tasdiqlarni ko‘rib chiqamiz.',
      summaryCards: [
        [
          'Takroriy paketni ko‘rib chiqish',
          'Jamoangiz har siklda qayta tayyorlaydigan hisobot paketini olib keling.',
        ],
        [
          'Manba va qoida tekshiruvi',
          'Raqamlar, chegaralar va shablon qoidalarini manbalarga bog‘laymiz.',
        ],
        [
          'Pilot mosligini muhokama qilish',
          'Mos jamoalar design-partner oqimiga o‘tishi mumkin.',
        ],
      ],
      extraLine:
        'Formani yuborish pilotga kirishni kafolatlamaydi. YDeck jamoalarni moslik, tayyorgarlik va imkoniyatga qarab taklif qiladi.',
    },
    modal: {
      close: 'Hisobot auditi formasini yopish',
      eyebrow: 'Hisobot auditi',
      title: 'YDeck hisobot jarayoni auditini so‘rash',
      text: 'Qaysi takroriy hisobotni qayta tayyorlashingizni, uni qaysi manbalar qo‘llab-quvvatlashini va yakuniy versiyani kim tasdiqlashini ayting.',
    },
    waitlistPage: {
      eyebrow: 'Design-partner piloti',
      title: 'Hisobot jarayoni auditini so‘rash',
      text: 'Agar jamoangiz har siklda bir xil boshqaruv hisobotini qayta yig‘sa, design-partner sifatida ariza bering. Pilotga taklif qilishdan oldin biz paket, manba ma’lumotlari, shablonlar va tekshiruv qoidalarini ko‘rib chiqamiz.',
      trust:
        'YDeck hisobot qoralamalarini tayyorlaydi, faktlarni manbalarga bog‘laydi va yakuniy tasdiqni insonga qoldiradi.',
    },
    waitlistForm: {
      progress: 'Hisobot auditi formasidagi qadamlar',
      fields: {
        name: 'Ism va familiya',
        email: 'Ish emaili',
        company: 'Kompaniya',
        role: 'Rol',
        contact: 'Afzal kontakt',
        presentationType: 'Takroriy hisobot jarayoni',
        preferredMode: 'Yakuniy hisobot formati',
        volume: 'Hisobot davriyligi',
      },
      placeholders: {
        name: 'Ismingiz',
        email: 'you@company.com',
        company: 'Kompaniya nomi',
        role: 'CFO, Head of FP&A, Operations lead...',
        contact: 'Email, telefon yoki LinkedIn',
      },
      presentationTypes: [
        'Konchilik bo‘yicha oylik operatsion hisobot',
        'Ishlab chiqarish reja-fakt hisoboti',
        'Xavfsizlik yoki hodisa hisoboti',
        'Oylik moliyaviy boshqaruv hisoboti',
        'Byudjet-fakt hisoboti',
        'Kengash yoki mijoz uchun moliyaviy paket',
        'Boshqa takroriy hisobot',
      ],
      modes: ['PowerPoint', 'PDF', 'PowerPoint and PDF'],
      volumes: ['Haftalik', 'Oylik', 'Choraklik', 'Boshqa'],
      continue: 'Davom etish',
      back: 'Orqaga',
      submit: 'Hisobot auditini so‘rash',
      submitting: 'Yuborilmoqda...',
      submitted: 'So‘rov qabul qilindi',
      success:
        'So‘rovingiz qabul qilindi. Hisobot jarayonini ko‘rib chiqamiz va u hozirgi design-partner pilotiga mos bo‘lsa bog‘lanamiz.',
      errorDuplicate:
        'Bu email allaqachon ro‘yxatda. Keyingi aloqada eng so‘nggi kontekstni hisobga olamiz.',
      errorGeneric: 'So‘rov yuborilmadi. Iltimos, qayta urinib ko‘ring.',
    },
  },
} as const;
