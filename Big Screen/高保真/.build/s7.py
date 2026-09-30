# -*- coding: utf-8 -*-
from gen import *

left = '\n'.join([
 pnl('clipbrd','巡检进度','''<div class="kpi" style="grid-template-columns:repeat(3,1fr)">
            <div class="k"><span class="ki"><svg class="si"><use href="#i-map"/></svg></span><span class="kt"><span class="l">已巡分区</span><span class="v">13<small>/21</small></span></span></div>
            <div class="k"><span class="ki"><svg class="si"><use href="#i-check"/></svg></span><span class="kt"><span class="l">完成率</span><span class="v">62<small>%</small></span></span></div>
            <div class="k warn"><span class="ki"><svg class="si"><use href="#i-warn"/></svg></span><span class="kt"><span class="l">漏检</span><span class="v">1</span></span></div></div>
          <div style="margin-top:4px"><div class="segs" id="pseg" style="height:30px"></div>
            <div class="ticks" id="ptick"></div></div>
          <div class="hint"><b>与 S1 全线态势带同一里程坐标系</b>· 绿=已巡 蓝=进行中 灰=未巡 红=漏检</div>''',
     sub='按防火分区', tag='今日班次', basis='0 0 400px'),
 pnl('map','巡检任务与打卡','<div class="tb" id="task"></div>', sub='到位时刻 / 停留时长 / 检查项', basis='0 0 660px'),
 pnl('helmet','在廊人员与作业票','<div class="plist" id="plist"></div>', tag='4 人', basis='0 0 520px'),
])

right = '\n'.join([
 c1('巡检点漏检','燃气舱 · F0202 · 超时 42 min',1,'通风机振动超标','电力舱 · F0103',1,True),
 pnl('order','维保工单看板','<div class="kb" id="kb"></div>', sub='待派 / 执行中 / 待审核 / 已完成 / 超时', tag='今日 12', basis='0 0 520px'),
 pnl('calendar','定期检测计划','<div class="tb" id="plan"></div>', sub='到期自动生成任务 · 含应急物资', tag='7 日内 5', basis='0 0 620px'),
 pnl('heart','设备健康度','<div class="barlist" id="hl"></div>', sub='评分 / MTBF / MTTR', tag='低分 3', basis='0 0 500px'),
])

ctop = '        ' + srch('搜索任务 / 人员 / 设备') + '\n        ' + seg(('地图 + 轨迹',1),('三画面轨迹',0)) + '\n        ' + seg(('今日',1),('本周',0),('本月',0))
cmid = '        ' + layers('巡检图层',[('巡查点 24',1,'pt'),('人员实时位置',1,'track'),('已走轨迹',1,'track'),('待巡分区',1,'zone'),('设备点位',0,'pipe')])

js = '''
UI.corridorMap(UI.$('base'), {
  zones:{0:'g',1:'g',2:'g',3:'g',4:'g',5:'g',6:'g',7:'g',8:'g',9:'g',10:'g',11:'g',12:'g',15:'a'},
  legendTitle:'巡检状态',
  legend:[['#20E08C','已巡分区 13'],['#3FE3FF','当前所在分区'],['#FF4D5E','漏检分区 1']],
  track:[0.02,0.50], trackLabel:'张建国 · 已入廊 74 min',
  points:[[.06,'pt','巡查点 01'],[.12,'pt',''],[.18,'pt',''],[.24,'pt',''],[.30,'pt',''],
    [.36,'pt','巡查点 06'],[.42,'pt',''],[.48,'pt',''],[.54,'pt',''],[.62,'pt',''],
    [.68,'pt',''],[.74,'pt',''],[.80,'pt','巡查点 16'],[.86,'pt',''],[.92,'pt',''],[.97,'pt','']],
  alarms:[[15.5/21,'巡检点漏检']],
  title:'巡检维保 · 巡检轨迹 / 维保工单 / 设备健康度 / 资产台账',
  sub:'巡查点 24 个　·　在廊 4 人　·　位置由门禁 + 打卡 + 视频三源融合推算（分区级）'
});
UI.band(UI.$('segs'), UI.$('ticks'), {0:'g',1:'g',2:'g',3:'g',4:'g',5:'g',6:'g',7:'g',8:'g',9:'g',10:'g',11:'g',12:'g',15:'a'});
UI.band(UI.$('pseg'), UI.$('ptick'), {0:'g',1:'g',2:'g',3:'g',4:'g',5:'g',6:'g',7:'g',8:'g',9:'g',10:'g',11:'g',12:'g',15:'a',16:'o',17:'o',18:'o',19:'o',20:'o'});
(function(){
  const R=[['巡查点 06','张建国','13:42','4 min 12s','8/8','ok'],['巡查点 07','张建国','13:51','3 min 40s','8/8','ok'],
    ['巡查点 08','张建国','14:02','5 min 08s','8/8','ok'],['巡查点 09','李伟','14:08','2 min 55s','6/6','ok'],
    ['巡查点 14','王海涛','—','—','0/6','bad'],['巡查点 16','陈晓','—','待巡','—',''],
    ['巡查点 18','陈晓','—','待巡','—','']];
  UI.$('task').innerHTML='<table><tr><th>巡查点</th><th>执行人</th><th>到位</th><th>停留</th><th>检查项</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td class="${r[5]}">${r[4]}</td></tr>`).join('')+'</table>';
})();
(function(){
  const P=[['张','张建国','管廊运维班 · 巡检',62,0],['李','李伟','中电管线 · 电缆检修',38,0],
    ['王','王海涛','管廊运维班 · 巡检',104,1],['陈','陈晓','燃气公司 · 巡线',24,0]];
  UI.$('plist').innerHTML=P.map(([a,n,r,pc,ot])=>`<div class="pp"><div class="av">${a}</div>
    <div class="i"><b>${n}</b><span>${r}</span></div>
    <div class="g ${ot?'ot':''}"><div class="bar"><i style="width:${Math.min(pc,100)}%"></i></div>
      <div class="tm"><span>已入廊 ${Math.round(pc*1.2)} min</span><b>${ot?'已超时':'计划 120 min'}</b></div></div></div>`).join('');
})();
(function(){
  const C=[['待派',2,[['风机振动检测','3# 通风机 · 电力舱'],['照明灯具更换','综合舱 F0101']]],
    ['执行中',3,[['K12 回路排查','电力舱 F0104 · 李伟'],['井盖复位','K3+120 · 安保'],['传感器标定','燃气舱 F0201']]],
    ['待审核',2,[['季度风机检测','4 台 · 张建国'],['消防设施检查','24 具灭火器']]],
    ['已完成',4,[['月度泵组保养','水信舱 F0301'],['摄像机清洁','8 台']]],
    ['超时',1,[['感温模块更换','综合舱 F0102 · 超 3h']]]];
  UI.$('kb').innerHTML=C.map(([n,c,cards],i)=>`<div class="cl ${i===4?'ot':''}">
    <div class="hd">${n}<b>${c}</b></div>
    ${cards.map(([t,s])=>`<div class="cd"><b>${t}</b>${s}</div>`).join('')}</div>`).join('');
})();
(function(){
  const R=[['通风机 季度检测','4 台','2026-09-18','4 天','w'],['排水泵 月度保养','6 台','2026-09-20','6 天','w'],
    ['灭火器 月度检查','48 具','2026-09-21','7 天','w'],['摄像机 半年清洁','32 台','2026-10-12','28 天','ok']];
  UI.$('plan').innerHTML='<table><tr><th>检测项 / 物资</th><th>数量</th><th>到期日</th><th>剩余</th></tr>'+
    R.map(r=>`<tr><td>${r[0]}</td><td class="n">${r[1]}</td><td>${r[2]}</td><td class="${r[4]}">${r[3]}</td></tr>`).join('')
    +'<tr><td>灭火器（应急物资）</td><td class="n">48 具</td><td>2026-10-31</td><td class="w">到期 24 具</td></tr>'+'</table>';
})();
UI.barlist(UI.$('hl'), [['3# 通风机 FAN03',42,'#FF4D5E'],['2# 感温模块',56,'#FFA63D'],['CAM-C04-02',61,'#FFA63D'],
  ['1# 排水泵 PMP01',84,'#20E08C'],['K12 配电回路',88,'#20E08C'],['1# 通风机 FAN01',94,'#20E08C']]);
UI.popup(0);
'''
print(write('S7','巡检维保',6,'',left,ctop,cmid,right,'巡检进度带',js))
