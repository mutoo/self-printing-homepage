/**
 * The app's browser side-effect boundary.
 *
 * Rendering stays pure; this module handles browser reads and writes such as
 * fetching the page source and committing the already-built markup.
 */
const currentPageSourceUrl = (): string => {
  const url = new URL(window.location.href);
  url.hash = "";

  return url.href;
};

type GoogleTagManagerWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

const googleTagManagerUrl = (containerId: string): string => {
  const url = new URL("https://www.googletagmanager.com/gtm.js");
  url.searchParams.set("id", containerId);

  return url.href;
};

const hasGoogleTagManagerScript = (containerId: string): boolean =>
  Array.from(document.scripts).some((script) => script.dataset.gtmId === containerId);

const pushGoogleTagManagerStart = (): void => {
  const gtmWindow = window as unknown as GoogleTagManagerWindow;
  const dataLayer = gtmWindow.dataLayer ?? [];

  dataLayer.push({
    "gtm.start": Date.now(),
    event: "gtm.js"
  });

  gtmWindow.dataLayer = dataLayer;
};

export const mountGoogleTagManager = (containerId: string): void => {
  const normalizedContainerId = containerId.trim();

  if (!normalizedContainerId || hasGoogleTagManagerScript(normalizedContainerId)) {
    return;
  }

  pushGoogleTagManagerStart();

  const script = document.createElement("script");
  script.async = true;
  script.dataset.gtmId = normalizedContainerId;
  script.src = googleTagManagerUrl(normalizedContainerId);

  const firstScript = document.getElementsByTagName("script")[0];
  firstScript?.parentNode
    ? firstScript.parentNode.insertBefore(script, firstScript)
    : document.head.appendChild(script);
};

export const fetchCurrentPageSource = async (): Promise<string> => {
  const response = await fetch(currentPageSourceUrl());

  if (!response.ok) {
    throw new Error(
      `Failed to fetch current page source: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
};

const revealBody = (): void => {
  document.body.removeAttribute("data-cloak");
};

const appElement = (mountId: string): HTMLElement => {
  const mount = document.getElementById(mountId);

  // Failing fast makes a missing mount node obvious during local development.
  if (!mount) {
    throw new Error(`Missing mount element: #${mountId}`);
  }

  return mount;
};

export const revealPage = (): void => {
  revealBody();
};

export const mountApp = (mountId: string, markup: string): void => {
  const mount = appElement(mountId);

  mount.innerHTML = markup;
  revealBody();
};
