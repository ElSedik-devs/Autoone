// src/map/leafletIconFix.ts
import L from "leaflet";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon1x from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

declare global {
  // eslint-disable-next-line no-var
  var __AUTOONE_LEAFLET_PATCHED__: boolean | undefined;
}

export function applyLeafletIconFix(): void {
  if (globalThis.__AUTOONE_LEAFLET_PATCHED__) return;

  // Remove computed url getter so explicit URLs below are used
  type IconDefaultProto = { _getIconUrl?: unknown };
  const proto = L.Icon.Default.prototype as unknown as IconDefaultProto;
  delete proto._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: icon2x,
    iconUrl: icon1x,
    shadowUrl: shadow,
    // (optional, but helps some themes)
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });

  globalThis.__AUTOONE_LEAFLET_PATCHED__ = true;
}
