declare module 'astrowind:config' {
  import type { SiteConfig, I18NConfig, MetaDataConfig, AppBlogConfig, UIConfig, AnalyticsConfig } from './config';

  export const SITE: SiteConfig;
  export const I18N: I18NConfig;
  export const METADATA: MetaDataConfig;
  export const APP_BLOG: AppBlogConfig;
  export const APP_PRODUCT: {
    isEnabled: boolean;
    productsPerPage: number;
    product: {
      isEnabled: boolean;
      permalink: string;
      robots: {
        index: boolean;
        follow: boolean;
      };
    };
    list: {
      isEnabled: boolean;
      pathname: string;
      robots: {
        index: boolean;
        follow: boolean;
      };
    };
    type: {
      isEnabled: boolean;
      pathname: string;
      robots: {
        index: boolean;
        follow: boolean;
      };
    };
  };
  export const UI: UIConfig;
  export const ANALYTICS: AnalyticsConfig;
}
