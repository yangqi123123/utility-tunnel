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
