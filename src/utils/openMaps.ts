import { mapsLink } from '~/utils/permalinks';

export const defaultOrgAddress = '394019, Воронежская обл., Воронеж, ул. Краснодонская д. 1а, офис 19';

export default function openMaps(address = defaultOrgAddress) {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(navigator.userAgent);

  const encodedAddress = encodeURIComponent(address);

  if (isIOS) {
    window.location.href = `maps://?q=${encodedAddress}`;
  } else if (isAndroid) {
    window.location.href = `geo:0,0?q=${encodedAddress}`;
  } else {
    window.open(mapsLink, '_blank');
  }
}
