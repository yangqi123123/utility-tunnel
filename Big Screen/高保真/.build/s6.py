# -*- coding: utf-8 -*-
from gen import *

left = '\n'.join([
 pnl('trend','负荷曲线','''<div class="chart" style="flex:1;min-height:0"><svg viewBox="0 0 600 260" id="ld"></svg></div>
          <div class="kpi" style="grid-template-columns:repeat(3,1fr);flex:0 0 auto">
            <div class="k"><span class="ki"><svg class="si"><use href="#i-bolt"/></svg></span><span class="kt"><span class="l">当前负荷</span><span class="v">186<small>kW</small></span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-trend"/></svg></span><span class="kt"><span class="l">最大需量</span><span class="v">248<small>kW</small></span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-speed"/></svg></span><span class="kt"><span class="l">负荷率</span><span class="v">61<small>%</small></span></span></div></div>''',
     sub='今日 24h', tag='1min', basis='0 0 660px'),
 pnl('chart','能耗构成','''<div class="two" style="grid-template-columns:430px 1fr">
            <div class="donut"><svg width="420" height="420" viewBox="0 0 420 420" id="dn"></svg>
              <div class="c"><b>1842</b><i>kWh · 今日累计</i></div></div>
            <div class="lvs">
              <div class="lvh"><span>设备类型</span><span>耗电量</span><span>占比</span></div>
              <div class="lv"><span class="d" style="background:#3FE3FF"></span>通风<b>742<i>kWh</i></b><s>40.3%</s></div>
              <div class="lv"><span class="d" style="background:#20E08C"></span>照明<b>508<i>kWh</i></b><s>27.6%</s></div>
              <div class="lv"><span class="d" style="background:#FFA63D"></span>排水<b>396<i>kWh</i></b><s>21.5%</s></div>
              <div class="lv"><span class="d" style="background:#A77BFF"></span>其他<b>196<i>kWh</i></b><s>10.6%</s></div>
              <div class="lvn">单位长度能耗 877 kWh/km·日 · 含监控中心机房</div></div></div>''',
     sub='按设备类型分摊', tag='今日', basis='0 0 560px'),
 pnl('pulse','电能质量','<div class="tb" id="pq"></div>', sub='电压偏差 / 三相不平衡', tag='越限 1', basis='0 0 540px'),
])

right = '\n'.join([
 c1('K12 剩余电流越限','电力舱 · F0104 · 512mA',1,'UPS 电池容量偏低','监控中心机房',1,True),
 pnl('cable','回路状态表','<div class="tb" id="ckt"></div>', sub='进线 / 馈线 / 分区回路', tag='8 回路', basis='0 0 940px'),
 pnl('warn','用电异常识别','<div class="flow" id="ab"></div>', sub='规则自动识别', tag='今日 3', basis='0 0 360px'),
 pnl('ups','UPS 与动力环境','''<div class="big4" id="ups"></div>
          <div class="hint" style="margin-top:10px"><b>40kVA 三进三出</b>· 免维护铅酸 · 应急 60 分钟 · 覆盖服务器 / 核心网络 / 工作站</div>''',
     sub='40kVA', tag='市电正常', basis='0 0 440px'),
])

ctop = '        ' + srch('搜索回路 / 配电柜') + '\n        ' + seg(('单线图',1),('GIS 定位',0)) + '\n        ' + seg(('实时',1),('日',0),('月',0))
cmid = '        ' + layers('图元',[('进线 / 母线',1),('馈线回路',1),('计量点',1),('UPS',1),('越限高亮',1)])

js = '''
/* ---------- 底板：供配电单线图 ---------- */
(function(){
  const W=3780,H=2010;
  const cx=1900, top=300;
  const box=(x,y,w,h,t,s,c)=>`<g transform="translate(${x},${y})">
    <rect x="${-w/2}" y="0" width="${w}" height="${h}" rx="4" fill="rgba(8,26,58,.82)" stroke="${c}" stroke-width="2.5"/>
    <text x="0" y="${h/2-4}" font-size="22" fill="#DCEDFF" text-anchor="middle">${t}</text>
    <text x="0" y="${h/2+24}" font-size="18" fill="#7FA3C8" text-anchor="middle">${s}</text></g>`;
  const brk=(x,y,on)=>`<g transform="translate(${x},${y})">
    <rect x="-16" y="-16" width="32" height="32" rx="3" fill="${on?'rgba(32,224,140,.25)':'rgba(60,20,30,.6)'}"
      stroke="${on?'#20E08C':'#FF4D5E'}" stroke-width="2.5"/>
    <path d="M-8 8 L8 -8" stroke="${on?'#20E08C':'#FF4D5E'}" stroke-width="3"/></g>`;
  const vline=(x,y1,y2,c)=>`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${c||'rgba(120,180,225,.55)'}" stroke-width="3"/>`;

  let s=`<defs><filter id="glowS" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="gg" width="90" height="90" patternUnits="userSpaceOnUse">
      <path d="M90 0H0v90" fill="none" stroke="rgba(70,140,210,.08)" stroke-width="1"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#gg)"/>
    <text x="${cx}" y="${top-80}" font-size="30" font-weight="700" fill="#7FC9EE" text-anchor="middle" letter-spacing="3">监控中心供配电系统单线图</text>`;

  // 双路进线
  s+=box(cx-460,top,340,86,'1# 市电进线','10kV / 400V · 投入','#20E08C')
    +box(cx+460,top,340,86,'2# 市电进线','10kV / 400V · 备用','#4C7CA8');
  s+=vline(cx-460,top+86,top+150)+vline(cx+460,top+86,top+150);
  s+=brk(cx-460,top+168,1)+brk(cx+460,top+168,0);
  s+=vline(cx-460,top+186,top+250)+vline(cx+460,top+186,top+250);
  // 母线
  s+=`<rect x="${cx-900}" y="${top+250}" width="1800" height="14" rx="7" fill="rgba(63,227,255,.65)" filter="url(#glowS)"/>
      <text x="${cx-900}" y="${top+238}" font-size="21" fill="#7FB6DC">400V 主母线　I=268A　U=398V　cosφ=0.94</text>`;
  // UPS 支路
  s+=vline(cx-840,top+264,top+340)+box(cx-840,top+340,300,80,'UPS 40kVA','市电 · 电池 98%','#FFD85E');
  // 馈线
  const F=[['K10 综合舱照明','128 mA · 32.4℃',1,'#20E08C'],['K11 电力舱动力','206 mA · 38.1℃',1,'#20E08C'],
    ['K12 电力舱动力','512 mA · 46.8℃',1,'#FF4D5E'],['K13 燃气舱照明','94 mA · 29.6℃',1,'#20E08C'],
    ['K14 水信舱动力','142 mA · 31.2℃',1,'#20E08C'],['K15 出入口配电','88 mA · 27.5℃',1,'#20E08C']];
  const fy=top+430, fw=250, gap=26, total=F.length*fw+(F.length-1)*gap, fx0=cx+90-total/2+fw/2;
  F.forEach(([n,v,on,c],i)=>{
    const X=fx0+i*(fw+gap);
    s+=vline(X,top+264,fy-56,c==='#FF4D5E'?'rgba(255,77,94,.7)':null);
    s+=brk(X,fy-38,on);
    s+=vline(X,fy-20,fy,c==='#FF4D5E'?'rgba(255,77,94,.7)':null);
    s+=box(X,fy,fw,92,n,v,c);
    if(c==='#FF4D5E'){s+=`<circle cx="${X}" cy="${fy-38}" r="24" fill="none" stroke="#FF4D5E" stroke-width="3">
      <animate attributeName="r" values="24;58" dur="1.7s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values=".9;0" dur="1.7s" repeatCount="indefinite"/></circle>
      <g transform="translate(${X+34},${fy+130})"><rect x="0" y="-22" width="290" height="44" rx="3"
        fill="rgba(60,10,20,.92)" stroke="#FF4D5E" stroke-width="1.5"/>
        <text x="14" y="6" font-size="21" fill="#FFC8CE">剩余电流越限 512 mA</text></g>`;}
  });
  // 图例
  s+=`<g transform="translate(${cx-900},${fy+300})">
    <text x="0" y="0" font-size="21" fill="#4E7EA8">图例：</text>
    <rect x="70" y="-16" width="26" height="26" rx="3" fill="rgba(32,224,140,.25)" stroke="#20E08C" stroke-width="2"/>
    <text x="108" y="4" font-size="20" fill="#7FA3C8">断路器合闸</text>
    <rect x="240" y="-16" width="26" height="26" rx="3" fill="rgba(60,20,30,.6)" stroke="#FF4D5E" stroke-width="2"/>
    <text x="278" y="4" font-size="20" fill="#7FA3C8">断路器分闸</text>
    <text x="430" y="4" font-size="20" fill="#7FA3C8">数值直接标注于回路，越限回路整条标红并脉冲</text></g>`;
  UI.$('base').innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${s}</svg>`;
})();

UI.band(UI.$('segs'), UI.$('ticks'), {3:'w'});
UI.line(UI.$('ld'), [
  {v:[92,88,86,90,104,138,172,186,192,188,180,176,182,190,196,186,178,166,152,140,126,112,102,96],c:'#3FE3FF'},
  {v:[62,60,58,60,68,88,110,120,124,120,116,112,118,122,126,120,114,106,98,90,82,74,68,64],c:'#FFA63D'}
], {max:260,min:0,labels:['00:00','06:00','12:00','18:00','24:00']});
UI.donut(UI.$('dn'), [[742,'#3FE3FF'],[508,'#20E08C'],[396,'#FFA63D'],[196,'#A77BFF']], 1842, 164);
(function(){
  const R=[['A 相电压','398 V','+0.5%','正常','ok'],['B 相电压','402 V','+1.0%','正常','ok'],
    ['C 相电压','386 V','-3.0%','偏低','w'],['三相不平衡度','3.8 %','阈值 4%','正常','ok'],
    ['功率因数','0.94','阈值 0.90','正常','ok']];
  UI.$('pq').innerHTML='<table><tr><th>指标</th><th>实测</th><th>偏差 / 阈值</th><th>判定</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td class="n">${r[1]}</td><td>${r[2]}</td><td class="${r[4]}">${r[3]}</td></tr>`).join('')+'</table>';
})();
(function(){
  const R=[['1# 市电进线','投入','268 A','106 kW','正常','ok'],['2# 市电进线','备用','0 A','0 kW','待命','ok'],
    ['K10 综合舱照明','合闸','32 A','12.6 kW','正常','ok'],['K11 电力舱动力','合闸','48 A','19.2 kW','正常','ok'],
    ['K12 电力舱动力','合闸','52 A','20.8 kW','剩余电流越限','bad'],['K13 燃气舱照明','合闸','26 A','10.1 kW','正常','ok'],
    ['K14 水信舱动力','合闸','44 A','17.6 kW','正常','ok'],['K15 出入口配电','合闸','18 A','7.2 kW','正常','ok']];
  UI.$('ckt').innerHTML='<table><tr><th>回路</th><th>状态</th><th>电流</th><th>有功</th><th>判定</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="n">${r[2]}</td><td class="n">${r[3]}</td><td class="${r[5]}">${r[4]}</td></tr>`).join('')+'</table>';
})();
UI.$('ab').innerHTML=[['14:02:18','K12 回路剩余电流 512mA 越限','规则 E-01 · 已生成工单',1],
  ['09:40:00','3# 通风机停机期间仍有 4.2kW 负荷','规则 E-03 · 疑似接触器粘连',1],
  ['昨 23:10','照明 L2 未按计划关断','规则 E-05 · 已提醒运维班',0]].map(([t,m,e,no])=>
  `<div class="fw ${no?'no':''}">${UI.SI('warn')}<span class="tm">${t}</span><span class="m">${m}<em>${e}</em></span></div>`).join('');
UI.$('ups').innerHTML=[['市电','正常','bolt'],['电池容量','98<i>%</i>','ups'],
  ['负载率','42<i>%</i>','chart'],['可支撑','58<i>min</i>','clock']]
  .map(([l,v,d])=>`<div class="q"><div class="ic">${UI.SI(d)}</div>
    <div class="d"><b>${v}</b><span>${l}</span></div></div>`).join('');
UI.popup(0);
'''
print(write('S6','电力监控',5,'',left,ctop,cmid,right,'分区用电负荷带',js))
