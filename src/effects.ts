/**
 * The app's DOM side-effect boundary.
 *
 * All rendering happens before this function is called; this function only
 * locates the mount point and commits the already-built markup into the page.
 */
export const mountApp = (mountId: string, markup: string): void => {
  const mount = document.getElementById(mountId);

  // Failing fast makes a missing mount node obvious during local development.
  if (!mount) {
    throw new Error(`Missing mount element: #${mountId}`);
  }

  mount.innerHTML = markup;
};
