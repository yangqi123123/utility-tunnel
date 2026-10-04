/* 共享底图组件
 * ------------------------------------------------------------------
 * 抽取自「工作台 / 设备监测总览」（web/pages/home/home.html）的地图实现，
 * 供其他页面（应急调度台等）复用同一套在线底图与本地保底底图。
 *
 * 用法：
 *   var base = BASE_MAP.create(mapElement, {
 *     center: [30.4595, 114.4296],   // 初始中心点
 *     zoom: 14,                      // 初始层级
 *     minZoom: 10, maxZoom: 18,
 *     fallbackClass: "is-fallback",  // 底图不可用时加到容器上的类名
 *     note: true,                    // 是否插入"本地保底底图"提示条
 *   });
 *   base.map            // L.Map 实例（底图不可用 / 无 Leaflet 时为 null）
 *   base.tiles          // 瓦片图层
 *   base.isFallback()   // 是否已切到保底底图
 *   base.invalidate()   // invalidateSize
 *   base.destroy()      // 清定时器 + 销毁地图
 *   BASE_MAP.bindTip(marker, "点位名称")   // 统一风格的悬浮名称提示
 *
 * 说明：容器需要自己具备 position:absolute/relative，并且在其 CSS 里为
 * fallbackClass 指定本地保底底图（url("../maps/device-monitor-map.svg")）。
 * ------------------------------------------------------------------ */
(function () {
  var TILE_URL = "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}";
  var DEFAULT_CENTER = [30.4595, 114.4296];
  var TIP_CLASS = "base-map-tip";
  var NOTE_TEXT = "本地保底底图 · 网络可用时自动切换在线地图";

  function addFallback(host, options) {
    if (!host) return;
    host.classList.add(options.fallbackClass || "is-fallback");
    if (options.note === false) return;
    if (host.querySelector(".base-map-note")) return;
    var note = document.createElement("div");
    note.className = "base-map-note";
    note.textContent = options.noteText || NOTE_TEXT;
    host.appendChild(note);
  }

  function stub(host, options) {
    addFallback(host, options);
    return {
      map: null,
      tiles: null,
      host: host || null,
      fallback: true,
      isFallback: function () { return true; },
      invalidate: function () {},
      destroy: function () {},
    };
  }

  function create(host, userOptions) {
    var options = {
      center: DEFAULT_CENTER,
      zoom: 14,
      minZoom: 10,
      maxZoom: 18,
      fallbackClass: "is-fallback",
      attribution: "© 高德地图",
      timeout: 4000,
      errorThreshold: 4,
      note: true,
      noteText: NOTE_TEXT,
      preferCanvas: false,
      zoomControl: false,
    };
    if (userOptions) {
      Object.keys(userOptions).forEach(function (key) {
        if (userOptions[key] !== undefined) options[key] = userOptions[key];
      });
    }
    if (!host || !window.L) return stub(host, options);

    var map = L.map(host, {
      zoomControl: options.zoomControl,
      minZoom: options.minZoom,
      maxZoom: options.maxZoom,
      preferCanvas: options.preferCanvas,
    });
    map.setView(options.center, options.zoom);

    var loaded = 0;
    var failed = 0;
    var settled = false;
    function fallback() {
      if (settled) return;
      settled = true;
      addFallback(host, options);
    }
    var tiles = L.tileLayer(TILE_URL, {
      subdomains: ["1", "2", "3", "4"],
      maxZoom: options.maxZoom,
      attribution: options.attribution,
    });
    tiles.on("tileload", function () { loaded += 1; });
    tiles.on("tileerror", function () {
      failed += 1;
      if (!settled && loaded === 0 && failed >= options.errorThreshold) fallback();
    });
    tiles.addTo(map);
    var timer = window.setTimeout(function () { if (loaded === 0) fallback(); }, options.timeout);

    return {
      map: map,
      tiles: tiles,
      host: host,
      fallback: false,
      isFallback: function () { return settled || host.classList.contains(options.fallbackClass); },
      invalidate: function () { try { map.invalidateSize(); } catch (error) { /* ignore */ } },
      destroy: function () { window.clearTimeout(timer); try { map.remove(); } catch (error) { /* ignore */ } },
    };
  }

  /* 统一风格的悬浮名称提示（与工作台点位一致） */
  function bindTip(layer, text, extra) {
    if (!layer || !text || !layer.bindTooltip) return layer;
    var config = { direction: "top", offset: [0, -14], className: TIP_CLASS, opacity: 1 };
    if (extra) Object.keys(extra).forEach(function (key) { config[key] = extra[key]; });
    layer.bindTooltip(text, config);
    return layer;
  }

  window.BASE_MAP = { create: create, bindTip: bindTip, TILE_URL: TILE_URL, TIP_CLASS: TIP_CLASS, DEFAULT_CENTER: DEFAULT_CENTER };
})();
