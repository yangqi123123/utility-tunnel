# -*- coding: utf-8 -*-
from gen import *

left = '\n'.join([
 pnl('fire','火灾报警统计','''<div class="kpi" style="grid-template-columns:repeat(2,1fr)">
            <div class="k"><span class="ki"><svg class="si"><use href="#i-fire"/></svg></span><span class="kt"><span class="l">今日火警</span><span class="v">0</span></span></div>
            <div class="k warn"><span class="ki"><svg class="si"><use href="#i-warn"/></svg></span><span class="kt"><span class="l">故障信号</span><span class="v">2</span></span></div>
            <div class="k warn"><span class="ki"><svg class="si"><use href="#i-offline"/></svg></span><span class="kt"><span class="l">屏蔽点位</span><span class="v">1</span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-eye"/></svg></span><span class="kt"><span class="l">监管信号</span><span class="v">0</span></span></div></div>
          <div class="chart" style="flex:1;min-height:0"><svg viewBox="0 0 460 200" id="tr"></svg></div>
          <div class="hint"><b>近 24h</b>· 柱为报警条数 · 线为未闭环累计</div>''',
     sub='FAS · 电气火灾', tag='今日', basis='0 0 430px'),
 pnl('layers','防火分区状态','<div class="grid9" id="fz"></div>', sub='探测器在线率', tag='21 区', basis='0 0 430px'),
 pnl('extg','消防设施台账','<div class="tb" id="fac"></div>', sub='灭火器 / 消火栓', tag='到期提醒 2', basis='0 0 500px'),
])

right = '\n'.join([
 c1('电气火灾剩余电流偏高','电力舱 · F0104 · 回路 K12',1,'感温电缆模块故障','综合舱 · F0102',2,True),
 pnl('bell','FAS 实时报警列表','<div class="alist" id="alist"></div>', sub='火警 / 故障 / 屏蔽 / 监管', tag='未闭环 3', basis='0 0 620px'),
 pnl('bolt','电气火灾监控','<div class="tb" id="ele"></div>', sub='剩余电流 · 温度 · 故障电弧', basis='0 0 560px'),
 pnl('door','防火门与消防电源','<div class="grid9" id="door" style="grid-template-columns:repeat(2,1fr)"></div>',
     sub='只读 · 含消防联动记录', tag='正常 18 / 20', basis='0 0 420px'),
])

ctop = '        ' + srch('搜索探测器 / 回路 / 部件') + '\n        ' + seg(('全部',1),('火警',0),('故障',0),('屏蔽',0),('监管',0))
cmid = '        ' + layers('消防图层',[('感烟 / 感温探测器',1,'fire'),('手动报警按钮',1,'alarm'),('消火栓 / 灭火器',1,'hyd'),('防火门',1,'door'),('应急照明',1,'lamp')])

js = '''
UI.corridorMap(UI.$('base'), {
  zones:{3:'w',9:'w',15:'g'},
  legendTitle:'消防点位',
  legend:[['#FF4D5E','感烟 / 感温探测器 168'],['#FF8A3D','消火栓 24 · 灭火器 96'],['#7FD4FF','防火门 20 · 应急照明']],
  points:[[.04,'fire',''],[.08,'hyd','消火栓'],[.12,'fire',''],[.16,'door','防火门'],[.20,'fire',''],
    [.24,'hyd',''],[.28,'fire',''],[.32,'door',''],[.36,'fire',''],[.40,'hyd','消火栓'],
    [.44,'fire',''],[.48,'door','防火门'],[.52,'fire',''],[.56,'hyd',''],[.60,'fire',''],
    [.64,'door',''],[.68,'fire',''],[.72,'hyd','消火栓'],[.76,'fire',''],[.80,'door',''],
    [.84,'fire',''],[.88,'hyd',''],[.92,'fire',''],[.96,'door','防火门']],
  alarms:[[3.5/21,'剩余电流 512mA · F0104','#FFA63D']],
  title:'消防监控 · 火灾自动报警 / 电气火灾 / 防火门 / 应急照明',
  sub:'FAS 主机 1 台　·　探测器 168 只　·　OPC DA 接入　·　平台只监视不控制'
});
UI.band(UI.$('segs'), UI.$('ticks'), {3:'w',9:'w',15:'g'});
UI.bars24(UI.$('tr'), [0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0], '#FFA63D');
UI.syscards(UI.$('fz'), [['F0101','探测器 8/8','100%','','smoke'],['F0102','探测器 7/8','87.5%','warn','smoke'],
  ['F0103','探测器 8/8','100%','','smoke'],['F0104','探测器 8/8','100%','warn','smoke'],
  ['F0201','探测器 8/8','100%','','smoke'],['F0202','探测器 8/8','100%','','smoke'],
  ['F0301','探测器 6/6','100%','','smoke'],['F0302','探测器 6/6','100%','','smoke'],
  ['F0401','探测器 6/6','100%','','smoke']]);
(function(){
  const R=[['灭火器 MFZ/ABC4','综合舱 F0101','24 具','2027-03','ok'],
    ['灭火器 MFZ/ABC4','电力舱 F0103','24 具','2026-10','w'],
    ['室内消火栓','全线均布','24 套','2027-06','ok'],
    ['消防水带 25m','出入口箱','24 盘','2026-09','bad'],
    ['感温光纤','电力舱全线','2.1 km','—','ok'],
    ['防火门','各分区隔墙','20 樘','2027-01','ok']];
  UI.$('fac').innerHTML='<table><tr><th>设施</th><th>位置</th><th>数量</th><th>有效期</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="n">${r[2]}</td><td class="${r[4]}">${r[3]}</td></tr>`).join('')+'</table>';
})();
UI.alist(UI.$('alist'), [
  ['l2','电气火灾 剩余电流 512mA','电力舱 · F0104 回路 K12 · 14:02:18','org','处置中','','bolt'],
  ['l2','2# 感温电缆模块通信故障','综合舱 · F0102 · 13:40:52','org','处置中','','temp'],
  ['l1','1# 手报按钮屏蔽中','综合舱 · F0101 · 09:15:00','org','已屏蔽','','bell'],
  ['l1','防火门 FM-0205 未闭合','燃气舱 · F0202 · 08:22:31','grn','已销警','','door']]);
(function(){
  const R=[['K10 综合舱照明','128 mA','32.4 ℃','正常','ok'],['K11 电力舱动力','206 mA','38.1 ℃','正常','ok'],
    ['K12 电力舱动力','512 mA','46.8 ℃','越限','bad'],['K13 燃气舱照明','94 mA','29.6 ℃','正常','ok'],
    ['K14 水信舱动力','142 mA','31.2 ℃','正常','ok']];
  UI.$('ele').innerHTML='<table><tr><th>回路</th><th>剩余电流</th><th>温度</th><th>状态</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td class="${r[4]}">${r[1]}</td><td class="${r[4]}">${r[2]}</td><td class="${r[4]}">${r[3]}</td></tr>`).join('')+'</table>';
})();
UI.syscards(UI.$('door'), [['防火门 20 樘','闭合 19 / 开启 1','FM-0205 未闭合','warn','door'],
  ['消防电源','主电 正常','备电 充足','','ups'],['应急照明','160 盏','故障 1 盏','warn','light'],
  ['防火卷帘','4 樘','全部到位','','layers']]);
UI.popup(0);
'''

print(write('S3','消防监控',2,'',left,ctop,cmid,right,'防火分区消防状态带',js))
