// Shared content for the «Вентиляция и аспирация» direction (home teaser + landing page).
// Full galleries live in src/data/product/ventilation/*.md.

const IMG = '/images/products/ventilation';

export interface VentImage {
  /** Full-size WebP (1280px on the long side). A `-sm.webp` copy (480/640px) sits next to it. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface VentCategory {
  slug: string;
  title: string;
  /** Short label for tiles. */
  label: string;
  cover: VentImage;
}

const portrait = (src: string, alt: string): VentImage => ({ src: `${IMG}/${src}`, alt, width: 960, height: 1280 });
const landscape = (src: string, alt: string): VentImage => ({ src: `${IMG}/${src}`, alt, width: 1280, height: 960 });

/** `/a/b.webp` → `/a/b-sm.webp` */
export const smallVariant = (src: string) => src.replace(/\.webp$/, '-sm.webp');

export const ventSrcset = (image: VentImage) => {
  const smallWidth = image.width >= image.height ? 640 : 480;
  return `${smallVariant(image.src)} ${smallWidth}w, ${image.src} ${image.width}w`;
};

export const VENTILATION_PATH = '/product/ventilation/';

export const salesContacts = {
  phone: '+7 (950) 773-72-52',
  phoneHref: 'tel:+79507737252',
  email: 'elevatormelservis36@yandex.ru',
  whatsapp: 'https://wa.link/8n75w8',
};

export const ventCategories: VentCategory[] = [
  {
    slug: 'vozdukhovody-pryamougolnye',
    title: 'Воздуховоды прямоугольные',
    label: 'Воздуховоды',
    cover: portrait(
      'vozdukhovody/vozdukhovody-pryamougolnye-partiya.webp',
      'Партия прямоугольных воздуховодов из оцинкованной стали'
    ),
  },
  {
    slug: 'fasonnye-izdeliya-pryamougolnye',
    title: 'Фасонные изделия прямоугольного сечения',
    label: 'Отводы и переходы',
    cover: portrait('fasonnye-pryamougolnye/otvod-pryamougolnyj-90.webp', 'Отвод прямоугольный 90° на шинорейке'),
  },
  {
    slug: 'fasonnye-izdeliya-kruglye',
    title: 'Фасонные изделия круглого сечения',
    label: 'Круглое сечение',
    cover: portrait('fasonnye-kruglye/otvod-kruglyj-90.webp', 'Отвод круглый 90° сегментный'),
  },
  {
    slug: 'drossel-klapany',
    title: 'Дроссель-клапаны',
    label: 'Дроссель-клапаны',
    cover: portrait('drossel-klapany/drossel-klapany-kruglye.webp', 'Дроссель-клапаны круглого сечения'),
  },
];

/** Gallery for the landing page, ordered so neighbouring photos differ. */
export const ventGallery: VentImage[] = [
  portrait('fasonnye-kruglye/otvod-kruglyj-90.webp', 'Отвод круглый 90° сегментный'),
  portrait('fasonnye-pryamougolnye/otvod-pryamougolnyj-90.webp', 'Отвод прямоугольный 90° на шинорейке'),
  landscape('fasonnye-kruglye/perekhody-kruglye.webp', 'Переходы круглого сечения разного диаметра'),
  portrait('drossel-klapany/drossel-klapan-pryamougolnyj.webp', 'Дроссель-клапан прямоугольный с ручным приводом'),
  portrait('vozdukhovody/vozdukhovody-pryamougolnye-partiya.webp', 'Партия прямоугольных воздуховодов'),
  portrait(
    'fasonnye-pryamougolnye/perekhod-pryamougolnyj-na-kruglyj.webp',
    'Переходы с прямоугольного на круглое сечение'
  ),
  portrait('drossel-klapany/drossel-klapany-kruglye.webp', 'Дроссель-клапаны круглого сечения'),
  landscape('fasonnye-pryamougolnye/otvody-pryamougolnye.webp', 'Отводы прямоугольного сечения'),
  portrait('fasonnye-kruglye/perekhod-kruglyj.webp', 'Переход круглый из оцинкованной стали'),
  portrait('fasonnye-pryamougolnye/zaglushki-pryamougolnye.webp', 'Заглушки прямоугольные с фланцами'),
  portrait('vozdukhovody/vozdukhovody-pryamougolnye-krupnye.webp', 'Прямоугольные воздуховоды большого сечения'),
  portrait('drossel-klapany/drossel-klapan-kruglyj.webp', 'Дроссель-клапан круглый'),
  portrait('fasonnye-pryamougolnye/otvod-pryamougolnyj-bolshoj.webp', 'Отвод прямоугольный большого сечения'),
  portrait('fasonnye-kruglye/nippel-kruglyj.webp', 'Ниппель для соединения круглых воздуховодов'),
  portrait('vozdukhovody/vozdukhovody-pryamougolnye-flantsy.webp', 'Воздуховоды разного сечения на шинорейке'),
  portrait('drossel-klapany/drossel-klapan-pryamougolnyj-zaslonka.webp', 'Дроссель-клапан прямоугольный, заслонка'),
  portrait('fasonnye-pryamougolnye/otvod-pryamougolnyj.webp', 'Отвод прямоугольный из оцинкованной стали'),
  portrait('fasonnye-pryamougolnye/fasonnoe-izdelie-pryamougolnoe.webp', 'Фасонное изделие прямоугольного сечения'),
];

export const ventOgImage = { url: `${IMG}/og-ventilyatsiya.jpg`, width: 1200, height: 630 };

const VID = '/videos/ventilation';

export const ventVideos = {
  production: {
    src: `${VID}/proizvodstvo-vozdukhovodov.mp4`,
    /** 432×768 copy for the carousel. */
    srcSmall: `${VID}/proizvodstvo-vozdukhovodov-sm.mp4`,
    poster: `${VID}/proizvodstvo-vozdukhovodov-poster.webp`,
    posterSmall: `${VID}/proizvodstvo-vozdukhovodov-poster-sm.webp`,
    title: 'Производство воздуховодов и фасонных изделий',
    duration: 33,
  },
  result: {
    src: `${VID}/gotovaya-produktsiya.mp4`,
    srcSmall: `${VID}/gotovaya-produktsiya-sm.mp4`,
    poster: `${VID}/gotovaya-produktsiya-poster.webp`,
    posterSmall: `${VID}/gotovaya-produktsiya-poster-sm.webp`,
    title: 'Готовые воздуховоды и фасонные изделия в цехе',
    duration: 11,
  },
};

export type VentReelItem =
  | { kind: 'image'; label: string; href?: string; image: VentImage }
  | {
      kind: 'video';
      label: string;
      href?: string;
      /** Small clip played inline. */
      src: string;
      /** Full-quality clip for the fullscreen viewer. */
      fullSrc: string;
      poster: string;
      /** Full-size poster for the lightbox. */
      lightboxPoster?: string;
      title: string;
      duration: number;
    };

const productHref = (slug: string) => `${VENTILATION_PATH}${slug}/`;
const reelImage = (slug: string, label: string, image: VentImage): VentReelItem => ({
  kind: 'image',
  label,
  href: productHref(slug),
  image,
});

/** Cards for the home page carousel: product types mixed with short reels. */
export const ventReel: VentReelItem[] = [
  reelImage('fasonnye-izdeliya-kruglye', 'Отводы круглые', ventGallery[0]),
  reelImage('fasonnye-izdeliya-pryamougolnye', 'Отводы прямоугольные', ventGallery[1]),
  {
    kind: 'video',
    label: 'Готовая продукция',
    href: VENTILATION_PATH,
    src: ventVideos.result.srcSmall,
    fullSrc: ventVideos.result.src,
    poster: ventVideos.result.posterSmall,
    lightboxPoster: ventVideos.result.poster,
    title: ventVideos.result.title,
    duration: ventVideos.result.duration,
  },
  reelImage('drossel-klapany', 'Дроссель-клапаны', ventGallery[6]),
  reelImage('vozdukhovody-pryamougolnye', 'Воздуховоды прямоугольные', ventGallery[4]),
  reelImage('fasonnye-izdeliya-pryamougolnye', 'Переходы на круглое сечение', ventGallery[5]),
  {
    kind: 'video',
    label: 'Как мы производим',
    href: VENTILATION_PATH,
    src: ventVideos.production.srcSmall,
    fullSrc: ventVideos.production.src,
    poster: ventVideos.production.posterSmall,
    lightboxPoster: ventVideos.production.poster,
    title: ventVideos.production.title,
    duration: ventVideos.production.duration,
  },
  reelImage('fasonnye-izdeliya-kruglye', 'Переходы круглые', ventGallery[8]),
  reelImage('fasonnye-izdeliya-pryamougolnye', 'Заглушки', ventGallery[9]),
  reelImage('drossel-klapany', 'Дроссель-клапан прямоугольный', ventGallery[3]),
  reelImage('fasonnye-izdeliya-kruglye', 'Ниппели', ventGallery[13]),
  reelImage('vozdukhovody-pryamougolnye', 'Воздуховоды большого сечения', ventGallery[10]),
];

/** Video shown on each ventilation product page: where it fits the product, and at which position. */
export const ventProductVideo: Record<string, { video: keyof typeof ventVideos; position: 'second' | 'last' }> = {
  'vozdukhovody-pryamougolnye': { video: 'production', position: 'last' },
  'fasonnye-izdeliya-pryamougolnye': { video: 'production', position: 'last' },
  'fasonnye-izdeliya-kruglye': { video: 'result', position: 'second' },
  'drossel-klapany': { video: 'production', position: 'last' },
};

export const videoReelItem = (key: keyof typeof ventVideos, label?: string, href?: string): VentReelItem => {
  const video = ventVideos[key];
  return {
    kind: 'video',
    label: label ?? (key === 'production' ? 'Как мы производим' : 'Готовая продукция'),
    href,
    src: video.srcSmall,
    fullSrc: video.src,
    poster: video.posterSmall,
    lightboxPoster: video.poster,
    title: video.title,
    duration: video.duration,
  };
};
