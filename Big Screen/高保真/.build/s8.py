# -*- coding: utf-8 -*-
from gen import *

left = '\n'.join([
 pnl('warn','主事件卡','''<div style="display:flex;align-items:center;gap:18px">
            <span class="pill red" style="font-size:20px;padding:8px 16px">三级紧急</span>
            <b style="font-size:34px;color:#FFD9DD;letter-spacing:2px">可燃气体超限</b></div>
          <div class="tb" style="flex:0 0 auto;margin-top:6px"><table>
            <tr><td>位置</td><td class="n">电力舱 · F0103 防火分区 · K1+280</td></tr>
            <tr><td>测点位号</td><td class="n">WLYL-C03-F0103-ENV01-CH4</td></tr>
            <tr><td>触发值</td><td class="bad">42 %LEL　＞ 阈值 40 %LEL</td></tr>
            <tr><td>发生时刻</td><td class="n">2026-09-14 14:26:08</td></tr>
            <tr><td>已持续</td><td class="bad">00:08:42</td></tr>
            <tr><td>签收人</td><td class="n">张值班　14:26:31 签收</td></tr>
            <tr><td>处置工单</td><td class="n">WO-EMG-2609140031 · 李伟 · <span class="bad">剩余 21:18</span></td></tr></table></div>''',
     sub='三级紧急报警自动切入', tag='锁定中', basis='0 0 900px', cls='pal'),
 pnl('link','联动执行进度','<div class="steps" id="stp"></div>', sub='含回读值与耗时', tag='7 步 / 已完成 5', basis='0 0 680px', cls='pem'),
 pnl('plan','预案处置步骤','<div class="steps" id="plan"></div>', sub='YA-GAS-01', tag='计时中', basis='0 0 500px', cls='pem'),
])

right = '\n'.join([
 c1('甲烷检测仪告警','电力舱 · F0103 · K1+280',5,'通风机启动失败','电力舱 · F0103',2,True),
 pnl('phone','调度与通讯','''<div class="dial">
            <b class="rec"><svg class="si"><use href="#i-phone"/></svg>组呼中</b>
            <b><svg class="si"><use href="#i-speaker"/></svg>分区广播</b>
            <b><svg class="si"><use href="#i-signal"/></svg>外线出局</b>
          </div>
          <div class="cts" id="cts" style="margin-top:12px;flex:0 0 auto"></div>
          <div class="flow" id="rep" style="flex:0 0 auto;margin-top:12px"></div>''',
     sub='呼入显示地址码与舱号 · 含上报状态', basis='0 0 1045px'),
 pnl('gas','事发与相邻分区环境','''<div class="chart" style="flex:1;min-height:0"><svg viewBox="0 0 600 260" id="ev"></svg></div>
          <div class="envbar" style="grid-template-columns:repeat(3,1fr);flex:0 0 auto">
            <div class="e bad"><div class="n">F0103 甲烷</div><div class="v">42<i>%LEL</i></div></div>
            <div class="e mid"><div class="n">F0102 甲烷</div><div class="v">18<i>%LEL</i></div></div>
            <div class="e"><div class="n">F0104 甲烷</div><div class="v">6<i>%LEL</i></div></div></div>''',
     sub='判断态势是否恶化', tag='3s', basis='0 0 255px'),
 pnl('bell','待处理事件队列','<div class="alist" id="alist"></div>', sub='点击切换主事件', tag='4 条', basis='0 0 780px', cls='pal'),
])

ctop = '        ' + srch('搜索事件 / 位号') + '\n        ' + seg(('GIS 放大',1),('断面示意',0)) + '\n        ' + seg(('逃生路径',1),('消防设施',1),('联动设备',1))
cmid = '        ' + layers('应急图层',[('事发点位',1,'alarm'),('已执行联动设备',1,'vent'),('逃生路径',1,'pipe'),('消防设施',1,'hyd'),('相邻分区环境',1,'env')])

js = '''
UI.corridorMap(UI.$('base'), {
  zones:{6:'w',7:'a',8:'w'},
  legendTitle:'应急处置',
  legend:[['#FF4D5E','事发点位 F0103'],['#20E08C','已执行联动设备 5'],['#FFD85E','最近出入口 2# · 120m']],
  points:[[.16,'gate','2# 出入口 120m'],[.26,'vent','事故风机 已启'],[.34,'hyd','消火栓'],
    [.30,'cam',''],[.46,'vent','相邻送风 已关'],[.56,'gate','3# 投料口 260m'],
    [.22,'cam',''],[.64,'cam','关联摄像机'],[.72,'gate','']],
  alarms:[[7.5/21,'甲烷 42 %LEL · F0103']],
  title:'应急指挥 · 事发分区放大　电力舱 F0103 · K1+280',
  sub:'底板已自动平移缩放至事发分区　·　叠加逃生路径 / 消防设施 / 已执行联动设备'
});
UI.band(UI.$('segs'), UI.$('ticks'), {6:'w',7:'a',8:'w'});
UI.$('stp').innerHTML=[['ok','① 启动本分区事故通风','FAN01/FAN02 已运行 · 回读 ✓ · 耗时 6s'],
  ['ok','② 关闭相邻分区送风','F0102/F0104 送风已停 · 回读 ✓ · 耗时 8s'],
  ['ok','③ 调阅本分区全部摄像机','4 路已起流 · 录像标记已开始'],
  ['ok','④ GIS 定位并大屏置顶','事发点已居中 · 闪烁中'],
  ['ok','⑤ 分区定向广播「禁止入廊」','F0102-F0104 已播 3 遍'],
  ['fail','⑥ 启动 3# 事故风机','回读超时 ✗ · 已重试 2 次 · 转人工'],
  ['run','⑦ 推送值班长 + 燃气管线单位','已推送 · 等待回执']].map(([c,t,s],i)=>
  `<div class="stp ${c}"><span class="dot">${c==='ok'?'✓':(c==='fail'?'✗':i+1)}</span>
    <span class="c"><b>${t}</b><span>${s}</span></span></div>`).join('');
UI.$('plan').innerHTML=[['ok','确认报警真实性','值班员 · 14:26:31 · 限 2 min'],
  ['ok','通知燃气管线单位到场','客服 · 14:28:10 · 限 5 min'],
  ['run','现场人员撤离确认','安全员 · 计时 03:12 · 限 10 min'],
  ['','切断本分区非防爆电源','电气值班 · 待执行 · 限 15 min'],
  ['','浓度复归后恢复通风','运维班 · 待执行']].map(([c,t,s],i)=>
  `<div class="stp ${c}"><span class="dot">${c==='ok'?'✓':i+1}</span>
    <span class="c"><b>${t}</b><span>${s}</span></span></div>`).join('');
UI.$('cts').innerHTML=[['值','中心值班室','张值班 · 组呼中','8001'],['运','管廊运维班','李伟 · 已接通','8012'],
  ['燃','燃气公司抢修','已呼叫 · 未接','13800138002']].map(([a,n,r,t])=>
  `<div class="ct"><div class="av">${a}</div><div class="i"><b>${n}</b><span>${r}</span></div>
    <div class="tel">${UI.SI('phone')}${t}</div></div>`).join('');
UI.line(UI.$('ev'), [
  {v:[8,10,12,15,18,22,27,32,36,39,42,42],c:'#FF4D5E'},
  {v:[4,5,6,7,9,11,13,15,16,17,18,18],c:'#FFA63D'},
  {v:[2,2,3,3,4,4,5,5,6,6,6,6],c:'#20E08C'}
], {max:50,min:0,labels:['-10min','-5min','现在']});
UI.alist(UI.$('alist'), [
  ['l3','甲烷浓度超限 42 %LEL','电力舱 · F0103 · 14:26:08','red','主事件','','gas'],
  ['l3','集水井超高水位 1.2m','水信舱 · F0301 · 14:11:33','org','处置中','','level'],
  ['l2','通风机启动失败','电力舱 · F0103 · 14:26:22','red','未签收','00:12','fan'],
  ['l2','通风机通信中断','综合舱 · F0102 · 13:52:07','org','处置中','','fan']]);
UI.$('rep').innerHTML=[['14:26:40','已上报区域级监控中心','接口 I-15 · 回执 OK',0],
  ['14:27:05','已通知中电管线单位','短信 + 电话 · 已确认',0],
  ['14:28:10','已通知燃气公司抢修','电话未接 · 已转短信',1]].map(([t,m,e,no])=>
  `<div class="fw ${no?'no':''}">${UI.SI('signal')}<span class="tm">${t}</span><span class="m">${m}<em>${e}</em></span></div>`).join('');
UI.spark(UI.$('sp'), [8,9,8,10,11,10,12,14,13,16,18,17,21,24,23,28,31,30,34,38,42], 46, 40);
UI.popup(5200);
'''

mask = MASK.format(maskcls='', lvl='三级紧急', ptitle='可燃气体超限', qn=4, sparktitle='触发前后 30 分钟趋势（%LEL）',
  pfields='''          <div class="f"><span class="k">位置</span><span class="v">电力舱 · F0103 防火分区 · K1+280</span></div>
          <div class="f"><span class="k">测点位号</span><span class="v">WLYL-C03-F0103-ENV01-CH4</span></div>
          <div class="f"><span class="k">触发值</span><span class="v"><b>42</b> %LEL　<em>＞ 阈值 40 %LEL</em></span></div>
          <div class="f"><span class="k">发生时刻</span><span class="v">2026-09-14 14:26:08</span></div>
          <div class="f"><span class="k">已持续</span><span class="v"><em>00:00:12</em></span></div>
          <div class="f"><span class="k">当前状态</span><span class="v"><span class="pill red">未签收</span></span></div>
          <div class="f"><span class="k">历史同类</span><span class="v">近 30 日该测点共 2 次</span></div>''')

print(write('S8','应急指挥',7,'',left,ctop,cmid,right,'事件时间轴　触发 → 推送 → 签收 → 联动 → 到场 → 处置 → 复归 → 销警',js,mask))
