# -*- coding: utf-8 -*-
from gen import *

# ==================== S1 系统首页 ====================
left = '\n'.join([
 pnl('speed','关键指标','''<div class="kpi" style="grid-template-columns:repeat(2,1fr)">
            <div class="k"><span class="ki"><svg class="si"><use href="#i-device"/></svg></span><span class="kt"><span class="l">设备在线率</span><span class="v">98.6<small>%</small></span></span></div>
            <div class="k warn"><span class="ki"><svg class="si"><use href="#i-bell"/></svg></span><span class="kt"><span class="l">今日报警 / 未闭环</span><span class="v">17<small>/ 3</small></span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-person"/></svg></span><span class="kt"><span class="l">在廊人数</span><span class="v">4<small>人</small></span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-bolt"/></svg></span><span class="kt"><span class="l">今日能耗</span><span class="v">1842<small>kWh</small></span></span></div></div>
          <div class="envbar" style="grid-template-columns:repeat(3,1fr)">
            <div class="e mid"><span class="ei"><svg class="si"><use href="#i-gas"/></svg></span><span class="et"><span class="n">氧气</span><span class="v">19.8<i>%</i></span></span></div>
            <div class="e bad"><span class="ei"><svg class="si"><use href="#i-fire"/></svg></span><span class="et"><span class="n">甲烷</span><span class="v">42<i>%LEL</i></span></span></div>
            <div class="e"><span class="ei"><svg class="si"><use href="#i-warn"/></svg></span><span class="et"><span class="n">硫化氢</span><span class="v">2<i>ppm</i></span></span></div></div>
          <div class="hint"><b>全线最不利值</b>· 甲烷取自电力舱 F0103 · 温湿度与水位见下方分区矩阵</div>''',
     sub='全线最不利环境值', tag='今日', basis='0 0 570px'),
 pnl('pulse','运行状态总览','''<div class="rings" id="rings"></div>
          <div class="syslite" id="sys"></div>''',
     sub='机电四类 / 9 类子系统接入', tag='实时 3s', basis='0 0 640px'),
 pnl('temp','环境参数总览','''<div class="mx"><table id="mx"></table></div>
          <div class="demo"><em>原型演示</em>
            <button id="reopen">演示：三级报警弹框</button>
            <button id="toggleRail">收起 / 展开浮栏</button></div>''',
     sub='按防火分区', tag='越限高亮', basis='0 0 770px'),
])

right = '\n'.join([
 c1('甲烷检测仪告警','电力舱 · F0103 · K1+280',3,'暂无待处理报障','—',0),
 pnl('bell','实时报警列表','<div class="alist" id="alist"></div>', tag='未闭环 3', basis='0 0 700px'),
 pnl('trend','报警分级与 24h 趋势','''<div class="two" style="grid-template-columns:300px 1fr">
          <div class="donut"><svg width="230" height="230" viewBox="0 0 230 230" id="dn"></svg>
            <div class="c"><b>17</b><i>今日报警</i></div></div>
          <div style="display:grid;grid-template-columns:130px 1fr;gap:16px;min-width:0">
            <div class="lvs">
              <div class="lv"><span class="d" style="background:var(--red)"></span>三级紧急<b>2</b></div>
              <div class="lv"><span class="d" style="background:var(--org)"></span>二级报警<b>6</b></div>
              <div class="lv"><span class="d" style="background:var(--cy)"></span>一级预警<b>9</b></div></div>
            <div class="chart"><svg viewBox="0 0 460 200" id="tr"></svg></div></div></div>''', basis='0 0 505px'),
 pnl('camera','视频监控','<div class="vids" id="vids"></div>', tag='按舱室 30s', basis='0 0 535px'),
])

ctop = '        ' + srch('搜索点位 / 位号 / 防火分区') + '\n        ' + seg(('矢量',1),('卫星',0),('断面示意',0))
cmid = '        ' + layers('图层',[('摄像机 32',1,'cam'),('环境监测点 21',1,'env'),('智能井盖 40',1,'lid'),('出入口 / 通风口',1,'gate'),('入廊管线',0,'pipe')])

js = '''
UI.corridorMap(UI.$('base'), {
  zones:{7:'a',12:'w',18:'o'},
  points:[[.05,'gate','1# 出入口'],[.05,'cam',''],[.12,'env',''],[.14,'cam',''],[.18,'vent','通风口'],
    [.22,'lid',''],[.26,'cam',''],[.30,'env',''],[.34,'lid',''],[.36,'gate','2# 出入口'],
    [.40,'cam',''],[.44,'env',''],[.48,'lid',''],[.52,'vent','通风口'],[.56,'cam',''],
    [.60,'env',''],[.64,'lid',''],[.68,'cam',''],[.72,'gate','3# 投料口'],[.76,'env',''],
    [.80,'lid',''],[.84,'cam',''],[.88,'env',''],[.92,'vent','通风口'],[.96,'gate','4# 出入口']],
  alarms:[[7.5/21,'甲烷 42 %LEL · F0103']]
});
UI.band(UI.$('segs'), UI.$('ticks'), {7:'a',12:'w',18:'o'});
UI.ring(UI.$('rings'), [['通风',18,16,1],['排水',12,11,1],['照明',46,44,0],['供配电',8,8,0]]);
UI.syslite(UI.$('sys'), [['智能井盖 Modbus','','中断 04:12','off','manhole'],
  ['电子巡查 SDK','','延迟 1min','warn','clipbrd'],
  ['其余 7 类子系统','','OPC DA / GB28181 / SIP · 接入正常','','topo']]);
(function(){
  const H=['防火分区','温度','湿度','氧气','甲烷','硫化氢','水位'];
  const R=[['综合舱 F0101','23.1','71','20.8','2','1','0.4'],['综合舱 F0102','23.6','73','20.7','3','1','0.5'],
    ['电力舱 F0103','26.4','78','19.8','42','2','0.6'],['电力舱 F0104','25.2','74','20.4','6','1','0.4'],
    ['燃气舱 F0201','22.8','69','20.9','8','2','0.3'],
    ['水信舱 F0301','21.9','82','20.8','1','1','1.2']];
  let h='<tr>'+H.map(x=>`<th>${x}</th>`).join('')+'</tr>';
  R.forEach((r,i)=>{h+=`<tr class="${i===2?'hot':''}">`+r.map((c,j)=>{
    let cls=''; if(i===2&&j===4)cls='a'; else if(i===2&&j===3)cls='w'; else if(i===5&&j===6)cls='w';
    return `<td class="${cls}">${c}</td>`;}).join('')+'</tr>';});
  UI.$('mx').innerHTML=h;
})();
UI.alist(UI.$('alist'), [
  ['l3','甲烷浓度超限 42 %LEL','电力舱 · F0103 · 14:26:08','red','未签收','00:48','gas'],
  ['l3','集水井超高水位 1.2m','水信舱 · F0301 · 14:11:33','org','处置中','','level'],
  ['l2','通风机通信中断','综合舱 · F0102 · 13:52:07','org','处置中','','fan'],
  ['l1','照明回路 L3 电流偏高','综合舱 · F0101 · 13:20:44','grn','已销警','','light']]);
UI.donut(UI.$('dn'), [[2,'#FF4D5E'],[6,'#FFA63D'],[9,'#3FE3FF']], 17);
UI.bars24(UI.$('tr'), [1,0,0,1,2,0,1,3,2,1,0,1,2,1,0,2,3,4,2,1,0,0,1,2]);
UI.vids(UI.$('vids'), [
  ['CAM-C01-07 综合舱 F0102','14:26:05','assets/video/cam1.mp4'],
  ['CAM-C03-03 电力舱 F0103','14:26:05','assets/video/cam2.mp4'],
  ['CAM-C02-05 燃气舱 F0201','14:26:05','assets/video/cam3.mp4'],
  ['CAM-G-02 2# 出入口','14:26:05','assets/video/cam4.mp4']]);
UI.spark(UI.$('sp'), [8,9,8,10,11,10,12,14,13,16,18,17,21,24,23,28,31,30,34,38,42], 46, 40);
UI.popup(0);
'''

mask = MASK.format(maskcls=' hide', lvl='三级紧急', ptitle='可燃气体超限', qn=3, sparktitle='触发前后 30 分钟趋势（%LEL）',
  pfields='''          <div class="f"><span class="k">位置</span><span class="v">电力舱 · F0103 防火分区 · K1+280</span></div>
          <div class="f"><span class="k">测点位号</span><span class="v">WLYL-C03-F0103-ENV01-CH4</span></div>
          <div class="f"><span class="k">触发值</span><span class="v"><b>42</b> %LEL　<em>＞ 阈值 40 %LEL</em></span></div>
          <div class="f"><span class="k">发生时刻</span><span class="v">2026-09-14 14:26:08</span></div>
          <div class="f"><span class="k">已持续</span><span class="v"><em>00:00:12</em></span></div>
          <div class="f"><span class="k">当前状态</span><span class="v"><span class="pill red">未签收</span></span></div>
          <div class="f"><span class="k">历史同类</span><span class="v">近 30 日该测点共 2 次</span></div>''')

print(write('S1','系统首页',0,'',left,ctop,cmid,right,'管廊全线态势带',js,mask))
