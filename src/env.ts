const envGtmContainerId = import.meta.env.VITE_GTM_ID;

export const gtmContainerId =
  typeof envGtmContainerId === "string" ? envGtmContainerId.trim() : "";
