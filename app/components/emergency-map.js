(function () {
  const DEFAULT_CONFIG = {
    tileRoot: "../../assets/maps/tianditu",
    baseLayer: "vec",
    annotationLayer: "cva",
    projection: "EPSG:3857",
    center: [31.84318, 117.20342],
    zoom: 15,
  };

  function icon(color, glyph) {
    return L.divIcon({
      className: "emergency-map-marker",
      html: `<span style="--marker-color:${color}">${glyph || ""}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  function markerFor(item, kind) {
    const colors = { event: "#F53F57", personnel: "#135AFA", vehicle: "#135AFA", resource: "#14C9BA", camera: "#9359E3" };
    const glyphs = { event: "!", personnel: "人", vehicle: "车", resource: "物", camera: "视" };
    return L.marker([Number(item.latitude), Number(item.longitude)], { icon: icon(colors[kind] || "#135AFA", glyphs[kind]) });
  }

  function create(element, config = {}) {
    if (!window.L || !element) return { fallback: true, setLayers() {}, focusEvent() {}, startCircleSelect() {}, startPolygonSelect() {}, clearSelection() {}, destroy() {} };
    const options = { ...DEFAULT_CONFIG, ...config };
    const map = L.map(element, { zoomControl: false, preferCanvas: true }).setView(options.center, options.zoom);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const groups = { event: L.layerGroup().addTo(map), personnel: L.layerGroup().addTo(map), vehicle: L.layerGroup().addTo(map), resource: L.layerGroup().addTo(map), camera: L.layerGroup().addTo(map) };
    let selectedLayer = null;
    let fallbackTimer = window.setTimeout(() => element.classList.add("dispatch-map-fallback"), 1800);
    const base = L.tileLayer(`${options.tileRoot}/${options.baseLayer}/{z}/{x}/{y}.png`, { maxZoom: 18, attribution: "天地图离线包" });
    const annotation = L.tileLayer(`${options.tileRoot}/${options.annotationLayer}/{z}/{x}/{y}.png`, { maxZoom: 18, opacity: 0.9 });
    let tileErrors = 0;
    const onTileError = () => { tileErrors += 1; if (tileErrors >= 2) element.classList.add("dispatch-map-fallback"); };
    base.on("tileerror", onTileError); annotation.on("tileerror", onTileError);
    base.addTo(map); annotation.addTo(map);

    function setLayers(data = {}) {
      const sourceKeys = { event: "events", personnel: "personnel", vehicle: "vehicles", resource: "resources", camera: "cameras" };
      Object.keys(groups).forEach((kind) => {
        groups[kind].clearLayers();
        (data[sourceKeys[kind]] || []).forEach((item) => markerFor(item, kind).addTo(groups[kind]));
      });
    }

    function focusEvent(event) { if (event?.latitude && event?.longitude) map.setView([Number(event.latitude), Number(event.longitude)], Math.max(map.getZoom(), 16)); }
    function startSelect(shape, onComplete) {
      clearSelection();
      element.classList.add("is-selecting");
      const finish = (latlng) => {
        element.classList.remove("is-selecting");
        const handler = shape === "circle" ? new L.Circle(latlng, 160, { color: "#135AFA", fillOpacity: 0.08 }).addTo(map) : new L.Polygon([[latlng.lat + 0.001, latlng.lng - 0.001], [latlng.lat + 0.001, latlng.lng + 0.001], [latlng.lat - 0.001, latlng.lng + 0.001], [latlng.lat - 0.001, latlng.lng - 0.001]], { color: "#135AFA", fillOpacity: 0.08 }).addTo(map);
        selectedLayer = handler;
        onComplete?.({ type: shape, bounds: handler.getBounds(), center: handler.getBounds().getCenter() });
        return handler;
      };
      const onClick = (event) => { map.off("click", onClick); finish(event.latlng); };
      map.on("click", onClick);
      return { cancel: () => { map.off("click", onClick); element.classList.remove("is-selecting"); } };
    }
    function clearSelection() { if (selectedLayer) { map.removeLayer(selectedLayer); selectedLayer = null; } }
    function destroy() { window.clearTimeout(fallbackTimer); map.remove(); }
    return { map, fallback: false, setLayers, focusEvent, startCircleSelect: (cb) => startSelect("circle", cb), startPolygonSelect: (cb) => startSelect("polygon", cb), clearSelection, destroy };
  }

  window.EMERGENCY_MAP = { create };
})();
