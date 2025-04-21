import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Продукция',
      links: [
        {
          text: 'Элеваторы',
          href: getPermalink('/elevators'),
        },
        {
          text: 'Транспортеры',
          href: getPermalink('/transporters'),
        },
        {
          text: 'Клапаны',
          href: getPermalink('/valves'),
        },
        {
          text: 'Задвижки',
          href: getPermalink('/shutters'),
        },
        {
          text: 'Металообработка',
          href: getPermalink('/metal-works'),
        },
        {
          text: 'Детали для сельхозтехники',
          href: getPermalink('/parts-agriculture'),
        },
      ],
    },
    {
      text: 'Документация',
      links: [
        {
          text: 'Образцы паспортов',
          href: getPermalink('/documents/passport-examples'),
        },
        {
          text: 'Руководство по эксплуатации',
          href: getPermalink('/documents/exp-manual'),
        },
        {
          text: 'Разрешительные документы',
          href: getPermalink('/documents/permitting-docs'),
        },
        { text: 'Статьи', href: getBlogPermalink() },
      ],
    },
    {
      text: 'Контакты',
      links: [
        {
          text: 'Адреса и телефоны',
          href: getPermalink('/contacts'),
        },
        { text: 'Новости', href: getBlogPermalink() },
        { text: 'О компании', href: getPermalink('/about') },
      ],
    },
  ],
  actions: [{ ariaLabel: 'Позвонить', icon: 'tabler:phone', href: 'tel:+7(900)300-63-23', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'Продукция',
      links: [
        { text: 'Элеваторы', href: getPermalink('/elevators') },
        { text: 'Транспортеры', href: getPermalink('/transporters') },
        { text: 'Клапаны', href: getPermalink('/valves') },
        { text: 'Задвижки', href: getPermalink('/shutters') },
        { text: 'Металообработка', href: getPermalink('/metal-works') },
        {
          text: 'Детали для сельхозтехники',
          href: getPermalink('/parts-agriculture'),
        },
      ],
    },

    {
      title: 'Компания',
      links: [
        { text: 'О нас', href: getPermalink('/about') },
        { text: 'Статьи', href: getBlogPermalink() },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Условия пользования', href: getPermalink('/terms') },
    { text: 'Политика конфиденциальности', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/T-Damer', target: '_blank' },
  ],
};
