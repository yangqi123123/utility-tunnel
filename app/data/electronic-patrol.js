(function () {
  const records = [
    { id: "EP-20261001-001", person: "李明", route: "A区日常巡更路线", point: "A-03 通风机房", patrolAt: "2026-10-01 09:18:26", method: "巡更棒", result: "正常", exception: "-", source: "第三方电子巡更平台", syncedAt: "2026-10-01 09:18:31" },
    { id: "EP-20261001-002", person: "周敏", route: "B区设备巡更路线", point: "B-12 消防泵房", patrolAt: "2026-10-01 08:56:42", method: "NFC 标签", result: "异常", exception: "消防泵房门禁未闭合", source: "第三方电子巡更平台", syncedAt: "2026-10-01 08:56:47" },
    { id: "EP-20261001-003", person: "王强", route: "A区日常巡更路线", point: "A-08 低压配电室", patrolAt: "2026-10-01 08:42:09", method: "巡更棒", result: "正常", exception: "-", source: "第三方电子巡更平台", syncedAt: "2026-10-01 08:42:14" },
    { id: "EP-20260930-014", person: "赵倩", route: "C区夜间巡更路线", point: "C-05 综合舱室", patrolAt: "2026-09-30 23:48:51", method: "二维码", result: "正常", exception: "-", source: "第三方电子巡更平台", syncedAt: "2026-09-30 23:48:56" },
    { id: "EP-20260930-013", person: "李明", route: "C区夜间巡更路线", point: "C-09 排水泵房", patrolAt: "2026-09-30 23:26:18", method: "二维码", result: "异常", exception: "点位温度高于阈值", source: "第三方电子巡更平台", syncedAt: "2026-09-30 23:26:23" },
    { id: "EP-20260930-012", person: "周敏", route: "B区设备巡更路线", point: "B-02 进风井", patrolAt: "2026-09-30 18:16:04", method: "NFC 标签", result: "正常", exception: "-", source: "第三方电子巡更平台", syncedAt: "2026-09-30 18:16:09" },
    { id: "EP-20260930-011", person: "王强", route: "A区日常巡更路线", point: "A-01 人员出入口", patrolAt: "2026-09-30 17:52:33", method: "巡更棒", result: "正常", exception: "-", source: "第三方电子巡更平台", syncedAt: "2026-09-30 17:52:38" },
    { id: "EP-20260930-010", person: "赵倩", route: "B区设备巡更路线", point: "B-18 电缆夹层", patrolAt: "2026-09-30 16:35:27", method: "NFC 标签", result: "正常", exception: "-", source: "第三方电子巡更平台", syncedAt: "2026-09-30 16:35:32" },
  ];

  window.ELECTRONIC_PATROL_STORE = {
    records,
    getRecords() {
      return records.map((record) => ({ ...record }));
    },
  };
})();
