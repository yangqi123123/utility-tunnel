# -*- coding: utf-8 -*-
"""未来一路综合管廊管理平台 · 大屏高保真原型生成器"""
import os, io, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icons import ic, sprite

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEAD = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>未来一路综合管廊管理平台 · {sid} {name}</title>
<link rel="stylesheet" href="assets/common.css">
</head>
<body>
{sprite}
<div id="fit"><div id="stage">

  <div class="nav">
    <div class="brand">
      <div class="lg">{lg}</div>
      <h1>未来一路综合管廊管理平台</h1>
    </div>
    <div class="menu" id="menu"></div>
    <div class="navr">
      <div class="wx">
        <div class="w">{wx_cloud}<b>多云 22℃</b></div>
        <div class="w rain">{wx_rain}<em>1h 降雨</em><b>2.4mm</b></div>
      </div>
      <div class="clock"><div class="t" id="clk">14:26:08</div><div class="d" id="dat">2026-09-14 星期日</div></div>
    </div>
  </div>

  <div class="main">
    <div class="base" id="base">{basehtml}</div>

    <div class="rail">
{left}
    </div>

    <div class="center">
      <div class="ctop">
{ctop}
        <div class="spacer"></div>
        <div class="noc">中心视窗 1812 × 2030 · 禁止遮挡</div>
      </div>
      <div class="cmid">
{cmid}
      </div>
      <div class="band">
        <div class="bh"><span class="dm"></span><h4>{bandtitle}</h4>
          <div class="lg"><s>正常</s><s class="w">预警</s><s class="a">报警</s><s class="o">离线</s></div></div>
        <div class="segs" id="segs"></div>
        <div class="ticks" id="ticks"></div>
      </div>
    </div>

    <div class="rail">
{right}
    </div>
  </div>
{mask}
</div></div>
<script src="assets/common.js"></script>
<script>
UI.fit(); UI.clock(); UI.nav({idx}); UI.railToggle(); UI.pan();
{js}
</script>
</body>
</html>
'''

MASK = '''
  <div class="mask{maskcls}" id="mask">
    <div class="pop">
      <div class="h"><span class="lvl">{lvl}</span><h3>{ptitle}</h3>
        <span class="q">第 1 条 / 共 {qn} 条</span><span class="x" id="close">✕</span></div>
      <div class="b">
        <div class="fields">
{pfields}
        </div>
        <div class="spark"><div class="t">{sparktitle}</div><svg viewBox="0 0 300 132" id="sp"></svg></div>
      </div>
      <div class="ft">
        <button class="pri" id="ack">签 收</button><button>查看详情</button>
        <button>前往处置</button><button id="close2">关 闭</button>
      </div>
      <div class="note">关闭仅代表不再挡住画面，不代表已处理——报警仍计入右栏 C-1 待处理面板与实时报警列表，并按卡口 K2 继续计时升级（三级 60 秒未签收自动抄送值班长）。</div>
    </div>
  </div>
'''

import re as _re
def pnl(icon, title, body, sub='', tag='', basis='1 1 auto', cls=''):
    # basis 中的数字作为权重，按比例精确铺满整栏，避免溢出或留白
    m = _re.search(r'(\d+)px', basis)
    w = int(m.group(1)) if m else 500
    flex = f'{w} 1 0'
    sub = f'<span class="sub">/ {sub}</span>' if sub else ''
    tag = f'<span class="rt"><span class="tag">{tag}</span></span>' if tag else ''
    return f'''      <div class="pnl {cls}" style="flex:{flex}">
        <div class="ph"><span class="pi">{ic(icon)}</span><h3>{title}</h3>{sub}{tag}</div>
        <div class="pb">{body}</div>
      </div>'''

def c1(alarm_title, alarm_sub, acount, fault_title, fault_sub, fcount, fault_on=False):
    aon = ' on' if acount else ''
    fon = ' on' if fault_on else ''
    return f'''      <div class="c1" style="flex:0 0 200px">
        <div class="bgA"></div><div class="bgB"></div>
        <svg class="seam" viewBox="0 0 984 200" preserveAspectRatio="none">
          <line x1="579.5" y1="0" x2="383.8" y2="200" stroke="rgba(63,227,255,.55)" stroke-width="2"/>
          <line x1="601.2" y1="0" x2="405.4" y2="200" stroke="rgba(63,227,255,.55)" stroke-width="2"/></svg>
        <div class="cols">
          <div class="col a{aon}">
            <div class="ico">{ic('alarmlt')}</div>
            <div class="tx"><b>{alarm_title}</b><span>{alarm_sub}</span>
              <em>{ic('history')}查看历史</em></div>
            <div class="cnt"><b>{acount}</b><span>待处理</span></div></div>
          <div class="col b{fon}">
            <div class="ico">{ic('wrench')}</div>
            <div class="tx"><b>{fault_title}</b><span>{fault_sub}</span>
              <em>{ic('history')}查看历史</em></div>
            <div class="cnt"><b>{fcount}</b><span>待处理</span></div></div>
        </div>
      </div>'''

def seg(*items):
    # 容错：允许传入多余元素（与 layers 共用文案时不至于报错）
    return '<div class="seg">' + ''.join(
        f'<b class="{"on" if it[1] else ""}">{it[0]}</b>' for it in items) + '</div>'

def srch(ph):
    return f'''<div class="srch">{ic('search')}<span>{ph}</span></div>'''

def layers(title, items):
    """items: (文本, 是否选中[, 底板图层键])，图层键与 common.js 的 KIND / 分组键对应"""
    h = f'<div class="layers"><div class="lt">{ic("layers")}{title}</div>'
    for it in items:
        t, on = it[0], it[1]
        k = it[2] if len(it) > 2 else ''
        ka = f' data-k="{k}"' if k else ''
        h += f'<label class="{"on" if on else ""}"{ka}><i></i>{t}</label>'
    return h + ('<div class="tip">拖动平移 · 滚轮缩放 · 双击复位'
                '<b id="mapReset">复位视图</b></div></div>')

def write(sid, name, idx, basehtml, left, ctop, cmid, right, bandtitle, js, mask=''):
    html = HEAD.format(sid=sid, name=name, idx=idx, basehtml=basehtml, left=left, ctop=ctop,
                       cmid=cmid, right=right, bandtitle=bandtitle, js=js, mask=mask,
                       sprite=sprite(), lg=ic('tunnel'), wx_cloud=ic('cloud'), wx_rain=ic('water'))
    p = os.path.join(OUT, f'{sid}-{name}.html')
    io.open(p, 'w', encoding='utf8').write(html)
    return p
