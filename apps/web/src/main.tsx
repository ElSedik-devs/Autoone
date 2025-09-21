import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n";
import i18n from "./i18n";            // <-- import the instance to listen for changes
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store";
import "leaflet/dist/leaflet.css";
import { applyLeafletIconFix } from "./map/leafletIconFix";

// Leaflet marker icon fix (must run before any map renders)
applyLeafletIconFix();

function setDir(lng: string) {
  const isRTL = lng?.startsWith("ar");
  document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  document.documentElement.classList.toggle("rtl", isRTL);
}

// Initial dir (fallback to localStorage or 'en')
setDir(i18n.language || localStorage.getItem("i18nextLng") || "en");

// Update dir whenever language changes
i18n.on("languageChanged", (lng) => setDir(lng));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
