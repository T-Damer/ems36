import type { Product } from '~/types';

export type DocumentKind = 'passport' | 'manual' | 'permit';

export interface SiteDocument {
  title: string;
  /** Path of the PDF inside `public/`. */
  href: string;
  kind: DocumentKind;
  /** Extra kinds whose lists also show this document (the filter's passport is its manual too). */
  alsoIn?: DocumentKind[];
  /** Regulation heading the document is grouped under on the permitting page. */
  regulation?: string;
  /** Product types (`valves`) or single products (`conveyors/belt-conveyor`) whose pages list the document. */
  products?: string[];
  /** Superseded file: its URL keeps working, but no list on the site shows it. */
  hidden?: boolean;
}

export const documentKinds: Record<DocumentKind, { title: string; href: string }> = {
  passport: { title: 'Паспорта', href: '/documents/passport-examples' },
  manual: { title: 'Руководства по эксплуатации', href: '/documents/exp-manual' },
  permit: { title: 'Разрешительные документы', href: '/documents/permitting-docs' },
};

const TR_004_020 = 'ТР ТС 004/2011 и ТР ТС 020/2011 — низковольтное оборудование и электромагнитная совместимость';
const TR_010 = 'ТР ТС 010/2011 — безопасность машин и оборудования';
const TR_012 = 'ТР ТС 012/2011 — оборудование для работы во взрывоопасных средах';

const SHUTTERS = 'shutters';
const VALVES = 'valves';
const CONVEYORS = 'conveyors';
const BELT_CONVEYOR = 'conveyors/belt-conveyor';
const SCREW_CONVEYOR = 'conveyors/screw-conveyor';
const CHAIN_CONVEYOR = 'conveyors/stationary-chain-conveyor';
const BELT_ELEVATOR = 'elevators/bucket-belt';
/** No product page yet: the ventilation landing lists these in its aspiration card. */
export const FILTERS = 'filters';

const passport = (file: string, title: string, products?: string[]): SiteDocument => ({
  title,
  href: `/files/passports/${file}`,
  kind: 'passport',
  products,
});
const oldPassport = (file: string, title: string): SiteDocument => ({ ...passport(file, title), hidden: true });

const manual = (file: string, title: string, products?: string[], hidden?: boolean): SiteDocument => ({
  title,
  href: `/files/exp-manual/${file}`,
  kind: 'manual',
  products,
  hidden,
});

const permit = (file: string, title: string, regulation: string, products?: string[]): SiteDocument => ({
  title,
  href: `/files/permitting-docs/${file}`,
  kind: 'permit',
  regulation,
  products,
});

export const documents: SiteDocument[] = [
  passport('Паспорт-задвижка-винтовая-ЗВ.pdf', 'Задвижка винтовая ЗВ', [SHUTTERS]),
  passport('Паспорт-задвижка-пневматическая-ЗП.pdf', 'Задвижка пневматическая ЗП', [SHUTTERS]),
  passport('Паспорт-задвижка-реечная-ручная-ЗР-Р.pdf', 'Задвижка реечная ручная ЗР(Р)', [SHUTTERS]),
  passport('Паспорт-задвижка-реечная-с-электроприводом-ЗР-Э.pdf', 'Задвижка реечная с электроприводом ЗР(Э)', [
    SHUTTERS,
  ]),
  passport(
    'Паспорт-задвижка-реечно-винтовая-комбинированная-ЗРВ-К.pdf',
    'Задвижка реечно-винтовая комбинированная ЗРВ(К)',
    [SHUTTERS]
  ),
  passport('Паспорт-клапан-перекидной.pdf', 'Клапан перекидной (делитель)', [VALVES]),
  passport('Паспорт-конвейер-винтовой-ВК.pdf', 'Конвейер винтовой ВК', [SCREW_CONVEYOR]),
  passport('Паспорт-конвейер-ленточный-КСЛ.pdf', 'Конвейер стационарный ленточный КСЛ', [BELT_CONVEYOR]),
  passport('Паспорт-конвейер-цепной-КЦС.pdf', 'Конвейер цепной стационарный КЦС', [CHAIN_CONVEYOR]),
  passport('Паспорт-элеватор-ковшовый-ленточный.pdf', 'Элеватор ковшовый ленточный ЭК(Л)', [BELT_ELEVATOR]),
  passport('Паспорт-элеватор-ковшовый-цепной.pdf', 'Элеватор ковшовый цепной ЭК(Ц)'),
  {
    ...passport('Паспорт-фильтр-локальный-ФЛ.pdf', 'Фильтр локальный ФЛ — паспорт и руководство по эксплуатации', [
      FILTERS,
    ]),
    alsoIn: ['manual'],
  },

  oldPassport('Образец-паспорта-винтовой-конвейер-в-желобе.pdf', 'Винтовой конвейер в желобе (образец 2025)'),
  oldPassport('Образец-паспорта-винтовой-конвейер-в-трубе.pdf', 'Винтовой конвейер в трубе (образец 2025)'),
  oldPassport('Образец-паспорта-задвижка-винтовая.pdf', 'Задвижка винтовая (образец 2025)'),
  oldPassport('Образец-паспорта-задвижка-комбинированная.pdf', 'Задвижка комбинированная (образец 2025)'),
  oldPassport('Образец-паспорта-задвижка-пневматическая.pdf', 'Задвижка пневматическая (образец 2025)'),
  oldPassport('Образец-паспорта-задвижка-реечная-ручная.pdf', 'Задвижка реечная ручная (образец 2025)'),
  oldPassport('Образец-паспорта-клапан-перекидной.pdf', 'Клапан перекидной (образец 2025)'),
  oldPassport('Образец-паспорта-ковейер-цепной-скребковый.pdf', 'Конвейер цепной скребковый (образец 2025)'),
  oldPassport('Образец-паспорта-конвейер-ленточный.pdf', 'Конвейер ленточный (образец 2025)'),
  oldPassport('Образец-паспорта-ленточный-конвейер.pdf', 'Ленточный конвейер (образец 2025)'),
  oldPassport('Образец-паспорта-элеватор-ковшовый-ленточный.pdf', 'Элеватор ковшовый ленточный (образец 2025)'),
  oldPassport('Образец-паспорта-элеватор-ковшовый-цепной.pdf', 'Элеватор ковшовый цепной (образец 2025)'),
  oldPassport('Паспорт-на-Задвижку-реечную-с-электроприводом-ЗРЭ.pdf', 'Задвижка реечная с электроприводом ЗРЭ (2025)'),

  manual('РЭ-конвейеры-ленточные.pdf', 'Конвейеры ленточные', [BELT_CONVEYOR]),
  manual('РЭ-конвейеры-цепные-стационарные.pdf', 'Конвейеры цепные стационарные', [CHAIN_CONVEYOR]),
  manual('РЭ-элеватор-ковшовый.pdf', 'Элеватор ковшовый', [BELT_ELEVATOR]),
  manual('РЭ-конвейеры-цепные.pdf', 'Конвейеры цепные (2025)', undefined, true),
  manual('РЭ-элеваторы.pdf', 'Элеваторы (2025)', undefined, true),

  permit('Декларация-ТР-ТС-004-020-задвижки.pdf', 'Декларация о соответствии — задвижки', TR_004_020, [SHUTTERS]),
  permit('Декларация-ТР-ТС-004-020-клапаны.pdf', 'Декларация о соответствии — клапаны', TR_004_020, [VALVES]),
  permit('Декларация-ТР-ТС-004-020-конвейеры.pdf', 'Декларация о соответствии — конвейеры', TR_004_020, [CONVEYORS]),
  permit('Декларация-ТР-ТС-004-020-элеваторы.pdf', 'Декларация о соответствии — элеваторы', TR_004_020, [
    BELT_ELEVATOR,
  ]),
  permit('Декларация-ТР-ТС-004-020-фильтры.pdf', 'Декларация о соответствии — фильтры локальные', TR_004_020, [
    FILTERS,
  ]),

  permit('Сертификат-ТР-ТС-012-задвижки.pdf', 'Сертификат соответствия — задвижки шиберные', TR_012, [SHUTTERS]),
  permit('Сертификат-ТР-ТС-012-клапаны.pdf', 'Сертификат соответствия — клапаны перекидные', TR_012, [VALVES]),

  permit('Декларация-ТР-ТС-010-фильтры.pdf', 'Декларация о соответствии — фильтры локальные', TR_010, [FILTERS]),
  permit('задвижки-декларация.pdf', 'Декларация о соответствии — задвижки', TR_010, [SHUTTERS]),
  permit('клапаны-декларация.pdf', 'Декларация о соответствии — клапаны', TR_010, [VALVES]),
  permit('конвейеры-декларация.pdf', 'Декларация о соответствии — конвейеры', TR_010, [CONVEYORS]),
  permit('нории-декларация.pdf', 'Декларация о соответствии — нории', TR_010, [BELT_ELEVATOR]),
  permit('АЖ49.01245.pdf', 'Сертификат соответствия — задвижка реечная ЗР', TR_010, [SHUTTERS]),
  permit('АЖ49.01246.pdf', 'Сертификат соответствия — задвижка винтовая ЗВ', TR_010, [SHUTTERS]),
  permit('АЖ49.01247.pdf', 'Сертификат соответствия — задвижка реечно-винтовая ЗР(РВ)', TR_010, [SHUTTERS]),
  permit('АЖ49.01248.pdf', 'Сертификат соответствия — задвижка пневматическая ЗП', TR_010, [SHUTTERS]),
  permit('АЖ49.01249.pdf', 'Сертификат соответствия — элеватор ковшовый ленточный ЭК(Л)', TR_010, [BELT_ELEVATOR]),
  permit('АЖ49.01250.pdf', 'Сертификат соответствия — элеватор ковшовый цепной ЭК(Ц)', TR_010),
  permit('АЖ49.01251.pdf', 'Сертификат соответствия — клапан перекидной КО', TR_010, [VALVES]),
  permit('АЖ49.01252.pdf', 'Сертификат соответствия — конвейер цепной скребковый КЦС', TR_010, [CHAIN_CONVEYOR]),
  permit('АЖ49.01253.pdf', 'Сертификат соответствия — конвейер ленточный КЛ', TR_010, [BELT_CONVEYOR]),
  permit('АЖ49.01254.pdf', 'Сертификат соответствия — конвейер винтовой ВК', TR_010, [SCREW_CONVEYOR]),
];

const visible = documents.filter((document) => !document.hidden);

export const documentsOfKind = (kind: DocumentKind) =>
  visible.filter((document) => document.kind === kind || document.alsoIn?.includes(kind));

/** Visible documents grouped by regulation, in the order the regulations first appear. */
export const permitsByRegulation = () => {
  const groups = new Map<string, SiteDocument[]>();
  for (const document of documentsOfKind('permit')) {
    const regulation = document.regulation ?? '';
    groups.set(regulation, [...(groups.get(regulation) ?? []), document]);
  }
  return Array.from(groups, ([regulation, items]) => ({ regulation, items }));
};

/** Visible documents tagged with any of the `products` keys. */
export const documentsFor = (...keys: string[]) =>
  visible.filter((document) => document.products?.some((key) => keys.includes(key)));

/** Visible documents for a product page, grouped by kind; kinds with nothing to show are left out. */
export const productDocuments = (product: Pick<Product, 'slug' | 'type'>) => {
  const type = product.type?.slug;
  if (!type) return [];
  const matching = documentsFor(type, `${type}/${product.slug}`);
  return (Object.keys(documentKinds) as DocumentKind[])
    .map((kind) => ({ kind, ...documentKinds[kind], items: matching.filter((document) => document.kind === kind) }))
    .filter((group) => group.items.length);
};
