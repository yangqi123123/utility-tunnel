/* =========================================================
   未来一路综合管廊管理平台 · 大屏高保真原型 · 公共脚本
   画布 3840×2160，等比自适应
   ========================================================= */
(function (G) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const S = (t, a) => { const e = document.createElementNS('http://www.w3.org/2000/svg', t); for (const k in a) e.setAttribute(k, a[k]); return e; };

  /* ---------------- 适配 ---------------- */
  function fit() {
    const st = $('stage'); if (!st) return;
    const f = () => { const s = Math.min(innerWidth / 3840, innerHeight / 2160); st.style.transform = 'scale(' + s + ')'; };
    addEventListener('resize', f); f();
  }

  /* ---------------- 时钟 ---------------- */
  const WK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  function clock() {
    const c = $('clk'), d = $('dat'); if (!c) return;
    const t = () => {
      const n = new Date(), p = (x) => String(x).padStart(2, '0');
      c.textContent = [n.getHours(), n.getMinutes(), n.getSeconds()].map(p).join(':');
      if (d) d.textContent = n.getFullYear() + '-' + p(n.getMonth() + 1) + '-' + p(n.getDate()) + ' ' + WK[n.getDay()];
    };
    t(); setInterval(t, 1000);
  }

  /* ---------------- 顶栏 ---------------- */
  /* 图标一律引用页面内的 sprite（.build/icons.py 生成），此处只写符号名 */
  const SI = (n, c) => `<svg class="si${c ? ' ' + c : ''}"><use href="#i-${n}"/></svg>`;
  const MENU = [
    ['系统首页', 'Index System', 'home', 'S1-系统首页.html'],
    ['环境监控', 'Environment', 'temp', 'S2-环境监控.html'],
    ['消防监控', 'Fire Monitoring', 'fire', 'S3-消防监控.html'],
    ['安防监控', 'Security', 'shield', 'S4-安防监控.html'],
    ['通信广播', 'Communication', 'speaker', 'S5-通信广播.html'],
    ['电力监控', 'Power', 'elec', 'S6-电力监控.html'],
    ['巡检维保', 'Patrol & Maint.', 'clipbrd', 'S7-巡检维保.html'],
    ['应急指挥', 'Emergency', 'alarmlt', 'S8-应急指挥.html'],
    ['统计分析', 'Statistics', 'chart', 'S9-统计分析.html'],
    ['设备监测', 'Devices', 'device', 'S10-设备监测.html']
  ];
  function nav(active) {
    const m = $('menu'); if (!m) return;
    m.innerHTML = MENU.map((x, i) => `<a class="mi${i === active ? ' on' : ''}" href="${x[3]}">
      <div class="ic">${SI(x[2])}</div>
      <div class="tt"><b>${x[0]}</b><i>${x[1]}</i></div></a>`).join('');
  }

  /* ---------------- 报警弹框 ---------------- */
  function popup(autoHideMs) {
    const m = $('mask'); if (!m) return;
    const hide = () => m.classList.add('hide');
    ['close', 'close2', 'ack'].forEach(id => { const e = $(id); if (e) e.addEventListener('click', hide); });
    m.addEventListener('click', e => { if (e.target === m) hide(); });
    const r = $('reopen'); if (r) r.addEventListener('click', () => m.classList.remove('hide'));
    addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    if (autoHideMs) setTimeout(hide, autoHideMs);
  }

  /* ---------------- GIS 底板：拖动平移 / 滚轮缩放 / 双击复位 ----------------
     画布整体做了 scale 适配，鼠标位移需换算回 3840 坐标系 */
  function pan(el) {
    el = el || $('base'); if (!el) return;
    const stage = $('stage');
    const sc = () => (stage ? stage.getBoundingClientRect().width / 3840 : 1) || 1;
    let k = 1, x = 0, y = 0, drag = false, sx = 0, sy = 0, ox = 0, oy = 0;
    const tg = () => el.firstElementChild;
    const rb = $('mapReset');
    const apply = () => {
      const t = tg(); if (!t) return;
      t.style.transformOrigin = '0 0';
      t.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + k.toFixed(3) + ')';
      /* 视图一旦偏离原位就点亮复位按钮，避免误拖后回不去 */
      if (rb) rb.classList.toggle('on', Math.abs(k - 1) > 0.001 || Math.abs(x) > 1 || Math.abs(y) > 1);
    };
    el.style.cursor = 'grab';
    el.style.userSelect = 'none';

    el.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      drag = true; sx = e.clientX; sy = e.clientY; ox = x; oy = y;
      el.style.cursor = 'grabbing'; e.preventDefault();
    });
    addEventListener('mousemove', e => {
      if (!drag) return;
      const s = sc();
      x = ox + (e.clientX - sx) / s; y = oy + (e.clientY - sy) / s; apply();
    });
    addEventListener('mouseup', () => { if (!drag) return; drag = false; el.style.cursor = 'grab'; });

    el.addEventListener('wheel', e => {
      e.preventDefault();
      const r = el.getBoundingClientRect(), s = sc();
      const mx = (e.clientX - r.left) / s, my = (e.clientY - r.top) / s;
      const nk = Math.min(6, Math.max(0.5, k * (e.deltaY < 0 ? 1.14 : 1 / 1.14)));
      x = mx - (mx - x) * nk / k; y = my - (my - y) * nk / k; k = nk; apply();
    }, { passive: false });

    el.addEventListener('dblclick', () => { k = 1; x = 0; y = 0; apply(); });

    if (rb) rb.addEventListener('click', e => { e.stopPropagation(); k = 1; x = 0; y = 0; apply(); });
  }

  /* ---------------- 浮栏收起 ---------------- */
  function railToggle() {
    const b = $('toggleRail'); if (!b) return;
    let on = true;
    b.onclick = () => {
      on = !on;
      document.querySelectorAll('.rail').forEach(r => {
        r.style.transition = 'opacity .3s'; r.style.opacity = on ? '1' : '0'; r.style.pointerEvents = on ? 'auto' : 'none';
      });
      const mn = document.querySelector('.main');
      if (mn) mn.style.gridTemplateColumns = on ? '984px 1fr 984px' : '0px 1fr 0px';
    };
  }

  /* =========================================================
     GIS 底板：管廊全线一张图（S1/S3/S4/S5/S7/S8/S9 复用）
     opts.points  : [[t, kind, label]]  t=0~1 沿线位置
     opts.alarms  : [[t, text]]
     opts.zones   : {index:'a'|'w'|'o'}  防火分区着色
     opts.title   : 底部标题
     opts.sub     : 副标题
     opts.legend  : [[color,text]] 舱室图例
     opts.track   : [t0,t1] 巡检轨迹区间
     ========================================================= */
  /* 底板点位类型：c 颜色 / i 图标(sprite) / n 中文名 / p 接入协议 / u 实时量纲 */
  const KIND = {
    cam:  { c: '#3FE3FF', i: 'camera',  n: '摄像机',        p: 'GB/T 28181', u: '' },
    env:  { c: '#20E08C', i: 'temp',    n: '环境监测点',    p: 'OPC DA',     u: '温湿度 / 气体' },
    lid:  { c: '#8FB4D6', i: 'manhole', n: '智能井盖',      p: 'Modbus',     u: '倾角 / 位移' },
    gate: { c: '#FFD85E', i: 'lock',    n: '出入口门禁',    p: 'GB/T 28181', u: '刷卡 / 开门' },
    vent: { c: '#A77BFF', i: 'fan',     n: '通风口 / 风机', p: 'OPC DA',     u: '转速 / 风量' },
    fire: { c: '#FF4D5E', i: 'smoke',   n: '感烟探测器',    p: 'OPC DA',     u: '烟雾浓度' },
    hyd:  { c: '#FF8A3D', i: 'hydrant', n: '消火栓',        p: 'OPC DA',     u: '压力' },
    door: { c: '#7FD4FF', i: 'door',    n: '防火门',        p: 'OPC DA',     u: '闭合状态' },
    tel:  { c: '#3FE3FF', i: 'phone',   n: '应急电话分机',  p: 'SIP 2.0',    u: '摘挂机' },
    bcast:{ c: '#FFD85E', i: 'speaker', n: '广播终端',      p: 'SIP 2.0',    u: '音量' },
    led:  { c: '#A77BFF', i: 'board',   n: 'LED 信息屏',    p: 'TCP 私有',   u: '发布内容' },
    pt:   { c: '#20E08C', i: 'map',     n: '电子巡查点',    p: 'SDK',        u: '打卡记录' },
    pwr:  { c: '#FFA63D', i: 'bolt',    n: '配电箱',        p: 'OPC DA',     u: '电流 / 电压' },
    pump: { c: '#3FE3FF', i: 'pump',    n: '排水泵',        p: 'OPC DA',     u: '运行 / 液位' },
    ext:  { c: '#FF8A3D', i: 'extg',    n: '灭火器',        p: '台账',       u: '有效期' },
    lamp: { c: '#FFD85E', i: 'light',   n: '应急照明',      p: 'OPC DA',     u: '回路状态' }
  };

  function corridorMap(el, o) {
    o = o || {};
    const A = { x: 250, y: 1035 }, B = { x: 3560, y: 952 }, N = 21;
    const px = t => A.x + (B.x - A.x) * t, py = t => A.y + (B.y - A.y) * t;
    const zones = o.zones || {};
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    let fz = '';
    for (let i = 0; i < N; i++) {
      const a = i / N, b = (i + 1) / N, st = zones[i];
      const col = { w: 'rgba(255,166,61,.85)', a: 'rgba(255,77,94,.95)', o: 'rgba(70,100,135,.8)', g: 'rgba(32,224,140,.75)' }[st];
      if (col) fz += `<path d="M${px(a)} ${py(a)} L${px(b)} ${py(b)}" stroke="${col}" stroke-width="15" stroke-linecap="round" filter="url(#glowS)"/>`;
      fz += `<path d="M${px(a)} ${py(a) - 26} L${px(a)} ${py(a) + 26}" stroke="rgba(120,180,225,.30)" stroke-width="2"/>`;
    }

    // 巡检轨迹
    let tk = '';
    if (o.track) {
      const [t0, t1] = o.track;
      tk = `<path d="M${px(t0)} ${py(t0)} L${px(t1)} ${py(t1)}" stroke="rgba(32,224,140,.85)" stroke-width="11"
        stroke-linecap="round" filter="url(#glowS)" opacity=".9"/>
        <g transform="translate(${px(t1)},${py(t1) - 62})">
          <circle r="17" fill="none" stroke="rgba(32,224,140,.9)" stroke-width="3">
            <animate attributeName="r" values="17;46" dur="1.9s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".9;0" dur="1.9s" repeatCount="indefinite"/></circle>
          <path d="M0 62 L0 18" stroke="rgba(32,224,140,.7)" stroke-width="2.5"/>
          <circle r="21" fill="rgba(6,40,28,.94)" stroke="#20E08C" stroke-width="2.6" filter="url(#glowS)"/>
          <g transform="translate(-10,-10) scale(.86)"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M5 21c0-4 3-6 7-6s7 2 7 6"
            fill="none" stroke="#9BF3CE" stroke-width="2"/></g>
          <g transform="translate(30,-14)"><rect x="0" y="-20" width="228" height="40" rx="3"
            fill="rgba(6,40,28,.9)" stroke="rgba(32,224,140,.7)" stroke-width="1.4"/>
            <text x="14" y="6" font-size="21" fill="#9BF3CE">${esc(o.trackLabel || '巡检人员 · 张建国')}</text></g></g>`;
    }

    // 点位（语义图标 · 可按图层过滤 · 可点击看详情）
    let ph = '';
    (o.points || []).forEach(([t, k, lb], idx) => {
      const X = px(t), Y = py(t) - 60, K = KIND[k] || KIND.pt;
      const zi = Math.min(N - 1, Math.floor(t * N));
      ph += `<g class="mpt" data-k="${k}" data-lb="${esc(lb || K.n)}" data-t="${t.toFixed(4)}" data-i="${idx}">
        <g transform="translate(${X},${Y})">
        <path d="M0 60 L0 18" stroke="rgba(120,180,225,.42)" stroke-width="2"/>
        <circle class="hit" cx="0" cy="0" r="26" fill="transparent"/>
        <circle class="bg" cx="0" cy="0" r="21" fill="rgba(6,22,48,.88)" stroke="${K.c}" stroke-width="2"/>
        <use href="#i-${K.i}" x="-13" y="-13" width="26" height="26"
          fill="none" stroke="${K.c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        ${lb ? `<text x="0" y="-34" font-size="19" fill="#7FB6DC" text-anchor="middle">${esc(lb)}</text>` : ''}
        </g></g>`;
    });

    // 报警点
    let ah = '';
    (o.alarms || []).forEach(([t, txt, col]) => {
      const c = col || '#FF4D5E', X = px(t), Y = py(t) - 60;
      const w = 30 + String(txt).length * 21;
      ah += `<g class="mpt" data-k="alarm" data-lb="${esc(txt)}" data-t="${t.toFixed(4)}">
        <g transform="translate(${X},${Y})">
        <circle class="hit" r="30" fill="transparent"/>
        <circle r="20" fill="none" stroke="${c}" stroke-width="3" opacity=".85">
          <animate attributeName="r" values="20;58" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".9;0" dur="1.8s" repeatCount="indefinite"/></circle>
        <circle r="20" fill="none" stroke="${c}" stroke-width="3" opacity=".7">
          <animate attributeName="r" values="20;58" dur="1.8s" begin=".9s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".9;0" dur="1.8s" begin=".9s" repeatCount="indefinite"/></circle>
        <path d="M0 60 L0 20" stroke="${c}" stroke-width="2.5" opacity=".75"/>
        <circle r="23" fill="rgba(60,8,18,.94)" stroke="${c}" stroke-width="2.6" filter="url(#glowS)"/>
        <g transform="translate(-11,-11)"><path d="M12 3a6 6 0 0 0-6 6c0 4-2 5-2 6h16c0-1-2-2-2-6a6 6 0 0 0-6-6z"
          fill="none" stroke="#FFB3BB" stroke-width="1.8" transform="scale(.92)"/></g>
        <g transform="translate(34,-16)"><rect x="0" y="-22" width="${w}" height="44" rx="3"
          fill="rgba(60,10,20,.92)" stroke="${c}" stroke-width="1.5"/>
          <text x="15" y="6" font-size="22" fill="#FFC8CE">${esc(txt)}</text></g></g></g>`;
    });

    // 入廊管线示意（沿管廊的四条管线，默认由图层开关控制显隐）
    const PIPE = [[-34, '#3FE3FF', '给水 DN200'], [-16, '#20E08C', '再生水 DN150'],
                  [16, '#FFA63D', '电力 10kV'], [34, '#FFD85E', '燃气 de110']];
    let pph = '<g class="mlayer" data-k="pipe">';
    PIPE.forEach(([dy, c, nm], i) => {
      pph += `<path d="M${A.x + 40} ${A.y + dy} L${B.x - 40} ${B.y + dy}" stroke="${c}" stroke-width="4"
        fill="none" opacity=".55" stroke-dasharray="${i % 2 ? '18 10' : ''}"/>
        <text x="${A.x + 60}" y="${A.y + dy - 8}" font-size="17" fill="${c}" opacity=".85">${nm}</text>`;
    });
    pph += '</g>';

    // 里程
    let mh = '';
    for (let i = 0; i <= 6; i++) { const t = i / 6; mh += `<text x="${px(t)}" y="${py(t) + 56}" text-anchor="middle">K${i}+${String(i * 350 % 1000).padStart(3, '0')}</text>`; }

    // 图例：色块表示舱室；给了 kind 的用设备图标，作为点位图示
    const lg = o.legend || [['#3FE3FF', '综合舱　2 个防火分区'], ['#FFA63D', '电力舱　2 个防火分区'], ['#A77BFF', '燃气舱 / 水信舱　3 个']];
    const LW = o.legendW || 360, LH = 54 + lg.length * 42;
    let lgh = `<rect x="0" y="0" width="${LW}" height="${LH}" rx="3" fill="rgba(6,20,46,.74)" stroke="rgba(64,158,255,.30)"/>
      <text x="20" y="38" font-size="23" fill="#7FB6DC" letter-spacing="2">${esc(o.legendTitle || '舱室构成')}</text><g font-size="21" fill="#A8CCE8">`;
    lg.forEach(([c, t, k], i) => {
      const y = 62 + i * 42;
      if (k && KIND[k]) lgh += `<use href="#i-${KIND[k].i}" x="20" y="${y}" width="27" height="27"
        fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
      else lgh += `<rect x="24" y="${y + 6}" width="16" height="16" fill="${c}"/>`;
      lgh += `<text x="58" y="${y + 21}">${esc(t)}</text>`;
    });
    lgh += '</g>';

    // 路名
    const V = [['科学岛南路', 1012, 150], ['科学岛北路', 2332, 150]];
    const H = [['高新七路', 1100, 432], ['科学大道', 1100, 1524]];
    let rd = '';
    V.forEach(([t, x, y]) => { rd += `<text x="${x}" y="${y}" text-anchor="middle">` + [...t].map((c, i) => `<tspan x="${x}" dy="${i ? 30 : 0}">${c}</tspan>`).join('') + '</text>'; });
    H.forEach(([t, x, y]) => { rd += `<text x="${x}" y="${y}">${t}</text>`; });

    el.innerHTML = `<svg viewBox="0 0 3780 2010" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gCor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#1E8FD6"/><stop offset=".5" stop-color="#3FE3FF"/><stop offset="1" stop-color="#1E8FD6"/></linearGradient>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glowS" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <pattern id="grid" width="90" height="90" patternUnits="userSpaceOnUse">
          <path d="M90 0H0v90" fill="none" stroke="rgba(70,140,210,.10)" stroke-width="1"/></pattern>
      </defs>
      <rect width="3780" height="2010" fill="url(#grid)"/>
      <g fill="rgba(22,56,100,.10)" stroke="rgba(70,150,220,.12)" stroke-width="1.5">
        <path d="M180 240 L980 150 L1120 640 L300 760 Z"/><path d="M1260 130 L2180 90 L2260 520 L1340 590 Z"/>
        <path d="M2420 180 L3320 250 L3280 700 L2400 620 Z"/><path d="M250 1200 L1080 1120 L1180 1640 L340 1740 Z"/>
        <path d="M1420 1180 L2300 1140 L2360 1660 L1480 1700 Z"/><path d="M2600 1120 L3420 1180 L3380 1700 L2560 1640 Z"/>
      </g>
      <g stroke="rgba(80,140,195,.10)" stroke-width="20" fill="none">
        <path d="M980 60 L1080 1950"/><path d="M2300 60 L2380 1950"/><path d="M120 470 L3660 400"/><path d="M120 1560 L3660 1490"/></g>
      <g stroke="rgba(80,140,195,.07)" stroke-width="10" fill="none">
        <path d="M560 60 L640 1950"/><path d="M1620 60 L1700 1950"/><path d="M2900 60 L2980 1950"/>
        <path d="M120 180 L3660 120"/><path d="M120 1840 L3660 1780"/></g>
      <path d="M120 1780 C700 1700 1200 1860 1800 1760 S3100 1600 3700 1690" fill="none"
        stroke="rgba(40,120,170,.16)" stroke-width="34" stroke-linecap="round"/>
      <g filter="url(#glow)"><path d="M${A.x} ${A.y} L${B.x} ${B.y}" stroke="url(#gCor)" stroke-width="13" fill="none" stroke-linecap="round" opacity=".95"/></g>
      <path d="M${A.x} ${A.y} L${B.x} ${B.y}" stroke="rgba(255,255,255,.55)" stroke-width="2.5" fill="none" stroke-dasharray="26 20">
        <animate attributeName="stroke-dashoffset" from="92" to="0" dur="2.6s" repeatCount="indefinite"/></path>
      <g class="mlayer" data-k="zone">${fz}</g>${pph}
      <g class="mlayer" data-k="track">${tk}</g><g>${ph}</g><g>${ah}</g>
      <g font-size="21" fill="#4E7EA8" font-family="ui-monospace,Menlo,monospace">${mh}</g>
      <g font-size="23" fill="#3D6A92" letter-spacing="3">${rd}</g>
      <g transform="translate(1080,210)">${lgh}</g>
      <g transform="translate(2330,1560)" stroke="#4E7EA8" fill="#4E7EA8" font-size="20">
        <path d="M0 0 H300" stroke-width="2.5" fill="none"/><path d="M0 -9 V9 M150 -6 V6 M300 -9 V9" stroke-width="2.5" fill="none"/>
        <text x="0" y="32" stroke="none">0</text><text x="258" y="32" stroke="none">500 m</text></g>
      <text x="1080" y="1176" font-size="26" fill="#7FC9EE" letter-spacing="3">${esc(o.title || '未来一路综合管廊（科学岛南路—科学岛北路）')}</text>
      <text x="1080" y="1212" font-size="21" fill="#4E7EA8" letter-spacing="2">${esc(o.sub || '全长约 2.1 km　·　21 个防火分区　·　4 个舱室')}</text>
    </svg>`;
    bindLayers(el); bindPoints(el);
  }

  /* ---------------- 图层勾选 → 控制底板分组显隐 ---------------- */
  function bindLayers(scope) {
    const box = document.querySelector('.layers'); if (!box) return;
    const labs = [...box.querySelectorAll('label[data-k]')];
    const sync = () => {
      const want = {};
      labs.forEach(l => {
        const k = l.dataset.k;
        want[k] = (want[k] || false) || l.classList.contains('on');
      });
      Object.keys(want).forEach(k => {
        scope.querySelectorAll('[data-k="' + k + '"]').forEach(g => { g.style.display = want[k] ? '' : 'none'; });
      });
    };
    labs.forEach(l => {
      if (l.dataset.bound) return;
      l.dataset.bound = '1';
      l.addEventListener('click', () => { l.classList.toggle('on'); sync(); });
    });
    /* 没挂图层键的项也能勾选（纯视觉主题项） */
    box.querySelectorAll('label:not([data-k])').forEach(l => {
      if (l.dataset.bound) return;
      l.dataset.bound = '1';
      l.addEventListener('click', () => l.classList.toggle('on'));
    });
    sync();
  }

  /* ---------------- 点击底板设备 → 详情弹窗 ---------------- */
  const CABIN = [['综合舱', 'C01'], ['综合舱', 'C02'], ['电力舱', 'C03'], ['燃气舱', 'C04'], ['水信舱', 'C05']];
  function mileage(t) {
    const m = Math.round(t * 2100);
    return 'K' + Math.floor(m / 1000) + '+' + String(m % 1000).padStart(3, '0');
  }
  function bindPoints(scope) {
    scope.querySelectorAll('.mpt').forEach(g => {
      if (g.dataset.bound) return;
      g.dataset.bound = '1';
      g.style.cursor = 'pointer';
      g.addEventListener('click', e => {
        e.stopPropagation();
        devpop(g.dataset.k, g.dataset.lb, parseFloat(g.dataset.t) || 0, +(g.dataset.i || 0));
      });
    });
  }

  let DP = null;
  function devpop(kind, label, t, seq) {
    const K = KIND[kind] || { c: '#FF4D5E', i: 'warn', n: '报警点位', p: '—', u: '' };
    const zi = Math.max(0, Math.min(20, Math.floor(t * 21)));
    const cb = CABIN[zi % CABIN.length];
    const fz = 'F0' + String(Math.floor(zi / 5) + 1) + String(zi % 5 + 1).padStart(2, '0');
    const code = 'WLYL-' + cb[1] + '-' + fz + '-' + kind.toUpperCase() + String(seq + 1).padStart(2, '0');
    const alarm = kind === 'alarm';

    if (!DP) {
      DP = document.createElement('div');
      DP.className = 'dmask hide'; DP.id = 'dmask';
      DP.innerHTML = `<div class="dbox">
        <div class="dh"><span class="di"></span><h3></h3><span class="sub"></span>
          <span class="rt"><span class="pill grn st"></span><span class="x">✕</span></span></div>
        <div class="db"><div class="dl"></div><div class="dr"></div></div>
        <div class="df"><button class="b1"></button><button>历史曲线</button>
          <button>设备台账</button><button class="cl">关 闭</button></div></div>`;
      (document.getElementById('stage') || document.body).appendChild(DP);
      const close = () => { DP.classList.add('hide'); const v = DP.querySelector('video'); if (v) v.pause(); };
      DP.addEventListener('click', e => { if (e.target === DP) close(); });
      DP.querySelector('.x').addEventListener('click', close);
      DP.querySelector('.cl').addEventListener('click', close);
      addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }

    DP.querySelector('.di').innerHTML = SI(K.i);
    DP.querySelector('.di').style.color = K.c;
    /* 没有自带名称的点位用「类型 + 序号」，副标题给位置而不是重复类型 */
    const title = (label && label !== K.n) ? label : (K.n + ' ' + String(seq + 1).padStart(2, '0') + ' 号');
    DP.querySelector('.dh h3').textContent = title;
    DP.querySelector('.dh .sub').textContent = '/ ' + cb[0] + ' · ' + fz + ' 防火分区 · ' + mileage(t);
    const st = DP.querySelector('.st');
    st.className = 'pill st ' + (alarm ? 'red' : 'grn');
    st.textContent = alarm ? '报警中 · 未闭环' : '在线 · 正常';
    DP.querySelector('.b1').textContent = kind === 'cam' ? '实时视频' : '实时数据';

    const F = [
      ['设备编号', code], ['设备类型', K.n], ['所在舱室', cb[0] + ' · ' + fz + ' 防火分区'],
      ['里程桩号', mileage(t)], ['接入协议', K.p], ['监测量', K.u || '—'],
      ['安装日期', '2026-0' + (seq % 8 + 1) + '-1' + (seq % 9)],
      ['最近心跳', new Date().toTimeString().slice(0, 8) + '　（3 秒前）']
    ];
    DP.querySelector('.dl').innerHTML = F.map(([k, v]) =>
      `<div class="f"><span>${k}</span><b>${v}</b></div>`).join('');

    let right;
    if (kind === 'cam') {
      right = `<div class="dv"><video src="assets/video/cam${seq % 4 + 1}.mp4" autoplay muted loop playsinline></video>
        <div class="vscan"></div><div class="osd tl">${title}</div><div class="osd br">主码流 · 已录像</div></div>
        <div class="dnote">点击「实时视频」可放大查看 · 支持云台控制与抓拍</div>`;
    } else {
      const vals = {
        env:  [['温度', '26.4', '℃'], ['湿度', '78', '%'], ['氧气', '19.8', '%'], ['甲烷', '42', '%LEL']],
        vent: [['运行状态', '运行', ''], ['转速', '1420', 'r/min'], ['风量', '18600', 'm³/h'], ['累计运行', '42', 'min']],
        pwr:  [['电流', '206', 'A'], ['电压', '398', 'V'], ['有功', '19.2', 'kW'], ['功率因数', '0.94', '']],
        lid:  [['盖体状态', '闭合', ''], ['倾角', '0.4', '°'], ['电池', '86', '%'], ['信号', '-71', 'dBm']],
        hyd:  [['压力', '0.42', 'MPa'], ['状态', '正常', ''], ['上次巡检', '09-08', ''], ['有效期', '2027-03', '']],
        door: [['闭合状态', '闭合', ''], ['联动', '已投入', ''], ['开启次数', '12', '次/月'], ['上次动作', '08:22', '']],
        fire: [['烟雾浓度', '0.02', '%/m'], ['温度', '32.4', '℃'], ['状态', '正常', ''], ['屏蔽', '否', '']],
        alarm:[['触发值', '42', '%LEL'], ['阈值', '40', '%LEL'], ['已持续', '00:08:42', ''], ['等级', '三级紧急', '']]
      }[kind] || [['在线状态', '在线', ''], ['通信质量', '优', ''], ['今日事件', '0', '次'], ['累计运行', '186', '天']];
      right = `<div class="dgrid">${vals.map(([n, v, u]) =>
        `<div class="dq"><span class="n">${n}</span><b>${v}<i>${u}</i></b></div>`).join('')}</div>
        <div class="dtr"><div class="t">近 30 分钟趋势</div><svg viewBox="0 0 520 190" id="dsp"></svg></div>`;
    }
    DP.querySelector('.dr').innerHTML = right;
    DP.classList.remove('hide');
    const sp = DP.querySelector('#dsp');
    if (sp) {
      const base = alarm ? 26 : 50, arr = [];
      for (let i = 0; i < 24; i++) arr.push(base + Math.round(Math.sin(i / 3 + seq) * 9 + (alarm ? i * 0.8 : 0) + (i % 3)));
      spark(sp, arr, Math.max(...arr) + 8, alarm ? 40 : null, alarm ? '#FF4D5E' : K.c);
    }
    const vv = DP.querySelector('video'); if (vv) vv.play().catch(() => {});
  }

  /* ---------------- 全线态势带 ---------------- */
  function band(elSegs, elTicks, zones) {
    let h = ''; for (let i = 0; i < 21; i++) h += `<i class="${zones[i] || ''}"></i>`;
    elSegs.innerHTML = h;
    if (elTicks) { let t = ''; for (let i = 0; i <= 6; i++) t += `<span>K${i}+${String(i * 350 % 1000).padStart(3, '0')}</span>`; elTicks.innerHTML = t; }
  }

  /* ---------------- 图表helpers ---------------- */
  function ring(el, list) {
    el.innerHTML = list.map(([n, tot, run, flt]) => {
      const p = tot ? run / tot : 0, R = 70, C = 2 * Math.PI * R, col = flt ? '#FFA63D' : '#20E08C';
      return `<div class="ring"><div class="g"><svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="${R}" fill="none" stroke="rgba(40,70,105,.65)" stroke-width="14"/>
        <circle cx="80" cy="80" r="${R}" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round"
          stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" style="filter:drop-shadow(0 0 7px ${col})"/></svg>
        <div class="c"><b>${run}</b><i>/ ${tot} 台</i></div></div>
        <div class="nm">${n}</div><div class="st"><s>运行 ${run}</s>${flt ? `<s class="f">故障 ${flt}</s>` : ''}</div></div>`;
    }).join('');
  }

  function donut(el, seg, total, R) {
    const vb = (el.getAttribute('viewBox') || '0 0 230 230').trim().split(/[\s,]+/);
    const cx = (+vb[2]) / 2, cy = (+vb[3]) / 2;
    R = R || 92; const W = Math.max(18, Math.round(R * 0.24));
    const C = 2 * Math.PI * R; let off = 0;
    let h = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(40,70,105,.55)" stroke-width="${W}"/>`;
    seg.forEach(([v, c]) => {
      const l = C * v / total;
      h += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${c}" stroke-width="${W}"
        stroke-dasharray="${(l - 4).toFixed(1)} ${(C - l + 4).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}"
        transform="rotate(-90 ${cx} ${cy})" style="filter:drop-shadow(0 0 6px ${c})"/>`; off += l;
    });
    el.innerHTML = h;
  }

  function bars24(el, V, lineColor) {
    const W = 460, H = 200, bw = W / V.length, mx = Math.max(...V, 1);
    let b = '', ln = '';
    V.forEach((v, i) => {
      const bh = v / mx * (H - 42), x = i * bw + 3, y = H - 22 - bh;
      b += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw - 6).toFixed(1)}" height="${bh.toFixed(1)}" rx="2" fill="url(#bgx)"/>`;
      ln += `${i ? 'L' : 'M'}${(x + (bw - 6) / 2).toFixed(1)} ${y.toFixed(1)}`;
    });
    el.innerHTML = `<defs><linearGradient id="bgx" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3FE3FF" stop-opacity=".92"/><stop offset="1" stop-color="#1E6FB0" stop-opacity=".22"/></linearGradient></defs>
      <line x1="0" y1="${H - 22}" x2="${W}" y2="${H - 22}" stroke="rgba(90,140,190,.32)" stroke-width="1.5"/>${b}
      <path d="${ln}" fill="none" stroke="${lineColor || '#FFD85E'}" stroke-width="2.4" stroke-linejoin="round" opacity=".9"/>
      <text x="0" y="${H - 4}" font-size="15" fill="#4C6A8C">00:00</text>
      <text x="${W / 2 - 24}" y="${H - 4}" font-size="15" fill="#4C6A8C">12:00</text>
      <text x="${W - 42}" y="${H - 4}" font-size="15" fill="#4C6A8C">24:00</text>`;
  }

  function spark(el, V, mx, thr, col) {
    col = col || '#FF4D5E'; const W = 300, H = 132;
    let d = '', a = '';
    V.forEach((v, i) => { const x = i / (V.length - 1) * W, y = H - 8 - (v / mx) * (H - 26); d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; a += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; });
    a += `L${W} ${H - 8} L0 ${H - 8} Z`;
    const ty = H - 8 - (thr / mx) * (H - 26);
    el.innerHTML = `<defs><linearGradient id="sgx" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${col}" stop-opacity=".55"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
      ${thr ? `<line x1="0" y1="${ty.toFixed(1)}" x2="${W}" y2="${ty.toFixed(1)}" stroke="rgba(255,166,61,.7)" stroke-width="1.6" stroke-dasharray="6 5"/>
      <text x="4" y="${(ty - 7).toFixed(1)}" font-size="13" fill="#FFA63D">阈值 ${thr}</text>` : ''}
      <path d="${a}" fill="url(#sgx)"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="${W}" cy="${(H - 8 - (V[V.length - 1] / mx) * (H - 26)).toFixed(1)}" r="5" fill="${col}" stroke="#fff" stroke-width="2"/>`;
  }

  function line(el, series, opt) {
    opt = opt || {}; const W = opt.w || 600, H = opt.h || 260, P = 34, mx = opt.max || 100, mn = opt.min || 0;
    const X = i => P + (W - P - 10) * i / (series[0].v.length - 1);
    const Y = v => H - 26 - (H - 56) * (v - mn) / (mx - mn);
    let g = '';
    for (let i = 0; i <= 4; i++) { const y = 18 + (H - 44) * i / 4; g += `<line x1="${P}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="rgba(90,140,190,.16)" stroke-width="1"/>`; }
    for (let i = 0; i <= 4; i++) { const v = mx - (mx - mn) * i / 4; g += `<text x="${P - 8}" y="${18 + (H - 44) * i / 4 + 6}" font-size="15" fill="#4C6A8C" text-anchor="end">${Math.round(v)}</text>`; }
    series.forEach(s => {
      let d = ''; s.v.forEach((v, i) => d += `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`);
      g += `<path d="${d}" fill="none" stroke="${s.c}" stroke-width="2.6" stroke-linejoin="round" style="filter:drop-shadow(0 0 5px ${s.c}66)"/>`;
    });
    (opt.labels || []).forEach((t, i) => { g += `<text x="${X(i * (series[0].v.length - 1) / (opt.labels.length - 1)).toFixed(1)}" y="${H - 4}" font-size="15" fill="#4C6A8C" text-anchor="middle">${t}</text>`; });
    el.innerHTML = g;
  }

  function barlist(el, rows) {
    const mx = Math.max(...rows.map(r => r[1]), 1);
    el.innerHTML = rows.map(([n, v, c]) => `<div class="b"><span class="n">${n}</span>
      <span class="t"><i style="width:${(v / mx * 100).toFixed(1)}%;background:linear-gradient(90deg,${c}44,${c})"></i></span>
      <span class="v">${v}</span></div>`).join('');
  }

  /* 视频窗：[点位名, 时间戳, 视频文件?]
     给了视频就本地 <video> 静音循环播放；没给则退回线框占位 */
  function vids(el, list) {
    el.innerHTML = list.map(([n, t, src], i) => {
      const ph = `<div class="scan"></div>
      <svg class="gl" viewBox="0 0 300 170" preserveAspectRatio="none">
        <path d="M0 120 L300 96 M0 150 L300 126" stroke="rgba(120,190,255,.22)" stroke-width="2" fill="none"/>
        <path d="M40 20 L40 170 M260 20 L260 170" stroke="rgba(120,190,255,.16)" stroke-width="2"/>
        <path d="M0 60 L300 44" stroke="rgba(120,190,255,.14)" stroke-width="14"/>
        ${!src && i === 1 ? '<circle cx="150" cy="96" r="16" fill="rgba(255,77,94,.35)" stroke="#FF4D5E" stroke-width="2"/>' : ''}
      </svg>`;
      const vd = src ? `<video class="bv" src="${src}" autoplay muted loop playsinline preload="auto"></video>` : '';
      const zm = src ? `<div class="vhov"><span class="ic">${SI('expand')}</span><em>点击放大播放</em></div>` : '';
      return `<div class="vd${src ? ' has' : ''}">${ph}${vd}
        <div class="lb">${SI('camera')}${n}</div><div class="live">LIVE</div>
        <div class="bt">${t}</div>${zm}</div>`;
    }).join('');
    /* 四格错开起播，避免画面同步 */
    el.querySelectorAll('video').forEach((v, i) => {
      const seek = () => { try { v.currentTime = (v.duration || 8) * (i * 0.23 % 1); } catch (e) {} };
      if (v.readyState >= 1) seek(); else v.addEventListener('loadedmetadata', seek, { once: true });
      v.play().catch(() => {});
    });
    /* 点击任一路 → 居中放大播放 */
    el.querySelectorAll('.vd.has').forEach(card => {
      card.addEventListener('click', () => {
        const v = card.querySelector('video');
        vzoom(card.querySelector('.lb').textContent.trim(), v.getAttribute('src'), v.currentTime);
      });
    });
  }

  /* ---------------- 视频居中放大播放 ---------------- */
  let VZ = null;
  function vzoom(name, src, at) {
    if (!VZ) {
      VZ = document.createElement('div');
      VZ.className = 'vmask hide'; VZ.id = 'vmask';
      VZ.innerHTML = `<div class="vbox">
        <div class="vh">${SI('camera')}<h3></h3><span class="sub"></span>
          <span class="rt"><span class="vlive">LIVE</span><span class="x">${SI('shrink')}</span></span></div>
        <div class="vbody">
          <video muted loop playsinline preload="auto"></video>
          <div class="vscan"></div>
          <div class="osd tl"></div><div class="osd tr">2560 × 1440 · 25 fps · H.265</div>
          <div class="osd bl"></div><div class="osd br">主码流 · 已录像</div>
        </div>
        <div class="vf">
          <button>${SI('ptz')}云台控制</button><button>${SI('snap')}抓  拍</button>
          <button>${SI('history')}录像回放</button><button class="cl">关  闭</button>
        </div></div>`;
      (document.getElementById('stage') || document.body).appendChild(VZ);
      const close = () => {
        VZ.classList.add('hide');
        VZ.querySelector('video').pause();
      };
      VZ.addEventListener('click', e => { if (e.target === VZ) close(); });
      VZ.querySelector('.x').addEventListener('click', close);
      VZ.querySelector('.cl').addEventListener('click', close);
      addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
    const v = VZ.querySelector('video');
    VZ.querySelector('.vh h3').textContent = name;
    VZ.querySelector('.vh .sub').textContent = '/ 实时视频 · 点击空白处或 ESC 退出';
    VZ.querySelector('.osd.tl').textContent = name;
    const n = new Date(), pd = x => String(x).padStart(2, '0');
    VZ.querySelector('.osd.bl').textContent =
      n.getFullYear() + '-' + pd(n.getMonth() + 1) + '-' + pd(n.getDate()) + ' ' +
      [n.getHours(), n.getMinutes(), n.getSeconds()].map(pd).join(':');
    VZ.classList.remove('hide');
    if (v.getAttribute('src') !== src) { v.setAttribute('src', src); v.load(); }
    const go = () => {
      if (at) { try { v.currentTime = Math.min(at, (v.duration || 1) - 0.1); } catch (e) {} }
      v.play().catch(() => {});
    };
    if (v.readyState >= 2) go(); else v.addEventListener('canplay', go, { once: true });
  }

  function alist(el, rows) {
    el.innerHTML = rows.map(([c, t, s, p, pt, cd, ico]) => `<div class="al ${c}">
      <div class="bell">${SI(ico || 'bell')}</div>
      <div class="m"><b>${t}</b><span>${s}</span></div>
      <div class="r"><span class="pill ${p}">${pt}</span>${cd ? `<span class="cd">剩余 ${cd}</span>` : ''}</div></div>`).join('');
  }

  /* 子系统接入：单行轻量状态条（替代 3×3 卡片，降低密度） */
  function syslite(el, rows) {
    el.innerHTML = rows.map(([n, p, m, c, ico]) => `<div class="sl ${c || ''}">
      ${ico ? SI(ico) : ''}<span class="n">${n}</span><span class="m">${m}</span></div>`).join('');
  }

  function syscards(el, rows) {
    el.innerHTML = rows.map(([n, p, m, c, ico]) => `<div class="sysc ${c || ''}">
      ${ico ? `<span class="sci">${SI(ico)}</span>` : ''}
      <span class="sct"><span class="n"><span class="dot"></span>${n}</span>
      <span class="m">${p} · ${m}</span></span></div>`).join('');
  }

  G.UI = { $, fit, clock, nav, popup, pan, railToggle, corridorMap, band, ring, donut, bars24, spark, line, barlist, vids, vzoom, devpop, bindLayers, alist, syscards, syslite, KIND, MENU, SI };
})(window);
