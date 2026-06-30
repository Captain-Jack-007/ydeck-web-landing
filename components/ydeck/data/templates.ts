export const web3TemplateSlides = [
  {
    number: '01',
    layout: 'mf_cover',
    title: 'Cover',
    kind: 'Cover',
    variant: 'cover',
    src: '/ydeck-web3-pitch-deck-previews/slide-01.png',
  },
  {
    number: '05',
    layout: 'mf_market_charts',
    title: 'Market charts',
    kind: 'Market',
    variant: 'market',
    src: '/ydeck-web3-pitch-deck-previews/slide-05.png',
  },
  {
    number: '09',
    layout: 'mf_plans_focus',
    title: 'Plans focus',
    kind: 'Plans',
    variant: 'plans',
    src: '/ydeck-web3-pitch-deck-previews/slide-09.png',
  },
  {
    number: '19',
    layout: 'mf_project_assessment',
    title: 'Project assessment',
    kind: 'Review',
    variant: 'assessment',
    src: '/ydeck-web3-pitch-deck-previews/slide-19.png',
  },
] as const;

export function makeTemplateSlides(
  slug: string,
  count: number,
  featured: number[] = [1, 2, 3, 4]
) {
  const ordered = [
    ...featured,
    ...Array.from({ length: count }, (_, index) => index + 1).filter(
      (number) => !featured.includes(number)
    ),
  ];

  return ordered.map((number) => ({
    number: String(number).padStart(2, '0'),
    src: `/ydeck-template-previews/${slug}/slide-${String(number).padStart(
      2,
      '0'
    )}.png`,
  }));
}

export type TemplateSlide = ReturnType<typeof makeTemplateSlides>[number];
export type Web3TemplateSlide = (typeof web3TemplateSlides)[number];

export const templatePreviews = {
  web3: makeTemplateSlides('ydeck-web3-pitch-deck', 21, [1, 5, 9, 19]),
  sales: makeTemplateSlides('ydeck-library-sales-proposal', 15, [1, 5, 7, 12]),
  startup: makeTemplateSlides('ydeck-startup-pitch', 16, [1, 5, 9, 15]),
  report: makeTemplateSlides('ydeck-business-report', 16, [1, 3, 10, 12]),
  country: makeTemplateSlides('ydeck-country-overview', 16, [1, 2, 5, 12]),
  globance: makeTemplateSlides('ydeck-globance-pitch-deck', 10, [1, 4, 7, 10]),
  investment: makeTemplateSlides('ydeck-investment-app-deck', 8, [1, 2, 5, 8]),
};
