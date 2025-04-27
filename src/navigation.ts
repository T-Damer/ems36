import { getPermalink, getBlogPermalink } from '~/utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Продукция',
      title: 'Продукция',
      links: [
        { text: 'Вся продукция', href: getPermalink('/product') },
        {
          text: 'Клапаны',
          href: getPermalink('/product/valves'),
        },
        {
          text: 'Конвейеры',
          href: getPermalink('/product/conveyors'),
        },
        { text: 'Элеваторы', href: getPermalink('/product/elevators') },
        { text: 'Задвижки', href: getPermalink('/product/shutters') },
        { text: 'Ямы Завальные', href: getPermalink('/product/pitfalls') },
        { text: 'Зерноочестительный агрегат', href: getPermalink('/product/zav') },
        { text: 'Прочее', href: getPermalink('/product/other') },
      ],
    },
    {
      text: 'Документация',
      title: 'Документация',
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
      title: 'Контакты',
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
  links: headerData.links,
  secondaryLinks: [
    { text: 'Условия пользования', href: getPermalink('/terms') },
    { text: 'Политика конфиденциальности', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/T-Damer', target: '_blank' },
    {
      ariaLabel: 'WhatsApp',
      icon: 'tabler:brand-whatsapp',
      href: 'https://wa.me/whatsappphonenumber?text=urlencodedtext',
      target: '_blank',
    },
  ],
};
