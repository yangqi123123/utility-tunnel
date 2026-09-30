# -*- coding: utf-8 -*-
from gen import *

left = '\n'.join([
 pnl('signal','分机在线统计','''<div class="kpi" style="grid-template-columns:repeat(2,1fr)">
            <div class="k"><span class="ki"><svg class="si"><use href="#i-phone"/></svg></span><span class="kt"><span class="l">应急电话分机</span><span class="v">48</span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-check"/></svg></span><span class="kt"><span class="l">在线</span><span class="v">47</span></span></div>
            <div class="k warn"><span class="ki"><svg class="si"><use href="#i-offline"/></svg></span><span class="kt"><span class="l">离线</span><span class="v">1</span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-speaker"/></svg></span><span class="kt"><span class="l">广播分区</span><span class="v">12</span></span></div></div>
          <div class="barlist" id="cap" style="flex:0 0 auto"></div>
          <div class="hint"><b>IP 核心调度</b>· 500 用户 · 最大 50 路并发 · 4 路外线出局</div>''',
     sub='SIP 2.0 接入', tag='巡检通过', basis='0 0 580px'),
 pnl('phone','呼叫记录','<div class="tb" id="call"></div>', sub='含分机地址码与舱号', tag='今日 14', basis='0 0 600px'),
 pnl('mic','录音记录','<div class="flow" id="rec"></div>', sub='按通话关联归档', tag='3.1 万小时', basis='0 0 460px'),
])

right = '\n'.join([
 c1('分机呼入未接','电力舱 · F0104 · 已重呼 2 次',1,'LED-03 屏体离线','3# 出入口',1,True),
 pnl('device','调度台','''<div class="dial">
            <b><svg class="si"><use href="#i-phone"/></svg>一键组呼</b>
            <b><svg class="si"><use href="#i-speaker"/></svg>全线广播</b>
            <b><svg class="si"><use href="#i-signal"/></svg>外线出局</b>
            <b class="rec"><svg class="si"><use href="#i-mic"/></svg>录音中</b>
          </div>
          <div class="cts" id="cts" style="margin-top:14px"></div>''',
     sub='通讯录 + 呼叫控制', basis='0 0 558px', cls='pem'),
 pnl('speaker','广播分区控制','<div class="ctl" id="bc"></div><div class="grpctl"><b>全线广播</b><b>预置语音</b><b>停止</b></div>',
     sub='分区 / 舱室 / 全线三级', basis='0 0 622px', cls='pem'),
 pnl('board','LED 信息发布','<div class="tb" id="led"></div>', sub='应急插播优先级最高', tag='4 屏', basis='0 0 480px'),
])

ctop = '        ' + srch('搜索分机 / 舱号 / 地址码') + '\n        ' + seg(('全部',1),('应急电话',0),('广播',0),('LED',0))
cmid = '        ' + layers('通信图层',[('应急电话分机 48',1,'tel'),('广播分区 12',1,'bcast'),('LED 屏 4',1,'led'),('语音网关',1,'gate'),('出入口',0,'pipe')])

js = '''
UI.corridorMap(UI.$('base'), {
  zones:{4:'w'},
  legendTitle:'通信点位',
  legend:[['#3FE3FF','应急电话分机 48 · 在线 47'],['#FFD85E','广播分区 12'],['#A77BFF','LED 信息屏 4']],
  points:[[.04,'led','1# LED'],[.08,'tel',''],[.14,'bcast',''],[.18,'tel',''],[.24,'tel',''],
    [.28,'bcast','广播分区'],[.32,'tel',''],[.38,'led','2# LED'],[.42,'tel',''],[.46,'bcast',''],
    [.52,'tel',''],[.56,'bcast','广播分区'],[.60,'tel',''],[.66,'led','3# LED'],[.70,'tel',''],
    [.74,'bcast',''],[.80,'tel',''],[.84,'bcast','广播分区'],[.88,'tel',''],[.94,'led','4# LED'],[.97,'tel','']],
  alarms:[[4.5/21,'分机呼入未接','#FFA63D']],
  title:'通信广播 · 应急电话 / IP 广播 / LED 信息发布',
  sub:'分机 48 台（按舱号编址）　·　广播分区 12 个　·　SIP 2.0 接入　·　通话全程录音'
});
UI.band(UI.$('segs'), UI.$('ticks'), {4:'w'});
UI.barlist(UI.$('cap'), [['当前并发通话',3,'#3FE3FF'],['今日峰值并发',11,'#FFD85E'],['授权上限',50,'#20E08C']]);
(function(){
  const R=[['14:22:41','K2+400','电力舱 F0104','02:14','报警','转接','w'],
    ['13:58:06','K1+120','综合舱 F0101','01:02','正常','本地','ok'],
    ['13:20:33','K3+560','燃气舱 F0202','03:41','报警','转接','w'],
    ['12:44:18','K0+800','综合舱 F0101','00:48','正常','本地','ok'],
    ['11:52:09','K4+200','水信舱 F0301','05:12','报警','转接','w'],
    ['10:31:55','K2+060','电力舱 F0103','01:33','正常','本地','ok']];
  UI.$('call').innerHTML='<table><tr><th>时间</th><th>地址码</th><th>舱号 / 分区</th><th>时长</th><th>性质</th><th>处理</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td class="n">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td class="${r[6]}">${r[4]}</td><td>${r[5]}</td></tr>`).join('')+'</table>';
})();
UI.$('rec').innerHTML=[['14:22:41','REC-20260914-0142.wav','02:14 · 电力舱 F0104 · 报警通话',0],
  ['13:58:06','REC-20260914-0141.wav','01:02 · 综合舱 F0101',0],
  ['13:20:33','REC-20260914-0140.wav','03:41 · 燃气舱 F0202 · 报警通话',0],
  ['12:44:18','REC-20260914-0139.wav','00:48 · 综合舱 F0101',0]].map(([t,m,e,no])=>
  `<div class="fw">${UI.SI('mic')}<span class="tm">${t}</span><span class="m">${m}<em>${e}</em></span></div>`).join('');
UI.$('cts').innerHTML=[['值','中心值班室','张值班 · 当班','8001'],['运','管廊运维班','班组长 李工','8012'],
  ['电','中电管线单位','值班电话 / 24h 抢修','13800138001']].map(([a,n,r,t])=>
  `<div class="ct"><div class="av">${a}</div><div class="i"><b>${n}</b><span>${r}</span></div>
    <div class="tel">${UI.SI('phone')}${t}</div></div>`).join('');
UI.$('bc').innerHTML=[['综合舱 F0101-F0102','空闲','on'],['电力舱 F0103-F0104','广播中',''],['燃气舱 F0201-F0202','空闲','on'],['水信舱 F0301','空闲','on']].map(([n,s,c])=>
  `<div class="row ${c?'':'off'}"><span class="dv">${UI.SI('speaker')}</span>
    <span class="nm"><b>${n}</b><span>分区广播</span></span>
    <span class="stt"><span class="pill ${c?'grn':'org'}">${s}</span></span>
    <span class="sw"><b class="${c?'':'on'}">播</b><b>停</b></span></div>`).join('');
(function(){
  const R=[['1# LED 出入口','在线','应急插播','距起飞 12h 预警','w'],['2# LED 出入口','在线','常规','管廊安全须知','ok'],
    ['3# LED 出入口','离线','—','屏体离线 00:22','bad'],['4# LED 出入口','在线','常规','管廊安全须知','ok']];
  UI.$('led').innerHTML='<table><tr><th>屏体</th><th>状态</th><th>模式</th><th>当前内容</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td class="${r[4]}">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')+'</table>';
})();
UI.popup(0);
'''
print(write('S5','通信广播',4,'',left,ctop,cmid,right,'广播分区状态带',js))
