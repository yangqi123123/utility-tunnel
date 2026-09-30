# -*- coding: utf-8 -*-
from gen import *

left = '\n'.join([
 pnl('camera','视频设备在线统计','''<div class="kpi" style="grid-template-columns:repeat(2,1fr)">
            <div class="k"><span class="ki"><svg class="si"><use href="#i-camera"/></svg></span><span class="kt"><span class="l">摄像机总数</span><span class="v">32</span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-check"/></svg></span><span class="kt"><span class="l">在线</span><span class="v">31</span></span></div>
            <div class="k warn"><span class="ki"><svg class="si"><use href="#i-offline"/></svg></span><span class="kt"><span class="l">离线</span><span class="v">1</span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-history"/></svg></span><span class="kt"><span class="l">录像可回溯</span><span class="v">118<small>天</small></span></span></div></div>
          <div class="barlist" id="sto" style="flex:0 0 auto"></div>
          <div class="hint"><b>IP-SAN ×2</b>· 有效容量 500TB · RAID 5/6 · 按 4Mbps × 32 路测算</div>''',
     sub='GB/T 28181', tag='在线率 96.9%', basis='0 0 470px'),
 pnl('lock','门禁出入事件流','<div class="flow" id="acc"></div>', sub='无有效审批刷卡标红', tag='今日 26', basis='0 0 470px'),
 pnl('fence','入侵防区与声光','<div class="grid9" id="zone" style="grid-template-columns:repeat(2,1fr)"></div>',
     sub='布防 / 撤防 / 报警', tag='8 防区', basis='0 0 376px'),
])

right = '\n'.join([
 c1('智能井盖非法开启','K3+120 · 无作业审批',1,'摄像机 C04-02 离线','水信舱 · F0301',1,True),
 pnl('camera','视频监控','<div class="vids" id="vids"></div>', sub='点击底板摄像机可直接起流', tag='按舱室 30s', basis='0 0 560px'),
 pnl('manhole','智能井盖状态','<div class="grid9" id="lid" style="grid-template-columns:repeat(4,1fr)"></div>',
     sub='40 套 · 与底板双向联动', tag='异常 1', basis='0 0 420px'),
 pnl('clipbrd','电子巡查记录','<div class="tb" id="pt"></div>', sub='正点率 / 误点率 / 漏检', basis='0 0 520px'),
])

ctop = '        ' + srch('搜索摄像机 / 门禁 / 防区') + '\n        ' + seg(('全部',1),('视频',0),('门禁',0),('入侵',0),('井盖',0)) + '\n        ' + seg(('地图',1),('视频墙',0))
cmid = '        ' + layers('安防图层',[('摄像机 32',1,'cam'),('门禁出入口 8',1,'gate'),('入侵防区 8',1,'zone'),('电子巡查点 24',1,'pt'),('智能井盖 40',1,'lid')])

js = '''
UI.corridorMap(UI.$('base'), {
  zones:{9:'a'},
  legendTitle:'安防点位',
  legend:[['#3FE3FF','摄像机 32 · 在线 31'],['#7FD4FF','门禁出入口 8'],['#8FB4D6','智能井盖 40 · 异常 1']],
  points:[[.04,'door','1# 出入口'],[.07,'cam',''],[.11,'lid',''],[.15,'cam',''],[.19,'pt',''],
    [.23,'lid',''],[.27,'cam',''],[.31,'pt',''],[.35,'door','2# 出入口'],[.38,'cam',''],
    [.42,'lid',''],[.46,'pt',''],[.50,'cam',''],[.54,'lid',''],[.58,'pt',''],
    [.62,'cam',''],[.66,'lid',''],[.70,'door','3# 出入口'],[.74,'cam',''],[.78,'pt',''],
    [.82,'lid',''],[.86,'cam',''],[.90,'pt',''],[.94,'door','4# 出入口'],[.97,'cam','']],
  alarms:[[9.5/21,'JG-018 非法开启 · K3+120']],
  title:'安防监控 · 视频 / 入侵 / 出入口控制 / 电子巡查 / 智能井盖',
  sub:'摄像机 32 路　·　门禁 8 处　·　防区 8 个　·　井盖 40 套　·　GB/T 28181 接入'
});
UI.band(UI.$('segs'), UI.$('ticks'), {9:'a'});
UI.barlist(UI.$('sto'), [['已用容量 (TB)',412,'#3FE3FF'],['剩余容量 (TB)',88,'#20E08C']]);
UI.$('acc').innerHTML=[['14:22:10','张建国 进 1# 出入口','作业票 ZY-0914-03 · 已授权',0],
  ['14:18:45','李伟 进 2# 出入口','作业票 ZY-0914-05 · 已授权',0],
  ['13:56:02','未知卡号 0x8A2F 刷卡','3# 出入口 · 无有效审批 · 已拒绝',1],
  ['13:40:18','王海涛 进 2# 出入口','作业票 ZY-0914-02 · 已授权',0],
  ['13:02:55','陈晓 出 1# 出入口','作业完成 · 时长 96 min',0],
  ['12:31:07','张建国 出 1# 出入口','换班',0]].map(([t,m,e,no])=>
  `<div class="fw ${no?'no':''}">${UI.SI('lock')}<span class="tm">${t}</span><span class="m">${m}<em>${e}</em></span></div>`).join('');
UI.syscards(UI.$('zone'), [['防区 1 综合舱','布防','正常','','fence'],['防区 2 综合舱','布防','正常','','fence'],
  ['防区 3 电力舱','布防','正常','','fence'],['防区 4 电力舱','撤防','作业中','warn','helmet'],
  ['防区 5 燃气舱','布防','正常','','fence'],['防区 6 燃气舱','布防','正常','','fence'],
  ['防区 7 水信舱','布防','正常','','fence'],['防区 8 出入口','布防','正常','','lock']]);
UI.vids(UI.$('vids'), [
  ['CAM-C01-07 综合舱 F0102','14:26:05','assets/video/cam3.mp4'],
  ['CAM-S-03 K3+120 井口','14:26:05','assets/video/cam4.mp4'],
  ['CAM-C03-03 电力舱 F0103','14:26:05','assets/video/cam1.mp4'],
  ['CAM-G-02 2# 出入口','14:26:05','assets/video/cam2.mp4']]);
(function(){
  let h='';
  for(let i=1;i<=40;i++){
    const bad=(i===18), off=(i===33);
    h+=`<div class="sysc ${bad?'off':(off?'warn':'')}" style="padding:8px 6px;text-align:center">
      <div class="n" style="font-size:16px;justify-content:center"><span class="dot"></span>${String(i).padStart(2,'0')}</div></div>`;
  }
  UI.$('lid').innerHTML=h;
})();
(function(){
  const R=[['张建国','综合舱 8 点','8','0','100%','ok'],['李伟','电力舱 6 点','5','1','83.3%','w'],
    ['王海涛','燃气舱 6 点','6','0','100%','ok'],['陈晓','水信舱 4 点','4','0','100%','ok'],
    ['合计','24 点','23','1','95.8%','ok']];
  UI.$('pt').innerHTML='<table><tr><th>巡查人</th><th>范围</th><th>已巡</th><th>漏检</th><th>正点率</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="n">${r[2]}</td><td class="${r[3]==='0'?'ok':'bad'}">${r[3]}</td><td class="${r[5]}">${r[4]}</td></tr>`).join('')+'</table>';
})();
UI.popup(0);
'''
print(write('S4','安防监控',3,'',left,ctop,cmid,right,'分区安防状态带',js))
