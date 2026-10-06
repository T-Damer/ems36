// One PhotoSwipe lightbox for the whole site: photo galleries, product carousels, prose images and video reels.
// PhotoSwipe and its CSS are loaded on the first open, so pages don't pay for them up front.
import type PhotoSwipe from 'photoswipe';
import type { SlideData } from 'photoswipe';
import photoswipeCss from 'photoswipe/style.css?url';

export interface LightboxItem {
  kind: 'image' | 'video';
  /** Full-size image or video URL. */
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  poster?: string;
  /** Caption title and an optional "more" link shown under the slide. */
  label?: string;
  href?: string;
  /** Thumbnail to zoom from when opening/closing. */
  element?: HTMLElement;
  /** The thumbnail is cropped with object-fit: cover. */
  thumbCropped?: boolean;
}

interface Slide extends SlideData {
  caption?: string;
}

const escapeHtml = (value = '') =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

const captionHtml = ({ label, alt, href }: LightboxItem) => {
  const title = label || alt;
  if (!title && !href) return '';
  const link = href ? `<a class="pswp-caption__link" href="${escapeHtml(href)}">Подробнее →</a>` : '';
  return `<span class="pswp-caption__title">${escapeHtml(title)}</span>${link}`;
};

const toSlide = (item: LightboxItem): Slide =>
  item.kind === 'video'
    ? {
        html: `<div class="pswp-video is-loading"><span class="aw-spinner pswp-video__spinner"></span><video src="${escapeHtml(item.src)}" poster="${escapeHtml(item.poster)}"
          controls playsinline preload="metadata" controlslist="nodownload noplaybackrate" disablepictureinpicture
          aria-label="${escapeHtml(item.alt)}"></video></div>`,
        alt: item.alt,
        caption: captionHtml(item),
      }
    : {
        src: item.src,
        width: item.width,
        height: item.height,
        alt: item.alt,
        element: item.element,
        thumbCropped: item.thumbCropped,
        msrc: item.element instanceof HTMLImageElement ? item.element.currentSrc : undefined,
        caption: captionHtml(item),
      };

let current: PhotoSwipe | null = null;
let opening = false;

export const isLightboxOpen = () => current !== null || opening;

// The stylesheet is linked on demand (not bundled), so it isn't inlined into every page.
const loadStyles = () =>
  new Promise<void>((resolve) => {
    if (document.querySelector('link[data-pswp-css]')) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = photoswipeCss;
    link.dataset.pswpCss = '';
    link.onload = link.onerror = () => resolve();
    document.head.append(link);
  });

const loadPhotoSwipe = () => Promise.all([import('photoswipe'), loadStyles()]).then(([module]) => module.default);

export async function openLightbox(
  items: LightboxItem[],
  index = 0,
  { onOpen, onClose }: { onOpen?: () => void; onClose?: () => void } = {}
) {
  if (!items.length || opening) return;
  current?.destroy();
  opening = true;
  const PhotoSwipeClass = await loadPhotoSwipe().finally(() => (opening = false));

  const pswp = new PhotoSwipeClass({
    dataSource: items.map(toSlide),
    index,
    bgOpacity: 0.97,
    spacing: 0.08,
    loop: items.length > 2,
    showHideAnimationType: 'zoom',
    imageClickAction: 'zoom',
    tapAction: 'toggle-controls',
    doubleTapAction: 'zoom',
    bgClickAction: 'close',
    clickToCloseNonZoomable: false,
    wheelToZoom: false,
    padding: { top: 56, bottom: 88, left: 8, right: 8 },
    preloaderDelay: 0,
    closeTitle: 'Закрыть (Esc)',
    zoomTitle: 'Увеличить',
    arrowPrevTitle: 'Назад',
    arrowNextTitle: 'Вперёд',
    errorMsg: 'Не удалось загрузить файл',
    indexIndicatorSep: ' / ',
  });

  // Caption bar at the bottom: title + link to the product page.
  pswp.on('uiRegister', () => {
    pswp.ui?.registerElement({
      name: 'caption',
      className: 'pswp-caption',
      appendTo: 'root',
      order: 9,
      isButton: false,
      onInit: (el, instance) => {
        const update = () => {
          const html = (instance.currSlide?.data as Slide | undefined)?.caption ?? '';
          el.innerHTML = html;
          el.hidden = !html;
        };
        instance.on('change', update);
        update();
      },
    });
  });

  // Video slides play when shown and pause when swiped away.
  pswp.on('contentActivate', ({ content }) => {
    const video = content.element?.querySelector('video');
    const wrap = video?.closest('.pswp-video');
    if (video && wrap && !video.dataset.bound) {
      video.dataset.bound = 'true';
      const loading = (on: boolean) => () => wrap.classList.toggle('is-loading', on);
      ['waiting', 'loadstart'].forEach((name) => video.addEventListener(name, loading(true)));
      ['playing', 'pause', 'error'].forEach((name) => video.addEventListener(name, loading(false)));
    }
    // Sound needs a user gesture in some browsers; fall back to muted playback.
    video?.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  });
  pswp.on('contentDeactivate', ({ content }) => {
    content.element?.querySelector('video')?.pause();
  });
  // Let the native video controls (bottom strip) work instead of starting a swipe.
  pswp.on('pointerDown', (event) => {
    const target = event.originalEvent.target;
    if (
      target instanceof HTMLVideoElement &&
      event.originalEvent.clientY > target.getBoundingClientRect().bottom - 64
    ) {
      event.preventDefault();
    }
  });

  // Inline reels pause behind the lightbox and resume afterwards.
  const paused: HTMLVideoElement[] = [];
  document.querySelectorAll<HTMLVideoElement>('video[data-reel]').forEach((video) => {
    if (!video.paused) {
      video.pause();
      paused.push(video);
    }
  });

  pswp.on('close', () => pswp.element?.querySelectorAll('video').forEach((video) => video.pause()));
  pswp.on('destroy', () => {
    if (current === pswp) current = null;
    paused.forEach((video) => video.play().catch(() => {}));
    onClose?.();
  });

  current = pswp;
  onOpen?.();
  pswp.init();
}

/** Builds a lightbox item from an `<img>`: `data-lightbox-src/-width/-height/-caption` override what the tag shows. */
export const itemFromImage = (img: HTMLImageElement): LightboxItem => ({
  kind: 'image',
  src: img.dataset.lightboxSrc || img.currentSrc || img.src,
  width: Number(img.dataset.lightboxWidth) || img.naturalWidth || img.width,
  height: Number(img.dataset.lightboxHeight) || img.naturalHeight || img.height,
  alt: img.alt,
  label: img.dataset.lightboxCaption || img.alt,
  href: img.dataset.lightboxHref,
  element: img,
  thumbCropped: getComputedStyle(img).objectFit === 'cover',
});

/** Builds a lightbox item from an inline reel `<video data-reel>`. */
export const itemFromReel = (video: HTMLVideoElement, extra: Partial<LightboxItem> = {}): LightboxItem => ({
  kind: 'video',
  src: video.dataset.fullSrc || video.currentSrc || video.src,
  poster: video.dataset.fullPoster || video.poster,
  alt: video.getAttribute('aria-label') ?? '',
  ...extra,
});
