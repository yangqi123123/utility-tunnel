(function () {
  window.APP_DATA = {
    devices: [
      {
        id: "D-10021", name: "管廊轴流风机", model: "ENV-FAN-001", vendor: "新风机电设备有限公司", category: "通风设备", system: "环境监测", smart: "是", note: "综合舱主通风设备。",
      },
      {
        id: "D-10022", name: "自动排水泵", model: "ENV-PUMP-002", vendor: "赛莱默水务设备有限公司", category: "排水泵", system: "环境监测", smart: "是", note: "给排水舱集水坑自动排水。",
      },
      {
        id: "D-10023", name: "舱内 LED 照明灯", model: "PWR-LIGHT-003", vendor: "飞利浦照明（中国）", category: "照明设备", system: "电力监测平台", smart: "是", note: "管廊常规照明回路。",
      },
      {
        id: "D-10024", name: "低压配电柜", model: "PWR-柜-004", vendor: "正泰电器设备有限公司", category: "供配电", system: "电力监测平台", smart: "是", note: "电力舱低压配电设备。",
      },
      {
        id: "D-10025", name: "火灾报警主机", model: "FIRE-CTRL-005", vendor: "青鸟消防股份有限公司", category: "消防设备", system: "消防监控系统", smart: "是", note: "消防监控室火灾报警控制主机。",
      },
      {
        id: "D-10026", name: "灭火器", model: "FIRE-EXT-006", vendor: "淮海消防器材有限公司", category: "消防设备", system: "消防监控系统", smart: "否", note: "手提式干粉灭火器，非智能化设备。",
      },
      {
        id: "D-10027", name: "消防栓", model: "FIRE-HYDRANT-007", vendor: "天广消防股份有限公司", category: "消防设备", system: "消防监控系统", smart: "否", note: "室内消火栓，非智能化设备。",
      },
      {
        id: "D-10028", name: "枪式摄像机-北侧入口", model: "VIDEO-BULLET-008", vendor: "海康威视", category: "枪式摄像机", system: "视频监控系统", smart: "是", note: "北侧出入口视频监控。",
      },
      {
        id: "D-10029", name: "球型摄像机-综合舱", model: "VIDEO-PTZ-009", vendor: "大华股份", category: "球型摄像机", system: "视频监控系统", smart: "是", note: "综合舱全景视频监控。",
      },
      {
        id: "D-10030", name: "半球摄像机-电力舱", model: "VIDEO-DOME-010", vendor: "海康威视", category: "半球摄像机", system: "视频监控系统", smart: "是", note: "电力舱室内视频监控。",
      },
      {
        id: "D-10031", name: "智能电表-1号配电柜", model: "PWR-METER-011", vendor: "安科瑞电气股份有限公司", category: "电表", system: "电力监测平台", smart: "是", note: "低压回路电能计量。",
      },
    ],
    tasks: [
      { level: "danger", title: "低压断路器故障", meta: "设备异常｜紧急抢修｜华东一区" },
      { level: "warning", title: "变频柜待巡检", meta: "巡检待办｜计划维护｜西南站" },
      { level: "primary", title: "压缩机维保中", meta: "处理中｜预计今日完成" },
    ],
  };
})();
