(function () {
  // 巡检设备：字段与「设备管理」保持一致（名称/编码/系统/分类/项目/管廊/舱室/区段/管线/安装位置），
  // workId 关联标准作业，用于在计划抽屉中回显「标准作业 / 检查项目 / 条目」。
  const device = (id, code, name, system, category, corridor, room, section, pipeline, location, workId) => ({
    id, code, name, system, category,
    project: "光谷科学岛综合管廊一期",
    corridor, room, section, pipeline, location, workId,
  });

  const devices = [
    device("DEV-001", "001_HZXFXT03BJ07_0203_001", "裙楼3层F3-2区可燃气体报警器", "消防监控系统", "燃气报警", "高新大道综合管廊", "燃气舱", "防火分区", "科学岛燃气管线", "设备间 1", "SW-009"),
    device("DEV-002", "001_HZXFXT03BJ07_0292_001", "裙楼3层F3-2区可燃气体故障报警器", "消防监控系统", "燃气报警", "高新大道综合管廊", "燃气舱", "通风口", "科学岛燃气管线", "设备间 2", "SW-009"),
    device("DEV-003", "001_XGXT02BJ01_0001_001", "9层东侧靠北巡更点2", "电子巡更", "巡检点底座", "高新大道综合管廊", "综合舱", "出入口", "科学岛通信光缆", "巡检通道 1", "SW-010"),
    device("DEV-004", "001_LZXT01BJ03_0002_001", "综合舱A区照明配电箱", "电力监测平台", "照明设备", "高新大道综合管廊", "综合舱", "防火分区", "科学岛电力管线", "设备间 3", "SW-005"),
    device("DEV-005", "001_HZXFXT03BJ07_1871_0006", "塔楼27层送风阀", "消防监控系统", "输入输出模块", "高新大道综合管廊", "电力舱", "吊装口", "科学岛电力管线", "设备间 4", "SW-012"),
    device("DEV-006", "001_HJJCO2BJ01_0001_001", "空气质量传感器", "环境监测", "室内环境传感器", "科学岛大道综合管廊", "燃气舱", "防火分区", "科学岛燃气管线", "设备间 5", "SW-011"),
    device("DEV-007", "001_PVXT02BJ01_0001_001", "光伏并网逆变器 01", "电力监测平台", "光伏并网逆变器", "科学岛大道综合管廊", "综合舱", "通风口", "科学岛电力管线", "屋面光伏区", "SW-013"),
    device("DEV-008", "001_HJXTFJ01_0002_001", "综合舱B区排风机", "环境监测", "通风设备", "高新大道综合管廊", "综合舱", "通风口", "科学岛给水管线", "设备间 6", "SW-003"),
    device("DEV-009", "001_GDXTGY01_0001_001", "高压配电柜 01", "电力监测平台", "供配电", "高新大道综合管廊", "电力舱", "出入口", "科学岛电力管线", "设备间 7", "SW-002"),
    device("DEV-010", "001_SJXT01BJ01_0001_001", "电力舱出入口枪式摄像机", "视频监控系统", "枪式摄像机", "高新大道综合管廊", "电力舱", "出入口", "科学岛通信光缆", "通道口", "SW-007"),
    device("DEV-011", "001_SJXT01BJ02_0003_001", "综合舱A区球型摄像机", "视频监控系统", "球型摄像机", "科学岛大道综合管廊", "综合舱", "防火分区", "科学岛通信光缆", "通道口", "SW-008"),
    device("DEV-012", "001_HZXFXT03BJ01_0001_001", "火灾自动报警主机", "消防监控系统", "消防设备", "高新大道综合管廊", "综合舱", "出入口", "科学岛通信光缆", "监控中心", "SW-001"),
  ];

  const standardWorks = [
    { id: "SW-001", code: "KCDS_INSP_2072245195876491265", name: "日常巡检", type: "巡检", mode: "并行作业", system: "消防监控系统", category: "消防设备", itemCount: 2, entryCount: 5, creator: "王鹏程", createdAt: "2026-07-01 17:19:13", updater: "王鹏程", updatedAt: "2026-08-17 14:15:56", status: "正常", remark: "日常设备状态巡检。" },
    { id: "SW-002", code: "KCDS_INSP_2072245195876491266", name: "日常巡检", type: "巡检", mode: "并行作业", system: "电力监测平台", category: "供配电", itemCount: 1, entryCount: 3, creator: "103", createdAt: "2026-07-01 17:19:13", updater: "103", updatedAt: "2026-07-01 17:19:13", status: "正常", remark: "供配电设备巡检。" },
    { id: "SW-003", code: "KCDS_INSP_2072245195876491267", name: "日常巡检", type: "巡检", mode: "并行作业", system: "环境监测", category: "通风设备", itemCount: 1, entryCount: 3, creator: "103", createdAt: "2026-07-01 17:19:13", updater: "103", updatedAt: "2026-07-01 17:19:13", status: "正常", remark: "通风设备巡检。" },
    { id: "SW-004", code: "KCDS_INSP_2072245195876491268", name: "日常巡检", type: "巡检", mode: "并行作业", system: "环境监测", category: "排水泵", itemCount: 1, entryCount: 3, creator: "103", createdAt: "2026-07-01 17:19:13", updater: "103", updatedAt: "2026-07-01 17:19:13", status: "正常", remark: "排水泵巡检。" },
    { id: "SW-005", code: "KCDS_INSP_2072245195876491269", name: "日常巡检", type: "巡检", mode: "并行作业", system: "电力监测平台", category: "照明设备", itemCount: 1, entryCount: 3, creator: "103", createdAt: "2026-07-01 17:19:13", updater: "103", updatedAt: "2026-07-01 17:19:13", status: "正常", remark: "照明设备巡检。" },
    { id: "SW-006", code: "KCDS_INSP_2072245195876491270", name: "日常巡检", type: "巡检", mode: "并行作业", system: "电力监测平台", category: "电表", itemCount: 1, entryCount: 3, creator: "103", createdAt: "2026-07-01 17:19:13", updater: "103", updatedAt: "2026-07-01 17:19:13", status: "正常", remark: "电表巡检。" },
    { id: "SW-007", code: "KCDS_INSP_2072245195876491271", name: "日常巡检", type: "巡检", mode: "并行作业", system: "视频监控系统", category: "枪式摄像机", itemCount: 1, entryCount: 3, creator: "103", createdAt: "2026-07-01 17:19:13", updater: "103", updatedAt: "2026-07-01 17:19:13", status: "正常", remark: "枪式摄像机巡检。" },
    { id: "SW-008", code: "KCDS_INSP_2072245195876491272", name: "日常巡检", type: "巡检", mode: "顺序作业", system: "视频监控系统", category: "球型摄像机", itemCount: 1, entryCount: 3, creator: "103", createdAt: "2026-07-01 17:19:13", updater: "103", updatedAt: "2026-07-01 17:19:13", status: "正常", remark: "球型摄像机巡检。" },
    { id: "SW-009", code: "KCDS_INSP_2072245195876491273", name: "日常巡检", type: "巡检", mode: "并行作业", system: "消防监控系统", category: "燃气报警", itemCount: 1, entryCount: 3, creator: "王鹏程", createdAt: "2026-07-02 09:12:41", updater: "王鹏程", updatedAt: "2026-08-05 10:20:33", status: "正常", remark: "燃气报警设备日常巡检。" },
    { id: "SW-010", code: "KCDS_INSP_2072245195876491274", name: "日常巡检", type: "巡检", mode: "顺序作业", system: "电子巡更", category: "巡检点底座", itemCount: 1, entryCount: 3, creator: "王鹏程", createdAt: "2026-07-02 09:15:02", updater: "王鹏程", updatedAt: "2026-07-30 16:41:07", status: "正常", remark: "巡更点底座日常巡检。" },
    { id: "SW-011", code: "KCDS_INSP_2072245195876491275", name: "日常巡检", type: "巡检", mode: "并行作业", system: "环境监测", category: "室内环境传感器", itemCount: 1, entryCount: 3, creator: "王鹏程", createdAt: "2026-07-02 09:18:26", updater: "王鹏程", updatedAt: "2026-08-11 11:02:58", status: "正常", remark: "室内环境传感器日常巡检。" },
    { id: "SW-012", code: "KCDS_INSP_2072245195876491276", name: "日常巡检", type: "巡检", mode: "并行作业", system: "消防监控系统", category: "输入输出模块", itemCount: 1, entryCount: 3, creator: "王鹏程", createdAt: "2026-07-02 09:21:19", updater: "王鹏程", updatedAt: "2026-08-19 09:37:44", status: "正常", remark: "输入输出模块日常巡检。" },
    { id: "SW-013", code: "KCDS_INSP_2072245195876491277", name: "日常巡检", type: "巡检", mode: "并行作业", system: "电力监测平台", category: "光伏并网逆变器", itemCount: 1, entryCount: 3, creator: "王鹏程", createdAt: "2026-07-02 09:24:55", updater: "王鹏程", updatedAt: "2026-08-22 15:26:10", status: "正常", remark: "光伏并网逆变器日常巡检。" },
  ];

  const inspectionProjects = [
    { id: "PRJ-001", workId: "SW-001", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-002", workId: "SW-001", order: 20, name: "安全巡检", status: "启用", remark: "安全防护装置检查项目" },
    { id: "PRJ-003", workId: "SW-002", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-004", workId: "SW-003", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-005", workId: "SW-004", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-006", workId: "SW-005", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-007", workId: "SW-006", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-008", workId: "SW-007", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-009", workId: "SW-008", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-010", workId: "SW-009", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-011", workId: "SW-010", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-012", workId: "SW-011", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-013", workId: "SW-012", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
    { id: "PRJ-014", workId: "SW-013", order: 10, name: "基础巡检", status: "启用", remark: "系统初始化：基础巡检项目" },
  ];

  const inspectionItems = [
    { id: "ITEM-001", workId: "SW-001", projectId: "PRJ-001", order: 10, name: "设备外观完好", required: true, inputType: "单选", unit: "-", options: ["正常", "异常"], remark: "检查设备外观是否完好，无破损、锈蚀、明显变形。", updatedAt: "2026-07-01 17:19:15" },
    { id: "ITEM-002", workId: "SW-001", projectId: "PRJ-001", order: 20, name: "设备运行状态正常", required: true, inputType: "单选", unit: "-", options: ["正常", "异常"], remark: "检查设备运行状态是否正常，无异常声响、异味、报警。", updatedAt: "2026-07-01 17:19:15" },
    { id: "ITEM-003", workId: "SW-001", projectId: "PRJ-001", order: 30, name: "现场环境整洁", required: true, inputType: "单选", unit: "-", options: ["正常", "异常"], remark: "检查设备周边环境是否整洁，无遮挡、积水、杂物堆放。", updatedAt: "2026-07-01 17:19:15" },
    { id: "ITEM-004", workId: "SW-001", projectId: "PRJ-002", order: 10, name: "安全标识完好", required: true, inputType: "单选", unit: "-", options: ["正常", "异常"], remark: "检查安全标识是否完好清晰、无脱落。", updatedAt: "2026-07-01 17:19:15" },
    { id: "ITEM-005", workId: "SW-001", projectId: "PRJ-002", order: 20, name: "防护装置齐全", required: false, inputType: "多选", unit: "-", options: ["齐全", "缺失", "破损"], remark: "检查防护装置是否齐全完好。", updatedAt: "2026-07-01 17:19:15" },
  ];

  // 基础巡检条目（设备外观完好 / 设备运行状态正常 / 现场环境整洁）
  const baseEntries = [
    { order: 10, name: "设备外观完好", inputType: "单选", options: ["正常", "异常"], remark: "检查设备外观是否完好，无破损、锈蚀、明显变形。" },
    { order: 20, name: "设备运行状态正常", inputType: "单选", options: ["正常", "异常"], remark: "检查设备运行状态是否正常，无异常声响、异味、报警。" },
    { order: 30, name: "现场环境整洁", inputType: "单选", options: ["正常", "异常"], remark: "检查设备周边环境是否整洁，无遮挡、积水、杂物堆放。" },
  ];
  const baseItemProjects = [["PRJ-003", "SW-002"], ["PRJ-004", "SW-003"], ["PRJ-005", "SW-004"], ["PRJ-006", "SW-005"], ["PRJ-007", "SW-006"], ["PRJ-008", "SW-007"], ["PRJ-009", "SW-008"], ["PRJ-010", "SW-009"], ["PRJ-011", "SW-010"], ["PRJ-012", "SW-011"], ["PRJ-013", "SW-012"], ["PRJ-014", "SW-013"]];
  let itemSeq = inspectionItems.length + 1;
  baseItemProjects.forEach(([projectId, workId]) => {
    baseEntries.forEach((entry) => {
      inspectionItems.push({ id: `ITEM-${String(itemSeq++).padStart(3, "0")}`, workId, projectId, order: entry.order, name: entry.name, required: true, inputType: entry.inputType, unit: "-", options: [...entry.options], remark: entry.remark, updatedAt: "2026-07-01 17:19:15" });
    });
  });

  const plans = [
    { id: "PLAN-001", code: "IP202607211453002617", name: "综合舱气体报警设备日检", project: "光谷科学岛综合管廊一期", level: "中", target: "裙楼3层F3-2区可燃气体报警器、裙楼3层F3-2区可燃气体故障报警器", cycle: "每日", weekDay: "周一", monthDay: 1, generateAt: "00:10:00", startAt: "09:00:00", inspector: "物管员", owner: "张强", status: "正常", finishHours: 24, createdAt: "2026-07-21 14:53:00", lastGenerateAt: "2026-10-01 00:10:04", nextGenerateAt: "2026-10-02 00:10:00", note: "每日生成巡检任务。", deviceIds: ["DEV-001", "DEV-002"] },
    { id: "PLAN-002", code: "IP202607011808557591", name: "低压配电设备运行巡检", project: "光谷科学岛综合管廊一期", level: "中", target: "裙楼3层F3-2区可燃气体报警器", cycle: "每日", weekDay: "周一", monthDay: 1, generateAt: "00:10:00", startAt: "09:00:00", inspector: "潘隆坤", owner: "张强", status: "正常", finishHours: 24, createdAt: "2026-07-01 18:08:55", lastGenerateAt: "2026-10-01 00:10:04", nextGenerateAt: "2026-10-02 00:10:00", note: "重点设备每日巡检。", deviceIds: ["DEV-001"] },
    { id: "PLAN-003", code: "IP202608051012334501", name: "每周综合巡检计划", project: "光谷科学岛综合管廊一期", level: "高", target: "综合舱A区照明配电箱", cycle: "每周", weekDay: "周一", monthDay: 1, generateAt: "00:10:00", startAt: "09:00:00", inspector: "黄志深", owner: "潘隆坤", status: "正常", finishHours: 8, createdAt: "2026-08-05 10:12:33", lastGenerateAt: "2026-09-28 00:10:02", nextGenerateAt: "2026-10-05 00:10:00", note: "每周一生成综合巡检任务。", deviceIds: ["DEV-004"] },
  ];

  const tasks = Array.from({ length: 10 }, (_, index) => {
    const day = String(9 - Math.floor(index / 2)).padStart(2, "0");
    const plan = index % 2 === 0 ? plans[0] : plans[1];
    const deviceCount = index % 2 === 0 ? 2 : 1;
    return {
      id: `TASK-${String(index + 1).padStart(3, "0")}`,
      code: `IT202609${day}0900${String(10168038 + index).padStart(2, "0")}`,
      name: `${plan.name}-202609${day}0900`,
      planId: plan.id,
      planName: plan.name,
      level: plan.level,
      inspector: plan.inspector,
      owner: plan.owner,
      status: ["待巡检", "巡检中", "验收中", "已完成", "已关闭"][index % 5],
      planExecution: index === 0 ? "未执行" : "执行中",
      result: index >= 3 ? "正常" : "-",
      overdue: "未逾期",
      deviceCount,
      itemCount: deviceCount === 2 ? 6 : 3,
      abnormalCount: 0,
      plannedAt: `2026-09-${day} 09:00:00`,
      deadline: `2026-09-${String(Number(day) + 1).padStart(2, "0")} 09:00:00`,
      startedAt: index === 0 ? "-" : `2026-09-${day} 09:05:00`,
      submittedAt: index >= 2 ? `2026-09-${day} 10:15:00` : "-",
      duration: index >= 2 ? "01:10:00" : "-",
      note: index === 4 ? "设备维护窗口关闭" : "-",
      deviceIds: plan.deviceIds,
    };
  });

  tasks.unshift({
    ...tasks[0],
    id: "TASK-OVERDUE-001",
    code: "IT202610020900102001",
    name: "综合舱气体报警设备补充巡检-202610020900",
    status: "待巡检",
    overdue: "已逾期",
    planExecution: "2026-10-02 09:00:00",
    plannedAt: "2026-10-02 09:00:00",
    deadline: "2026-10-03 09:00:00",
    startedAt: "-",
    submittedAt: "-",
    duration: "-",
  });

  const departments = [
    { id: "D-01", name: "科学岛管廊监控中心", children: [
      { id: "D-02", name: "项目管理中心", children: [
        { id: "D-03", name: "项目综合管理部" },
        { id: "D-04", name: "招商运营部" },
        { id: "D-05", name: "客户服务部" },
      ] },
      { id: "D-06", name: "工程管理中心", children: [
        { id: "D-07", name: "机电工程部" },
        { id: "D-08", name: "土建工程部" },
        { id: "D-09", name: "设备运维部" },
      ] },
      { id: "D-10", name: "物业运营中心", children: [
        { id: "D-11", name: "物业服务部" },
        { id: "D-12", name: "环境管理部" },
        { id: "D-13", name: "秩序维护部" },
      ] },
      { id: "D-14", name: "财务管理部", children: [
        { id: "D-15", name: "财务核算组" },
        { id: "D-16", name: "成本管理组" },
      ] },
    ] },
  ];

  const personnel = [
    { id: "U-001", name: "彭飞龙", account: "1000011", phone: "13060993725", dept: "机电工程部" },
    { id: "U-002", name: "张晓慧", account: "1000012", phone: "13416456121", dept: "土建工程部" },
    { id: "U-003", name: "黄志深", account: "1000013", phone: "17512887806", dept: "设备运维部" },
    { id: "U-004", name: "张强", account: "1000014", phone: "15271361004", dept: "项目综合管理部" },
    { id: "U-005", name: "潘隆坤", account: "1000015", phone: "15772599167", dept: "设备运维部" },
    { id: "U-006", name: "何明红", account: "1000016", phone: "15186643109", dept: "招商运营部" },
    { id: "U-007", name: "邹丽平", account: "1000017", phone: "13728019966", dept: "客户服务部" },
    { id: "U-008", name: "李国栋", account: "1000018", phone: "13600992318", dept: "物业服务部" },
    { id: "U-009", name: "物管员", account: "1000019", phone: "13500000000", dept: "物业服务部" },
    { id: "U-010", name: "王雅琳", account: "1000020", phone: "15019462775", dept: "环境管理部" },
    { id: "U-011", name: "刘建华", account: "1000021", phone: "13922158840", dept: "秩序维护部" },
    { id: "U-012", name: "陈思远", account: "1000022", phone: "15822390067", dept: "财务核算组" },
    { id: "U-013", name: "周敏", account: "1000023", phone: "13455667788", dept: "成本管理组" },
  ];

  window.INSPECTION_DATA = { devices, standardWorks, inspectionProjects, inspectionItems, plans, tasks, departments, personnel };
})();
