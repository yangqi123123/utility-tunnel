# -*- coding: utf-8 -*-
from gen import *

left = '\n'.join([
 pnl('chart','报警统计','''<div class="kpi" style="grid-template-columns:repeat(3,1fr)">
            <div class="k"><span class="ki"><svg class="si"><use href="#i-bell"/></svg></span><span class="kt"><span class="l">本月报警</span><span class="v">412</span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-check"/></svg></span><span class="kt"><span class="l">闭环率</span><span class="v">98.3<small>%</small></span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-clock"/></svg></span><span class="kt"><span class="l">平均闭环</span><span class="v">26<small>min</small></span></span></div></div>
          <div class="chart" style="flex:1;min-height:0"><svg viewBox="0 0 600 260" id="am"></svg></div>
          <div class="hint"><b>按日分级堆叠</b>· 红=三级 橙=二级 青=一级</div>''',
     sub='本月按日', tag='2026-09', basis='0 0 640px'),
 pnl('target','报警热点 TOP10','<div class="barlist" id="hot"></div>',
     sub='点击即在底板热力图定位', tag='含误报率', basis='0 0 700px'),
 pnl('trend','环境趋势与超标统计','''<div class="chart" style="flex:1;min-height:0"><svg viewBox="0 0 600 220" id="et"></svg></div>
          <div class="barlist" id="ex" style="flex:0 0 auto"></div>''',
     sub='各舱室六参数', tag='本月', basis='0 0 620px'),
])

right = '\n'.join([
 c1('电气火灾剩余电流偏高','电力舱 · F0104 · 回路 K12',3,'通风机振动超标','电力舱 · F0103',1,True),
 pnl('link','联动有效性','<div class="tb" id="lnk"></div>', sub='规则调优依据', tag='9 条规则', basis='0 0 540px'),
 pnl('server','接口与网络健康','<div class="tb" id="net"></div>', sub='三网 + 9 类子系统', tag='可用率 99.6%', basis='0 0 740px'),
 pnl('clipbrd','巡检与维保质量','<div class="barlist" id="qa"></div>', sub='按班组对比', tag='本月', basis='0 0 460px'),
])

ctop = ('        ' + seg(('日',0),('周',0),('月',1),('自定义',0)) + '\n        ' +
  seg(('全线',1),('按舱室',0),('按子系统',0),('按班组',0)) + '\n        ' +
  seg(('报警热点',1),('设备健康度',0),('能耗',0),('漏检点位',0)))
cmid = '        ' + layers('落图主题',[('报警热点热力',1,'zone'),('设备健康度分色',0),('能耗按舱室分色',0),('漏检点位',0,'pt'),('通信中断点位',0)])

js = '''
UI.corridorMap(UI.$('base'), {
  zones:{3:'w',7:'a',9:'w',12:'w',15:'a',18:'o'},
  legendTitle:'报警热点热力',
  legend:[['#FF4D5E','高频（≥20 次/月）3 区'],['#FFA63D','中频（8~19 次）4 区'],['#20E08C','低频（<8 次）14 区']],
  points:[[.16,'env','F0103 · 46 次'],[.36,'env','F0104 · 28 次'],[.74,'env','F0301 · 22 次']],
  alarms:[[7.5/21,'F0103 报警热点 46 次 / 月','#FF4D5E'],[15.5/21,'F0301 报警热点 22 次 / 月','#FFA63D']],
  title:'统计分析 · 分析结果落图（报警热点热力）',
  sub:'本月 412 条报警　·　TOP3 分区占 47%　·　点击落图单元查看明细与历史曲线'
});
UI.band(UI.$('segs'), UI.$('ticks'), {3:'w',7:'a',9:'w',12:'w',15:'a',18:'o'});
UI.line(UI.$('am'), [
  {v:[12,9,14,18,11,8,16,22,19,13,10,17,24,20,15,11,9,18,26,21,16,12,14,19,23,17,13,10,15],c:'#3FE3FF'},
  {v:[4,2,5,7,3,2,6,9,7,4,3,6,10,8,5,3,2,7,11,8,6,4,5,7,9,6,4,3,5],c:'#FFA63D'},
  {v:[1,0,1,2,0,0,1,2,1,0,0,1,3,2,1,0,0,1,3,2,1,0,1,2,2,1,0,0,1],c:'#FF4D5E'}
], {max:30,min:0,labels:['09-01','09-08','09-15','09-22','09-29']});
UI.barlist(UI.$('hot'), [
  ['F0103 甲烷 CH4　误报 4%',46,'#FF4D5E'],['F0104 剩余电流　误报 11%',28,'#FF4D5E'],
  ['F0301 集水井水位　误报 2%',22,'#FFA63D'],['F0102 感温模块　误报 26%',19,'#FFA63D'],
  ['JG-018 智能井盖　误报 8%',16,'#FFA63D'],['F0201 氧气浓度　误报 3%',12,'#20E08C'],
  ['CAM-C04-02 离线　误报 0%',9,'#20E08C'],['F0202 硫化氢　误报 5%',7,'#20E08C']]);
UI.line(UI.$('et'), [
  {v:[22.1,22.6,23.4,24.2,25.1,25.8,26.2,26.4],c:'#FFD85E'},
  {v:[68,70,72,74,76,77,78,78],c:'#3FE3FF'},
  {v:[20.9,20.8,20.6,20.4,20.2,20.0,19.9,19.8],c:'#20E08C'}
], {max:100,min:0,h:220,labels:['09-01','09-15','09-29']});
UI.barlist(UI.$('ex'), [['甲烷超标次数',31,'#FF4D5E'],['氧气偏低次数',18,'#FFA63D'],['水位超高次数',12,'#3FE3FF']]);
(function(){
  const R=[['R-GAS-01 可燃气体超限','14','13','1','92.9%','w'],['R-WL-02 集水井高水位','22','22','0','100%','ok'],
    ['R-O2-03 氧气偏低','9','9','0','100%','ok'],['R-NET-09 通信中断','11','10','1','90.9%','w']];
  UI.$('lnk').innerHTML='<table><tr><th>规则</th><th>触发</th><th>成功</th><th>失败</th><th>成功率</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td class="n">${r[1]}</td><td class="ok">${r[2]}</td><td class="${r[3]==='0'?'':'bad'}">${r[3]}</td><td class="${r[5]}">${r[4]}</td></tr>`).join('')+'</table>';
})();
(function(){
  const R=[['消防专网','99.98%','0 次','—','ok'],['安防监控网','99.82%','2 次','14 min','ok'],
    ['环境与设备监控网','99.41%','5 次','3.2 h','w'],
    ['环控 OPC','99.6%','3 次','1.8 h','w'],['视频 GB28181','99.9%','1 次','8 min','ok'],
    ['智能井盖 Modbus','97.2%','12 次','14.6 h','bad']];
  UI.$('net').innerHTML='<table><tr><th>网络 / 接口</th><th>可用率</th><th>中断次数</th><th>累计时长</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td class="${r[4]}">${r[1]}</td><td class="n">${r[2]}</td><td class="${r[4]}">${r[3]}</td></tr>`).join('')+'</table>';
})();
UI.barlist(UI.$('qa'), [['运维一班 正点率',96,'#20E08C'],['运维二班 正点率',91,'#20E08C'],
  ['运维三班 正点率',84,'#FFA63D'],['设备检测合格率',93,'#20E08C'],['工单按时完成率',88,'#FFA63D']]);
UI.popup(0);
'''
print(write('S9','统计分析',8,'',left,ctop,cmid,right,'报警热点分布带',js))
