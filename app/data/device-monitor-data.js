(function () {
  /* =========================================================================
   * 设备监测总览（首页）数据源
   * 1) systems        —— 全网设备规模统计（口径合计 1,286 台）
   * 2) spatialTree    —— 空间层级（与管廊/舱室/区段/管线管理命名保持一致）
   * 3) categoryStyles —— 设备分类颜色与图标（地图点位、分类图例共用）
   * 4) metricTemplates—— 各分类的监测指标模板
   * 5) devices        —— 地图监测点位（含“设备管理-详情”全部字段）
   *                      视频监控设备额外带 video/channel/resolution/ptz 字段，
   *                      其“实时数据”改用视频监控画面（复用视频监控-实时视频组件）
   * ========================================================================= */
  var REPORT_TIME = "2026-09-30 12:00:00";

  /* --- 1. 全网设备规模：总数 1286 / 在线 1214（94.4%）/ 预警 18 / 故障+离线 54（4.2%）--- */
  var systems = [
    { name: "火灾报警系统", code: "FAS", total: 162, online: 156, warn: 2, fault: 2, offline: 2 },
    { name: "环境监测", code: "EMS", total: 248, online: 236, warn: 5, fault: 4, offline: 3 },
    { name: "安全防范系统", code: "SPS", total: 96, online: 91, warn: 1, fault: 2, offline: 2 },
    { name: "视频监控系统", code: "VSS", total: 118, online: 112, warn: 2, fault: 2, offline: 2 },
    { name: "入侵报警", code: "IAS", total: 72, online: 69, warn: 1, fault: 1, offline: 1 },
    { name: "电子巡更", code: "EPS", total: 56, online: 53, warn: 1, fault: 1, offline: 1 },
    { name: "门禁系统", code: "ACS", total: 148, online: 142, warn: 2, fault: 2, offline: 2 },
    { name: "智能井盖", code: "ISC", total: 40, online: 36, warn: 1, fault: 1, offline: 2 },
    { name: "电力监测平台", code: "POMS", total: 186, online: 176, warn: 3, fault: 4, offline: 3 },
    { name: "消防监控系统", code: "FMS", total: 92, online: 88, warn: 0, fault: 2, offline: 2 },
    { name: "通信系统", code: "COM", total: 68, online: 55, warn: 0, fault: 7, offline: 6 },
  ];

  /* --- 2. 空间层级 --- */
  var spatialTree = [
    {
      name: "光谷科学岛综合开发项目",
      corridors: [
        {
          name: "高新大道综合管廊",
          cabins: [
            { name: "综合舱", sections: ["防火分区", "出入口", "通风口"] },
            { name: "电力舱", sections: ["防火分区", "通风口"] },
          ],
        },
        {
          name: "科学岛大道综合管廊",
          cabins: [
            { name: "综合舱", sections: ["防火分区", "出入口"] },
            { name: "电力舱", sections: ["防火分区"] },
          ],
        },
      ],
    },
    {
      name: "科学岛东区管廊延伸工程",
      corridors: [
        {
          name: "科学岛东区综合管廊",
          cabins: [
            { name: "燃气舱", sections: ["通风口", "吊装口"] },
            { name: "综合舱", sections: ["防火分区"] },
          ],
        },
      ],
    },
  ];

  /* --- 3. 设备分类颜色 / 图标 --- */
  var categoryStyles = {
    "通风设备": { color: "#3B7DFF", icon: "fa-fan" },
    "室内环境传感器": { color: "#12B7A8", icon: "fa-temperature-half" },
    "排水泵": { color: "#2E9BD6", icon: "fa-water" },
    "供配电": { color: "#E8952A", icon: "fa-bolt" },
    "电表": { color: "#8A6BE0", icon: "fa-gauge-high" },
    "照明设备": { color: "#E8B52A", icon: "fa-lightbulb" },
    "光伏并网逆变器": { color: "#34A853", icon: "fa-solar-panel" },
    "消防设备": { color: "#F0453F", icon: "fa-fire-extinguisher" },
    "燃气报警": { color: "#E2603A", icon: "fa-triangle-exclamation" },
    "输入输出模块": { color: "#C0504D", icon: "fa-microchip" },
    "枪式摄像机": { color: "#5B6BFF", icon: "fa-video" },
    "球型摄像机": { color: "#7A5BE0", icon: "fa-video" },
    "半球摄像机": { color: "#4A9AD6", icon: "fa-video" },
    "感烟探测器": { color: "#D94F4F", icon: "fa-smog" },
    "感温探测器": { color: "#E0743C", icon: "fa-temperature-high" },
    "手动报警按钮": { color: "#C4453F", icon: "fa-hand-point-up" },
    "声光警报器": { color: "#E6534C", icon: "fa-volume-high" },
    "双鉴探测器": { color: "#3F8FD9", icon: "fa-satellite-dish" },
    "振动光纤主机": { color: "#5A7FD6", icon: "fa-wave-square" },
    "门禁控制器": { color: "#9359E3", icon: "fa-id-card-clip" },
    "读卡器": { color: "#A56BE0", icon: "fa-address-card" },
    "巡检点底座": { color: "#24AE83", icon: "fa-location-dot" },
    "井盖监测终端": { color: "#B0763A", icon: "fa-road-spikes" },
    "环网交换机": { color: "#159C8E", icon: "fa-network-wired" },
    "广播终端": { color: "#3AA0B5", icon: "fa-bullhorn" },
    "电子围栏主机": { color: "#6E7BD9", icon: "fa-tower-broadcast" },
  };
  var defaultStyle = { color: "#6B7B8C", icon: "fa-microchip" };

  /* --- 4. 监测指标模板 --- */
  var envMetrics = [
    { name: "温度", unit: "℃", base: 26.3, decimals: 1, amp: 0.06 },
    { name: "湿度", unit: "%", base: 78, decimals: 0, amp: 0.08 },
    { name: "氧气", unit: "%VOL", base: 19.8, decimals: 1, amp: 0.03 },
    { name: "甲烷", unit: "%LEL", base: 42, decimals: 0, amp: 0.15 },
    { name: "硫化氢", unit: "ppm", base: 2, decimals: 0, amp: 0.3 },
    { name: "集水井水位", unit: "m", base: 0.6, decimals: 2, amp: 0.12 },
  ];
  var cameraMetrics = [
    { name: "视频码率", unit: "Mbps", base: 4.6, decimals: 1, amp: 0.1 },
    { name: "帧率", unit: "fps", base: 25, decimals: 0, amp: 0.04 },
    { name: "存储剩余", unit: "GB", base: 296, decimals: 0, amp: 0.05 },
    { name: "在线时长", unit: "h", base: 2680, decimals: 0, amp: 0.01 },
  ];
  var metricTemplates = {
    "通风设备": envMetrics,
    "室内环境传感器": envMetrics,
    "排水泵": [
      { name: "集水井水位", unit: "m", base: 0.62, decimals: 2, amp: 0.12 },
      { name: "排水流量", unit: "m³/h", base: 36, decimals: 1, amp: 0.08 },
      { name: "电机电流", unit: "A", base: 12.4, decimals: 1, amp: 0.07 },
      { name: "累计运行时长", unit: "h", base: 1286, decimals: 0, amp: 0.02 },
    ],
    "供配电": [
      { name: "A相电流", unit: "A", base: 126.4, decimals: 1, amp: 0.06 },
      { name: "B相电流", unit: "A", base: 124.8, decimals: 1, amp: 0.06 },
      { name: "母线电压", unit: "V", base: 398, decimals: 0, amp: 0.02 },
      { name: "有功功率", unit: "kW", base: 86.2, decimals: 1, amp: 0.08 },
    ],
    "电表": [
      { name: "有功电量", unit: "kWh", base: 1268.4, decimals: 1, amp: 0.01 },
      { name: "有功功率", unit: "kW", base: 32.6, decimals: 1, amp: 0.08 },
      { name: "功率因数", unit: "", base: 0.96, decimals: 2, amp: 0.02 },
    ],
    "照明设备": [
      { name: "回路电流", unit: "A", base: 3.6, decimals: 2, amp: 0.06 },
      { name: "回路电压", unit: "V", base: 220.4, decimals: 1, amp: 0.02 },
      { name: "回路功率", unit: "W", base: 720, decimals: 0, amp: 0.05 },
      { name: "亮度", unit: "%", base: 80, decimals: 0, amp: 0.06 },
    ],
    "光伏并网逆变器": [
      { name: "直流电压", unit: "V", base: 612, decimals: 0, amp: 0.04 },
      { name: "输出功率", unit: "kW", base: 42.6, decimals: 1, amp: 0.1 },
      { name: "日发电量", unit: "kWh", base: 268.4, decimals: 1, amp: 0.05 },
      { name: "转换效率", unit: "%", base: 97.8, decimals: 1, amp: 0.01 },
    ],
    "消防设备": [
      { name: "回路电压", unit: "V", base: 24.6, decimals: 1, amp: 0.02 },
      { name: "备电电压", unit: "V", base: 26.2, decimals: 1, amp: 0.02 },
      { name: "故障点数", unit: "个", base: 2, decimals: 0, amp: 0.5 },
      { name: "屏蔽点数", unit: "个", base: 0, decimals: 0, amp: 0 },
    ],
    "燃气报警": [
      { name: "甲烷浓度", unit: "%LEL", base: 42, decimals: 0, amp: 0.15 },
      { name: "探测器电压", unit: "V", base: 24.1, decimals: 1, amp: 0.02 },
      { name: "报警次数", unit: "次", base: 1, decimals: 0, amp: 0.5 },
    ],
    "输入输出模块": [
      { name: "回路电压", unit: "V", base: 24, decimals: 1, amp: 0.02 },
      { name: "输出电压", unit: "V", base: 23.8, decimals: 1, amp: 0.02 },
      { name: "反馈次数", unit: "次", base: 6, decimals: 0, amp: 0.2 },
    ],
    "枪式摄像机": cameraMetrics,
    "球型摄像机": cameraMetrics,
    "半球摄像机": cameraMetrics,
    "巡检点底座": [
      { name: "感应次数", unit: "次", base: 326, decimals: 0, amp: 0.04 },
      { name: "电池电量", unit: "%", base: 86, decimals: 0, amp: 0.03 },
    ],
    "感烟探测器": [
      { name: "烟雾浓度", unit: "%obs/m", base: 1.8, decimals: 2, amp: 0.2 },
      { name: "回路电压", unit: "V", base: 17.6, decimals: 1, amp: 0.02 },
      { name: "灵敏度", unit: "级", base: 3, decimals: 0, amp: 0 },
    ],
    "感温探测器": [
      { name: "环境温度", unit: "℃", base: 26.4, decimals: 1, amp: 0.06 },
      { name: "升温速率", unit: "℃/min", base: 0.4, decimals: 2, amp: 0.25 },
      { name: "回路电压", unit: "V", base: 17.5, decimals: 1, amp: 0.02 },
    ],
    "手动报警按钮": [
      { name: "回路电压", unit: "V", base: 17.8, decimals: 1, amp: 0.02 },
      { name: "触发次数", unit: "次", base: 0, decimals: 0, amp: 0 },
    ],
    "声光警报器": [
      { name: "回路电压", unit: "V", base: 17.4, decimals: 1, amp: 0.02 },
      { name: "驱动电流", unit: "mA", base: 42, decimals: 0, amp: 0.06 },
      { name: "动作次数", unit: "次", base: 3, decimals: 0, amp: 0.3 },
    ],
    "双鉴探测器": [
      { name: "探测灵敏度", unit: "%", base: 60, decimals: 0, amp: 0.05 },
      { name: "触发次数", unit: "次", base: 12, decimals: 0, amp: 0.25 },
      { name: "工作电压", unit: "V", base: 12.2, decimals: 1, amp: 0.02 },
    ],
    "振动光纤主机": [
      { name: "光纤通道", unit: "个", base: 8, decimals: 0, amp: 0 },
      { name: "报警次数", unit: "次", base: 2, decimals: 0, amp: 0.5 },
      { name: "工作电压", unit: "V", base: 12, decimals: 1, amp: 0.02 },
    ],
    "门禁控制器": [
      { name: "开门次数", unit: "次", base: 268, decimals: 0, amp: 0.05 },
      { name: "在线时长", unit: "h", base: 1286, decimals: 0, amp: 0.01 },
      { name: "工作电压", unit: "V", base: 12.1, decimals: 1, amp: 0.02 },
    ],
    "读卡器": [
      { name: "刷卡次数", unit: "次", base: 146, decimals: 0, amp: 0.06 },
      { name: "工作电压", unit: "V", base: 12, decimals: 1, amp: 0.02 },
    ],
    "井盖监测终端": [
      { name: "井盖倾角", unit: "°", base: 2.4, decimals: 1, amp: 0.15 },
      { name: "电池电量", unit: "%", base: 64, decimals: 0, amp: 0.03 },
      { name: "报警次数", unit: "次", base: 1, decimals: 0, amp: 0.5 },
    ],
    "环网交换机": [
      { name: "端口占用率", unit: "%", base: 42, decimals: 0, amp: 0.08 },
      { name: "带宽利用率", unit: "%", base: 36, decimals: 0, amp: 0.1 },
      { name: "丢包率", unit: "%", base: 0.02, decimals: 2, amp: 0.4 },
    ],
    "广播终端": [
      { name: "输出功率", unit: "W", base: 60, decimals: 0, amp: 0.05 },
      { name: "在线时长", unit: "h", base: 2680, decimals: 0, amp: 0.01 },
    ],
    "电子围栏主机": [
      { name: "围栏电压", unit: "kV", base: 5.42, decimals: 2, amp: 0.03 },
      { name: "报警次数", unit: "次", base: 1, decimals: 0, amp: 0.5 },
    ],
  };

  /* --- 5. 监测点位定义 --- */
  var defs = [
    { name: "管廊轴流风机", system: "环境监测", type: "通风设备", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "防火分区", model: "ENV-FAN-001", brand: "新风机电设备有限公司", vendor: "新风机电设备有限公司", remark: "综合舱主通风设备。" },
    { name: "电力舱温湿度传感器 01", system: "环境监测", type: "室内环境传感器", status: "online", corridor: "高新大道综合管廊", cabin: "电力舱", section: "防火分区", model: "ENV-SENSOR-001" },
    { name: "综合舱氧气传感器 02", system: "环境监测", type: "室内环境传感器", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "出入口", model: "ENV-SENSOR-002" },
    { name: "燃气舱甲烷探测器 03", system: "环境监测", type: "室内环境传感器", status: "warn", corridor: "科学岛东区综合管廊", cabin: "燃气舱", section: "通风口", model: "ENV-SENSOR-003", metrics: { "甲烷": 62 }, remark: "甲烷浓度接近报警阈值。" },
    { name: "综合舱硫化氢传感器 04", system: "环境监测", type: "室内环境传感器", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "防火分区", model: "ENV-SENSOR-004" },
    { name: "集水井水位传感器 05", system: "环境监测", type: "室内环境传感器", status: "warn", corridor: "科学岛大道综合管廊", cabin: "综合舱", section: "防火分区", model: "ENV-SENSOR-005", metrics: { "集水井水位": 0.86 }, remark: "集水井水位处于高位预警区间。" },
    { name: "2# 集水井排水泵", system: "环境监测", type: "排水泵", status: "fault", corridor: "科学岛大道综合管廊", cabin: "综合舱", section: "出入口", model: "ENV-PUMP-002", remark: "过载保护动作，设备已停机。" },
    { name: "综合舱空调控制柜", system: "环境监测", type: "通风设备", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "通风口", model: "ENV-FAN-002" },
    { name: "电力舱低压配电柜", system: "电力监测平台", type: "供配电", status: "online", corridor: "高新大道综合管廊", cabin: "电力舱", section: "防火分区", model: "PWR-CAB-001" },
    { name: "综合舱智能电表", system: "电力监测平台", type: "电表", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "防火分区", model: "PWR-METER-011" },
    { name: "管廊照明控制箱", system: "电力监测平台", type: "照明设备", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "出入口", model: "PWR-LIGHT-003" },
    { name: "光伏并网逆变器 01", system: "电力监测平台", type: "光伏并网逆变器", status: "online", corridor: "科学岛东区综合管廊", cabin: "燃气舱", section: "吊装口", model: "PWR-PV-001" },
    { name: "消防监控主机", system: "消防监控系统", type: "消防设备", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "防火分区", model: "FIRE-CTRL-005" },
    { name: "燃气舱燃气报警器 01", system: "消防监控系统", type: "燃气报警", status: "warn", corridor: "科学岛东区综合管廊", cabin: "燃气舱", section: "通风口", model: "FIRE-GAS-001", metrics: { "甲烷浓度": 58 } },
    { name: "防火门监控模块 02", system: "消防监控系统", type: "输入输出模块", status: "online", corridor: "高新大道综合管廊", cabin: "电力舱", section: "防火分区", model: "FIRE-IO-002" },
    { name: "管廊枪式摄像机 01", system: "视频监控系统", type: "枪式摄像机", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "出入口", model: "VIDEO-BULLET-008", channel: 1, resolution: "2560×1440", ptz: true },
    { name: "综合舱球型摄像机 02", system: "视频监控系统", type: "球型摄像机", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "防火分区", model: "VIDEO-PTZ-009", channel: 2, resolution: "2560×1440", ptz: true },
    { name: "电力舱半球摄像机 03", system: "视频监控系统", type: "半球摄像机", status: "offline", corridor: "高新大道综合管廊", cabin: "电力舱", section: "通风口", model: "VIDEO-DOME-010", channel: 3, resolution: "1920×1080", ptz: false, lastOnline: "2026-09-30 11:13:58", remark: "通信中断，离线超过 46 分钟。" },
    { name: "投料口枪式摄像机 04", system: "视频监控系统", type: "枪式摄像机", status: "online", corridor: "科学岛大道综合管廊", cabin: "综合舱", section: "出入口", model: "VIDEO-BULLET-011", channel: 4, resolution: "1920×1080", ptz: true },
    { name: "电力舱枪式摄像机 05", system: "视频监控系统", type: "枪式摄像机", status: "online", corridor: "高新大道综合管廊", cabin: "电力舱", section: "防火分区", model: "VIDEO-BULLET-012", channel: 5, resolution: "2560×1440", ptz: true },
    { name: "燃气舱防爆球型摄像机 06", system: "视频监控系统", type: "球型摄像机", status: "warn", corridor: "科学岛东区综合管廊", cabin: "燃气舱", section: "通风口", model: "VIDEO-PTZ-013", channel: 6, resolution: "1920×1080", ptz: true, remark: "画面码率异常，分辨率已自动降级。" },
    { name: "点型感烟火灾探测器 08", system: "火灾报警系统", type: "感烟探测器", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "防火分区", model: "FAS-SMOKE-008" },
    { name: "缆式线型感温探测器 01", system: "火灾报警系统", type: "感温探测器", status: "online", corridor: "高新大道综合管廊", cabin: "电力舱", section: "防火分区", model: "FAS-HEAT-001" },
    { name: "手动火灾报警按钮 03", system: "火灾报警系统", type: "手动报警按钮", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "出入口", model: "FAS-CALL-003" },
    { name: "声光警报器 05", system: "火灾报警系统", type: "声光警报器", status: "warn", corridor: "科学岛大道综合管廊", cabin: "综合舱", section: "防火分区", model: "FAS-SOUND-005", metrics: { "驱动电流": 58 } },
    { name: "双鉴入侵探测器 01", system: "入侵报警", type: "双鉴探测器", status: "online", corridor: "科学岛大道综合管廊", cabin: "综合舱", section: "出入口", model: "IAS-DUAL-001" },
    { name: "振动光纤主机 01", system: "入侵报警", type: "振动光纤主机", status: "offline", corridor: "科学岛东区综合管廊", cabin: "燃气舱", section: "吊装口", model: "IAS-FIBER-001", remark: "主机失联，待现场核查。" },
    { name: "出入口门禁控制器 01", system: "门禁系统", type: "门禁控制器", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "出入口", model: "ACS-CTRL-001" },
    { name: "电力舱读卡器 02", system: "门禁系统", type: "读卡器", status: "online", corridor: "高新大道综合管廊", cabin: "电力舱", section: "防火分区", model: "ACS-READ-002" },
    { name: "巡检点底座 A-01", system: "电子巡更", type: "巡检点底座", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "防火分区", model: "EPS-BASE-001" },
    { name: "投料口井盖监测终端 01", system: "智能井盖", type: "井盖监测终端", status: "fault", corridor: "科学岛东区综合管廊", cabin: "燃气舱", section: "吊装口", model: "ISC-TERM-001", metrics: { "井盖倾角": 18.6 }, remark: "井盖倾角超限，疑似异常开启。" },
    { name: "管廊环网交换机 01", system: "通信系统", type: "环网交换机", status: "online", corridor: "高新大道综合管廊", cabin: "综合舱", section: "防火分区", model: "COM-SW-001" },
    { name: "应急广播终端 02", system: "通信系统", type: "广播终端", status: "online", corridor: "高新大道综合管廊", cabin: "电力舱", section: "通风口", model: "COM-BC-002" },
    { name: "电子围栏主机 01", system: "安全防范系统", type: "电子围栏主机", status: "online", corridor: "科学岛大道综合管廊", cabin: "综合舱", section: "防火分区", model: "SPS-FENCE-001" },
  ];

  var categoryCodes = {};
  (window.APP_DEVICE_CATEGORIES || []).forEach(function (item) { categoryCodes[item.name] = item.code; });

  var pipelineByCabin = { "综合舱": "低压配电管线", "电力舱": "10kV电力管线", "燃气舱": "燃气管线", "通信舱": "通信光缆管线" };
  var brandBySystem = {
    "环境监测": ["昆仑海岸", "北京昆仑海岸传感技术有限公司"],
    "电力监测平台": ["安科瑞", "安科瑞电气股份有限公司"],
    "消防监控系统": ["青鸟消防", "青鸟消防股份有限公司"],
    "火灾报警系统": ["海湾", "海湾安全技术有限公司"],
    "视频监控系统": ["海康威视", "杭州海康威视数字技术股份有限公司"],
    "电子巡更": ["兰德华", "北京兰德华电子技术有限公司"],
    "入侵报警": ["霍尼韦尔", "霍尼韦尔安防（中国）有限公司"],
    "门禁系统": ["中控智慧", "中控智慧科技股份有限公司"],
    "智能井盖": ["宏电", "深圳市宏电技术股份有限公司"],
    "通信系统": ["华为", "华为技术有限公司"],
    "安全防范系统": ["博世", "博世安防系统（中国）有限公司"],
  };

  function tri(n) { var k = ((n % 21) + 21) % 21; return k <= 10 ? k : k - 21; }
  function round(value, decimals) { var f = Math.pow(10, decimals); return Math.round(value * f) / f; }
  function pad(num, len) { return String(num).padStart(len, "0"); }
  function projectOf(corridor) {
    for (var i = 0; i < spatialTree.length; i += 1) {
      var hit = spatialTree[i].corridors.some(function (item) { return item.name === corridor; });
      if (hit) return spatialTree[i].name;
    }
    return spatialTree[0].name;
  }

  var devices = defs.map(function (def, index) {
    var style = categoryStyles[def.type] || defaultStyle;
    var brand = brandBySystem[def.system] || ["—", "—"];
    var seq = pad(index + 1, 4);
    var template = metricTemplates[def.type] || envMetrics;
    /* 视频监控设备：实时数据以“实时视频画面”呈现（复用视频监控-实时视频组件） */
    var isVideo = def.system === "视频监控系统";
    var metrics = template.map(function (metric, mi) {
      var step = index === 0 ? 0 : tri(index * 5 + mi * 4);
      var value = def.metrics && def.metrics[metric.name] !== undefined ? def.metrics[metric.name] : round(metric.base * (1 + step / 100), metric.decimals);
      return { key: metric.name, name: metric.name, unit: metric.unit, decimals: metric.decimals, amp: metric.amp, value: value };
    });
    var lat = Number((30.4703 - index * 0.00072 + (index % 3) * 0.0009).toFixed(6));
    var lng = Number((114.4098 + index * 0.00132 + (index % 4) * 0.0008).toFixed(6));
    return {
      id: "DM-" + seq,
      seq: index + 1,
      name: def.name,
      code: "001_" + String(categoryCodes[def.type] || "DEVICE").replace(/-/g, "").slice(0, 9) + "_" + seq,
      system: def.system,
      type: def.type,
      status: def.status,
      color: style.color,
      icon: style.icon,
      project: projectOf(def.corridor),
      corridor: def.corridor,
      room: def.cabin,
      section: def.section,
      pipeline: pipelineByCabin[def.cabin] || "低压配电管线",
      location: "设备间 " + (index + 1),
      brand: def.brand || brand[0],
      model: def.model,
      vendor: def.vendor || brand[1],
      supplierPhone: "0" + (27 + (index % 3)) + "-86" + pad(1200 + index * 37, 4) + "88",
      manufacturer: index % 3 === 1 ? "—" : brand[1],
      manufactureDate: "2026-06-20",
      deliveryDate: "2026-07-05",
      installDate: "2026-07-11",
      acceptDate: "2026-07-10",
      scrapDate: "",
      factoryCode: index % 4 === 0 ? "" : "FC-" + pad(2400 + index * 13, 4),
      cadCode: index % 5 === 0 ? "" : "CAD-" + pad(6100 + index * 7, 4),
      sourceModule: index % 4 === 2 ? "第三方同步" : "人工台账",
      service: "设备运行、巡检及维保服务",
      remark: def.remark || "设备纳入监测平台统一采集与预警。",
      smart: index % 7 === 3 ? "否" : "是",
      thirdPartyCode: index % 4 === 2 ? "" : "THIRD-" + pad(index + 1, 4),
      coordinate: lng + ", " + lat,
      createdAt: index === 0 ? "2026-07-11 14:01:25" : "2026-0" + (6 + (index % 2)) + "-" + pad(10 + (index % 18), 2) + " " + pad(9 + (index % 8), 2) + ":" + pad((index * 7) % 60, 2) + ":00",
      lat: lat,
      lng: lng,
      metrics: metrics,
      /* 视频监控相关字段 */
      video: isVideo,
      channel: isVideo ? "CH" + pad(def.channel || (index + 1), 2) : "",
      resolution: isVideo ? def.resolution || "1920×1080" : "",
      ptz: isVideo ? (def.ptz === undefined ? def.type === "球型摄像机" : !!def.ptz) : false,
      lastOnline: isVideo ? def.lastOnline || "" : "",
    };
  });

  function metricValueAt(device, mi, index) {
    var metric = device.metrics[mi];
    if (!metric) return null;
    var step = index === 0 ? 0 : tri(device.seq * 6 + index * 9 + mi * 5);
    var drift = (step / 100) * (metric.amp || 0.05) * 4;
    return round(metric.value * (1 + drift), metric.decimals);
  }

  /* 历史数据：15 分钟一条，最近 11 条 */
  function historyOf(device) {
    var list = [];
    for (var i = 0; i < 11; i += 1) {
      var minutes = 12 * 60 - i * 15;
      var time = "2026-09-30 " + pad(Math.floor(minutes / 60), 2) + ":" + pad(minutes % 60, 2) + ":00";
      var values = [];
      device.metrics.forEach(function (metric, mi) { values.push(metricValueAt(device, mi, i)); });
      list.push({ time: time, values: values });
    }
    return list;
  }

  /* 历史曲线：今日 / 本月 / 本年 */
  function seriesOf(device, mi, period) {
    var points = period === "month" ? 30 : period === "year" ? 12 : 24;
    var metric = device.metrics[mi];
    var list = [];
    if (!metric) return list;
    for (var j = 0; j < points; j += 1) {
      var wave = Math.sin((j / Math.max(points - 1, 1)) * Math.PI * 2 + mi * 1.2) * 0.6 + Math.sin(j * 0.83 + mi * 2.1) * 0.4;
      list.push(round(metric.value * (1 + (metric.amp || 0.05) * wave), metric.decimals));
    }
    return list;
  }

  function labelsOf(period) {
    var list = [];
    var i;
    if (period === "month") { for (i = 1; i <= 30; i += 1) list.push(i + "日"); }
    else if (period === "year") { for (i = 1; i <= 12; i += 1) list.push(i + "月"); }
    else { for (i = 0; i < 24; i += 1) list.push(pad(i, 2) + ":00"); }
    return list;
  }

  window.DEVICE_MONITOR_DATA = {
    reportTime: REPORT_TIME,
    systems: systems,
    spatialTree: spatialTree,
    categoryStyles: categoryStyles,
    devices: devices,
    historyOf: historyOf,
    seriesOf: seriesOf,
    labelsOf: labelsOf,
    labelStep: { today: 4, month: 5, year: 1 },
    mapCenter: [30.4595, 114.4296],
  };
})();
