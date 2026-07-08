import type { Locale } from '../types';

export type LegalPageKey = 'privacy' | 'terms' | 'security';

type LegalPageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: {
    title: string;
    body: string;
  }[];
};

type LegalCopy = {
  back: string;
  updated: string;
  contact: string;
  pages: Record<LegalPageKey, LegalPageCopy>;
};

export const legalCopy: Record<Locale, LegalCopy> = {
  en: {
    back: 'Back to YDeck',
    updated: 'Updated July 4, 2026',
    contact: 'Questions: hello@ydeck.ai',
    pages: {
      privacy: {
        eyebrow: 'Privacy policy',
        title: 'Privacy for presentation work.',
        intro:
          'YDeck is built for people working with sensitive notes, reports, lessons, and company files. This page explains the privacy approach for the pilot and waitlist.',
        sections: [
          {
            title: 'Waitlist information',
            body: 'When you request access, we collect the details you submit in the form, such as name, email, organization, role, contact handle, presentation type, preferred mode, and deck volume.',
          },
          {
            title: 'Product files',
            body: 'YDeck is designed around private document workflows. Pilot handling of uploaded or processed files will be explained clearly before users are invited into the product.',
          },
          {
            title: 'Contact and deletion',
            body: 'You can ask us to update or remove your waitlist information by emailing hello@ydeck.ai from the address used in your request.',
          },
        ],
      },
      terms: {
        eyebrow: 'Terms',
        title: 'Pilot access terms.',
        intro:
          'YDeck is preparing a pilot for selected users. These terms summarize the expected pilot relationship and will be replaced by full product terms before public launch.',
        sections: [
          {
            title: 'Pilot availability',
            body: 'Submitting the waitlist form does not guarantee access. We may invite users in stages based on fit, capacity, region, and product readiness.',
          },
          {
            title: 'Use of the service',
            body: 'Pilot users should only submit material they have permission to use and should review any generated presentation before relying on it in business, education, or public settings.',
          },
          {
            title: 'Changes',
            body: 'YDeck features, pricing, availability, and export options may change during the pilot as the product is tested and improved.',
          },
        ],
      },
      security: {
        eyebrow: 'Security',
        title: 'Security notes for private decks.',
        intro:
          'YDeck is being designed for confidential presentation workflows. We avoid claiming certifications we have not earned; this page describes the product direction plainly.',
        sections: [
          {
            title: 'Local-first direction',
            body: 'The product direction includes private and local-first workflows so sensitive source material can stay closer to the user where possible.',
          },
          {
            title: 'Sensitive material',
            body: 'Users should treat business plans, reports, student material, and internal documents as confidential and choose the right mode before processing them.',
          },
          {
            title: 'Responsible rollout',
            body: 'Security details will be shared with pilot users before access. We will not present unearned compliance, audit, or certification claims.',
          },
        ],
      },
    },
  },
  ru: {
    back: 'Назад к YDeck',
    updated: 'Обновлено 4 июля 2026',
    contact: 'Вопросы: hello@ydeck.ai',
    pages: {
      privacy: {
        eyebrow: 'Политика приватности',
        title: 'Приватность для работы с презентациями.',
        intro:
          'YDeck создается для работы с чувствительными заметками, отчетами, уроками и файлами компаний. Здесь описан подход к приватности для пилота и листа ожидания.',
        sections: [
          {
            title: 'Данные листа ожидания',
            body: 'Когда вы запрашиваете доступ, мы собираем данные из формы: имя, email, организацию, роль, контакт, тип презентаций, предпочитаемый режим и объем deck-работы.',
          },
          {
            title: 'Файлы продукта',
            body: 'YDeck проектируется вокруг приватных документных процессов. Обработка файлов в пилоте будет объяснена до приглашения пользователей в продукт.',
          },
          {
            title: 'Контакт и удаление',
            body: 'Вы можете попросить обновить или удалить данные листа ожидания, написав на hello@ydeck.ai с email, который использовали в заявке.',
          },
        ],
      },
      terms: {
        eyebrow: 'Условия',
        title: 'Условия пилотного доступа.',
        intro:
          'YDeck готовит пилот для выбранных пользователей. Эти условия кратко описывают ожидаемые правила пилота и будут заменены полными условиями до публичного запуска.',
        sections: [
          {
            title: 'Доступ к пилоту',
            body: 'Отправка формы не гарантирует доступ. Мы можем приглашать пользователей поэтапно с учетом соответствия, емкости, региона и готовности продукта.',
          },
          {
            title: 'Использование сервиса',
            body: 'Пилотные пользователи должны отправлять только материалы, которые имеют право использовать, и проверять сгенерированную презентацию перед применением.',
          },
          {
            title: 'Изменения',
            body: 'Функции YDeck, цены, доступность и варианты экспорта могут меняться во время пилота по мере тестирования и улучшения продукта.',
          },
        ],
      },
      security: {
        eyebrow: 'Безопасность',
        title: 'Заметки о безопасности приватных deck-процессов.',
        intro:
          'YDeck проектируется для конфиденциальной работы с презентациями. Мы не заявляем о сертификациях, которых еще нет; эта страница описывает направление продукта.',
        sections: [
          {
            title: 'Local-first направление',
            body: 'В продуктовое направление входят приватные и local-first процессы, чтобы чувствительные исходные материалы по возможности оставались ближе к пользователю.',
          },
          {
            title: 'Чувствительные материалы',
            body: 'Бизнес-планы, отчеты, учебные материалы и внутренние документы стоит считать конфиденциальными и выбирать подходящий режим обработки.',
          },
          {
            title: 'Ответственный запуск',
            body: 'Детали безопасности будут раскрыты пилотным пользователям до доступа. Мы не будем использовать неподтвержденные compliance, audit или certification claims.',
          },
        ],
      },
    },
  },
  uz: {
    back: 'YDeck sahifasiga qaytish',
    updated: '2026-yil 4-iyulda yangilangan',
    contact: 'Savollar: hello@ydeck.ai',
    pages: {
      privacy: {
        eyebrow: 'Maxfiylik siyosati',
        title: 'Taqdimot ishlarida maxfiylik.',
        intro:
          'YDeck maxfiy qaydlar, hisobotlar, dars materiallari va kompaniya fayllari bilan ishlaydigan foydalanuvchilar uchun yaratilmoqda.',
        sections: [
          {
            title: 'Waitlist ma’lumotlari',
            body: 'Dostup so‘raganingizda formadagi ism, email, tashkilot, rol, kontakt, taqdimot turi, afzal rejim va deck hajmi kabi ma’lumotlarni olamiz.',
          },
          {
            title: 'Mahsulot fayllari',
            body: 'YDeck maxfiy hujjat jarayonlari atrofida loyihalanmoqda. Pilotdagi fayl qayta ishlash tartibi foydalanuvchilar mahsulotga kirishidan oldin tushuntiriladi.',
          },
          {
            title: 'Kontakt va o‘chirish',
            body: 'Waitlist ma’lumotlarini yangilash yoki o‘chirish uchun arizada ishlatgan emailingizdan hello@ydeck.ai manziliga yozishingiz mumkin.',
          },
        ],
      },
      terms: {
        eyebrow: 'Shartlar',
        title: 'Pilot dostup shartlari.',
        intro:
          'YDeck tanlangan foydalanuvchilar uchun pilot tayyorlamoqda. Bu sahifa pilot munosabatini qisqacha tushuntiradi va public launchdan oldin to‘liq shartlar bilan almashtiriladi.',
        sections: [
          {
            title: 'Pilot mavjudligi',
            body: 'Waitlist formasini yuborish dostupni kafolatlamaydi. Foydalanuvchilarni moslik, imkoniyat, region va mahsulot tayyorligiga qarab bosqichma-bosqich taklif qilamiz.',
          },
          {
            title: 'Servisdan foydalanish',
            body: 'Pilot foydalanuvchilar faqat foydalanishga ruxsat bor materiallarni yuborishi va yaratilgan taqdimotni ish, ta’lim yoki ommaviy foydalanishdan oldin tekshirishi kerak.',
          },
          {
            title: 'O‘zgarishlar',
            body: 'YDeck funksiyalari, narxlari, mavjudligi va eksport variantlari pilot davomida test va yaxshilash jarayonida o‘zgarishi mumkin.',
          },
        ],
      },
      security: {
        eyebrow: 'Xavfsizlik',
        title: 'Maxfiy deck ishlari uchun xavfsizlik qaydlari.',
        intro:
          'YDeck maxfiy taqdimot jarayonlari uchun loyihalanmoqda. Biz hali olinmagan sertifikat yoki compliance da’volarini ishlatmaymiz.',
        sections: [
          {
            title: 'Local-first yo‘nalish',
            body: 'Mahsulot yo‘nalishi maxfiy va local-first jarayonlarni o‘z ichiga oladi, shunda sezgir manba materiallar imkon qadar foydalanuvchiga yaqin qoladi.',
          },
          {
            title: 'Sezgir materiallar',
            body: 'Biznes rejalar, hisobotlar, talaba materiallari va ichki hujjatlar maxfiy hisoblanishi, ishlov berishdan oldin mos rejim tanlanishi kerak.',
          },
          {
            title: 'Mas’uliyatli rollout',
            body: 'Xavfsizlik tafsilotlari pilot foydalanuvchilariga dostupdan oldin tushuntiriladi. Tasdiqlanmagan compliance, audit yoki certification da’volari berilmaydi.',
          },
        ],
      },
    },
  },
};

export function isLegalPageKey(value: string): value is LegalPageKey {
  return value === 'privacy' || value === 'terms' || value === 'security';
}
