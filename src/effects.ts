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
