/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Augment ImportMetaEnv so TypeScript knows our custom VITE_ vars.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_CURRENT_USER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
