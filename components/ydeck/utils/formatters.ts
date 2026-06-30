import type { Web3TemplateSlide } from '../data/templates';
import type { Locale } from '../types';

export function formatSlideCount(count: number, locale: Locale) {
  if (locale === 'ru') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    const suffix =
      mod10 === 1 && mod100 !== 11
        ? 'слайд'
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
          ? 'слайда'
          : 'слайдов';
    return `${count} ${suffix}`;
  }

  if (locale === 'uz') {
    return `${count} slayd`;
  }

  return `${count} slide${count === 1 ? '' : 's'}`;
}

export function formatTemplatePreviewAlt(
  title: string,
  slideNumber: string,
  locale: Locale
) {
  if (locale === 'ru') {
    return `${title}, превью слайда ${slideNumber}`;
  }

  if (locale === 'uz') {
    return `${title}, ${slideNumber}-slayd prevyusi`;
  }

  return `${title} slide ${slideNumber} preview`;
}

export function formatMiniSlideAlt(slide: Web3TemplateSlide, locale: Locale) {
  if (locale === 'ru') {
    return `${slide.title}, превью слайда из макета ${slide.layout}`;
  }

  if (locale === 'uz') {
    return `${slide.title}, ${slide.layout} maketidan slayd prevyusi`;
  }

  return `${slide.title} slide preview from ${slide.layout}`;
}
