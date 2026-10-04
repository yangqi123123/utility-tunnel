(() => {
      const screen = document.getElementById('screenShell');
      const pageKey = screen.dataset.page;
      const workspace = document.querySelector('.workspace');
      const ensureHeaderOverlays = () => {
        const headerTools = document.querySelector('.header-tools');
        const overlayHost = screen || document.body;
        if (headerTools && !document.getElementById('profilePopover')) {
          headerTools.insertAdjacentHTML('beforeend', '<div class="profile-popover" id="profilePopover" role="dialog" aria-label="基本信息" hidden><h2>基本信息</h2><dl><div><dt>用户名:</dt><dd>test</dd></div><div><dt>姓名:</dt><dd>管理员</dd></div><div><dt>手机号:</dt><dd>18705183442</dd></div></dl></div>');
        }
        if (!document.getElementById('logoutConfirmModal')) {
          overlayHost.insertAdjacentHTML('beforeend', '<div class="device-modal logout-confirm-modal" id="logoutConfirmModal" role="dialog" aria-modal="true"><div class="device-dialog logout-confirm-dialog"><button class="device-dialog-close" id="logoutConfirmClose" type="button">×</button><div class="device-dialog-head">退出登录</div><p class="logout-confirm-question">确认退出当前账号</p><div class="alarm-action-buttons"><button id="logoutCancelButton" type="button">取消</button><button class="primary" id="logoutConfirmButton" type="button">确定</button></div></div></div>');
        }
        if (!document.getElementById('alarmMessageModal')) {
          overlayHost.insertAdjacentHTML('beforeend', '<div class="device-modal alarm-message-modal" id="alarmMessageModal" role="dialog" aria-modal="true" aria-labelledby="alarmMessageTitle"><div class="device-dialog alarm-message-dialog"><button class="device-dialog-close" id="alarmMessageClose" type="button" aria-label="关闭报警消息">×</button><div class="alarm-message-tabs" role="tablist"><button class="active" type="button" data-alarm-view="messages">报警消息</button><button type="button" data-alarm-view="stats">报警统计</button></div><div class="alarm-message-view-pane active" data-alarm-pane="messages"></div><div class="alarm-message-view-pane alarm-statistics" data-alarm-pane="stats"></div></div></div>');
        }
        if (!document.getElementById('falseAlarmModal')) {
          overlayHost.insertAdjacentHTML('beforeend', '<div class="device-modal alarm-action-modal" id="falseAlarmModal" role="dialog" aria-modal="true"><div class="device-dialog alarm-action-dialog form-dialog"><button class="device-dialog-close" data-close-alarm-action="falseAlarmModal" type="button">×</button><div class="device-dialog-head">误报确认</div><p class="alarm-action-question">是否确认该报警为误报</p><label class="false-alarm-description">误报说明<textarea required placeholder="请输入误报说明"></textarea></label><div class="alarm-action-buttons"><button data-close-alarm-action="falseAlarmModal">取消</button><button class="primary" data-close-alarm-action="falseAlarmModal" data-confirm-false-alarm type="button">确定</button></div></div></div>');
          overlayHost.insertAdjacentHTML('beforeend', '<div class="device-modal alarm-action-modal" id="processAlarmModal" role="dialog" aria-modal="true"><div class="device-dialog alarm-action-dialog form-dialog"><button class="device-dialog-close" data-close-alarm-action="processAlarmModal" type="button">×</button><div class="device-dialog-head">处理确认</div><label>处理人<select><option>管理员</option><option>张工</option><option>李工</option></select></label><label>处理时间<input type="datetime-local"></label><label>备注<textarea></textarea></label><div class="alarm-action-buttons"><button data-close-alarm-action="processAlarmModal">取消</button><button class="primary" data-close-alarm-action="processAlarmModal">确定</button></div></div></div>');
          overlayHost.insertAdjacentHTML('beforeend', '<div class="device-modal alarm-action-modal" id="workOrderAlarmModal" role="dialog" aria-modal="true"><div class="device-dialog alarm-action-dialog form-dialog"><button class="device-dialog-close" data-close-alarm-action="workOrderAlarmModal" type="button">×</button><div class="device-dialog-head">转工单确认</div><label>联系人<input type="text" placeholder="请输入联系人"></label><label>联系电话<input type="tel" placeholder="请输入联系电话"></label><label>工单类型<select><option>室内报修</option><option>公区报修</option></select></label><label>工单分类<select><option>设备故障</option><option>设备离线</option><option>环境异常</option><option>其他</option></select></label><label>紧急程度<select><option>一般</option><option>紧急</option></select></label><label>上传图片<input type="file" accept="image/*"></label><label>报修内容<textarea placeholder="请输入报修内容"></textarea></label><div class="alarm-action-buttons"><button data-close-alarm-action="workOrderAlarmModal">取消</button><button class="primary" data-close-alarm-action="workOrderAlarmModal">确定</button></div></div></div>');
        }
        ['falseAlarmModal', 'processAlarmModal', 'workOrderAlarmModal'].forEach((id) => {
          const modal = document.getElementById(id);
          if (modal && modal.parentElement !== document.body) document.body.append(modal);
        });
      };
      ensureHeaderOverlays();
      document.addEventListener('click', (event) => {
        const batchAction = event.target.closest?.('[data-batch-action]');
        if (!batchAction) return;
        if (batchAction.disabled) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const modalId = { false: 'falseAlarmModal', process: 'processAlarmModal', workorder: 'workOrderAlarmModal' }[batchAction.dataset.batchAction];
        document.getElementById(modalId)?.classList.add('open');
      }, true);
      const alarmMessagesMarkup = '<form class="alarm-message-filters" id="alarmMessageFilters"><select name="type" aria-label="报警类型"><option value="">全部报警类型</option><option>设备离线</option><option>设备属性</option></select><select name="level" aria-label="报警等级"><option value="">全部报警等级</option><option>告警</option><option>预警</option><option>提醒</option></select><select name="status" aria-label="报警状态"><option value="">全部报警状态</option><option>未处理</option><option>处理中</option><option>已处理</option></select><button type="reset">重置</button><button type="submit">查询</button><div class="alarm-batch-wrap"><button type="button" class="alarm-batch-trigger">批量处理</button><div class="alarm-batch-menu"><button type="button" data-batch-action="false">误报</button><button type="button" data-batch-action="process">处理</button><button type="button" data-batch-action="workorder">转工单</button></div></div></form><div class="alarm-message-table"><div class="alarm-message-row table-head"><label><input class="alarm-select-all" type="checkbox" aria-label="全选未处理报警"></label><span>序号</span><span>报警设备</span><span>报警类型</span><span>报警消息</span><span>报警等级</span><span>报警时间</span><span>报警状态</span><span>操作</span></div><div class="alarm-message-row" data-alarm-status="未处理"><label><input type="checkbox" class="alarm-row-check" aria-label="选择第1条报警"></label><span>1</span><span>光伏并网逆变器20KW</span><span>设备离线</span><span>逆变器设备掉线告警，位置:5F5F强电间</span><span>告警</span><span>2026-09-08 03:00:00</span><span>未处理</span><button class="alarm-message-view" type="button" data-device="光伏并网逆变器20KW" data-code="5F-PV-INV-20" data-position="科创大厦/5F/5F强电间">查看</button></div><div class="alarm-message-row" data-alarm-status="处理中"><label><input type="checkbox" disabled aria-label="处理中报警不可选择"></label><span>2</span><span>1F10号电梯前室PM4</span><span>设备属性</span><span>信息发布设备离线告警，位置:1F总部区电梯厅</span><span>预警</span><span>2026-09-08 02:49:45</span><span>处理中</span><button class="alarm-message-view" type="button" data-device="1F10号电梯前室PM4" data-code="1F-PM4" data-position="科创大厦/1F/总部区电梯厅">查看</button></div><div class="alarm-message-row" data-alarm-status="已处理"><label><input type="checkbox" disabled aria-label="已处理报警不可选择"></label><span>3</span><span>1F东门入口大厅PM6</span><span>设备属性</span><span>信息发布设备通讯恢复，位置:1F入口大厅</span><span>提醒</span><span>2026-09-08 02:42:12</span><span>已处理</span><button class="alarm-message-view" type="button" data-device="1F东门入口大厅PM6" data-code="1F-PM6" data-position="科创大厦/1F/入口大厅">查看</button></div></div>';
      document.querySelectorAll('[data-alarm-pane="messages"]').forEach((pane) => { pane.innerHTML = alarmMessagesMarkup; });
      const syncBatchActionState = () => {
        const enabled = Boolean(document.querySelector('.alarm-row-check:checked'));
        document.querySelectorAll('[data-batch-action]').forEach((button) => { button.disabled = !enabled; });
      };
      document.querySelector('.header-icon[aria-label="消息提醒"]')?.classList.add('has-unread');
      syncBatchActionState();
      document.addEventListener('change', (event) => {
        if (event.target.matches('.alarm-row-check, .alarm-select-all')) syncBatchActionState();
      });
      const alarmStatisticsMarkup = '<div class="alarm-stat-toolbar"><span>统计周期</span><button class="active" type="button" data-alarm-period="today">今日</button><button type="button" data-alarm-period="week">本周</button><button type="button" data-alarm-period="month">本月</button><button type="button" data-alarm-period="year">本年</button></div><div class="alarm-stat-grid"><section><h3>报警趋势</h3><div class="alarm-trend-chart"><span class="alarm-chart-unit">单位（次）</span><svg viewBox="0 0 480 180" role="img" aria-label="报警趋势折线图"><g class="alarm-chart-grid"><line x1="48" y1="35" x2="464" y2="35"></line><line x1="48" y1="82" x2="464" y2="82"></line><line x1="48" y1="129" x2="464" y2="129"></line></g><g class="alarm-chart-y"><text x="20" y="39">10</text><text x="26" y="86">5</text><text x="26" y="133">0</text></g><path class="alarm-chart-area" d="M48 116 C90 108 118 64 154 77 S220 99 258 72 S320 84 360 59 S420 68 464 48 L464 129 L48 129 Z"></path><path class="alarm-chart-line" d="M48 116 C90 108 118 64 154 77 S220 99 258 72 S320 84 360 59 S420 68 464 48"></path><g class="alarm-chart-x" id="alarmTrendAxis"></g></svg></div></section><section><h3>报警类型</h3><div class="alarm-type-layout"><div class="alarm-donut"><strong>11<small>报警总数</small></strong></div><div class="alarm-type-legend"><span><i class="dot red"></i><b>设备属性</b><em>9个</em><strong>81.82%</strong></span><span><i class="dot orange"></i><b>设备离线</b><em>2个</em><strong>18.18%</strong></span></div></div></section><section><h3>报警排行</h3><div class="alarm-rank-head"><span>单位（次）</span><div><button class="active" type="button" data-rank-mode="space">空间</button><button type="button" data-rank-mode="system">系统</button></div></div><div class="alarm-bars" id="alarmRankingBars"></div></section><section><h3>报警状态</h3><div class="alarm-type-layout"><div class="alarm-donut status"><strong>11<small>报警总数</small></strong></div><div class="alarm-type-legend status-legend"><span><i class="dot pending"></i><b>未处理</b><em>6个</em><strong>54.55%</strong></span><span><i class="dot processing"></i><b>处理中</b><em>3个</em><strong>27.27%</strong></span><span><i class="dot handled"></i><b>已处理</b><em>2个</em><strong>18.18%</strong></span></div></div></section><section><h3>报警系统分布</h3><div class="alarm-system-grid"><span class="hvac"><i class="fa-solid fa-wind"></i><b>暖通系统</b><em>3</em></span><span class="electric"><i class="fa-solid fa-bolt"></i><b>电气系统</b><em>2</em></span><span class="water"><i class="fa-solid fa-faucet-drip"></i><b>给排水系统</b><em>2</em></span><span class="fire"><i class="fa-solid fa-fire-flame-curved"></i><b>消防系统</b><em>2</em></span><span class="lift"><i class="fa-solid fa-elevator"></i><b>电梯系统</b><em>1</em></span><span class="security"><i class="fa-solid fa-shield-halved"></i><b>安防系统</b><em>1</em></span></div></section><section><h3>报警处理</h3><div class="alarm-type-layout"><div class="alarm-donut handled"><strong>5<small>处理报警</small></strong></div><div class="alarm-type-legend"><span><i class="dot processing"></i><b>转工单</b><em>2个</em><strong>40%</strong></span><span><i class="dot orange"></i><b>误报</b><em>1个</em><strong>20%</strong></span><span><i class="dot handled"></i><b>直接处理</b><em>2个</em><strong>40%</strong></span></div></div></section></div>';
      document.querySelectorAll('.alarm-statistics').forEach((pane) => { pane.innerHTML = alarmStatisticsMarkup; });
      if (pageKey === 'overview') {
        const peopleStatisticsData = {
          today: { office: 683, visitors: 46, labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], values: [2, 6, 4, 7, 6, 9, 8] },
          week: { office: 3258, visitors: 286, labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], values: [4, 7, 6, 8, 7, 9, 8] },
          month: { office: 12860, visitors: 1128, labels: ['1日', '5日', '9日', '13日', '17日', '21日', '25日', '29日'], values: [2, 5, 6, 4, 7, 6, 9, 8] },
          year: { office: 148260, visitors: 13582, labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], values: [3, 5, 7, 6, 5, 6, 8, 7, 9, 10, 9, 10] }
        };
        const renderPeopleStatistics = (period) => {
          const data = peopleStatisticsData[period] || peopleStatisticsData.today;
          const total = data.office + data.visitors;
          const officeRatio = total ? Math.round((data.office / total) * 100) : 0;
          const officeCount = document.getElementById('peopleOfficeCount');
          const visitorCount = document.getElementById('peopleVisitorCount');
          const totalCount = document.getElementById('peopleTotalCount');
          const ring = document.getElementById('peopleTypeRing');
          if (officeCount) officeCount.textContent = data.office.toLocaleString('zh-CN');
          if (visitorCount) visitorCount.textContent = data.visitors.toLocaleString('zh-CN');
          if (totalCount) {
            totalCount.textContent = total.toLocaleString('zh-CN');
            totalCount.style.fontSize = total >= 100000 ? '12px' : total >= 10000 ? '15px' : '';
          }
          if (ring) ring.style.background = `conic-gradient(#59e4ea 0 ${officeRatio}%, #1d6ea6 ${officeRatio}% 100%)`;
          const left = 30;
          const right = 312;
          const top = 15;
          const bottom = 71;
          const maxValue = Math.max(10, ...data.values);
          const points = data.values.map((value, index) => ({
            x: left + (right - left) * index / Math.max(data.values.length - 1, 1),
            y: bottom - (bottom - top) * value / maxValue
          }));
          const linePath = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
          const trendLine = document.getElementById('peopleTrendLine');
          const trendArea = document.getElementById('peopleTrendArea');
          if (trendLine) trendLine.setAttribute('d', linePath);
          if (trendArea) trendArea.setAttribute('d', `${linePath} L${right} ${bottom} L${left} ${bottom} Z`);
          const pointsGroup = document.getElementById('peopleTrendPoints');
          if (pointsGroup) pointsGroup.innerHTML = points.map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="2"></circle>`).join('');
          const axis = document.getElementById('peopleTrendAxis');
          if (axis) axis.innerHTML = data.labels.map((label, index) => {
            const x = left + (right - left) * index / Math.max(data.labels.length - 1, 1);
            return `<text x="${x.toFixed(1)}" y="91" text-anchor="middle">${label}</text>`;
          }).join('');
        };
        document.querySelectorAll('[data-people-period]').forEach((button) => button.addEventListener('click', () => {
          document.querySelectorAll('[data-people-period]').forEach((item) => {
            const active = item === button;
            item.classList.toggle('active', active);
            item.setAttribute('aria-selected', String(active));
          });
          renderPeopleStatistics(button.dataset.peoplePeriod);
        }));
        renderPeopleStatistics('today');
      }
      const logoutButton = document.querySelector('.header-icon[aria-label="退出系统"]');
      const logoutConfirmModal = document.getElementById('logoutConfirmModal');
      const profileButton = document.getElementById('profileButton');
      const profilePopover = document.getElementById('profilePopover');
      // Header actions are delegated at document level so they remain available on every module view.
      document.addEventListener('click', (event) => {
        const trigger = event.target.closest?.('.header-icon');
        if (!trigger) return;
        const label = trigger.getAttribute('aria-label');
        if (label === '消息提醒') {
          event.preventDefault();
          event.stopImmediatePropagation();
          document.getElementById('alarmMessageModal')?.classList.add('open');
        } else if (label === '退出系统') {
          event.preventDefault();
          event.stopImmediatePropagation();
          document.getElementById('logoutConfirmModal')?.classList.add('open');
        } else if (label === '用户中心') {
          event.preventDefault();
          event.stopImmediatePropagation();
          const popover = document.getElementById('profilePopover');
          const button = document.getElementById('profileButton');
          if (popover) popover.hidden = !popover.hidden;
          button?.setAttribute('aria-expanded', String(popover ? !popover.hidden : false));
        }
      }, true);
      const closeLogoutConfirm = () => logoutConfirmModal?.classList.remove('open');
      const closeProfilePopover = () => { if (profilePopover) profilePopover.hidden = true; profileButton?.setAttribute('aria-expanded', 'false'); };
      logoutButton?.addEventListener('click', () => logoutConfirmModal?.classList.add('open'));
      document.getElementById('logoutConfirmClose')?.addEventListener('click', closeLogoutConfirm);
      document.getElementById('logoutCancelButton')?.addEventListener('click', closeLogoutConfirm);
      document.getElementById('logoutConfirmButton')?.addEventListener('click', () => { window.location.href = new URL('../index.html', window.location.href).href; });
      logoutConfirmModal?.addEventListener('click', (event) => { if (event.target === logoutConfirmModal) closeLogoutConfirm(); });
      profileButton?.addEventListener('click', (event) => { event.stopPropagation(); const isOpen = profilePopover && !profilePopover.hidden; if (profilePopover) profilePopover.hidden = isOpen; profileButton.setAttribute('aria-expanded', String(!isOpen)); });
      profilePopover?.addEventListener('click', (event) => event.stopPropagation());
      document.addEventListener('click', closeProfilePopover);
      const floorControl = document.querySelector('.floor-control');
      const floorPlan = document.querySelector('.floor-plan');
      const floorButton = document.querySelector('.floor-button');
      const floorMenu = document.querySelector('.floor-menu');
      const buildingFloors = [
        { id: '1栋', floors: ['5F', '4F', '3F', '2F', '1F'] },
        { id: '2栋', floors: ['5F', '4F', '3F', '2F', '1F'] },
        { id: '3栋', floors: ['5F', '4F', '3F', '2F', '1F'] },
        { id: '4栋', floors: ['5F', '4F', '3F', '2F', '1F'] },
      ];
      const environmentFloorPicker = document.getElementById('environmentFloorPicker');
      const carbonPeriodValues = { today: ['26.55', '23.86', '21.48', '19.62'], week: ['186.42', '168.03', '151.36', '138.75'], month: ['798.63', '720.18', '648.92', '594.37'], year: ['9,584', '8,642', '7,787', '7,132'] };
      document.querySelectorAll('[data-carbon-period]').forEach((button) => button.addEventListener('click', () => {
        document.querySelectorAll('[data-carbon-period]').forEach((item) => {
          const selected = item === button;
          item.classList.toggle('active', selected);
          item.setAttribute('aria-selected', String(selected));
        });
        document.querySelectorAll('[data-carbon-building]').forEach((value, index) => { value.textContent = carbonPeriodValues[button.dataset.carbonPeriod]?.[index] || '0'; });
      }));
      if (environmentFloorPicker) {
        const trigger = environmentFloorPicker.querySelector('.environment-floor-trigger');
        const menu = environmentFloorPicker.querySelector('.environment-floor-menu');
        menu.innerHTML = buildingFloors.map(({ id, floors }, buildingIndex) => `<details class="environment-floor-building" ${buildingIndex === 0 ? 'open' : ''}><summary>${id}</summary><div>${floors.map((floor, floorIndex) => `<label><input type="radio" name="environmentFloor" value="${id} ${floor}" ${buildingIndex === 0 && floorIndex === 0 ? 'checked' : ''}><span>${floor}</span></label>`).join('')}</div></details>`).join('');
        trigger.addEventListener('click', (event) => {
          event.stopPropagation();
          const open = environmentFloorPicker.classList.toggle('open');
          trigger.setAttribute('aria-expanded', String(open));
        });
        menu.addEventListener('click', (event) => event.stopPropagation());
        menu.addEventListener('change', (event) => {
          if (!event.target.matches('input[type="radio"]')) return;
          trigger.querySelector('span').textContent = event.target.value;
          environmentFloorPicker.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        });
        document.addEventListener('click', () => {
          environmentFloorPicker.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        });
      }
      if (floorMenu) {
        floorMenu.innerHTML = buildingFloors.map(({ id, floors }, buildingIndex) => `<div class="floor-building"><strong>${id}</strong>${floors.map((floor, floorIndex) => `<button type="button" data-building="${id}" data-floor="${floor}" class="${buildingIndex === 0 && floorIndex === 0 ? 'active' : ''}">${floor}</button>`).join('')}</div>`).join('');
      }
      const floorItems = [...document.querySelectorAll('.floor-menu button')];
      if (pageKey === 'weak-electric') {
        document.querySelector('.building-scene')?.insertAdjacentHTML('afterbegin', '<label class="weak-overview-diagram-toggle"><input id="weakOverviewDiagramToggle" type="checkbox"><span>系统图</span></label>');
      }
      const deviceLocationOptions = buildingFloors.flatMap(({ id, floors }) => floors.map((floor) => ({ value: `${id}-${floor}`, label: `${id} ${floor}` })));
      ['energy-total-panel', 'energy-electric-panel', 'energy-water-panel', 'energy-cooling-panel'].forEach((className, index) => document.querySelectorAll('.workspace > .energy-dashboard-panel')[index]?.classList.add(className));
      if (pageKey === 'energy') {
        const energyPanels = [...document.querySelectorAll('.energy-dashboard-panel')];
        const overviewPanels = [
          { panel: energyPanels[1], title: '用电概览', trend: '用电趋势', unit: '单位(万kW·h)', type: 'electric' },
          { panel: energyPanels[2], title: '用水概览', trend: '用水趋势', unit: '单位(t)', type: 'water' },
          { panel: energyPanels[3], title: '用冷概览', trend: '用冷趋势', unit: '单位(万kW·h)', type: 'cooling' }
        ];
        overviewPanels.forEach(({ panel, title: panelTitle, trend, unit, type }) => {
          if (!panel) return;
          panel.classList.add('energy-overview-panel', `energy-overview-${type}`);
          const title = panel.querySelector('.panel-title');
          if (title) title.firstChild.textContent = panelTitle;
          const head = panel.querySelector('.energy-stat-head');
          if (head) head.innerHTML = `<span class="energy-trend-label">${trend}</span><span class="energy-stat-unit">${unit}</span>${type === 'cooling' ? '<button class="energy-detail-trigger" type="button" data-energy-detail="cooling" onclick="document.getElementById(\'coolingDetailModal\').style.display=\'flex\'; return false;">查看</button>' : `<button class="energy-detail-trigger" type="button" data-energy-detail="${type}">查看</button>`}`;
        });
        const energyDetailMarkup = `<div class="energy-detail-modal" id="energyDetailModal" role="dialog" aria-modal="true" aria-labelledby="energyDetailTitle"><div class="energy-detail-dialog"><button class="energy-detail-close" type="button" aria-label="关闭能源明细">×</button><div class="energy-detail-head"><h2 id="energyDetailTitle">用电概览明细</h2></div><div class="energy-detail-tabs" role="tablist"><button class="active" type="button" data-energy-view="zone">分区统计</button><button type="button" data-energy-view="item">分项统计</button></div><div class="energy-detail-filters"><button class="active" type="button">今日</button><button type="button">本月</button><button type="button">本年</button></div><div class="energy-detail-summary" id="energyDetailSummary"></div><div class="energy-detail-content"><aside class="energy-master-list"><h3>总表</h3><button class="active" type="button" data-master="备用（总表）">备用（总表）<small>26,552 kW·h</small></button><button type="button" data-master="办公普通照明1（总表）">办公普通照明1（总表）<small>6,480 kW·h</small></button><button type="button" data-master="生活水泵房（总表）">生活水泵房（总表）<small>6,725 kW·h</small></button></aside><section class="energy-detail-table-wrap"><h3>分表列表</h3><div class="energy-detail-table" id="energyDetailTable"></div></section></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', energyDetailMarkup);
        const energyDetailModal = document.getElementById('energyDetailModal');
        const energyDetailTable = document.getElementById('energyDetailTable');
        const energyDetailData = { electric: { title: '用电概览明细', unit: 'kW·h', zoneCards: [['总用量','26,552'],['1号楼用量','6,480'],['2号楼用量','6,725'],['3号楼用量','6,392'],['4号楼用量','6,955']], itemCards: [['总用量','26,552'],['插座用量','4,186'],['照明用量','4,240'],['空调用量','13,972'],['动力设备用量','4,154']], zone: [['空调分表','AC-1F-001','1栋','1F','总部办公区','3,680'],['照明分表','LT-2F-014','2栋','2F','公共走道','1,245'],['动力设备分表','PW-4F-006','4栋','4F','设备机房','2,180']], item: [['插座','LT-ALL-001','1栋','1F','1栋1F公共办公区','插座','4,186'],['照明','LT-ALL-002','2栋','2F','2栋2F公共走道','照明','4,240'],['空调','AC-ALL-001','3栋','3F','3栋3F租赁办公区','空调','13,972'],['动力设备','PW-ALL-001','4栋','4F','4栋4F设备机房','动力设备','4,154']] }, water: { title: '用水概览明细', unit: 't', zoneCards: [['总用量','1,286'],['1号楼用量','312'],['2号楼用量','296'],['3号楼用量','338'],['4号楼用量','340']], zone: [['生活用水分表','WM-1F-001','1栋','1F','卫生间','312'],['生活用水分表','WM-2F-003','2栋','2F','茶水间','296'],['公共用水分表','WM-3F-006','3栋','3F','公共区域','338'],['公共用水分表','WM-4F-009','4栋','4F','卫生间','340']] }, cooling: { title: '用冷概览明细', unit: 'kW·h', zoneCards: [['总用量','18,432'],['1号楼用量','4,520'],['2号楼用量','4,316'],['3号楼用量','4,789'],['4号楼用量','4,807']], zone: [['空调冷量分表','CM-1F-001','1栋','1F','公区空调','4,520'],['空调冷量分表','CM-2F-004','2栋','2F','租赁区空调','4,316'],['空调冷量分表','CM-3F-007','3栋','3F','公区空调','4,789'],['空调冷量分表','CM-4F-010','4栋','4F','租赁区空调','4,807']] }, solar: { title: '光伏概览明细', unit: 'kW·h', zoneCards: [['总发电量','8,426'],['1号楼逆变器','2,086'],['2号楼逆变器','2,194'],['3号楼逆变器','2,018'],['4号楼逆变器','2,128']], zone: [['逆变器接口电表','PV-INV-01','1栋','屋顶','接口A','1,086'],['逆变器接口电表','PV-INV-02','2栋','屋顶','接口B','1,194'],['逆变器接口电表','PV-INV-03','3栋','屋顶','接口A','1,018'],['逆变器接口电表','PV-INV-04','4栋','屋顶','接口B','1,128']] } };
        let currentEnergyType = 'electric';
        let detailRows = energyDetailData.electric;
        let selectedMaster = '备用（总表）';
        const renderEnergyDetail = (view = 'zone') => { const config = energyDetailData[currentEnergyType]; const sourceRows = config[view] || config.zone; const rows = currentEnergyType === 'solar' ? sourceRows.map((row) => [row[0], row[1], row[2], row[3], row[5]]) : sourceRows; const headers = currentEnergyType === 'solar' ? ['设备名称','设备编码','楼栋','位置','发电量（kW·h）'] : view === 'item' ? ['设备名称','设备编码','楼栋','楼层','房源','用电分项','用量（' + config.unit + '）'] : ['设备名称','设备编码','楼栋','楼层','房源','用量（' + config.unit + '）']; energyDetailTable.className = `energy-detail-table ${view === 'item' ? 'item-table' : ''} ${currentEnergyType === 'solar' ? 'solar-table' : ''}`; energyDetailTable.innerHTML = `<div class="energy-detail-row table-head">${headers.map((header) => `<span>${header}</span>`).join('')}</div>${rows.map((row) => `<div class="energy-detail-row">${row.map((cell) => `<span>${cell}</span>`).join('')}</div>`).join('')}`; };
        const renderEnergySummary = (view = 'zone') => { const config = energyDetailData[currentEnergyType]; document.getElementById('energyDetailSummary').innerHTML = (config[view + 'Cards'] || config.zoneCards).map(([label, value]) => `<div><span>${label}</span><strong>${value} <small>${config.unit}</small></strong></div>`).join(''); };
        const configureEnergyDetail = (type) => { currentEnergyType = type; const config = energyDetailData[type]; detailRows = config; selectedMaster = '备用（总表）'; energyDetailModal.classList.toggle('zone-only', type !== 'electric'); document.getElementById('energyDetailTitle').textContent = config.title; const tabs = document.querySelector('.energy-detail-tabs'); tabs.hidden = type !== 'electric'; document.querySelector('[data-energy-view="item"]').hidden = type !== 'electric'; document.querySelectorAll('[data-master]').forEach((button) => { button.style.display = ''; button.classList.toggle('active', button.dataset.master === '备用（总表）'); }); renderEnergySummary('zone'); renderEnergyDetail('zone'); };
        const openEnergyDetail = (type) => { configureEnergyDetail(type); energyDetailModal.classList.add('open'); energyDetailModal.setAttribute('aria-hidden', 'false'); };
        window.__openEnergyDetail = openEnergyDetail;
        renderEnergySummary();
        renderEnergyDetail();
        document.addEventListener('click', (event) => { const trigger = event.target.closest?.('[data-energy-detail]'); if (trigger) openEnergyDetail(trigger.dataset.energyDetail); if (event.target.closest?.('.energy-detail-close') || event.target === energyDetailModal) { energyDetailModal.classList.remove('open'); energyDetailModal.setAttribute('aria-hidden', 'true'); } const view = event.target.closest?.('[data-energy-view]'); if (view) { document.querySelectorAll('[data-energy-view]').forEach((button) => button.classList.toggle('active', button === view)); renderEnergySummary(view.dataset.energyView); renderEnergyDetail(view.dataset.energyView); } const master = event.target.closest?.('[data-master]'); if (master) { selectedMaster = master.dataset.master; document.querySelectorAll('[data-master]').forEach((button) => button.classList.toggle('active', button === master)); renderEnergyDetail(document.querySelector('[data-energy-view].active')?.dataset.energyView || 'zone'); } });
        energyPanels.find((panel) => panel?.classList.contains('energy-carbon-panel'))?.classList.add('energy-solar-overview-panel');
        const solarHead = document.querySelector('.solar-generation-head');
        if (solarHead) solarHead.innerHTML = '<span class="energy-trend-label">发电趋势</span><span class="energy-stat-unit">单位(万kW·h)</span><button class="energy-detail-trigger" type="button" data-energy-detail="solar" onclick="window.__openEnergyDetail(\'solar\'); return false;">查看</button>';
        document.querySelectorAll('[data-energy-detail]').forEach((button) => button.onclick = (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          openEnergyDetail(button.dataset.energyDetail);
        });
        document.addEventListener('click', (event) => {
          const button = event.target.closest?.('[data-energy-detail]');
          if (!button) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          openEnergyDetail(button.dataset.energyDetail);
        }, true);
        const breakdown = document.querySelector('.energy-breakdown-panel');
        const legend = breakdown?.querySelector('.energy-breakdown-legend');
        const breakdownHead = breakdown?.querySelector('.energy-breakdown-head');
        if (legend && breakdownHead) {
          breakdownHead.append(legend);
          breakdownHead.querySelector('.energy-unit-label')?.classList.add('energy-breakdown-unit');
        }
      }
      const floorData = {
        '15F': { total: 94, online: 89, onlineRate: '95%', offlineRate: '5%', alarms: 0, devices: [15, 15, 0, 0] },
        '19F': { total: 94, online: 92, onlineRate: '98%', offlineRate: '2%', alarms: 1, devices: [15, 15, 0, 0] },
        '12F': { total: 86, online: 84, onlineRate: '98%', offlineRate: '2%', alarms: 2, devices: [12, 12, 0, 0] },
        'B1': { total: 74, online: 70, onlineRate: '95%', offlineRate: '5%', alarms: 3, devices: [14, 14, 0, 0] }
      };
      const systemData = {
        overview: { intro: '集中展示项目暖通、电气、给排水、消防、电梯、燃气、光伏及自然通风等机电系统运行状态，实现设备统一监测、故障预警和跨系统协同。', subs: [], total: 11521, online: 11232, alarms: 7, devices: buildingFloors.flatMap(({ id }) => ['1F', '2F', '3F', '4F', '5F'].map((floor) => `科学岛管廊监控中心${id}${floor}设备房`)) },
        hvac: { intro: '采用集中供冷系统，覆盖办公及公共区域；末端结合新风与热回收系统，实现温湿度调节、空气品质监测和高效节能运行。', subs: ['空调水系统', '空调末端系统', '空调风系统', '通风系统'], total: 1831, online: 1675, alarms: 3, devices: ['低区送风机房', '高区排风机房', '生活热交换机房', '空调循环泵', '新风机组', '冷却塔'] },
        electric: { intro: '高低压配电系统互为备用，覆盖变配电房、动力设备和公共照明，实时监测电压、电流、功率及设备运行状态。', subs: ['高低压配电系统', '动力配电系统', '照明配电系统'], total: 765, online: 761, alarms: 3, devices: ['高压进线柜', '低压配电柜', '动力配电箱', '公共照明箱', '应急照明箱', '智能电表'] },
        water: { intro: '给排水系统涵盖生活供水、污废水、雨水及回用水，结合水泵、水箱和液位监测设备，实现用水安全与节水管理。', subs: ['给水系统', '污废水系统', '雨水系统', '雨水回用系统'], total: 308, online: 308, alarms: 3, devices: ['给水泵', '热水水泵', '雨水供水泵', '污水提升泵', '液位传感器', '水质监测仪'] },
        fire: { intro: '消防系统覆盖消火栓、喷淋、防排烟和电气火灾监控，接入消防控制中心，实现报警、联动和设备状态统一管理。', subs: ['防排烟系统', '消防水系统', '电气消防系统'], total: 5824, online: 5824, alarms: 3, devices: ['烟感探测器', '温感探测器', '手动报警按钮', '输入输出模块', '消火栓泵', '喷淋泵'] },
        elevator: { intro: '电梯系统覆盖客梯、货梯、消防电梯及扶梯，实时采集楼层、方向、运行状态和故障信息，支持设备快速定位。', subs: ['低区', '中区', '高区', '观光梯', '穿梭梯', 'VIP', '货梯', '扶梯'], total: 28, online: 28, alarms: 3, devices: ['低区客梯01', '低区客梯02', '高区客梯01', '消防电梯', '货梯', '自动扶梯'] },
        gas: { intro: '燃气系统服务商业厨房及配套区域，设置燃气表、泄漏报警和紧急切断装置，实现用气计量与安全联动。', subs: ['燃气系统'], total: 2, online: 2, alarms: 3, devices: ['1号楼1层燃气表', '1号楼1层燃气报警器'] },
        solar: { intro: '屋顶布置光伏发电设备，系统监测逆变器、发电功率和累计发电量，为项目提供可再生能源运行数据。', subs: ['光伏系统'], total: 14, online: 8, alarms: 3, devices: ['西面光伏逆变器', '南面光伏逆变器', '东面光伏逆变器', '屋顶光伏逆变器', '1号楼光伏发电', '并网计量柜'] },
        ventilation: { intro: '自然通风系统根据室内外温湿度、风速及空气品质自动判断启停条件，联动通风器改善室内环境并降低空调能耗。', subs: ['低区通风', '中区通风', '高区通风', '室外区'], total: 84, online: 80, alarms: 3, devices: ['低区电动通风器', '中区电动通风器', '高区电动通风器', '室外温湿度传感器', '风速传感器', '雨量传感器'] },
        'weak-overview': { intro: '弱电系统统一管理会议办公、智慧停车、综合安防和信息网络等系统，实现设备集中监测、场景联动和运行状态可视化。', subs: [], total: 1435, online: 1368, alarms: 10, devices: ['1F弱电间', '1F弱电间', '1F数据中心机房', '1F安防控制室'] },
        meeting: { intro: '会议办公系统提供会议室预约、智能音视频、信息发布和办公协同能力，支持会议场景统一控制。', subs: [], total: 94, online: 89, alarms: 0, devices: ['15F经理办公区', '31F会议室', '32F会议室', '多媒体会议终端'] },
        parking: { intro: '智慧停车系统管理车辆进出、车位引导、停车计费和机械车位设施，为地下车库提供实时运行数据。', subs: [], total: 198, online: 198, alarms: 0, devices: ['B1停车场', 'B2停车场', 'B3停车场', '机械车位控制器'] },
        security: { intro: '综合安防系统融合门禁、视频监控、消防报警和重点区域监控，支持异常事件快速发现和联动处置。', subs: [], total: 416, online: 416, alarms: 0, devices: ['门禁系统', '视频监控', '消防报警', '重点区域监控'] },
        network: { intro: '信息网络系统覆盖数据中心、网络设备、机房环境和综合布线，为项目业务系统提供稳定可靠的网络基础。', subs: [], total: 36, online: 36, alarms: 0, devices: ['1F弱电间温控面板', '1层POE交换机', '1F数据中心机房', '网络核心交换机'] }
      };
      const weakLocations = Array.from({ length: 5 }, (_, buildingIndex) => buildingIndex + 1).flatMap((building) =>
        Array.from({ length: 5 }, (_, floorIndex) => {
          const floor = floorIndex + 1;
          const seed = (building - 1) * 5 + floorIndex;
          return {
            shaftName: `科学岛管廊监控中心${building}栋${floor}F弱电井`,
            roomName: `科学岛管廊监控中心${building}栋${floor}F弱电机房`,
            status: seed % 9 === 8 ? '离线' : '在线',
            roomStatus: seed % 9 === 8 ? '检修' : '运行',
            temperature: (17.2 + (seed % 6) * 0.4).toFixed(2),
            humidity: (48.5 + (seed % 7) * 0.8).toFixed(2),
            electricity: (538.8 + seed * 5.2).toFixed(1),
            dutyStatus: seed % 4 === 3 ? '巡检中' : '在岗'
          };
        })
      );
      const setScale = () => {
        const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        screen.style.setProperty('--scale', Math.max(scale, 0.1).toFixed(4));
      };
      const pad = (value) => String(value).padStart(2, '0');
      const updateClock = () => {
        const now = new Date();
        const weekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
        document.getElementById('clockTime').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        document.getElementById('clockDate').textContent = `星期${weekday}`;
        document.getElementById('currentDate').textContent = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;
      };
      const activateGroup = (selector, button) => {
        const items = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
        items.forEach((item) => {
          item.classList.toggle('active', item === button);
          if (item.hasAttribute('aria-current')) item.removeAttribute('aria-current');
          if (item.getAttribute('role') === 'tab') item.setAttribute('aria-selected', item === button ? 'true' : 'false');
        });
        if (button.closest('.module-nav')) button.setAttribute('aria-current', 'page');
      };
      const pageModuleMap = { overview: '总览', mep: '机电系统', 'weak-electric': '弱电系统', energy: '能源管理', operation: '运营管理' };
      const activeModuleButton = [...document.querySelectorAll('.module-nav button')].find((button) => button.textContent.trim() === pageModuleMap[pageKey]);
      if (activeModuleButton) activateGroup('.module-nav button', activeModuleButton);
      const slides = [...document.querySelectorAll('.certificate-slide')];
      const carouselDots = [...document.querySelectorAll('.carousel-dot')];
      const certificateImage = 'assets/carbon-neutral-certificate.png';
      let currentSlide = 0;
      const showCertificate = (index) => {
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === currentSlide));
        carouselDots.forEach((dot, dotIndex) => {
          const selected = dotIndex === currentSlide;
          dot.classList.toggle('active', selected);
          dot.setAttribute('aria-selected', String(selected));
        });
      };
      const modal = document.getElementById('certificateModal');
      const preview = document.getElementById('certificatePreview');
      const closeModal = () => modal?.classList.remove('open');
      const deviceModal = document.getElementById('deviceModal');
      const alarmMessageModal = document.getElementById('alarmMessageModal');
      const alarmMessageTrigger = document.querySelector('.header-icon[aria-label="消息提醒"]');
      const maintenanceModal = document.getElementById('maintenanceModal');
      const maintenancePlanContent = document.getElementById('maintenancePlanContent');
      const maintenanceRecords = [
        { name: '专用变压器月度维保', device: '专用变压器', executor: '测试人员', department: '工程运维部', start: '2026-01-23', end: '2026-01-23', result: '--', status: '待处理', location: '负一楼' },
        { name: '客梯月度维保', device: 'DT01电梯', executor: '张工', department: '工程运维部', start: '2026-01-18', end: '2026-01-18', result: '正常', status: '已完成', location: '1栋电梯井' },
        { name: '消防泵季度维保', device: '消防泵组', executor: '李工', department: '安全管理部', start: '2026-01-15', end: '2026-01-15', result: '正常', status: '已完成', location: '地下消防泵房' },
        { name: '配电柜年度维保', device: '低压配电柜', executor: '王工', department: '工程运维部', start: '2026-02-08', end: '2026-02-08', result: '--', status: '待处理', location: '负一楼配电房' },
        { name: '新风机组维保', device: '新风机组', executor: '陈工', department: '工程运维部', start: '2026-02-15', end: '2026-02-15', result: '--', status: '待处理', location: '5F机电间' }
      ];
      const workOrderRanking = document.getElementById('workOrderRanking');
      const workOrderRankingData = {
        month: [
          { name: '张工', count: 28 },
          { name: '李工', count: 22 },
          { name: '王工', count: 18 },
          { name: '陈工', count: 14 },
          { name: '赵工', count: 10 }
        ],
        year: [
          { name: '张工', count: 168 },
          { name: '李工', count: 142 },
          { name: '王工', count: 126 },
          { name: '陈工', count: 108 },
          { name: '赵工', count: 94 }
        ]
      };
      const assetModal = document.getElementById('assetModal');
      const assetDetailModal = document.getElementById('assetDetailModal');
      const assetData = {
        fixed: [
          { name: '特种设备', code: '2025102863077', location: '公区1', department: '-', entry: '2025-10-28 00:00:00', type: '特种设备' },
          { name: '房屋和建筑物', code: '202511194406', location: '公区1', department: '客服部', entry: '-', type: '房屋和建筑物' },
          { name: '机械设备', code: '202511822857', location: '公区1', department: '-', entry: '-', type: '机械设备' },
          { name: '其他固定资产', code: '202511807483', location: '公区1', department: '-', entry: '-', type: '其他固定资产' }
        ],
        movable: [
          { name: '办公设备', code: '2025111866225', location: '公区1', department: '-', entry: '-', type: '办公设备' },
          { name: '其他可移动资产', code: '202511878391', location: '公区1', department: '-', entry: '-', type: '其他可移动资产' }
        ]
      };
      let currentAssetType = 'fixed';
      const renderAssets = (filters = {}) => {
        const records = assetData[currentAssetType].filter((asset) => (!filters.code || asset.code.includes(filters.code)) && (!filters.name || asset.name.includes(filters.name)));
        const root = document.getElementById('assetRows');
        if (!root) return;
        root.innerHTML = records.length ? records.map((asset, index) => `<div class="asset-table-row"><span>${index + 1}</span><span>${asset.name}</span><span>${asset.code}</span><span>${asset.location}</span><span>${asset.department}</span><span>${asset.entry}</span><button type="button" data-asset-code="${asset.code}">查看</button></div>`).join('') : '<div class="empty-state"><i class="fa-solid fa-box-open"></i><span>暂无数据</span></div>';
        root.querySelectorAll('[data-asset-code]').forEach((button) => button.addEventListener('click', () => openAssetDetail(assetData[currentAssetType].find((asset) => asset.code === button.dataset.assetCode))));
      };
      const openAssetDetail = (asset) => {
        if (!asset) return;
        const fields = [['项目', '-'], ['资产分类', asset.type], ['资产名称', asset.name], ['资产编码', asset.code], ['品牌', asset.type], ['型号', '-'], ['设备序列号', '-'], ['管理员', '15271361001'], ['所属公司', '-'], ['所在位置', asset.location], ['购置时间', '-'], ['购置方式', '租赁'], ['购置金额', '0.00'], ['入库时间', asset.entry], ['预计使用期限（月）', '36'], ['备注', '-'], ['使用人', '-'], ['使用部门', asset.department], ['目标房源', '-'], ['领用日期', '-'], ['保养到期时间', '-'], ['保养说明', '-'], ['预计折旧期限（月）', '-'], ['标签链接', '-'], ['图片', '暂无图片']];
        const detailRoot = document.getElementById('assetDetailGrid');
        if (detailRoot) detailRoot.innerHTML = fields.map(([label, value], index) => `<div class="asset-detail-field${[15, 21, 24].includes(index) ? ' wide' : ''}"><span>${label}</span><b>${value || '-'}</b></div>`).join('');
        assetDetailModal?.classList.add('open');
      };
      const renderWorkOrderRanking = (period = 'month') => {
        if (!workOrderRanking) return;
        const rows = [...(workOrderRankingData[period] || [])]
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
          .slice(0, 5);
        if (!rows.length) {
          workOrderRanking.innerHTML = '<section class="work-order-ranking"><h3 class="work-order-ranking-title">工单排行</h3><div class="work-order-ranking-empty">暂无排行数据</div></section>';
          return;
        }
        const maxCount = rows[0].count;
        workOrderRanking.innerHTML = `<section class="work-order-ranking" aria-labelledby="workOrderRankingTitle"><h3 class="work-order-ranking-title" id="workOrderRankingTitle">工单排行</h3><div class="work-order-ranking-list">${rows.map((row, index) => `<div class="work-order-ranking-row"><i aria-label="第${index + 1}名">${index + 1}</i><span>${row.name}</span><div class="work-order-ranking-track"><span style="--rank:${Math.round((row.count / maxCount) * 100)}%"></span></div><b>${row.count}</b></div>`).join('')}</div></section>`;
      };
      const renderMaintenancePlan = (period = 'month') => {
        if (!maintenancePlanContent) return;
        const cards = maintenanceRecords.filter((record) => period === 'year' || record.start.startsWith('2026-01')).slice(0, 3);
        maintenancePlanContent.innerHTML = `<div class="maintenance-overview"><div class="maintenance-total"><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i><span>任务总数</span><b>${period === 'year' ? '196' : '48'}</b></div><div class="maintenance-statuses"><div class="maintenance-status"><span><i class="fa-solid fa-circle-check" aria-hidden="true"></i>已完成</span><b>3</b></div><div class="maintenance-status pending"><span><i class="fa-solid fa-clock" aria-hidden="true"></i>未完成</span><b>1957</b></div></div></div><div class="maintenance-card-list">${cards.map((record) => `<article class="maintenance-card"><div class="maintenance-card-title"><span>${record.device}</span><em class="${record.status === '已完成' ? 'done' : ''}">${record.status}</em></div><div class="maintenance-card-grid"><span>维保位置：<b>${record.location}</b></span><span>维保单位：<b>${record.department}</b></span><span>维保时间：<b>${record.start}</b></span><span>完成时间：<b>${record.end}</b></span></div></article>`).join('')}</div>`;
        renderWorkOrderRanking(period);
      };
      const renderMaintenanceRecords = (filters = {}) => {
        const rows = maintenanceRecords.filter((record) => (!filters.name || record.name.includes(filters.name)) && (!filters.start || record.start >= filters.start) && (!filters.end || record.end <= filters.end));
        const rowRoot = document.getElementById('maintenanceRecordRows');
        if (!rowRoot) return;
        rowRoot.innerHTML = rows.length ? rows.map((record, index) => `<div class="maintenance-record-row"><span>${index + 1}</span><span>${record.name}</span><span>${record.device}</span><span>${record.executor}</span><span>${record.department}</span><span>${record.start}</span><span>${record.end}</span><span>${record.result}</span><button type="button">查看</button></div>`).join('') : '<div class="empty-state"><i class="fa-solid fa-box-open"></i><span>暂无数据</span></div>';
      };
      renderMaintenancePlan();
      const passageModal = document.getElementById('passageModal');
      const passagePhotoModal = document.getElementById('passagePhotoModal');
      const passagePhotoTriggers = [...document.querySelectorAll('.passage-photo-trigger')];
      const passageRecordTrigger = document.querySelector('.passage-record-trigger');
      const globalMonitorModal = document.getElementById('globalMonitorModal');
      const globalMonitorTrigger = document.querySelector('.global-monitor-trigger');
      const securitySystemDiagramModal = document.getElementById('securitySystemDiagramModal');
      const securitySystemDiagramTriggers = [...document.querySelectorAll('.security-system-diagram-trigger')];
      const weakOverviewDiagramModal = document.getElementById('weakOverviewDiagramModal');
      const weakOverviewDiagramToggle = document.getElementById('weakOverviewDiagramToggle');
      const parkingRecordModal = document.getElementById('parkingRecordModal');
      const parkingRecordTrigger = document.querySelector('.parking-record-trigger');
      const parkingRecordFilters = document.getElementById('parkingRecordFilters');
      const controllerDeviceModal = document.getElementById('controllerDeviceModal');
      const controllerDeviceTriggers = [...document.querySelectorAll('.scene-device-trigger')];
      const networkRoomDetailModal = document.getElementById('networkRoomDetailModal');
      const networkRoomDetailTriggers = [...document.querySelectorAll('.network-room-detail-trigger')];
      const networkMainTabs = [...document.querySelectorAll('[data-network-view]')];
      const networkMainViews = [...document.querySelectorAll('[data-network-main-view]')];
      const networkDetailTabs = [...document.querySelectorAll('[data-network-detail-view]')];
      const networkDetailViews = [...document.querySelectorAll('[data-network-detail-pane]')];
      const networkDeviceDetailTriggers = [...document.querySelectorAll('.network-device-detail-trigger')];
      const networkTopologyModal = document.getElementById('networkTopologyModal');
      const networkTopologyTriggers = [...document.querySelectorAll('.network-topology-trigger')];
      const networkSimpleRoomModal = document.getElementById('networkSimpleRoomModal');
      const networkSimpleRoomTriggers = [...document.querySelectorAll('.network-simple-room-trigger')];
      const deviceTabs = [...document.querySelectorAll('.device-tabs button')];
      const devicePanes = [...document.querySelectorAll('.device-pane')];
      const ledgerFields = document.querySelector('.device-pane[data-pane="ledger"] .device-fields:not(.two)');
      if (ledgerFields && !ledgerFields.querySelector('[data-device-field="cad"]')) {
        ledgerFields.insertAdjacentHTML('beforeend', '<div class="device-field" data-device-field="cad"><label>CAD编码</label><strong>3 11 146</strong></div><div class="device-field"><label>服务范围</label><strong>-</strong></div><div class="device-field"><label>备注</label><strong>-</strong></div>');
      }
      const showDevicePane = (name) => {
        deviceTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.pane === name));
        devicePanes.forEach((pane) => pane.classList.toggle('active', pane.dataset.pane === name));
      };
      const closeDeviceModal = () => deviceModal?.classList.remove('open');
      const closeAlarmMessageModal = () => alarmMessageModal?.classList.remove('open');
      const closePassageModal = () => passageModal?.classList.remove('open');
      const closePassagePhotoModal = () => passagePhotoModal?.classList.remove('open');
      const closeGlobalMonitorModal = () => globalMonitorModal?.classList.remove('open');
      const closeSecuritySystemDiagramModal = () => securitySystemDiagramModal?.classList.remove('open');
      const closeWeakOverviewDiagramModal = () => { weakOverviewDiagramModal?.classList.remove('open'); if (weakOverviewDiagramToggle) weakOverviewDiagramToggle.checked = false; };
      const closeParkingRecordModal = () => parkingRecordModal?.classList.remove('open');
      const closeControllerDeviceModal = () => controllerDeviceModal?.classList.remove('open');
      const closeNetworkRoomDetailModal = () => networkRoomDetailModal?.classList.remove('open');
      const closeNetworkTopologyModal = () => networkTopologyModal?.classList.remove('open');
      const closeNetworkSimpleRoomModal = () => networkSimpleRoomModal?.classList.remove('open');
      const controllerDeviceData = {
        '1号楼经理办公室': [['调光灯-1', '开:1,关:0,调光:85', '在线'], ['调光灯-2', '开:1,关:0,调光:85', '在线'], ['环境传感器', '温度:24.6℃,湿度:51%', '在线']],
        '1号楼-CK-05': [['调光灯-6', '开:0,关:0,调光:100', '在线'], ['调光灯-5', '开:0,关:0,调光:100', '在线'], ['调光灯-3', '开:0,关:0,调光:100', '在线'], ['调光灯-4', '开:0,关:0,调光:100', '在线'], ['调光灯-2', '开:0,关:0,调光:100', '在线'], ['调光灯-1', '开:0,关:0,调光:100', '在线'], ['传感器', '状态:0', '在线']],
        '1号楼-MK-05': [['会议主灯', '开:1,关:0,调光:80', '在线'], ['投影幕布', '上升:0,下降:0,停止:1', '在线'], ['电动窗帘', '开度:100%', '在线'], ['环境传感器', '温度:24.1℃,湿度:49%', '在线'], ['场景面板', '当前场景:会议', '在线'], ['新风控制器', '运行:1,风速:2', '在线']],
        '1号楼-MK-01': [['调光灯-1', '开:1,关:0,调光:70', '在线'], ['调光灯-2', '开:1,关:0,调光:70', '在线'], ['会议显示屏', '开机:1,信号:HDMI1', '在线'], ['环境传感器', '温度:23.8℃,湿度:50%', '在线'], ['窗帘控制器', '开度:85%', '在线'], ['空调面板', '制冷:1,设定:25℃', '在线']]
      };
      const openControllerDeviceModal = (controller) => {
        const rows = controllerDeviceData[controller] || [];
        const title = document.getElementById('controllerDeviceTitle');
        const root = document.getElementById('controllerDeviceRows');
        if (title) title.textContent = controller;
        if (root) root.innerHTML = rows.map(([name, realtime, status]) => `<div class="controller-device-row"><span title="${name}">${name}</span><span title="${realtime}">${realtime}</span><span>${status}</span></div>`).join('');
        controllerDeviceModal?.classList.add('open');
      };
      const roomInfoToggle = document.getElementById('roomInfoToggle');
      const devicePointToggle = document.getElementById('devicePointToggle');
      const resetRoomInfo = () => { if (roomInfoToggle) roomInfoToggle.checked = false; workspace.classList.remove('room-info'); };
      const setFloorOverview = (active) => workspace.classList.toggle('floor-overview-active', active);
      const openDeviceModal = (point) => {
        const deviceName = point.dataset.device;
        const deviceCode = point.dataset.code;
        document.getElementById('deviceDialogTitle').textContent = `设备详情-${deviceName}`;
        document.querySelectorAll('[data-device-name]').forEach((item) => { item.textContent = deviceName; });
        document.querySelectorAll('[data-device-code]').forEach((item) => { item.textContent = deviceCode; });
        document.querySelector('[data-device-position]').textContent = point.dataset.position || `${deviceName}-7`;
        document.querySelectorAll('#deviceModal .device-pane[data-pane="alarm"] .alarm-record').forEach((record) => { record.hidden = false; });
        document.querySelectorAll('#deviceModal .alarm-process').forEach((detail) => { detail.hidden = false; });
        const operationActions = document.querySelector('#deviceModal .alarm-operation-actions');
        if (operationActions) operationActions.hidden = true;
        showDevicePane('ledger');
        deviceModal.classList.add('open');
      };
      const showNetworkMainView = (name) => {
        networkMainTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.networkView === name));
        networkMainViews.forEach((view) => view.classList.toggle('active', view.dataset.networkMainView === name));
      };
      const showNetworkDetailView = (name) => {
        networkDetailTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.networkDetailView === name));
        networkDetailViews.forEach((view) => view.classList.toggle('active', view.dataset.networkDetailPane === name));
      };
      const updateNetworkEnvironmentChart = (metric) => {
        const chart = document.querySelector('.environment-chart');
        const high = chart?.querySelector('.high-line');
        const low = chart?.querySelector('.low-line');
        const area = chart?.querySelector('.network-chart-area');
        const unit = chart?.querySelector('text');
        if (!chart || !high || !low || !area || !unit) return;
        const humidity = metric === 'humidity';
        unit.textContent = humidity ? '单位(%)' : '单位(℃)';
        high.setAttribute('d', humidity ? 'M70 90 L125 91 L180 88 L235 93 L290 89 L345 91' : 'M70 80 L125 81 L180 78 L235 82 L290 84 L345 83');
        low.setAttribute('d', humidity ? 'M70 98 L125 99 L180 96 L235 101 L290 97 L345 99' : 'M70 84 L125 85 L180 82 L235 86 L290 88 L345 87');
        area.setAttribute('d', humidity ? 'M70 92 L125 93 L180 90 L235 95 L290 91 L345 93 L345 208 L70 208 Z' : 'M70 82 L125 83 L180 80 L235 84 L290 86 L345 85 L345 208 L70 208 Z');
      };
      const updateNetworkUpsChart = (phase) => {
        const chart = document.querySelector('.ups-chart');
        const line = chart?.querySelector('.ups-line');
        const area = chart?.querySelector('.ups-area');
        if (!line || !area) return;
        const paths = {
          A: 'M70 74 L125 75 L180 73 L235 77 L290 76 L345 76',
          B: 'M70 70 L125 72 L180 71 L235 73 L290 70 L345 72',
          C: 'M70 78 L125 77 L180 79 L235 76 L290 78 L345 77'
        };
        const path = paths[phase] || paths.A;
        line.setAttribute('d', path);
        area.setAttribute('d', `${path} L345 208 L70 208 Z`);
      };
      const networkSimpleRoomData = {
        security: {
          title: '房间详情-消控室',
          position: '1F安防控制室',
          rows: [['监听音响（主）', '1F-XK-YS-01'], ['IP模块音频接口', '1F-XK-IP-01'], ['IP模块音频接口', '1F-XK-IP-02'], ['电脑主机', '1F-XK-PC-01'], ['IP模块音频接口', '1F-XK-IP-03'], ['1楼平时排风机', '1F-XK-FAN-01'], ['1层消防控制室-消防门2号', '1F-XK-DOOR-02'], ['IP模块音频接口', '1F-XK-IP-04'], ['1楼消防控制室温控面板', '1F-XK-TH-01'], ['网络音频接口', '1F-XK-NET-01'], ['IP模块音频接口', '1F-XK-IP-05'], ['24口POE交换机-1', '1F-XK-POE-01']]
        },
        shaft: {
          title: '房间详情-1F弱电间',
          position: '1F弱电间',
          rows: [['1F弱电间温控面板', '1F-WK-TH-01'], ['1口POE交换机-1', '1F-WK-POE-01'], ['1F烟感', '1F-WK-SMOKE-01'], ['1口POE交换机-1', '1F-WK-POE-02'], ['1口接入交换机-1', '1F-WK-ACCESS-01'], ['1口接入交换机-1', '1F-WK-ACCESS-02']]
        }
      };
      const openNetworkSimpleRoomModal = (room) => {
        const config = networkSimpleRoomData[room];
        const title = document.getElementById('networkSimpleRoomTitle');
        const root = document.getElementById('networkSimpleRoomRows');
        if (!config || !root) return;
        if (title) title.textContent = config.title;
        root.innerHTML = config.rows.map(([name, code]) => `<div class="network-detail-row"><span>${name}</span><span>在线</span><button class="network-simple-device-trigger" type="button" data-device="${name}" data-code="${code}" data-position="${config.position}">查看</button></div>`).join('');
        root.querySelectorAll('.network-simple-device-trigger').forEach((trigger) => trigger.addEventListener('click', () => openDeviceModal(trigger)));
        networkSimpleRoomModal?.classList.add('open');
      };
      const deviceTypeBySystem = { hvac: 'hvac', electric: 'electric', water: 'water', fire: 'fire', elevator: 'other', gas: 'other', solar: 'other', ventilation: 'other' };
      const getDeviceLocation = (_, index) => deviceLocationOptions[index % deviceLocationOptions.length].value;
      const resetDeviceFilters = () => {
        document.querySelectorAll('#mepDeviceFilters input[type="checkbox"]').forEach((input) => { input.checked = false; });
        document.querySelectorAll('[data-filter-summary]').forEach((summary) => { summary.textContent = '全部'; });
        document.querySelectorAll('#mepDeviceFilters > .filter-dropdown').forEach((details) => { details.removeAttribute('open'); });
      };
      const applyDeviceFilters = () => {
        const groups = ['type', 'location', 'status'];
        const selected = Object.fromEntries(groups.map((group) => [group, [...document.querySelectorAll(`#mepDeviceFilters input[data-filter-group="${group}"]:checked`)].map((input) => input.value)]));
        groups.forEach((group) => {
          const summary = document.querySelector(`[data-filter-summary="${group}"]`);
          if (summary) summary.textContent = selected[group].length ? `${selected[group].length}项` : '全部';
        });
        document.querySelectorAll('#mepDeviceRows .mep-device-row').forEach((row) => {
          const matches = groups.every((group) => !selected[group].length || selected[group].includes(row.dataset[group]));
          row.hidden = !matches;
        });
      };
      const renderWeakOverviewLists = () => {
        const shaftRoot = document.getElementById('mepDeviceRows');
        const roomRoot = document.getElementById('weakRoomRows');
        if (!shaftRoot || !roomRoot) return;
        const renderShaft = (startIndex = 0) => {
          const cards = [0, 1].map((offset) => {
            const itemIndex = (startIndex + offset) % weakLocations.length;
            const item = weakLocations[itemIndex];
            const online = item.status === '在线' ? 1 : 0;
            return `<article class="weak-shaft-card"><div class="weak-shaft-name" title="${item.shaftName}">${item.shaftName}</div><div class="weak-shaft-stats"><div><strong>1</strong><small>设备数量</small></div><div><strong class="is-online">${online}</strong><small>在线数量</small></div><div><strong>${1 - online}</strong><small>离线数量</small></div><div><strong class="is-fault">0</strong><small>故障数量</small></div><button class="weak-next-button" type="button" aria-label="查看下一组弱电井"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div></article>`;
          }).join('');
          shaftRoot.innerHTML = `<div class="weak-shaft-cards">${cards}</div>`;
          shaftRoot.querySelectorAll('.weak-next-button').forEach((button) => button.addEventListener('click', () => renderShaft((startIndex + 2) % weakLocations.length)));
        };
        const renderRoom = (selectedIndex = 0) => {
          const item = weakLocations[selectedIndex];
          const roomOptions = weakLocations.map((room, index) => `<button class="weak-room-option${index === selectedIndex ? ' active' : ''}" type="button" role="option" aria-selected="${index === selectedIndex}" data-room-index="${index}">${room.roomName}</button>`).join('');
          roomRoot.innerHTML = `<div class="weak-room-body"><div class="weak-room-picker"><button class="weak-room-select" type="button" aria-haspopup="listbox" aria-expanded="false">${item.roomName}<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><div class="weak-room-menu" role="listbox" aria-label="选择弱电机房">${roomOptions}</div></div><article class="weak-room-detail"><div class="weak-room-heading"><span title="${item.roomName}">${item.roomName}</span><button class="weak-next-button" type="button" aria-label="查看下一处弱电机房"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div><div class="weak-room-detail-grid"><div class="wide"><span>机房位置</span><strong>${item.roomName}</strong></div><div><span>机房状态</span><strong class="${item.roomStatus === '运行' ? 'is-online' : 'is-offline'}">${item.roomStatus}</strong></div><div><span>温度</span><strong>${item.temperature}℃</strong></div><div><span>湿度</span><strong>${item.humidity}%</strong></div><div><span>今日用电</span><strong>${item.electricity}kW·h</strong></div><div class="wide"><span>值班状态</span><strong>${item.dutyStatus}</strong></div></div></article></div>`;
          const roomSelect = roomRoot.querySelector('.weak-room-select');
          roomSelect.addEventListener('click', () => {
            const isOpen = roomRoot.querySelector('.weak-room-picker').classList.toggle('is-open');
            roomSelect.setAttribute('aria-expanded', String(isOpen));
          });
          roomRoot.querySelectorAll('[data-room-index]').forEach((option) => option.addEventListener('click', () => renderRoom(Number(option.dataset.roomIndex))));
          roomRoot.querySelector('.weak-next-button').addEventListener('click', () => renderRoom((selectedIndex + 1) % weakLocations.length));
        };
        renderShaft();
        renderRoom();
      };
      const renderSystem = (key) => {
        const data = systemData[key];
        if (key !== 'weak-overview') closeWeakOverviewDiagramModal();
        if (key !== 'meeting') closeControllerDeviceModal();
        const isOverview = key === 'overview';
        const isWeakSystem = key.startsWith('weak-') || ['meeting', 'parking', 'security', 'network'].includes(key);
        const isMepSystem = !isOverview && !isWeakSystem;
        const defaultPanelData = { total: 94, online: 89, alarms: 0 };
        const panelData = isOverview || isWeakSystem ? data : { ...defaultPanelData, alarms: data.alarms };
        const panelOnlineRate = isOverview ? 97 : isWeakSystem ? Math.round((data.online / data.total) * 100) : 95;
        const panelOfflineRate = 100 - panelOnlineRate;
        const offline = data.total - data.online;
        const onlineRate = Math.round((data.online / data.total) * 100);
        const offlineRate = 100 - onlineRate;
        const onlineDeviceRows = Math.round((onlineRate / 100) * data.devices.length);
        workspace.classList.toggle('system-overview', isOverview);
        workspace.classList.toggle('weak-overview', key === 'weak-overview');
        workspace.classList.toggle('meeting-active', key === 'meeting');
        workspace.classList.toggle('parking-active', key === 'parking');
        workspace.classList.toggle('security-active', key === 'security');
        workspace.classList.toggle('network-active', key === 'network');
        workspace.classList.toggle('mep-subsystem-active', isMepSystem);
        resetDeviceFilters();
        document.querySelector('.mep-left > .mep-intro-panel .panel-title').childNodes[0].textContent = isOverview ? '设备分类统计' : isWeakSystem ? (key === 'meeting' ? '会议室使用' : key === 'parking' ? '停车概览' : key === 'security' ? '道闸系统' : key === 'network' ? '数据中心机房' : '系统分类') : '系统简介';
        document.getElementById('mepSystemIntro').innerHTML = isOverview ? `<div class="mep-system-category-grid" aria-label="各系统设备数量"><article class="hvac"><i class="fa-solid fa-wind" aria-hidden="true"></i><div><strong>暖通空调</strong><b>186</b></div></article><article class="electric"><i class="fa-solid fa-bolt" aria-hidden="true"></i><div><strong>电气系统</strong><b>152</b></div></article><article class="water"><i class="fa-solid fa-faucet-drip" aria-hidden="true"></i><div><strong>给排水系统</strong><b>96</b></div></article><article class="fire"><i class="fa-solid fa-fire-flame-curved" aria-hidden="true"></i><div><strong>消防系统</strong><b>214</b></div></article><article class="elevator"><i class="fa-solid fa-elevator" aria-hidden="true"></i><div><strong>电梯系统</strong><b>20</b></div></article><article class="gas"><i class="fa-solid fa-gas-pump" aria-hidden="true"></i><div><strong>燃气系统</strong><b>32</b></div></article><article class="solar"><i class="fa-solid fa-solar-panel" aria-hidden="true"></i><div><strong>光伏系统</strong><b>48</b></div></article><article class="ventilation"><i class="fa-solid fa-fan" aria-hidden="true"></i><div><strong>自然通风</strong><b>75</b></div></article></div>` : data.intro;
        document.querySelector('.mep-left > .mep-device-list-panel .panel-title').childNodes[0].textContent = isOverview ? '设备房列表' : isWeakSystem ? '设备列表' : '设备列表';
        const leftTitle = document.querySelector('.mep-left > .mep-intro-panel .panel-title');
        const rightTitles = [...document.querySelectorAll('.mep-right .default-mep-panel .panel-title')];
        if (isWeakSystem) {
          const titleMap = { 'weak-overview': ['系统分类', '弱电井列表', '设备数量及状态统计', '实时/历史运行监测', '设备报警'], meeting: ['会议室使用', '一卡通系统', '联动场景控制', '背景音乐系统', '设备报警'], parking: ['停车概览', '车位统计', '机械车位', '停车场视频监控', '设备报警'], security: ['道闸系统', '门禁系统', '弱电井', '信息网络', '系统报警'], network: ['数据中心机房', '消控室', '弱电井', '信息网络', '系统报警'] }[key];
          leftTitle.childNodes[0].textContent = titleMap[0];
          document.querySelector('.mep-left > .mep-device-list-panel .panel-title').childNodes[0].textContent = titleMap[1];
          rightTitles.forEach((title, index) => { title.childNodes[0].textContent = titleMap[index + 2]; });
          if (key === 'weak-overview') {
            document.getElementById('mepSystemIntro').innerHTML = `<div class="overview-class-grid weak-overview-grid"><button class="active">系统总览</button><button>会议办公</button><button>智慧停车</button><button>综合安防</button><button>信息网络</button></div>`;
          }
          if (key === 'meeting') { document.getElementById('mepSystemIntro').innerHTML = '<div class="mep-system-intro">会议室预约、音视频控制、信息发布和一卡通数据统一管理，支持会议场景联动。</div>'; }
          if (key === 'parking') { document.getElementById('mepSystemIntro').innerHTML = '<div class="mep-system-intro">停车场进出、车位引导、AGV 车位及机械车位运行状态集中监控。</div>'; }
          if (key === 'security') { document.getElementById('mepSystemIntro').innerHTML = '<div class="mep-system-intro">门禁、道闸、视频监控与消防系统协同运行，异常事件实时预警。</div>'; }
          if (key === 'network') { document.getElementById('mepSystemIntro').innerHTML = '<div class="mep-system-intro">数据中心、消控室和弱电井设备统一监控，保障网络与信息发布稳定运行。</div>'; }
        } else if (isMepSystem) {
          rightTitles.forEach((title, index) => { title.childNodes[0].textContent = ['设备数量及状态统计', '实时/历史运行监测', '设备报警'][index]; });
        }
        document.getElementById('systemSubnav').innerHTML = data.subs.map((name, index) => `<button class="${index === 0 ? 'active' : ''}" type="button">${name}</button>`).join('');
        const overviewRooms = buildingFloors.flatMap(({ id, floors }, buildingIndex) => floors.slice().reverse().map((floor, floorIndex) => ({
          name: `科学岛管廊监控中心${id}${floor}设备房`,
          building: id,
          floor,
          total: 8 + ((buildingIndex * 3 + floorIndex * 2) % 13)
        })));
        const overviewRoomCard = ({ name, total, building, floor }) => `<article class="overview-device-card"><div class="mep-device-head"><span title="${name}">${name}</span></div><div class="mep-device-stats"><div class="mep-device-stat"><strong>${total}</strong><small>设备数量</small></div><div class="mep-device-stat"><strong>${total}</strong><small>在线数量</small></div><div class="mep-device-stat"><strong>0</strong><small>离线数量</small></div><div class="mep-device-stat"><strong>0</strong><small>故障数量</small></div><button class="room-floor-trigger" type="button" data-building="${building}" data-floor="${floor}" title="定位${building}${floor}楼层平面图" aria-label="定位${building}${floor}楼层平面图"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div></article>`;
        document.getElementById('mepDeviceRows').innerHTML = key === 'weak-overview' ? '' : isOverview ? overviewRooms.map(overviewRoomCard).join('') : data.devices.map((name, index) => { const status = index < onlineDeviceRows ? 'online' : 'offline'; return `<div class="mep-device-row" data-type="${deviceTypeBySystem[key] || 'other'}" data-location="${getDeviceLocation(name, index)}" data-status="${status}"><span>${index + 1}</span><span title="${name}">${name}</span><span>${status === 'online' ? '在线' : '离线'}</span><button type="button">定位</button></div>`; }).join('');
        document.querySelectorAll('.room-floor-trigger').forEach((button) => button.addEventListener('click', () => {
          const floorItem = floorItems.find((item) => item.dataset.building === button.dataset.building && item.dataset.floor === button.dataset.floor);
          if (floorItem) openFloorPlan(floorItem);
        }));
        document.getElementById('weakRoomRows').innerHTML = '';
        if (key === 'weak-overview') renderWeakOverviewLists();
        if (key === 'weak-overview') {
          document.querySelectorAll('.overview-class-grid button').forEach((button, index) => button.addEventListener('click', () => {
            const target = ['weak-overview', 'meeting', 'parking', 'security', 'network'][index];
            if (target) { activateGroup('#weakDock button', document.querySelector(`#weakDock button[data-system="${target}"]`)); renderSystem(target); }
          }));
        }
        document.getElementById('mepTotal').textContent = panelData.total;
        document.getElementById('mepOnlineCount').textContent = panelData.online;
        document.getElementById('mepOfflineCount').textContent = panelData.total - panelData.online;
        document.getElementById('mepOnlineRate').textContent = `${panelOnlineRate}%`;
        document.getElementById('mepOfflineRate').textContent = `${panelOfflineRate}%`;
        document.getElementById('mepFaultRate').textContent = `${Math.round((panelData.alarms / panelData.total) * 100)}%`;
        document.getElementById('mepAlarmCount').textContent = panelData.alarms;
        document.getElementById('mepPendingAlarms').textContent = Math.max(panelData.alarms - 1, 0);
        document.getElementById('mepHandledAlarms').textContent = panelData.alarms > 0 ? '1' : '0';
        document.querySelector('.mep-donut:not(.offline)').style.background = `conic-gradient(#80e89a 0 ${panelOnlineRate}%, #1c7391 ${panelOnlineRate}% 100%)`;
        document.querySelector('.mep-donut.offline').style.background = `conic-gradient(#e9edf0 0 ${panelOfflineRate}%, #2b718e ${panelOfflineRate}% 100%)`;
        document.querySelectorAll('#systemSubnav button').forEach((button) => button.addEventListener('click', () => activateGroup('#systemSubnav button', button)));
        applyDeviceFilters();
      };
      const updateFloorData = (floor, building = '') => {
        const floorLabel = building ? `${building} ${floor}` : floor;
        if (!document.getElementById('mepTotal')) {
          floorPlan.querySelector('.floor-plan-label').textContent = `${floorLabel} 楼层平面图`;
          floorPlan.querySelector('img').alt = `${floorLabel}楼层平面图`;
          return;
        }
        const data = floorData[floor] || { total: 94, online: 89, onlineRate: '95%', offlineRate: '5%', alarms: 0, devices: [15, 15, 0, 0] };
        document.getElementById('mepTotal').textContent = data.total;
        document.getElementById('mepOnlineCount').textContent = data.online;
        document.getElementById('mepOfflineCount').textContent = data.total - data.online;
        document.getElementById('mepOnlineRate').textContent = data.onlineRate;
        document.getElementById('mepOfflineRate').textContent = data.offlineRate;
        document.getElementById('mepAlarmCount').textContent = data.alarms;
        document.getElementById('mepPendingAlarms').textContent = Math.max(data.alarms - 1, 0);
        document.getElementById('mepHandledAlarms').textContent = data.alarms > 0 ? '1' : '0';
        document.querySelectorAll('.mep-device-card').forEach((card, cardIndex) => {
          const base = data.devices[cardIndex % data.devices.length];
          const values = [base, base, 0, cardIndex === 0 ? data.alarms : 0];
          card.querySelectorAll('.mep-device-stat strong').forEach((value, statIndex) => { value.textContent = values[statIndex]; });
        });
        floorPlan.querySelector('.floor-plan-label').textContent = `${floorLabel} 楼层平面图`;
        floorPlan.querySelector('img').alt = `${floorLabel}楼层平面图`;
      };
      const openFloorPlan = (item) => {
        activateGroup(floorItems, item);
        updateFloorData(item.dataset.floor, item.dataset.building);
        floorPlan.classList.add('visible');
        floorControl.classList.add('open');
        floorButton.setAttribute('aria-expanded', 'true');
        setFloorOverview(true);
      };
      document.querySelectorAll('.module-nav button').forEach((button) => button.addEventListener('click', () => {
        const routes = { 总览: 'overview.html', 机电系统: 'mep.html', 弱电系统: 'weak-electric.html', 能源管理: 'energy.html', 运营管理: 'operation.html' };
        activateGroup('.module-nav button', button);
        const moduleName = button.textContent.trim();
        if (routes[moduleName] && routes[moduleName] !== `${pageKey}.html`) { window.location.href = routes[moduleName]; return; }
        const isMep = moduleName === '机电系统';
        const isWeak = moduleName === '弱电系统';
        const isEnergy = moduleName === '能源管理';
        const isOperation = moduleName === '运营管理';
        workspace.classList.remove('system-overview', 'weak-overview', 'meeting-active', 'parking-active', 'security-active', 'network-active', 'energy-active', 'operation-active', 'operation-management', 'floor-overview-active');
        workspace.classList.toggle('mep-active', isMep || isWeak);
        workspace.classList.toggle('weak-active', isWeak);
        workspace.classList.toggle('energy-active', isEnergy);
        workspace.classList.toggle('operation-active', isOperation);
        if (isEnergy) document.querySelectorAll('.energy-dashboard-panel .panel-title').forEach((title) => { if (title.firstChild?.textContent.trim() === '空调能耗') title.firstChild.textContent = '用冷能耗'; });
        if (isOperation) activateGroup('#operationDock button', document.querySelector('#operationDock button[data-operation="asset"]'));
        if (isWeak) { activateGroup('#weakDock button', document.querySelector('#weakDock button')); renderSystem('weak-overview'); }
        if (!isMep && !isWeak) { floorControl.classList.remove('open'); floorPlan.classList.remove('visible'); floorButton.setAttribute('aria-expanded', 'false'); resetRoomInfo(); }
        if (!isMep && !isWeak) setFloorOverview(false);
      }));
      floorButton.addEventListener('click', () => {
        if (floorPlan.classList.contains('visible')) {
          floorPlan.classList.remove('visible');
          floorControl.classList.remove('open');
          floorButton.setAttribute('aria-expanded', 'false');
          setFloorOverview(false);
          resetRoomInfo();
          return;
        }
        const open = !floorControl.classList.contains('open');
        floorControl.classList.toggle('open', open);
        floorButton.setAttribute('aria-expanded', String(open));
        setFloorOverview(open);
      });
      floorItems.forEach((item) => item.addEventListener('click', () => openFloorPlan(item)));
      document.querySelectorAll('#systemDock button').forEach((button) => button.addEventListener('click', () => {
        activateGroup('#systemDock button', button);
        renderSystem(button.dataset.system);
        floorPlan.classList.remove('visible');
        floorControl.classList.remove('open');
        floorButton.setAttribute('aria-expanded', 'false');
        setFloorOverview(false);
        resetRoomInfo();
      }));
      document.querySelectorAll('#weakDock button').forEach((button) => button.addEventListener('click', () => {
        activateGroup('#weakDock button', button);
        renderSystem(button.dataset.system);
        floorPlan.classList.remove('visible');
        floorControl.classList.remove('open');
        floorButton.setAttribute('aria-expanded', 'false');
        setFloorOverview(false);
        resetRoomInfo();
      }));
      document.querySelectorAll('#operationDock button').forEach((button) => button.addEventListener('click', () => {
        activateGroup('#operationDock button', button);
        workspace.classList.toggle('operation-management', button.dataset.operation === 'management');
        document.querySelectorAll('#operationDock button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      }));
      document.querySelectorAll('[data-maintenance-period]').forEach((button) => button.addEventListener('click', () => {
        activateGroup('[data-maintenance-period]', button);
        renderMaintenancePlan(button.dataset.maintenancePeriod);
      }));
      document.getElementById('maintenanceMore')?.addEventListener('click', () => { renderMaintenanceRecords(); maintenanceModal?.classList.add('open'); });
      document.getElementById('maintenanceModalClose')?.addEventListener('click', () => maintenanceModal?.classList.remove('open'));
      maintenanceModal?.addEventListener('click', (event) => { if (event.target === maintenanceModal) maintenanceModal.classList.remove('open'); });
      document.getElementById('maintenanceRecordFilters')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        renderMaintenanceRecords({ name: String(formData.get('name') || '').trim(), start: String(formData.get('start') || ''), end: String(formData.get('end') || '') });
      });
      document.getElementById('maintenanceRecordFilters')?.addEventListener('reset', (event) => { window.setTimeout(() => renderMaintenanceRecords(), 0); });
      document.querySelectorAll('[data-asset-type]').forEach((button) => button.addEventListener('click', () => {
        currentAssetType = button.dataset.assetType;
        const title = document.getElementById('assetModalTitle');
        if (title) title.textContent = currentAssetType === 'fixed' ? '固定资产' : '可移动资产';
        document.getElementById('assetFilters')?.reset();
        renderAssets();
        assetModal?.classList.add('open');
      }));
      document.getElementById('assetModalClose')?.addEventListener('click', () => assetModal?.classList.remove('open'));
      assetModal?.addEventListener('click', (event) => { if (event.target === assetModal) assetModal.classList.remove('open'); });
      document.getElementById('assetFilters')?.addEventListener('submit', (event) => { event.preventDefault(); const values = new FormData(event.currentTarget); renderAssets({ code: String(values.get('code') || '').trim(), name: String(values.get('name') || '').trim() }); });
      document.getElementById('assetFilters')?.addEventListener('reset', () => { window.setTimeout(() => renderAssets(), 0); });
      document.getElementById('assetDetailClose')?.addEventListener('click', () => assetDetailModal?.classList.remove('open'));
      assetDetailModal?.addEventListener('click', (event) => { if (event.target === assetDetailModal) assetDetailModal.classList.remove('open'); });
      document.querySelectorAll('.mep-mini-tabs button, .mep-alarm-tabs button, .meeting-periods button, .operation-tabs button, .rental-filters button').forEach((button) => button.addEventListener('click', () => activateGroup(button.closest('[role="tablist"]')?.querySelectorAll('button') || button.parentElement.querySelectorAll('button'), button)));
      document.querySelectorAll('.data-tabs button, .env-tabs button').forEach((button) => button.addEventListener('click', () => activateGroup(button.closest('[role="tablist"]').querySelectorAll('button'), button)));
      document.querySelectorAll('.energy-periods button').forEach((button) => button.addEventListener('click', () => activateGroup(button.closest('[role="tablist"]').querySelectorAll('button'), button)));
      document.querySelectorAll('.device-point').forEach((point) => point.addEventListener('click', () => openDeviceModal(point)));
      document.querySelectorAll('.floor-device-search').forEach((form) => form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = form.querySelector('input')?.value.trim().toLowerCase() || '';
        form.closest('.floor-overview-body')?.querySelectorAll('.floor-overview-rows > div').forEach((row) => { row.hidden = query && !row.children[1].textContent.toLowerCase().includes(query); });
      }));
      const filterChecks = [...document.querySelectorAll('.floor-filters input')];
      const applyPointFilters = () => {
        const all = document.querySelector('[data-filter="all"]').checked;
        document.querySelectorAll('.device-point').forEach((point) => {
          const visible = all || document.querySelector(`[data-filter="${point.dataset.category}"]`)?.checked;
          point.classList.toggle('is-hidden', !visible);
        });
      };
      filterChecks.forEach((check) => check.addEventListener('change', () => {
        if (check.dataset.filter === 'all') filterChecks.forEach((item) => { item.checked = check.checked; });
        else if (!check.checked) document.querySelector('[data-filter="all"]').checked = false;
        else if (filterChecks.filter((item) => item.dataset.filter !== 'all').every((item) => item.checked)) document.querySelector('[data-filter="all"]').checked = true;
        applyPointFilters();
      }));
      document.querySelectorAll('#mepDeviceFilters input[type="checkbox"]').forEach((check) => check.addEventListener('change', applyDeviceFilters));
      roomInfoToggle?.addEventListener('change', () => workspace.classList.toggle('room-info', roomInfoToggle.checked));
      devicePointToggle?.addEventListener('change', () => document.querySelectorAll('.device-point').forEach((point) => point.classList.toggle('is-hidden', !devicePointToggle.checked)));
      deviceTabs.forEach((tab) => tab.addEventListener('click', () => showDevicePane(tab.dataset.pane)));
      document.querySelectorAll('.speed-buttons button').forEach((button) => button.addEventListener('click', () => activateGroup('.speed-buttons button', button)));
      document.querySelectorAll('.power-buttons button').forEach((button) => button.addEventListener('click', () => activateGroup('.power-buttons button', button)));
      document.getElementById('deviceDialogClose')?.addEventListener('click', closeDeviceModal);
      deviceModal?.addEventListener('click', (event) => { if (event.target === deviceModal) closeDeviceModal(); });
      alarmMessageTrigger?.addEventListener('click', () => alarmMessageModal?.classList.add('open'));
      document.getElementById('alarmMessageClose')?.addEventListener('click', closeAlarmMessageModal);
      alarmMessageModal?.addEventListener('click', (event) => { if (event.target === alarmMessageModal) closeAlarmMessageModal(); });
      document.querySelectorAll('[data-alarm-view]').forEach((tab) => tab.addEventListener('click', () => {
        const view = tab.dataset.alarmView;
        document.querySelectorAll('[data-alarm-view]').forEach((item) => item.classList.toggle('active', item === tab));
        document.querySelectorAll('[data-alarm-pane]').forEach((pane) => pane.classList.toggle('active', pane.dataset.alarmPane === view));
      }));
      const alarmAxisLabels = {
        today: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        week: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        month: ['1日', '5日', '9日', '13日', '17日', '21日', '25日', '29日'],
        year: Array.from({ length: 12 }, (_, index) => `${index + 1}月`)
      };
      const renderAlarmTrendAxis = (period = 'today') => {
        const axis = document.getElementById('alarmTrendAxis');
        if (!axis) return;
        const labels = alarmAxisLabels[period];
        axis.classList.toggle('dense', labels.length > 12);
        axis.innerHTML = labels.map((label, index) => `<text x="${48 + index * (416 / (labels.length - 1))}" y="158" text-anchor="middle">${label}</text>`).join('');
      };
      document.querySelectorAll('[data-alarm-period]').forEach((button) => button.addEventListener('click', () => {
        button.parentElement.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
        renderAlarmTrendAxis(button.dataset.alarmPeriod);
      }));
      const alarmRankings = {
        space: [['1号楼1F', 6], ['2号楼3F', 4], ['3号楼2F', 3], ['4号楼5F', 2], ['5号楼1F', 1]],
        system: [['暖通系统', 6], ['电气系统', 5], ['给排水系统', 3], ['电梯系统', 2], ['安防系统', 1]]
      };
      const renderAlarmRanking = (mode = 'space') => {
        const root = document.getElementById('alarmRankingBars');
        if (!root) return;
        const max = Math.max(...alarmRankings[mode].map((item) => item[1]));
        root.innerHTML = alarmRankings[mode].map(([label, value]) => `<span><b>${label}</b><i style="--bar:${value / max * 100}%"><em>${value}</em></i></span>`).join('');
      };
      document.querySelectorAll('[data-rank-mode]').forEach((button) => button.addEventListener('click', () => {
        button.parentElement.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
        renderAlarmRanking(button.dataset.rankMode);
      }));
      renderAlarmTrendAxis();
      renderAlarmRanking();
      document.querySelectorAll('.alarm-message-view').forEach((button) => button.addEventListener('click', () => {
        openDeviceModal(button);
        showDevicePane('alarm');
        const records = [...document.querySelectorAll('#deviceModal .device-pane[data-pane="alarm"] .alarm-record')];
        records.forEach((record, index) => { record.hidden = index !== 0; });
        const currentSummary = records[0]?.querySelector('summary span');
        if (currentSummary) currentSummary.innerHTML = `<strong>【设备报警】</strong> ${button.dataset.device}设备报警`;
        const alarmStatus = button.closest('.alarm-message-row')?.dataset.alarmStatus || '未处理';
        const statusField = [...(records[0]?.querySelectorAll('.device-field') || [])].find((field) => field.querySelector('label')?.textContent.trim() === '报警状态');
        if (statusField?.querySelector('strong')) statusField.querySelector('strong').textContent = alarmStatus;
        const processDetails = records[0]?.querySelector('.alarm-process');
        if (processDetails) processDetails.hidden = alarmStatus !== '已处理';
        const operationActions = document.querySelector('#deviceModal .alarm-operation-actions');
        if (operationActions) operationActions.hidden = alarmStatus !== '未处理';
      }));
      document.querySelector('.alarm-select-all')?.addEventListener('change', (event) => {
        document.querySelectorAll('.alarm-row-check:not(:disabled)').forEach((check) => { check.checked = event.currentTarget.checked; });
        syncBatchActionState();
      });
      document.getElementById('alarmMessageFilters')?.addEventListener('reset', () => {
        window.setTimeout(() => {
          document.querySelectorAll('.alarm-message-row[data-alarm-status]').forEach((row) => { row.hidden = false; });
          syncBatchActionState();
        }, 0);
      });
      document.getElementById('alarmMessageFilters')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        document.querySelectorAll('.alarm-message-row[data-alarm-status]').forEach((row) => {
          const text = row.textContent;
          row.hidden = Boolean((values.get('type') && !text.includes(values.get('type'))) || (values.get('level') && !text.includes(values.get('level'))) || (values.get('status') && row.dataset.alarmStatus !== values.get('status')));
        });
      });
      document.querySelectorAll('[data-batch-action]').forEach((button) => button.addEventListener('click', () => {
        const modalId = { false: 'falseAlarmModal', process: 'processAlarmModal', workorder: 'workOrderAlarmModal' }[button.dataset.batchAction];
        document.getElementById(modalId)?.classList.add('open');
      }));
      document.querySelectorAll('[data-close-alarm-action]:not([data-confirm-false-alarm])').forEach((button) => button.addEventListener('click', () => document.getElementById(button.dataset.closeAlarmAction)?.classList.remove('open')));
      document.querySelectorAll('.alarm-action-modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.remove('open'); }));
      const alarmActionButtons = document.createElement('div');
      alarmActionButtons.className = 'alarm-operation-actions';
      alarmActionButtons.hidden = true;
      alarmActionButtons.innerHTML = '<button type="button" data-alarm-action="false">误报</button><button type="button" data-alarm-action="process">处理</button><button type="button" data-alarm-action="workorder">转工单</button>';
      document.querySelector('#deviceModal .device-pane[data-pane="alarm"]')?.append(alarmActionButtons);
      alarmActionButtons.querySelector('[data-alarm-action="false"]')?.addEventListener('click', () => document.getElementById('falseAlarmModal')?.classList.add('open'));
      alarmActionButtons.querySelector('[data-alarm-action="process"]')?.addEventListener('click', () => document.getElementById('processAlarmModal')?.classList.add('open'));
      alarmActionButtons.querySelector('[data-alarm-action="workorder"]')?.addEventListener('click', () => document.getElementById('workOrderAlarmModal')?.classList.add('open'));
      document.querySelector('[data-confirm-false-alarm]')?.addEventListener('click', () => {
        const input = document.querySelector('#falseAlarmModal textarea');
        if (!input?.value.trim()) {
          input?.setCustomValidity('请填写误报说明');
          input?.reportValidity();
          input?.focus();
          return;
        }
        input.setCustomValidity('');
        document.getElementById('falseAlarmModal')?.classList.remove('open');
      });
      networkMainTabs.forEach((tab) => tab.addEventListener('click', () => showNetworkMainView(tab.dataset.networkView)));
      networkRoomDetailTriggers.forEach((trigger) => trigger.addEventListener('click', () => { showNetworkDetailView('environment'); networkRoomDetailModal?.classList.add('open'); }));
      networkDetailTabs.forEach((tab) => tab.addEventListener('click', () => showNetworkDetailView(tab.dataset.networkDetailView)));
      networkDeviceDetailTriggers.forEach((trigger) => trigger.addEventListener('click', () => openDeviceModal(trigger)));
      document.getElementById('networkRoomDetailClose')?.addEventListener('click', closeNetworkRoomDetailModal);
      networkRoomDetailModal?.addEventListener('click', (event) => { if (event.target === networkRoomDetailModal) closeNetworkRoomDetailModal(); });
      document.getElementById('networkEnvironmentMetric')?.addEventListener('change', (event) => updateNetworkEnvironmentChart(event.currentTarget.value));
      document.getElementById('networkUpsPhase')?.addEventListener('change', (event) => updateNetworkUpsChart(event.currentTarget.value));
      networkSimpleRoomTriggers.forEach((trigger) => trigger.addEventListener('click', () => openNetworkSimpleRoomModal(trigger.dataset.room)));
      document.getElementById('networkSimpleRoomClose')?.addEventListener('click', closeNetworkSimpleRoomModal);
      networkSimpleRoomModal?.addEventListener('click', (event) => { if (event.target === networkSimpleRoomModal) closeNetworkSimpleRoomModal(); });
      networkTopologyTriggers.forEach((trigger) => trigger.addEventListener('click', () => networkTopologyModal?.classList.add('open')));
      document.getElementById('networkTopologyClose')?.addEventListener('click', closeNetworkTopologyModal);
      networkTopologyModal?.addEventListener('click', (event) => { if (event.target === networkTopologyModal) closeNetworkTopologyModal(); });
      passageRecordTrigger?.addEventListener('click', () => passageModal?.classList.add('open'));
      document.getElementById('passageDialogClose')?.addEventListener('click', closePassageModal);
      passageModal?.addEventListener('click', (event) => { if (event.target === passageModal) closePassageModal(); });
      document.getElementById('passageFilters')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const result = event.currentTarget.querySelector('select')?.value || 'all';
        document.querySelectorAll('.passage-table tbody tr').forEach((row) => { row.hidden = result !== 'all' && row.dataset.result !== result; });
      });
      passagePhotoTriggers.forEach((trigger) => trigger.addEventListener('click', () => passagePhotoModal?.classList.add('open')));
      document.getElementById('passagePhotoClose')?.addEventListener('click', closePassagePhotoModal);
      passagePhotoModal?.addEventListener('click', (event) => { if (event.target === passagePhotoModal) closePassagePhotoModal(); });
      globalMonitorTrigger?.addEventListener('click', () => { globalCameraItems.forEach((item) => item.classList.remove('active')); setGlobalView('4'); globalMonitorModal?.classList.add('open'); });
      document.getElementById('globalMonitorClose')?.addEventListener('click', closeGlobalMonitorModal);
      globalMonitorModal?.addEventListener('click', (event) => { if (event.target === globalMonitorModal) closeGlobalMonitorModal(); });
      const globalVideoGrid = document.querySelector('.global-video-grid');
      const globalViewButtons = [...document.querySelectorAll('.global-view-switch button')];
      const globalCameraItems = [...document.querySelectorAll('.camera-list span')];
      const setGlobalView = (view, cameraIndex = -1) => {
        if (!globalVideoGrid) return;
        if (view === 'single' && cameraIndex < 0) cameraIndex = 0;
        globalVideoGrid.classList.remove('view-4', 'view-9', 'view-12', 'view-single');
        globalVideoGrid.classList.add(`view-${view}`);
        globalViewButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === view));
        document.querySelectorAll('.global-video').forEach((video, index) => video.classList.toggle('selected', index === cameraIndex));
      };
      globalViewButtons.forEach((button) => button.addEventListener('click', () => { globalCameraItems.forEach((item) => item.classList.remove('active')); setGlobalView(button.dataset.view); }));
      globalCameraItems.forEach((item, index) => item.addEventListener('click', () => { globalCameraItems.forEach((entry) => entry.classList.remove('active')); item.classList.add('active'); setGlobalView('single', index % document.querySelectorAll('.global-video').length); }));
      securitySystemDiagramTriggers.forEach((trigger) => trigger.addEventListener('click', () => securitySystemDiagramModal?.classList.add('open')));
      document.getElementById('securityDiagramClose')?.addEventListener('click', closeSecuritySystemDiagramModal);
      securitySystemDiagramModal?.addEventListener('click', (event) => { if (event.target === securitySystemDiagramModal) closeSecuritySystemDiagramModal(); });
      controllerDeviceTriggers.forEach((trigger) => trigger.addEventListener('click', () => openControllerDeviceModal(trigger.dataset.controller)));
      document.getElementById('controllerDeviceClose')?.addEventListener('click', closeControllerDeviceModal);
      controllerDeviceModal?.addEventListener('click', (event) => { if (event.target === controllerDeviceModal) closeControllerDeviceModal(); });
      weakOverviewDiagramToggle?.addEventListener('change', () => {
        if (weakOverviewDiagramToggle.checked) weakOverviewDiagramModal?.classList.add('open');
        else closeWeakOverviewDiagramModal();
      });
      document.getElementById('weakOverviewDiagramClose')?.addEventListener('click', closeWeakOverviewDiagramModal);
      weakOverviewDiagramModal?.addEventListener('click', (event) => { if (event.target === weakOverviewDiagramModal) closeWeakOverviewDiagramModal(); });
      parkingRecordTrigger?.addEventListener('click', () => parkingRecordModal?.classList.add('open'));
      document.getElementById('parkingRecordClose')?.addEventListener('click', closeParkingRecordModal);
      parkingRecordModal?.addEventListener('click', (event) => { if (event.target === parkingRecordModal) closeParkingRecordModal(); });
      parkingRecordFilters?.addEventListener('submit', (event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        const plate = String(values.get('plate') || '').trim().toLowerCase();
        const start = String(values.get('start') || '');
        const end = String(values.get('end') || '');
        document.querySelectorAll('.parking-record-table tbody tr').forEach((row) => {
          const rowPlate = row.dataset.plate.toLowerCase();
          const rowTime = row.dataset.time;
          row.hidden = Boolean(
            (plate && !rowPlate.includes(plate)) ||
            (start && rowTime < start) ||
            (end && rowTime > end)
          );
        });
      });
      parkingRecordFilters?.addEventListener('reset', () => {
        window.setTimeout(() => {
          document.querySelectorAll('.parking-record-table tbody tr').forEach((row) => { row.hidden = false; });
        }, 0);
      });
      const mepChart = document.querySelector('.mep-chart');
      const mepChartTooltip = document.querySelector('.mep-chart-tooltip');
      const mepChartModes = {
        today: { labels: ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00'], values: [96, 97, 97, 98, 98, 99] },
        week: { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], values: [96, 97, 98, 97, 99, 98, 99] },
        month: { labels: ['1日', '5日', '9日', '13日', '17日', '21日', '25日', '29日'], values: [97, 96, 98, 97, 99, 98, 99, 98] }
      };
      let mepChartSeries = [];
      const renderMepChart = (mode = 'today') => {
        if (!mepChart) return;
        const config = mepChartModes[mode] || mepChartModes.today;
        const xStart = 36;
        const xEnd = 324;
        const yBase = 124;
        const yTop = 45;
        while (mepChart.querySelectorAll('.mep-chart-x-axis').length < config.labels.length) {
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('class', 'mep-chart-axis mep-chart-x-axis');
          label.setAttribute('y', '145');
          mepChart.appendChild(label);
        }
        const xLabels = [...mepChart.querySelectorAll('.mep-chart-x-axis')];
        const xStep = config.labels.length > 1 ? (xEnd - xStart) / (config.labels.length - 1) : 0;
        mepChartSeries = config.labels.map((time, index) => ({ time, online: config.values[index], offline: 100 - config.values[index], fault: 0, x: xStart + xStep * index, y: yBase - ((config.values[index] / 100) * (yBase - yTop)) }));
        xLabels.forEach((label, index) => {
          const point = mepChartSeries[index];
          label.textContent = point?.time || '';
          label.setAttribute('x', point ? point.x.toFixed(1) : xEnd);
          label.setAttribute('text-anchor', index === 0 ? 'start' : index === mepChartSeries.length - 1 ? 'end' : 'middle');
        });
        const linePath = mepChartSeries.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
        const fillPath = `M${xStart} ${yBase} ${mepChartSeries.map((point) => `L${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')} L${xEnd} ${yBase} Z`;
        mepChart.querySelector('.mep-chart-line')?.setAttribute('d', linePath);
        mepChart.querySelector('.mep-chart-fill')?.setAttribute('d', fillPath);
      };
      const mepChartTabs = [...document.querySelectorAll('.mep-mini-tabs button')];
      const chartModeByLabel = { 今日: 'today', 本周: 'week', 本月: 'month' };
      mepChartTabs.forEach((button) => button.addEventListener('click', () => renderMepChart(chartModeByLabel[button.textContent.trim()] || 'today')));
      renderMepChart();
      mepChart?.addEventListener('mousemove', (event) => {
        const chartRect = mepChart.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (event.clientX - chartRect.left) / chartRect.width));
        const point = mepChartSeries[Math.round(ratio * (mepChartSeries.length - 1))];
        mepChartTooltip.innerHTML = `<b>${point.time}</b>在线: ${point.online}%<br>离线: ${point.offline}%<br>故障: ${point.fault}%`;
        mepChartTooltip.classList.add('visible');
        const panelRect = mepChart.closest('.mep-monitor').getBoundingClientRect();
        const tooltipWidth = mepChartTooltip.offsetWidth;
        const left = Math.min(event.clientX - panelRect.left + 10, panelRect.width - tooltipWidth - 8);
        mepChartTooltip.style.left = `${Math.max(8, left)}px`;
        mepChartTooltip.style.top = `${Math.max(48, event.clientY - panelRect.top - mepChartTooltip.offsetHeight - 8)}px`;
      });
      mepChart?.addEventListener('mouseleave', () => mepChartTooltip.classList.remove('visible'));
      const meetingRankMetric = document.getElementById('meetingRankMetric');
      const meetingRankData = {
        frequency: [{ name: '3120小会议室', value: '18次', rank: '100%' }, { name: '3324小会议室', value: '15次', rank: '83%' }],
        duration: [{ name: '3120小会议室', value: '34507800', rank: '100%' }, { name: '3324小会议室', value: '31536000', rank: '91%' }]
      };
      const renderMeetingRank = (metric) => {
        const rows = meetingRankData[metric] || meetingRankData.frequency;
        document.querySelectorAll('[data-meeting-rank]').forEach((row, index) => {
          const data = rows[index];
          if (!data) return;
          row.querySelector('em').textContent = data.name;
          row.querySelector('b').textContent = data.value;
          row.querySelector('.rank-track span').style.setProperty('--rank', data.rank);
        });
      };
      meetingRankMetric?.addEventListener('change', () => renderMeetingRank(meetingRankMetric.value));
      if (meetingRankMetric) renderMeetingRank(meetingRankMetric.value);
      carouselDots.forEach((dot, index) => dot.addEventListener('click', () => showCertificate(index)));
      document.querySelector('.preview-button')?.addEventListener('click', () => {
        preview.src = certificateImage;
        modal.classList.add('open');
      });
      document.getElementById('certificateClose')?.addEventListener('click', closeModal);
      modal?.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { closeModal(); closeDeviceModal(); closeAlarmMessageModal(); closePassageModal(); closePassagePhotoModal(); closeGlobalMonitorModal(); closeSecuritySystemDiagramModal(); closeWeakOverviewDiagramModal(); closeParkingRecordModal(); closeControllerDeviceModal(); closeNetworkRoomDetailModal(); closeNetworkSimpleRoomModal(); closeNetworkTopologyModal(); closeLogoutConfirm(); closeProfilePopover(); }
      });
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.setInterval(() => showCertificate(currentSlide + 1), 4800);
      }
      document.querySelectorAll('.scene-control.left').forEach((button) => button.addEventListener('click', () => button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') !== 'true')));
      if (pageKey === 'mep') renderSystem('overview');
      if (pageKey === 'weak-electric') renderSystem('weak-overview');
      setScale();
      window.addEventListener('resize', setScale);
      updateClock();
      window.setInterval(updateClock, 1000);
      screen.setAttribute('data-ready', 'true');
    })();

