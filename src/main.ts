import "./styles.css";
import indexHtmlSource from "../public/index.html";
import { mountApp } from "./effects";
import { renderHomepage } from "./view";

// Step 1: transform the real index.html source into the homepage markup.
const app = renderHomepage({
  filename: "index.html",
  source: indexHtmlSource
});

// Step 2: commit the pure render result at the single DOM side-effect boundary.
mountApp("app", app);
