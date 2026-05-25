import "./styles.css";
import {
  fetchCurrentPageSource,
  mountApp,
  mountGoogleTagManager,
  revealPage
} from "./effects";
import { gtmContainerId } from "./env";
import { renderHomepage } from "./view";

const appId = "app";

mountGoogleTagManager(gtmContainerId);

const main = async (): Promise<void> => {
  // Step 1: fetch the current page source at runtime.
  const source = await fetchCurrentPageSource();

  // Step 2: transform the real index.html source into the homepage markup.
  const app = renderHomepage({
    filename: "index.html",
    source
  });

  // Step 3: commit the pure render result at the DOM side-effect boundary.
  mountApp(appId, app);
};

void main().catch((error: unknown) => {
  console.error(error);
  revealPage();
});
