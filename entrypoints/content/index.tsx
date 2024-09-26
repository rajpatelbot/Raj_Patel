import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style.css";

export default defineContentScript({
  matches: ["*://*.linkedin.com/messaging/*"], // TODO: Will change this to linkedin.com
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "language-learning-content-box",
      position: "inline",
      onMount: (container) => {
        const appContainer = document.createElement("div");
        appContainer.id = "app-container";
        container.appendChild(appContainer);

        const root = ReactDOM.createRoot(appContainer);
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });
    ui.mount();
  },
});
