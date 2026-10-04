(function () {
  const status = {
    ok: { key: "ok", label: "正常", tone: "ok" },
    warn: { key: "warn", label: "关注", tone: "warn" },
    alarm: { key: "alarm", label: "告警", tone: "alarm" },
    standby: { key: "standby", label: "待机", tone: "standby" },
    recovered: { key: "recovered", label: "已恢复", tone: "recovered" },
  };

  window.POWER_MONITORING_DATA = {
    updatedAt: "2026-10-01 09:42:53",
    connection: { label: "第三方数据已接入", tone: "ok" },
    summary: [
      { key: "health", label: "供电健康度", value: "98.6", unit: "分", tone: "ok" },
      { key: "load", label: "当前总负荷", value: "1,284", unit: "kW", tone: "neutral" },
      { key: "devices", label: "运行设备", value: "26", unit: "台", tone: "neutral" },
      { key: "alarms", label: "未处理告警", value: "03", unit: "条", tone: "warn" },
    ],
    systemLines: [
      { id: "line-a", nodes: [
        { label: "10kV 进线", value: "U 10.2kV", status: status.ok },
        { label: "1# 变压器", value: "630 kVA", status: status.ok },
        { label: "低压母线", value: "I 182 A", status: status.warn },
        { label: "UPS 配电", value: "负载 64%", status: status.ok },
      ] },
      { id: "line-b", nodes: [
        { label: "2# 进线", value: "U 10.1kV", status: status.ok },
        { label: "2# 变压器", value: "630 kVA", status: status.ok },
        { label: "低压出线", value: "P 486 kW", status: status.ok },
        { label: "应急负荷", value: "ATS 自动", status: status.ok },
      ] },
    ],
    devices: [
      { id: "transformer-1", icon: "fa-solid fa-box", name: "1# 变压器", detail: "温度 48°C · 负载率 72%", status: status.ok },
      { id: "ups-a", icon: "fa-solid fa-battery-three-quarters", name: "UPS 主机 A", detail: "电池电压 218V · 负载 64%", status: status.ok },
      { id: "generator", icon: "fa-solid fa-power-off", name: "柴油发电机", detail: "油位 76% · 待机自检", status: status.standby },
      { id: "ats-02", icon: "fa-solid fa-right-left", name: "ATS-02", detail: "当前电源：市电 · 切换 0 次", status: status.warn },
    ],
    alarms: [
      { time: "09:41:26", message: "2# 低压出线柜电流接近阈值", status: status.warn },
      { time: "09:36:05", message: "ATS-02 通讯恢复，数据已同步", status: status.recovered },
      { time: "09:18:44", message: "UPS 主机 A 电池温度上升", status: status.warn },
    ],
    events: [
      { time: "08:42:13", message: "1# 变压器保护装置自检完成", status: { key: "remote", label: "遥信", tone: "info" } },
      { time: "07:55:21", message: "高压进线电压恢复至额定范围", status: status.recovered },
      { time: "06:16:02", message: "柴油发电机完成日常巡检", status: { key: "record", label: "记录", tone: "info" } },
    ],
  };
})();
