(function () {
  window.APP_MENU = [
    {
      key: "home",
      label: "工作台",
      icon: "fa-solid fa-house",
      href: "../home/home.html",
    },
    {
      key: "project",
      label: "管廊管理",
      icon: "fa-solid fa-building",
      children: [
        { key: "project.manage", label: "项目管理", href: "../project/project-management.html" },
        { key: "project.building", label: "管廊管理", href: "../project/building.html" },
        { key: "project.floor", label: "舱室管理", href: "../project/floor.html" },
        { key: "project.house", label: "区段管理", href: "../project/house.html" },
        { key: "project.pipeline", label: "管线管理", href: "../project/pipeline.html" },
      ],
    },
    {
      key: "device",
      label: "设备管理",
      icon: "fa-solid fa-layer-group",
      children: [
        { key: "device.list", label: "设备管理", href: "../device/list.html" },
        { key: "config.system-type", label: "系统类型", href: "../config/system-type.html" },
        { key: "device.category", label: "设备分类", href: "../device/category.html" },
      ],
    },
    {
      key: "smart-monitoring",
      label: "智能监测",
      icon: "fa-solid fa-display",
      children: [
        { key: "smart-monitoring.parking", label: "停车记录", href: "../monitoring/parking-record.html" },
        { key: "smart-monitoring.pedestrian", label: "人行通行记录", href: "../monitoring/pedestrian-record.html" },
        { key: "smart-monitoring.video", label: "视频监控", href: "../monitoring/video-monitor.html" },
      ],
    },
    {
      key: "broadcast",
      label: "广播管理",
      icon: "fa-solid fa-tower-broadcast",
      children: [
        { key: "broadcast.console", label: "广播控制台", href: "../broadcast/console.html" },
        { key: "broadcast.tasks", label: "广播任务", href: "../broadcast/tasks.html" },
        { key: "broadcast.terminals", label: "广播终端", href: "../broadcast/terminals.html" },
        { key: "broadcast.resources", label: "音频资源", href: "../broadcast/resources.html" },
        { key: "broadcast.logs", label: "广播日志", href: "../broadcast/logs.html" },
      ],
    },
    {
      key: "energy",
      label: "能源管理",
      icon: "fa-solid fa-bolt",
      children: [
        { key: "energy.electricity", label: "用电概览", href: "../energy/electricity-overview.html" },
        { key: "energy.water", label: "用水概览", href: "../energy/water-overview.html" },
        { key: "energy.cooling", label: "冷量概览", href: "../energy/cooling-overview.html" },
        { key: "energy.photovoltaic", label: "光伏概览", href: "../energy/photovoltaic-overview.html" },
        { key: "energy.carbon", label: "碳排放数据", href: "../energy/carbon-data.html" },
        { key: "energy.carbon-setting", label: "碳排放设置", href: "../energy/carbon-setting.html" },
        { key: "energy.warning", label: "能耗预警", href: "../energy/energy-warning.html" },
        { key: "energy.warning-record", label: "能耗预警记录", href: "../energy/energy-warning-record.html" },
      ],
    },
    {
      key: "alarm-center",
      label: "报警中心",
      icon: "fa-solid fa-bell",
      children: [
        { key: "alarm-center.info", label: "报警信息", href: "../alarm-center/alarm-info.html" },
        { key: "alarm-center.rule", label: "报警规则", href: "../alarm-center/alarm-rule.html" },
      ],
    },
    {
      key: "system",
      label: "系统管理",
      icon: "fa-solid fa-gear",
      children: [
        { key: "system.user", label: "用户管理", href: "../system/user.html" },
        { key: "system.role", label: "角色管理", href: "../system/role.html" },
        { key: "system.menu", label: "菜单管理", href: "../system/menu.html" },
        { key: "system.department", label: "部门管理", href: "../system/department.html" },
        { key: "system.post", label: "岗位管理", href: "../system/post.html" },
        { key: "system.dictionary", label: "字典管理", href: "../system/dictionary.html" },
        { key: "system.parameter", label: "参数设置", href: "../system/parameter.html" },
        { key: "system.notice", label: "通知公告", href: "../system/notice.html" },
        {
          key: "service-center",
          label: "服务中心",
          icon: "fa-solid fa-server",
          href: "../service-center/service-center.html",
        },
        {
          key: "system.logs",
          label: "日志管理",
          children: [
            { key: "system.operation-log", label: "操作日志", href: "../system/operation-log.html" },
            { key: "system.login-log", label: "登录日志", href: "../system/login-log.html" },
          ],
        },
      ],
    },
  ];
})();
