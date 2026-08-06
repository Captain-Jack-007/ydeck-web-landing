import { contactEmail } from '../constants';
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
    contact: `Questions: ${contactEmail}`,
    pages: {
      privacy: {
        eyebrow: 'Privacy policy',
        title: 'Privacy for recurring reporting work.',
        intro:
          'YDeck is being developed for teams working with sensitive report packs, source data, templates, comments, and company rules. This page explains the privacy approach for the reporting-audit form and pilot.',
        sections: [
          {
            title: 'Reporting-audit information',
            body: 'When you request a reporting-process audit, we collect the details you submit in the form, such as name, email, company, role, contact details, recurring report workflow, final report format, and reporting frequency.',
          },
          {
            title: 'Product files',
            body: 'YDeck is designed around private reporting workflows. Pilot handling of uploaded or processed report packs, source files, and templates will be explained clearly before teams are invited into the product.',
          },
          {
            title: 'Contact and deletion',
            body: `You can ask us to update or remove your waitlist information by emailing ${contactEmail} from the address used in your request.`,
          },
        ],
      },
      terms: {
        eyebrow: 'Terms',
        title: 'Pilot access terms.',
        intro:
          'YDeck is preparing a reporting-agent pilot for selected teams. These terms summarize the expected pilot relationship and will be replaced by full product terms before public launch.',
        sections: [
          {
            title: 'Pilot availability',
            body: 'Submitting the waitlist form does not guarantee access. We may invite users in stages based on fit, capacity, region, and product readiness.',
          },
          {
            title: 'Use of the service',
            body: 'Pilot users should only submit report packs, source data, and templates they have permission to use and should review any generated reporting draft before relying on it in business settings.',
          },
          {
            title: 'Changes',
            body: 'YDeck features, pricing, availability, and export options may change during the pilot as the product is tested and improved.',
          },
        ],
      },
      security: {
        eyebrow: 'Security',
        title: 'Security notes for private reporting pilots.',
        intro:
          'YDeck is being designed for confidential reporting workflows. We avoid claiming certifications we have not earned; this page describes the product direction plainly.',
        sections: [
          {
            title: 'Local-first direction',
            body: 'The product direction includes private and local-first reporting workflows so sensitive source material can stay closer to the user where supported.',
          },
          {
            title: 'Sensitive material',
            body: 'Users should treat report packs, exports, KPI definitions, manager comments, and internal documents as confidential and choose the right mode before processing them.',
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
    contact: `Вопросы: ${contactEmail}`,
    pages: {
      privacy: {
        eyebrow: 'Политика приватности',
        title: 'Приватность для регулярной отчетности.',
        intro:
          'YDeck создается для команд, которые работают с чувствительными пакетами отчетов, исходными данными, шаблонами, комментариями и правилами компании. Здесь описан подход к приватности для формы аудита и пилота.',
        sections: [
          {
            title: 'Данные аудита отчетности',
            body: 'Когда вы запрашиваете аудит отчетного процесса, мы собираем данные из формы: имя, email, компанию, роль, контакт, регулярный отчетный процесс, финальный формат отчета и частоту отчетности.',
          },
          {
            title: 'Файлы продукта',
            body: 'YDeck проектируется вокруг приватных отчетных процессов. Обработка пакетов отчетов, исходных файлов и шаблонов в пилоте будет объяснена до приглашения команд в продукт.',
          },
          {
            title: 'Контакт и удаление',
            body: `Вы можете попросить обновить или удалить данные листа ожидания, написав на ${contactEmail} с email, который использовали в заявке.`,
          },
        ],
      },
      terms: {
        eyebrow: 'Условия',
        title: 'Условия пилотного доступа.',
        intro:
          'YDeck готовит пилот отчетного агента для выбранных команд. Эти условия кратко описывают ожидаемые правила пилота и будут заменены полными условиями до публичного запуска.',
        sections: [
          {
            title: 'Доступ к пилоту',
            body: 'Отправка формы не гарантирует доступ. Мы можем приглашать пользователей поэтапно с учетом соответствия, емкости, региона и готовности продукта.',
          },
          {
            title: 'Использование сервиса',
            body: 'Пилотные пользователи должны отправлять только пакеты отчетов, исходные данные и шаблоны, которые имеют право использовать, и проверять созданный черновик отчета перед применением.',
          },
          {
            title: 'Изменения',
            body: 'Функции YDeck, цены, доступность и варианты экспорта могут меняться во время пилота по мере тестирования и улучшения продукта.',
          },
        ],
      },
      security: {
        eyebrow: 'Безопасность',
        title: 'Заметки о безопасности приватных отчетных пилотов.',
        intro:
          'YDeck проектируется для конфиденциальных отчетных процессов. Мы не заявляем о сертификациях, которых еще нет; эта страница описывает направление продукта.',
        sections: [
          {
            title: 'Local-first направление',
            body: 'В продуктовое направление входят приватные и local-first отчетные процессы, чтобы чувствительные исходные материалы оставались ближе к пользователю там, где это поддерживается.',
          },
          {
            title: 'Чувствительные материалы',
            body: 'Пакеты отчетов, выгрузки, KPI-определения, комментарии менеджеров и внутренние документы стоит считать конфиденциальными и выбирать подходящий режим обработки.',
          },
          {
            title: 'Ответственный запуск',
            body: 'Детали безопасности будут раскрыты пилотным пользователям до доступа. Мы не будем использовать неподтвержденные заявления о compliance, аудите или сертификации.',
          },
        ],
      },
    },
  },
  uz: {
    back: 'YDeck sahifasiga qaytish',
    updated: '2026-yil 4-iyulda yangilangan',
    contact: `Savollar: ${contactEmail}`,
    pages: {
      privacy: {
        eyebrow: 'Maxfiylik siyosati',
        title: 'Takroriy hisobot ishlari uchun maxfiylik.',
        intro:
          'YDeck sezgir report pack’lar, manba ma’lumotlari, shablonlar, izohlar va kompaniya qoidalari bilan ishlaydigan jamoalar uchun ishlab chiqilmoqda.',
        sections: [
          {
            title: 'Hisobot auditi ma’lumotlari',
            body: 'Hisobot jarayoni auditini so‘raganingizda formadagi ism, email, kompaniya, rol, kontakt, takroriy hisobot jarayoni, yakuniy hisobot formati va hisobot davriyligi kabi ma’lumotlarni olamiz.',
          },
          {
            title: 'Mahsulot fayllari',
            body: 'YDeck maxfiy hisobot jarayonlari atrofida loyihalanmoqda. Pilotdagi report pack’lar, manba fayllari va shablonlarni qayta ishlash tartibi jamoalar mahsulotga kirishidan oldin tushuntiriladi.',
          },
          {
            title: 'Kontakt va o‘chirish',
            body: `Ariza ma’lumotlarini yangilash yoki o‘chirish uchun arizada ishlatgan emailingizdan ${contactEmail} manziliga yozishingiz mumkin.`,
          },
        ],
      },
      terms: {
        eyebrow: 'Shartlar',
        title: 'Pilotga kirish shartlari.',
        intro:
          'YDeck tanlangan jamoalar uchun hisobot agenti pilotini tayyorlamoqda. Bu sahifa pilot munosabatini qisqacha tushuntiradi va ommaviy ishga tushirishdan oldin to‘liq shartlar bilan almashtiriladi.',
        sections: [
          {
            title: 'Pilot mavjudligi',
            body: 'Ariza formasini yuborish pilotga kirishni kafolatlamaydi. Foydalanuvchilarni moslik, imkoniyat, region va mahsulot tayyorligiga qarab bosqichma-bosqich taklif qilamiz.',
          },
          {
            title: 'Servisdan foydalanish',
            body: 'Pilot foydalanuvchilar faqat foydalanishga ruxsat bor report pack’lar, manba ma’lumotlari va shablonlarni yuborishi hamda yaratilgan hisobot loyihasini biznesda ishlatishdan oldin tekshirishi kerak.',
          },
          {
            title: 'O‘zgarishlar',
            body: 'YDeck funksiyalari, narxlari, mavjudligi va eksport variantlari pilot davomida test va yaxshilash jarayonida o‘zgarishi mumkin.',
          },
        ],
      },
      security: {
        eyebrow: 'Xavfsizlik',
        title: 'Maxfiy hisobot pilotlari uchun xavfsizlik qaydlari.',
        intro:
          'YDeck maxfiy hisobot jarayonlari uchun loyihalanmoqda. Biz hali olinmagan sertifikat yoki compliance da’volarini ishlatmaymiz.',
        sections: [
          {
            title: 'Local-first yo‘nalishi',
            body: 'Mahsulot yo‘nalishi maxfiy va local-first hisobot jarayonlarini o‘z ichiga oladi, shunda sezgir manba materiallari qo‘llab-quvvatlangan joylarda foydalanuvchiga yaqin qoladi.',
          },
          {
            title: 'Sezgir materiallar',
            body: 'Report pack’lar, eksportlar, KPI ta’riflari, menejer izohlari va ichki hujjatlar maxfiy hisoblanishi, ishlov berishdan oldin mos rejim tanlanishi kerak.',
          },
          {
            title: 'Mas’uliyatli joriy etish',
            body: 'Xavfsizlik tafsilotlari pilot foydalanuvchilariga kirishdan oldin tushuntiriladi. Tasdiqlanmagan compliance, audit yoki sertifikat da’volari berilmaydi.',
          },
        ],
      },
    },
  },
};

export function isLegalPageKey(value: string): value is LegalPageKey {
  return value === 'privacy' || value === 'terms' || value === 'security';
}
