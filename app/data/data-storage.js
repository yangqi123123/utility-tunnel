(function () {
  const systems = [
    { id: "env", name: "环境监测", code: "EMS" },
    { id: "power", name: "电力监测平台", code: "POMS" },
    { id: "fire", name: "消防监控系统", code: "FMS" },
  ];

  const devices = [
    {
      id: "ENV-001",
      name: "B1 环境监测主机",
      code: "EMS-B1-001",
      systemId: "env",
      type: "环境监测主机",
      project: "金山管廊一期",
      location: "B1 舱室 / 东侧区段",
      status: "在线",
      latestReportedAt: "2026-10-01 10:28:14",
      info: { brand: "海康威视", model: "iDS-EM800", vendor: "上海智感物联", installDate: "2025-06-18", service: "温湿度、氧气、硫化氢监测" },
      files: [{ type: "设备说明书", name: "环境监测主机说明书.pdf" }, { type: "验收资料", name: "EMS-B1-001验收记录.docx" }],
      metrics: [
        { key: "fault", name: "故障状态", value: "正常", unit: "", reportedAt: "2026-10-01 10:28:14", quality: "有效", source: "设备遥测", rawPayload: '{"fault":false}' },
        { key: "temperature", name: "环境温度", value: "23.6", unit: "℃", reportedAt: "2026-10-01 10:28:14", quality: "有效", source: "温度探头", rawPayload: '{"temperature":23.6}' },
        { key: "humidity", name: "相对湿度", value: "58", unit: "%RH", reportedAt: "2026-10-01 10:28:14", quality: "有效", source: "湿度探头", rawPayload: '{"humidity":58}' },
        { key: "oxygen", name: "氧气浓度", value: "20.8", unit: "%VOL", reportedAt: "2026-10-01 10:28:14", quality: "有效", source: "氧气探头", rawPayload: '{"oxygen":20.8}' },
      ],
    },
    {
      id: "PWR-001",
      name: "1号楼低压进线柜",
      code: "POMS-1F-001",
      systemId: "power",
      type: "智能电表",
      project: "金山管廊一期",
      location: "1号楼 / B1 配电室",
      status: "在线",
      latestReportedAt: "2026-10-01 10:27:58",
      info: { brand: "安科瑞", model: "AEM96", vendor: "安科瑞电气", installDate: "2025-05-22", service: "低压进线电能质量监测" },
      files: [{ type: "设备说明书", name: "AEM96产品手册.pdf" }, { type: "维保资料", name: "POMS-1F-001维保记录.xlsx" }],
      metrics: [
        { key: "voltage", name: "三相电压", value: "381.2", unit: "V", reportedAt: "2026-10-01 10:27:58", quality: "有效", source: "电表遥测", rawPayload: '{"voltage":381.2}' },
        { key: "current", name: "A相电流", value: "126.4", unit: "A", reportedAt: "2026-10-01 10:27:58", quality: "有效", source: "电表遥测", rawPayload: '{"current":126.4}' },
        { key: "power", name: "有功功率", value: "78.6", unit: "kW", reportedAt: "2026-10-01 10:27:58", quality: "有效", source: "电表遥测", rawPayload: '{"power":78.6}' },
      ],
    },
    {
      id: "FIR-001",
      name: "B2 消防水箱液位计",
      code: "FMS-B2-002",
      systemId: "fire",
      type: "液位计",
      project: "金山管廊一期",
      location: "B2 舱室 / 消防泵房",
      status: "告警",
      latestReportedAt: "2026-10-01 10:26:42",
      info: { brand: "北京昆仑海岸", model: "JYB-KO-LAG", vendor: "中建智控设备服务", installDate: "2025-04-08", service: "消防水箱液位监测" },
      files: [{ type: "验收资料", name: "消防液位计验收报告.pdf" }, { type: "其他资料", name: "现场接线图.dwg" }],
      metrics: [
        { key: "level", name: "水箱液位", value: "62", unit: "%", reportedAt: "2026-10-01 10:26:42", quality: "超限", source: "液位变送器", rawPayload: '{"level":62,"alarm":"low"}' },
        { key: "pressure", name: "管网压力", value: "0.48", unit: "MPa", reportedAt: "2026-10-01 10:26:42", quality: "有效", source: "压力变送器", rawPayload: '{"pressure":0.48}' },
      ],
    },
    {
      id: "ENV-002",
      name: "C1 有害气体探测器",
      code: "EMS-C1-008",
      systemId: "env",
      type: "气体探测器",
      project: "金山管廊二期",
      location: "C1 舱室 / 西侧区段",
      status: "离线",
      latestReportedAt: "2026-10-01 09:58:09",
      info: { brand: "汉威科技", model: "GTQ-HW", vendor: "河南汉威电子", installDate: "2025-09-02", service: "甲烷、硫化氢浓度监测" },
      files: [{ type: "设备说明书", name: "气体探测器使用说明.pdf" }],
      metrics: [
        { key: "methane", name: "甲烷浓度", value: "0.00", unit: "%LEL", reportedAt: "2026-10-01 09:58:09", quality: "中断", source: "气体探测器", rawPayload: '{"methane":null,"quality":"offline"}' },
        { key: "h2s", name: "硫化氢浓度", value: "-", unit: "ppm", reportedAt: "2026-10-01 09:58:09", quality: "中断", source: "气体探测器", rawPayload: '{"h2s":null,"quality":"offline"}' },
      ],
    },
  ];

  const historyReadings = [];
  devices.forEach((device) => {
    device.metrics.forEach((metric, metricIndex) => {
      [0, 3, 6].forEach((minutes, index) => {
        const date = new Date("2026-10-01T10:28:14");
        date.setMinutes(date.getMinutes() - minutes - (device.id === "ENV-002" ? 12 : 0));
        const reportedAt = date.toISOString().slice(0, 19).replace("T", " ");
        const numeric = Number.parseFloat(metric.value);
        const value = Number.isFinite(numeric) ? (numeric - index * (metricIndex ? 0.6 : 0.2)).toFixed(metric.unit === "℃" ? 1 : 2) : metric.value;
        historyReadings.push({
          id: `${device.id}-${metric.key}-${index}`,
          deviceId: device.id,
          metric: metric.name,
          metricKey: metric.key,
          value,
          unit: metric.unit,
          reportedAt,
          quality: metric.quality,
          source: metric.source,
          rawPayload: metric.rawPayload,
        });
      });
    });
  });

  const defaultArchiveConfig = {
    enabled: true,
    retentionDays: 365,
    retentionUnit: "天",
    schedule: "每天",
    executeAt: "02:00",
    cron: "0 0 2 * * ?",
    retryTimes: 3,
  };

  const store = {
    systems,
    devices,
    historyReadings,
    archiveConfig: { ...defaultArchiveConfig },
    archiveTasks: [
      { id: "archive-001", name: "历史数据日归档", schedule: "每天 02:00", lastRunAt: "2026-10-01 02:00:12", result: "成功", nextRunAt: "2026-10-02 02:00:00" },
      { id: "archive-002", name: "历史数据月度校验", schedule: "每月 1 日 03:00", lastRunAt: "2026-10-01 03:00:28", result: "成功", nextRunAt: "2026-11-01 03:00:00" },
    ],
    resetArchiveConfig() { this.archiveConfig = { ...defaultArchiveConfig }; },
  };

  window.DATA_STORAGE_STORE = store;
})();
