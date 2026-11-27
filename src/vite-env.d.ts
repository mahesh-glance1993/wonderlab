/// <reference types="vite/client" />

/** Build identity injected by vite.config.ts ("1.0.0+abc1234"). */
declare const __APP_VERSION__: string;

/** Optional build-time config for the /support page (unset = "Support options coming soon"). */
interface ImportMetaEnv {
  readonly VITE_SUPPORT_UPI_ID?: string;
  readonly VITE_SUPPORT_NAME?: string;
}
