export const legalDates = {
  effective: {
    display: '14 August 2026',
    iso: '2026-08-14',
  },
  updated: {
    display: '14 August 2026',
    iso: '2026-08-14',
  },
} as const;

export const legalCompany = {
  legalName: 'GLOBANCE GROUP LIMITED',
  jurisdiction: 'Hong Kong',
  email: 'admin@globance.co',
  businessWebsite: 'https://globance.ai',
  productWebsite: 'https://ydeck.app',
} as const;

export const legalNavigation = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Data Deletion', href: '/data-deletion' },
] as const;

export type LegalSectionLink = {
  id: string;
  label: string;
};
