# -*- coding: utf-8 -*-
from gen import *

left = '\n'.join([
 pnl('gas','环境参数实时卡','''<div class="envbar" style="grid-template-columns:repeat(3,1fr)">
            <div class="e"><span class="ei"><svg class="si"><use href="#i-temp"/></svg></span><span class="et"><span class="n">温度</span><span class="v">26.4<i>℃</i></span></span></div>
            <div class="e"><span class="ei"><svg class="si"><use href="#i-humid"/></svg></span><span class="et"><span class="n">湿度</span><span class="v">78<i>%</i></span></span></div>
            <div class="e mid"><span class="ei"><svg class="si"><use href="#i-gas"/></svg></span><span class="et"><span class="n">氧气</span><span class="v">19.8<i>%</i></span></span></div>
            <div class="e bad"><span class="ei"><svg class="si"><use href="#i-fire"/></svg></span><span class="et"><span class="n">甲烷</span><span class="v">42<i>%LEL</i></span></span></div>
            <div class="e"><span class="ei"><svg class="si"><use href="#i-warn"/></svg></span><span class="et"><span class="n">硫化氢</span><span class="v">2<i>ppm</i></span></span></div>
            <div class="e"><span class="ei"><svg class="si"><use href="#i-level"/></svg></span><span class="et"><span class="n">水位</span><span class="v">0.6<i>m</i></span></span></div></div>
          <div class="chart" style="flex:1;min-height:0"><svg viewBox="0 0 600 260" id="ln"></svg></div>
          <div class="hint"><b>电力舱 F0103</b>· 24h 曲线 · 虚线为三级阈值</div>''',
     sub='当前分区 24h 趋势', tag='3s', basis='0 0 574px'),
 pnl('grid','分区环境矩阵','<div class="mx"><table id="mx"></table></div>',
     sub='点击切换底板断面', tag='越限高亮', basis='0 0 640px'),
 pnl('pump','集水井水位与泵组','''<div class="wl">
            <div class="tube"><div class="fl" style="height:50%"></div>
              <div class="mk" style="bottom:62%"><i>高 0.75m</i></div>
              <div class="mk hi" style="bottom:80%"><i>超高 0.95m</i></div>
              <div class="vv">0.60 m</div></div>
            <div class="pumps" id="pumps"></div></div>''', tag='F0103', basis='0 0 352px'),
])

right = '\n'.join([
 c1('甲烷检测仪告警','电力舱 · F0103 · K1+280',2,'通风机通信中断','综合舱 · F0102',1,True),
 pnl('fan','设备状态与控制','''<div class="ctl" id="fan" style="flex:0 0 auto"></div>
          <div class="ctl" id="pl" style="flex:0 0 auto"></div>
          <div class="grpctl"><b>本分区群开</b><b>本分区群关</b><b>全舱室群开</b></div>''',
     sub='通风 / 排水 / 照明', tag='需二次确认', basis='0 0 1150px', cls='pem'),
 pnl('flowchart','指令执行流水','<div class="flow" id="cmd"></div>', sub='含回读校核', basis='0 0 450px'),
 pnl('fire','本分区消防状态','<div class="grid9" id="fire" style="grid-template-columns:repeat(2,1fr)"></div>',
     sub='只读', tag='FAS', basis='0 0 270px'),
])

ctop = ('        ' + srch('搜索设备 / 位号') + '\n        ' +
  seg(('综合舱',0),('电力舱',1),('燃气舱',0),('水信舱',0)) + '\n        ' +
  seg(('F0103',1),('F0104',0)) + '\n        ' + seg(('断面示意',1),('GIS 定位',0)))
cmid = '        ' + layers('图元',[('风机 / 水泵',1),('照明回路',1),('环境传感器',1),('摄像机 / 门禁',1),('入廊管线',1)])

js = '''
/* ---------- 底板：道路横断面 + 地下箱涵剖切 + 直埋管线 ---------- */
(function(){
  const W=3780,H=2010, CX=1900;
  const E=s=>s;
  // 尺寸标注
  const dim=(x1,x2,y,t)=>`<g stroke="#E8453C" fill="#E8453C">
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke-width="2.5"/>
    <line x1="${x1}" y1="${y-11}" x2="${x1}" y2="${y+11}" stroke-width="2.5"/>
    <line x1="${x2}" y1="${y-11}" x2="${x2}" y2="${y+11}" stroke-width="2.5"/>
    <text x="${(x1+x2)/2}" y="${y-14}" font-size="22" text-anchor="middle" stroke="none">${t}</text></g>`;
  // 管线（圆管 + 引出标注）
  const pipe=(x,y,r,c,name,spec)=>{
    const ly=y+r+34;
    return `<g>
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*0.92}" fill="${c}" opacity=".9"/>
      <ellipse cx="${x}" cy="${y}" rx="${r*0.62}" ry="${r*0.56}" fill="rgba(0,0,0,.28)"/>
      <ellipse cx="${x-r*0.3}" cy="${y-r*0.36}" rx="${r*0.3}" ry="${r*0.2}" fill="rgba(255,255,255,.34)"/>
      <path d="M${x} ${y+r*0.92} L${x} ${ly-4}" stroke="${c}" stroke-width="2" opacity=".75"/>
      <text x="${x}" y="${ly+20}" font-size="21" fill="#DCEDFF" text-anchor="middle">${name}</text>
      <text x="${x}" y="${ly+44}" font-size="18" fill="${c}" text-anchor="middle">${spec}</text></g>`;
  };
  const boxpipe=(x,y,w,h,c,name,spec)=>{
    const ly=y+h/2+34;
    return `<g><rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="4" fill="${c}" opacity=".9"/>
      <rect x="${x-w/2+9}" y="${y-h/2+9}" width="${w-18}" height="${h-18}" rx="3" fill="rgba(0,0,0,.26)"/>
      <path d="M${x} ${y+h/2} L${x} ${ly-4}" stroke="${c}" stroke-width="2" opacity=".75"/>
      <text x="${x}" y="${ly+20}" font-size="21" fill="#DCEDFF" text-anchor="middle">${name}</text>
      <text x="${x}" y="${ly+44}" font-size="18" fill="${c}" text-anchor="middle">${spec}</text></g>`;
  };
  const tray=(x,y,w,n,c)=>{let t=`<rect x="${x}" y="${y}" width="${w}" height="${n*26+8}" rx="2" fill="rgba(10,30,62,.55)" stroke="rgba(120,175,230,.5)" stroke-width="1.8"/>`;
    for(let i=0;i<n;i++){t+=`<line x1="${x+5}" y1="${y+18+i*26}" x2="${x+w-5}" y2="${y+18+i*26}" stroke="rgba(120,175,230,.4)" stroke-width="1.6"/>`;
      for(let k=0;k<Math.floor(w/34);k++)t+=`<circle cx="${x+18+k*34}" cy="${y+12+i*26}" r="7" fill="${c}" opacity=".85"/>`;}
    return t;};
  const chip=(x,y,t,v,bad)=>`<g transform="translate(${x},${y})">
    <rect x="0" y="-26" width="${62+String(t+v).length*12}" height="52" rx="4"
      fill="${bad?'rgba(58,10,20,.94)':'rgba(6,24,50,.92)'}" stroke="${bad?'rgba(255,77,94,.85)':'rgba(63,227,255,.6)'}" stroke-width="1.7"/>
    <text x="14" y="-4" font-size="18" fill="${bad?'#FF9AA4':'#7FB6DC'}">${t}</text>
    <text x="14" y="18" font-size="22" font-weight="700" fill="${bad?'#FF8A96':'#EAF6FF'}">${v}</text></g>`;

  const RX1=1130, RX2=2670, RY=404, RH=92;          // 道路
  const GY=RY+RH;                                     // 地面线
  const BW=880, BH=560, BX=CX-BW/2, BY=GY+256;        // 箱涵

  let s=`<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1C33"/><stop offset="1" stop-color="#071426"/></linearGradient>
    <linearGradient id="asph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A3242"/><stop offset="1" stop-color="#1A2130"/></linearGradient>
    <linearGradient id="soilg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14202F"/><stop offset="1" stop-color="#070E19"/></linearGradient>
    <linearGradient id="conc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4558"/><stop offset="1" stop-color="#232C3B"/></linearGradient>
    <filter id="glowS" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="soilp" width="54" height="54" patternUnits="userSpaceOnUse">
      <path d="M0 54 L54 0 M-14 14 L14 -14 M40 68 L68 40" stroke="rgba(90,130,180,.09)" stroke-width="2"/></pattern></defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect x="0" y="${GY}" width="${W}" height="${H-GY}" fill="url(#soilg)"/>
  <rect x="0" y="${GY}" width="${W}" height="${H-GY}" fill="url(#soilp)"/>
  <line x1="0" y1="${GY}" x2="${W}" y2="${GY}" stroke="rgba(120,175,230,.35)" stroke-width="2"/>
  <text x="${RX1}" y="${RY-192}" font-size="30" font-weight="700" fill="#7FC9EE" letter-spacing="3">未来一路　道路横断面与综合管廊（K1+240 ~ K1+320）</text>`;

  // 尺寸标注
  s+=dim(RX1,RX1+230,GY+52,'4.5')+dim(RX1+230,RX1+400,GY+52,'3.5')
    +dim(RX1+400,RX2-400,GY+52,'14.5')+dim(RX2-400,RX2-230,GY+52,'3.5')+dim(RX2-230,RX2,GY+52,'4.5');

  // 道路与两侧
  s+=`<rect x="${RX1}" y="${RY}" width="${RX2-RX1}" height="${RH}" fill="url(#asph)" stroke="rgba(140,190,240,.3)" stroke-width="1.5"/>
    <rect x="${RX1}" y="${RY}" width="230" height="${RH}" fill="rgba(46,90,70,.5)"/>
    <rect x="${RX2-230}" y="${RY}" width="230" height="${RH}" fill="rgba(46,90,70,.5)"/>
    <rect x="${RX1+230}" y="${RY}" width="170" height="${RH}" fill="rgba(70,80,96,.55)"/>
    <rect x="${RX2-400}" y="${RY}" width="170" height="${RH}" fill="rgba(70,80,96,.55)"/>
    <text x="${RX1+115}" y="${RY+58}" font-size="19" fill="#8FC6A8" text-anchor="middle">绿化带</text>
    <text x="${RX1+315}" y="${RY+58}" font-size="19" fill="#AEBCCE" text-anchor="middle">人行道</text>
    <text x="${RX2-315}" y="${RY+58}" font-size="19" fill="#AEBCCE" text-anchor="middle">人行道</text>
    <text x="${RX2-115}" y="${RY+58}" font-size="19" fill="#8FC6A8" text-anchor="middle">绿化带</text>
    <line x1="${CX-5}" y1="${RY+8}" x2="${CX-5}" y2="${RY+RH-8}" stroke="#E8C33C" stroke-width="3"/>
    <line x1="${CX+5}" y1="${RY+8}" x2="${CX+5}" y2="${RY+RH-8}" stroke="#E8C33C" stroke-width="3"/>`;
  [RX1+560,RX1+760,RX2-760,RX2-560].forEach(x=>{
    s+=`<line x1="${x}" y1="${RY+14}" x2="${x}" y2="${RY+RH-14}" stroke="rgba(230,238,250,.65)" stroke-width="2.5" stroke-dasharray="16 14"/>`;});
  // 行道树与路灯
  [RX1+110,RX1+180,RX2-180,RX2-110].forEach(x=>{
    s+=`<g><line x1="${x}" y1="${RY}" x2="${x}" y2="${RY-56}" stroke="#5A7A62" stroke-width="5"/>
      <circle cx="${x}" cy="${RY-72}" r="26" fill="rgba(60,140,96,.72)"/></g>`;});
  [RX1+330,RX2-330].forEach(x=>{
    s+=`<g stroke="#7FA3C8" stroke-width="4" fill="none"><path d="M${x} ${RY} L${x} ${RY-120} L${x+(x<CX?60:-60)} ${RY-120}"/></g>
      <circle cx="${x+(x<CX?60:-60)}" cy="${RY-114}" r="9" fill="#FFD85E" filter="url(#glowS)"/>`;});

  // 直埋管线（左：通信/燃气/给水；右：污水/雨水/再生水/电力）
  s+=pipe(BX-350, GY+176, 32,'#C264D6','通信','6 × 4 孔')
    +pipe(BX-140, GY+186, 28,'#E0489E','燃气','de110')
    +pipe(BX-240, GY+356, 36,'#2FD37A','给水','DN200')
    +pipe(BX+BW+150, GY+172, 42,'#2E7BE8','污水','DN400')
    +pipe(BX+BW+326, GY+192, 48,'#4FA8E0','雨水','d600~2.0×1.2')
    +pipe(BX+BW+150, GY+382, 28,'#2FD37A','再生水','DN150')
    +boxpipe(BX+BW+330, GY+382, 88,88,'#E8453C','电力','1.6m×1.6m');

  // 箱涵本体
  s+=`<rect x="${BX-18}" y="${BY-18}" width="${BW+36}" height="${BH+36}" rx="8" fill="url(#conc)" stroke="rgba(180,200,225,.55)" stroke-width="3"/>
    <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="4" fill="rgba(6,16,30,.94)"/>
    <text x="${BX}" y="${BY-40}" font-size="24" fill="#9FC6E4">综合管廊箱涵　3 舱 · 净宽 8.6m · 净高 3.2m</text>
    ${dim(BX-18,BX+BW+18,BY+BH+96,'8.6 m')}`;

  // 三舱
  const names=['综合舱','电力舱','燃气舱'],cols=['#3FE3FF','#FFA63D','#A77BFF'],cw=(BW-16)/3;
  for(let c=0;c<3;c++){
    const X=BX+4+c*cw, sel=(c===1);
    s+=`<rect x="${X}" y="${BY+6}" width="${cw-8}" height="${BH-12}" rx="3"
        fill="${sel?'rgba(52,32,8,.5)':'rgba(10,26,50,.5)'}" stroke="${sel?'rgba(255,166,61,.85)':'rgba(90,150,210,.4)'}" stroke-width="${sel?3:2}"/>
      <text x="${X+cw/2-4}" y="${BY+BH+42}" font-size="23" fill="${cols[c]}" text-anchor="middle">${names[c]}</text>`;
    // 支架与管线
    if(c===0) s+=tray(X+16,BY+64,110,3,'#3FE3FF')+tray(X+cw-134,BY+64,110,2,'#2FD37A')
      +`<ellipse cx="${X+cw/2-4}" cy="${BY+BH-120}" rx="44" ry="42" fill="rgba(47,211,122,.35)" stroke="#2FD37A" stroke-width="3"/>
        <text x="${X+cw/2-4}" y="${BY+BH-112}" font-size="17" fill="#9FE8C0" text-anchor="middle">给水</text>`;
    if(c===1) s+=tray(X+16,BY+58,118,4,'#FFA63D')+tray(X+cw-142,BY+58,118,4,'#FFD85E')
      +`<text x="${X+16}" y="${BY+BH-56}" font-size="17" fill="#FFC98A">10kV 电力电缆 ×8</text>`;
    if(c===2) s+=tray(X+16,BY+70,104,2,'#A77BFF')
      +`<ellipse cx="${X+cw/2+10}" cy="${BY+BH-130}" rx="46" ry="44" fill="rgba(224,72,158,.3)" stroke="#E0489E" stroke-width="3"/>
        <text x="${X+cw/2+10}" y="${BY+BH-122}" font-size="17" fill="#F0A8CE" text-anchor="middle">燃气</text>`;
    // 顶部风机与照明
    s+=`<rect x="${X+50}" y="${BY+18}" width="${cw-108}" height="9" rx="4" fill="rgba(255,216,94,.6)"/>
      <g transform="translate(${X+cw/2-4},${BY+42})"><circle r="22" fill="rgba(6,26,54,.92)" stroke="${sel?'#20E08C':'#4C7CA8'}" stroke-width="2.4"/>
      <g transform="translate(-10,-10) scale(.84)"><path d="M12 12c0-4 3-5 5-4s1 5-2 5-3-1-3-1 4-3 3-6-4-1-4 2 1 5 1 5-3-4-6-3-1 4 2 4 4-2 4-2z"
        fill="none" stroke="${sel?'#20E08C':'#4C7CA8'}" stroke-width="1.9"/></g>
      ${sel?'<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.4s" repeatCount="indefinite" additive="sum"/>':''}</g>
      <rect x="${X+20}" y="${BY+BH-40}" width="${cw-48}" height="22" rx="3" fill="rgba(16,60,110,.6)" stroke="rgba(63,227,255,.35)" stroke-width="1.6"/>`;
  }
  // 电力舱内设备
  const X1=BX+4+cw;
  s+=`<g transform="translate(${X1+cw-64},${BY+BH-104})"><rect x="-26" y="-26" width="52" height="52" rx="4" fill="rgba(6,26,54,.94)" stroke="#3FE3FF" stroke-width="2.4"/>
      <g transform="translate(-12,-12)"><path d="M4 8h3l1.5-2h7L17 8h3v10H4z" fill="none" stroke="#3FE3FF" stroke-width="1.7"/></g></g>
    <g transform="translate(${X1+50},${BY+BH-104})"><rect x="-26" y="-26" width="52" height="52" rx="4" fill="rgba(6,26,54,.94)" stroke="#20E08C" stroke-width="2.4"/>
      <g transform="translate(-11,-11)"><path d="M9 8h6v11H9z M7 19h10 M12 3v5" fill="none" stroke="#20E08C" stroke-width="1.9"/></g></g>
    <g transform="translate(${X1+cw-52},${BY+150})">
      <circle r="18" fill="none" stroke="rgba(255,77,94,.9)" stroke-width="3">
        <animate attributeName="r" values="18;50" dur="1.7s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".9;0" dur="1.7s" repeatCount="indefinite"/></circle>
      <circle r="22" fill="rgba(58,10,20,.95)" stroke="#FF4D5E" stroke-width="2.6" filter="url(#glowS)"/>
      <g transform="translate(-10,-10)"><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z" fill="none" stroke="#FFB3BB" stroke-width="1.9" transform="scale(.84)"/></g></g>`;

  // 实时读数条
  const CY=BY+BH+230;
  [['温度','26.4 ℃',0],['湿度','78 %',0],['氧气','19.8 %',0],['甲烷','42 %LEL',1],['硫化氢','2 ppm',0]]
    .forEach(([t,v,bad],i)=>{ s+=chip(BX-140+i*320,CY,t,v,bad); });
  s+=`<text x="${BX-140}" y="${CY-52}" font-size="20" fill="#4E7EA8" letter-spacing="2">电力舱 F0103 实时环境读数（选中分区）</text>`;

  UI.$('base').innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${s}</svg>`;
})();

UI.band(UI.$('segs'), UI.$('ticks'), {7:'a',12:'w',18:'o'});
UI.line(UI.$('ln'), [
  {v:[18,19,20,22,24,26,30,34,38,42],c:'#FF4D5E'},
  {v:[20.9,20.8,20.7,20.6,20.4,20.2,20.0,19.9,19.8,19.8],c:'#20E08C'},
  {v:[23.1,23.4,23.8,24.2,24.9,25.3,25.8,26.0,26.2,26.4],c:'#FFD85E'}
], {max:45,min:0,labels:['00:00','06:00','12:00','18:00','24:00']});
(function(){
  const H=['防火分区','温度','湿度','氧气','甲烷','水位'];
  const R=[['综合舱 F0101','23.1','71','20.8','2','0.4'],['综合舱 F0102','23.6','73','20.7','3','0.5'],
    ['电力舱 F0103','26.4','78','19.8','42','0.6'],['电力舱 F0104','25.2','74','20.4','6','0.4'],
    ['燃气舱 F0201','22.8','69','20.9','8','0.3'],['燃气舱 F0202','22.5','68','20.9','5','0.3'],
    ['水信舱 F0301','21.9','82','20.8','1','1.2']];
  let h='<tr>'+H.map(x=>`<th>${x}</th>`).join('')+'</tr>';
  R.forEach((r,i)=>{h+=`<tr class="${i===2?'hot':''}">`+r.map((c,j)=>{
    let cls=''; if(i===2&&j===4)cls='a'; else if(i===2&&j===3)cls='w'; else if(i===6&&j===5)cls='w';
    return `<td class="${cls}">${c}</td>`;}).join('')+'</tr>';});
  UI.$('mx').innerHTML=h;
})();
UI.$('pumps').innerHTML=[['1# 排水泵','运行','已运行 42 min','on'],['2# 备用泵','停止','待命','']].map(([n,s,d,c])=>
  `<div class="row" style="display:flex;align-items:center;gap:14px;padding:13px 15px;border-radius:3px;background:rgba(9,26,56,.5);border:1px solid var(--ln2)">
    <span class="dv" style="width:42px;height:42px;flex:0 0 auto;border-radius:3px;display:flex;align-items:center;justify-content:center;color:var(--cy);background:rgba(63,227,255,.10);border:1px solid rgba(63,227,255,.30)">${UI.SI('pump')}</span>
    <span style="flex:1"><b style="display:block;font-size:21px;color:#E4F2FF">${n}</b>
      <span style="display:block;margin-top:4px;font-size:16px;color:var(--tx3)">${d}</span></span>
    <span class="pill ${c?'grn':'org'}">${s}</span></div>`).join('')
  +`<div class="hint" style="margin-top:6px"><b>联锁</b>· 低液位强制停泵 · 连续启停间隔 ≥ 3 min</div>`;

UI.$('fan').innerHTML=[['1# 通风机','WLYL-C03-F0103-FAN01','运行','自动',1,0],
  ['2# 通风机','WLYL-C03-F0103-FAN02','运行','自动',1,0],
  ['3# 通风机','WLYL-C03-F0103-FAN03','停止','就地',0,1],
  ['4# 排风机','WLYL-C03-F0103-FAN04','故障','自动',0,0]].map(([n,c,s,m,on,lock])=>
  `<div class="row ${s==='停止'?'off':''}"><span class="dv">${UI.SI(n.indexOf('排风')>=0?'wind':'fan')}</span>
    <span class="nm"><b>${n}</b><span>${c}</span></span>
    <span class="stt"><span class="pill ${s==='运行'?'grn':(s==='故障'?'red':'org')}">${s}</span></span>
    <span class="mode">${m}</span>
    <span class="sw"><b class="${on?'on':''}${lock?' lock':''}">启</b><b class="${lock?'lock':''}">停</b></span></div>`).join('');

UI.$('pl').innerHTML=[['照明回路 L1','全亮','on'],['照明回路 L2','全亮','on'],['照明回路 L3','关闭','']].map(([n,s,c])=>
  `<div class="row ${c?'':'off'}"><span class="dv">${UI.SI('light')}</span>
    <span class="nm"><b>${n}</b><span>WLYL-C03-F0103-LGT</span></span>
    <span class="stt"><span class="pill ${c?'grn':'org'}">${s}</span></span>
    <span class="sw"><b class="${c?'on':''}">开</b><b>关</b></span></div>`).join('')
  ;

UI.$('cmd').innerHTML=[['14:24:02','启动 1# 通风机','张值班 · 回读 运行 ✓',0],
  ['14:18:40','照明 L3 关闭','张值班 · 回读 关闭 ✓',0],
  ['14:06:11','启动 3# 通风机','张值班 · 回读超时 ✗ 已转工单',1]].map(([t,m,e,no])=>
  `<div class="fw ${no?'no':''}">${UI.SI('flowchart')}<span class="tm">${t}</span><span class="m">${m}<em>${e}</em></span></div>`).join('');

UI.syscards(UI.$('fire'), [['火灾报警','FAS','无火警','','fire'],['电气火灾','剩余电流','正常','','bolt'],
  ['防火门','FM-0103','闭合','','door'],['应急照明','EL-0103','正常','','light']]);
UI.popup(0);
'''

print(write('S2','环境监控',1,'',left,ctop,cmid,right,'防火分区导航带',js))
