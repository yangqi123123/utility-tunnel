# -*- coding: utf-8 -*-
"""语义化图标库
造型来源：参考工程 src/assets/images（nav / numValue / tools / homeIcon / index/left /
fire/left / list 等目录下的 PNG 图标），按其语义与线形重绘为 24×24 单色描边 SVG，
以便随主题着色、4K 下矢量清晰；工程内没有对应物的（管廊专有设备、流程类）自行绘制。
"""

I = {}

# ---------- 一、工程内可对应（复刻自 参考工程）----------
I['home']    = '<path d="M3.6 11.2 12 4.4l8.4 6.8"/><path d="M5.8 9.6V20h12.4V9.6"/><path d="M9.8 20v-5.6h4.4V20"/>'                      # nav/home.png
I['fire']    = ('<path d="M12 21.4c-3.6 0-6.4-2.8-6.4-6.3 0-2.4 1.2-4 2.5-5.5C9.6 8 11 6.4 11 4c0-.6-.1-1.2-.3-1.8 4.1 1.1 8.2 5.4 8.2 10.8 0 4.2-2.9 8.4-6.9 8.4z"/>'
                '<path d="M12 21.4a3.1 3.1 0 0 1-3.1-3.1c0-1.2.6-2 1.2-2.8.6-.7 1.2-1.4 1.2-2.5 2 .9 3.8 2.9 3.8 5.3a3.1 3.1 0 0 1-3.1 3.1z"/>')      # nav/fire、common/warning
I['hydrant'] = '<path d="M9 8.6h6v10.4H9z"/><path d="M6.8 19h10.4"/><path d="M12 3.4v5.2"/><path d="M9.4 3.4h5.2"/><path d="M6.2 11.4H9M15 11.4h2.8"/><path d="M9 15.2h6"/>'  # nav/fire.png
I['bolt']    = '<path d="M13.4 2.8 5.6 13.6h5.4l-.9 7.6 7.8-11.2h-5.4z"/>'                                                               # nav/elec.png
I['elec']    = '<circle cx="12" cy="12" r="8.6"/><path d="M12.9 7 9.6 12.5h2.9l-.5 4.5 3.4-5.5h-3z"/>'                                    # nav/elec.png
I['wrench']  = '<path d="M15.4 6.2a4.4 4.4 0 0 0-5.8 5.4l-5.4 5.4v2.8h2.8l5.4-5.4a4.4 4.4 0 0 0 5.4-5.8l-2.6 2.6-2.4-.4-.4-2.4z"/>'      # nav/equipment.png
I['speaker'] = '<path d="M4 9.2v5.6h3.6L13 19V5L7.6 9.2z"/><path d="M16.2 8.8a5 5 0 0 1 0 6.4"/><path d="M18.8 6.4a8.6 8.6 0 0 1 0 11.2"/>'  # nav/com.png
I['chart']   = '<path d="M3.8 20.2h16.4"/><path d="M6.6 20.2v-6.6M11 20.2V7.4M15.4 20.2v-4.2M19.8 20.2V10.6"/>'                           # nav/statistcs.png
I['topo']    = '<circle cx="12" cy="5.6" r="2.2"/><circle cx="5.6" cy="18.4" r="2.2"/><circle cx="18.4" cy="18.4" r="2.2"/><path d="M12 7.8v3.8"/><path d="M12 11.6H6.6a1 1 0 0 0-1 1v3.6"/><path d="M12 11.6h5.4a1 1 0 0 1 1 1v3.6"/>'  # nav/system.png
I['temp']    = '<path d="M14 13.9V5.2a2 2 0 1 0-4 0v8.7a4 4 0 1 0 4 0z"/><path d="M12 8.6v5.8"/>'                                         # nav/icon-temperature、homeIcon
I['humid']   = '<path d="M12 3.4s5.4 6.1 5.4 9.7a5.4 5.4 0 0 1-10.8 0C6.6 9.5 12 3.4 12 3.4z"/><path d="M9.6 13.6a2.6 2.6 0 0 0 2.6 2.6"/>'  # nav/19shidu.png
I['wind']    = '<path d="M3.4 8.6h10.2a2.6 2.6 0 1 0-2.6-2.6"/><path d="M3.4 12.4h13.2a2.6 2.6 0 1 1-2.6 2.6"/><path d="M3.4 16.2h7.2"/>'   # nav/23fenshu.png
I['cloud']   = '<path d="M17 17.2H7a4 4 0 0 1-.6-8 5.6 5.6 0 0 1 10.8-1.4A4.4 4.4 0 0 1 17 17.2z"/>'                                       # nav/icon-cloudy.png
I['water']   = '<path d="M12 3.4s3.8 4 3.8 6.5a3.8 3.8 0 0 1-7.6 0C8.2 7.4 12 3.4 12 3.4z"/><path d="M3.6 15.4c2.1 0 2.1-1.6 4.2-1.6s2.1 1.6 4.2 1.6 2.1-1.6 4.2-1.6 2.1 1.6 4.2 1.6"/><path d="M3.6 19.4c2.1 0 2.1-1.6 4.2-1.6s2.1 1.6 4.2 1.6 2.1-1.6 4.2-1.6 2.1 1.6 4.2 1.6"/>'  # homeIcon/water_01.png
I['camera']  = '<path d="M2.8 8.6h11.2v6.8H2.8z"/><path d="M14 10.8 20.6 7.4v9.2L14 13.2z"/><path d="M5.6 15.4v4.2"/>'                     # numValue/icon-fire-camera-.png
I['eye']     = '<path d="M2.4 12S6.2 5.8 12 5.8 21.6 12 21.6 12 17.8 18.2 12 18.2 2.4 12 2.4 12z"/><circle cx="12" cy="12" r="3"/>'        # numValue/icon-fire-surveillance.png
I['light']   = '<path d="M9.2 16.2a5.6 5.6 0 1 1 5.6 0v1.9H9.2z"/><path d="M10 20.4h4"/><path d="M12 9.2v3.4"/>'                           # numValue/icon-fire-lighting.png
I['gas']     = '<circle cx="8.6" cy="14.2" r="2.8"/><circle cx="14.8" cy="9.2" r="2.8"/><circle cx="16" cy="16.4" r="1.8"/><path d="m10.8 12.4 1.9-1.4M11.2 15.4l3-.5"/>'  # numValue/icon-fire-covi.png
I['board']   = '<rect x="2.8" y="4.2" width="18.4" height="11.4" rx="1"/><path d="M8 19.8h8M12 15.6v4.2"/><path d="M6.4 8h4.4M6.4 11.8h8.8"/>'  # numValue/icon-fire-board.png
I['car']     = '<path d="M4 14.8h16v3.4h-2.4v1.6h-2.6v-1.6H9v1.6H6.4v-1.6H4z"/><path d="m5.6 14.8 1.9-5.4h9l1.9 5.4"/><circle cx="7.6" cy="16.5" r=".9"/><circle cx="16.4" cy="16.5" r=".9"/>'  # index/left/car.png
I['device']  = '<rect x="3.2" y="4.4" width="17.6" height="15.2" rx="1.4"/><path d="m7.4 9.6 2.8 2.6-2.8 2.6"/><path d="M12.6 15h4.4"/>'   # index/left/device.png
I['fault']   = '<rect x="5" y="3.4" width="14" height="17.2" rx="1.2"/><path d="M5 7.4h14"/><path d="M12.6 10.2 9.8 14.4h3.2l-.8 3.6 3-4.6h-3z"/>'  # index/left/malfunction.png
I['alarmlt'] = '<path d="M7.4 19.4v-4.8a4.6 4.6 0 0 1 9.2 0v4.8z"/><path d="M5.6 19.4h12.8"/><path d="M12 5.6V3.2M6.6 7.4 5 5.8M17.4 7.4 19 5.8"/>'  # index/left/warnning.png
I['pool']    = '<rect x="3.4" y="7" width="17.2" height="10.4" rx="1"/><path d="M3.4 12.6c2 0 2-1.4 4-1.4s2 1.4 4 1.4 2-1.4 4-1.4 2 1.4 4 1.4"/>'  # index/left/shuichi.png
I['search']  = '<circle cx="11" cy="11" r="6.8"/><path d="m20 20-4.2-4.2"/>'                                                              # list/icon-search.png
I['edit']    = '<path d="M4.4 19.6h4.2L19.2 9a2 2 0 0 0-2.8-2.8L5.8 16.8z"/><path d="m14.8 7.8 2.8 2.8"/>'                                # list/icon-edit.png
I['refresh'] = '<path d="M19.8 12a7.8 7.8 0 1 1-2.3-5.5"/><path d="M19.8 4.6v4.6h-4.6"/>'                                                 # list/icon-refresh.png
I['back']    = '<path d="M14.4 5.6 8 12l6.4 6.4"/>'                                                                                      # list/icon-back.png
I['road']    = '<path d="M6.2 20.4 9.2 3.6M17.8 20.4 14.8 3.6"/><path d="M12 4.6v3.2M12 10.6v3M12 16.6v3.4"/>'                                  # homeIcon/road_01.png
I['heart']   = '<path d="M12 20s-7.6-4.7-7.6-9.7a4.4 4.4 0 0 1 7.6-3 4.4 4.4 0 0 1 7.6 3c0 5-7.6 9.7-7.6 9.7z"/>'                          # numValue/icon-heart.png

# ---------- 二、工程内无对应，自绘 ----------
I['fan']     = ('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.4"/>'
                '<path d="M12 10.9c0-2.6 1.3-4.2 2.9-3.7 1.5.5 1 2.7-2.9 3.7Z"/>'
                '<g transform="rotate(120 12 12)"><path d="M12 10.9c0-2.6 1.3-4.2 2.9-3.7 1.5.5 1 2.7-2.9 3.7Z"/></g>'
                '<g transform="rotate(240 12 12)"><path d="M12 10.9c0-2.6 1.3-4.2 2.9-3.7 1.5.5 1 2.7-2.9 3.7Z"/></g>')
I['pump']    = '<circle cx="10.4" cy="13.6" r="5"/><path d="M10.4 8.6V4.8h6.4v5.2"/><path d="M15.4 13.6h5"/><path d="M8.4 13.6a2 2 0 0 1 2-2"/>'
I['valve']   = '<circle cx="12" cy="12" r="3.2"/><path d="M3.6 12h5.2M15.2 12h5.2"/><path d="M12 8.8V4.8M9.6 4.8h4.8"/>'
I['level']   = '<rect x="6.6" y="3.6" width="10.8" height="16.8" rx="1.2"/><path d="M6.6 13c1.4 0 1.4-1.3 2.7-1.3S10.7 13 12 13s1.4-1.3 2.7-1.3 1.4 1.3 2.7 1.3"/><path d="M3.4 7.4h2M3.4 11h2M3.4 14.6h2"/>'
I['pipe']    = '<path d="M3.4 9.2h17.2v5.6H3.4z"/><path d="M6.8 7.8v8.4M17.2 7.8v8.4"/>'
I['tunnel']  = '<rect x="3.2" y="6.6" width="17.6" height="13" rx="1"/><path d="M9.2 6.6v13M14.8 6.6v13"/><path d="M3.2 4h17.6"/>'
I['layers']  = '<path d="M12 3.4 3.4 7.8 12 12.2l8.6-4.4z"/><path d="m3.4 12.2 8.6 4.4 8.6-4.4"/><path d="m3.4 16.6 8.6 4.4 8.6-4.4"/>'
I['map']     = '<path d="M12 3.4a5.6 5.6 0 0 0-5.6 5.6c0 4.4 5.6 11.6 5.6 11.6s5.6-7.2 5.6-11.6A5.6 5.6 0 0 0 12 3.4z"/><circle cx="12" cy="9" r="2.2"/>'
I['shield']  = '<path d="M12 3.2 19.4 6v6c0 4.7-3.2 7.6-7.4 8.8C7.8 19.6 4.6 16.7 4.6 12V6z"/><path d="m8.8 12 2.4 2.4 4-4.6"/>'
I['fence']   = '<path d="M3.4 20.4V8.6L12 3.8l8.6 4.8v11.8"/><path d="M3.4 12.4h17.2M3.4 16.6h17.2"/><path d="M8.4 8.8v11.6M15.6 8.8v11.6"/>'
I['lock']    = '<rect x="4.8" y="10.2" width="14.4" height="10" rx="1.4"/><path d="M8.2 10.2V7.4a3.8 3.8 0 0 1 7.6 0v2.8"/><circle cx="12" cy="15" r="1.4"/>'
I['door']    = '<path d="M5.6 3.6h12.8v16.8H5.6z"/><path d="M9.2 3.6v16.8"/><circle cx="15.4" cy="12" r="1"/>'
I['manhole'] = '<ellipse cx="12" cy="12" rx="8.4" ry="5.4"/><path d="M6.2 10.4h11.6M6.2 13.6h11.6"/>'
I['person']  = '<circle cx="12" cy="7.2" r="3.2"/><path d="M5.4 20.4a6.6 6.6 0 0 1 13.2 0"/>'
I['helmet']  = '<path d="M4.4 15.6a7.6 7.6 0 0 1 15.2 0z"/><path d="M3.2 15.6h17.6"/><path d="M9.6 8.8V5.4h4.8v3.4"/>'
I['team']    = '<circle cx="9" cy="8.4" r="2.8"/><path d="M3.6 18.8a5.4 5.4 0 0 1 10.8 0"/><circle cx="17" cy="9.6" r="2.2"/><path d="M15.2 14.2a4.4 4.4 0 0 1 5.2 3.4"/>'
I['clipbrd'] = '<path d="M8.8 5H6.4a1.2 1.2 0 0 0-1.2 1.2v13.2A1.2 1.2 0 0 0 6.4 20.6h11.2a1.2 1.2 0 0 0 1.2-1.2V6.2A1.2 1.2 0 0 0 17.6 5h-2.4"/><rect x="8.8" y="3.2" width="6.4" height="3.2" rx="1"/><path d="M8.8 11.4h6.4M8.8 15.2h4.4"/>'
I['order']   = '<path d="M6 3.6h9l3.8 3.8v13H6z"/><path d="M15 3.6v4h3.8"/><path d="M9 12.4h6M9 16h4"/>'
I['calendar']= '<rect x="4" y="5.4" width="16" height="15" rx="1.2"/><path d="M4 10.2h16M8.8 3.4v4M15.2 3.4v4"/><path d="M8.2 13.6h2.2M8.2 17h2.2M13.6 13.6h2.2M13.6 17h2.2"/>'
I['clock']   = '<circle cx="12" cy="12" r="8.4"/><path d="M12 6.8V12l3.6 2.2"/>'
I['history'] = '<path d="M4.4 12a7.6 7.6 0 1 0 2.4-5.6"/><path d="M4 5.4v4.2h4.2"/><path d="M12 8.4V12l2.8 1.8"/>'
I['doc']     = '<path d="M6.4 3.6h8.2l4 4v12.8H6.4z"/><path d="M14.6 3.6v4h4"/><path d="M9.4 16.4v-3M12 16.4v-5.6M14.6 16.4v-2"/>'
I['export']  = '<path d="M12 3.8v10.4"/><path d="m8.4 10.8 3.6 3.4 3.6-3.4"/><path d="M4.6 16.2v3.2a1 1 0 0 0 1 1h12.8a1 1 0 0 0 1-1v-3.2"/>'
I['link']    = '<path d="M10.4 13.6a3.6 3.6 0 0 0 5.4.4l2.4-2.4a3.6 3.6 0 0 0-5.1-5.1l-1.4 1.4"/><path d="M13.6 10.4a3.6 3.6 0 0 0-5.4-.4l-2.4 2.4a3.6 3.6 0 0 0 5.1 5.1l1.4-1.4"/>'
I['plan']    = '<path d="M5.6 3.8h9.6l3.2 3.2v13.2H5.6z"/><path d="M15.2 3.8V7h3.2"/><path d="m8.8 13.4 2 2 4.2-4.6"/>'
I['flowchart']='<rect x="3.4" y="3.8" width="6" height="4.4" rx=".8"/><rect x="14.6" y="3.8" width="6" height="4.4" rx=".8"/><rect x="9" y="15.6" width="6" height="4.4" rx=".8"/><path d="M6.4 8.2v3.6h11.2V8.2M12 11.8v3.8"/>'
I['ups']     = '<rect x="3.2" y="7" width="15" height="10" rx="1.4"/><path d="M18.2 10.4h2.6v3.2h-2.6"/><path d="M11.8 9.4 8.8 13.2h3.2l-.8 2.8 3.2-4.2h-3z"/>'
I['meter']   = '<rect x="4.2" y="3.6" width="15.6" height="16.8" rx="1.4"/><rect x="7" y="6.6" width="10" height="4.4" rx=".6"/><path d="M7.4 14.8h3M13.6 14.8h3M7.4 17.6h9.2"/>'
I['trans']   = '<rect x="4.2" y="8.4" width="5.4" height="7.2" rx=".6"/><rect x="14.4" y="8.4" width="5.4" height="7.2" rx=".6"/><path d="M9.6 10.6h4.8M9.6 13.4h4.8"/><path d="M6.9 8.4V5.2M17.1 8.4V5.2M6.9 15.6v3.2M17.1 15.6v3.2"/>'
I['cable']   = '<circle cx="12" cy="12" r="8.4"/><circle cx="9.4" cy="10.2" r="2"/><circle cx="14.6" cy="10.2" r="2"/><circle cx="12" cy="15.2" r="2"/>'
I['signal']  = '<circle cx="12" cy="17.6" r="1.4"/><path d="M8.6 14.4a4.8 4.8 0 0 1 6.8 0"/><path d="M5.8 11.2a8.8 8.8 0 0 1 12.4 0"/><path d="M3.2 8.2a12.4 12.4 0 0 1 17.6 0"/>'
I['mic']     = '<rect x="9" y="3.4" width="6" height="11" rx="3"/><path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0"/><path d="M12 18v2.6M9.2 20.6h5.6"/>'
I['phone']   = '<path d="M5.2 3.8h3.6l1.8 4.4-2.4 1.6a12.6 12.6 0 0 0 5.8 5.8l1.6-2.4 4.4 1.8v3.6a1.4 1.4 0 0 1-1.6 1.4C9.9 19.3 4.7 14.1 3.8 5.4a1.4 1.4 0 0 1 1.4-1.6z"/>'
I['video']   = '<rect x="3" y="4.6" width="18" height="12.4" rx="1.2"/><path d="M8.4 20.4h7.2M12 17v3.4"/><path d="m10.6 8.8 4 2.2-4 2.2z"/>'
I['grid']    = '<rect x="3.6" y="3.6" width="7.2" height="7.2" rx=".8"/><rect x="13.2" y="3.6" width="7.2" height="7.2" rx=".8"/><rect x="3.6" y="13.2" width="7.2" height="7.2" rx=".8"/><rect x="13.2" y="13.2" width="7.2" height="7.2" rx=".8"/>'
I['bell']    = '<path d="M12 3.2a6.2 6.2 0 0 0-6.2 6.2c0 4.2-2 5.2-2 6.2h16.4c0-1-2-2-2-6.2A6.2 6.2 0 0 0 12 3.2z"/><path d="M10.2 19.4a2 2 0 0 0 3.6 0"/>'
I['warn']    = '<path d="M12 4.2 20.8 19.6H3.2z"/><path d="M12 10v4.4M12 17.2v.6"/>'
I['check']   = '<circle cx="12" cy="12" r="8.4"/><path d="m8 12.2 2.8 2.8 5.2-6"/>'
I['offline'] = '<circle cx="12" cy="12" r="8.4"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>'
I['smoke']   = '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3"/><path d="M12 3.8v2M12 18.2v2M3.8 12h2M18.2 12h2"/>'
I['spray']   = '<path d="M12 3.6v5"/><path d="M6.4 8.6h11.2"/><path d="m8.8 12.6-1.6 3.6M12 12.8v3.8M15.2 12.6l1.6 3.6"/><circle cx="12" cy="10.4" r="1.6"/>'
I['extg']    = '<path d="M9 8.6h5.6v11.6H9z"/><path d="M9 8.6a2.8 2.8 0 0 1 5.6 0"/><path d="M14.6 10.8h3.2V7.2"/><path d="M10.8 4.6h2.6v2"/>'
I['speed']   = '<path d="M4.2 17.4a8.6 8.6 0 1 1 15.6 0"/><path d="m12 13.6 4-3.8"/><circle cx="12" cy="14.8" r="1.2"/>'
I['pulse']   = '<path d="M3.4 12h3.8l2-5.2 3.6 10.4 2.4-5.2h5.4"/>'
I['server']  = '<rect x="3.6" y="4.2" width="16.8" height="6" rx="1"/><rect x="3.6" y="13.8" width="16.8" height="6" rx="1"/><path d="M7 7.2h.4M7 16.8h.4"/><path d="M10.6 7.2h6M10.6 16.8h6"/>'
I['db']      = '<ellipse cx="12" cy="6.4" rx="7.4" ry="2.8"/><path d="M4.6 6.4v11.2c0 1.5 3.3 2.8 7.4 2.8s7.4-1.3 7.4-2.8V6.4"/><path d="M4.6 12c0 1.5 3.3 2.8 7.4 2.8s7.4-1.3 7.4-2.8"/>'
I['switch']  = '<rect x="2.8" y="7.6" width="18.4" height="8.8" rx="4.4"/><circle cx="16.8" cy="12" r="2.8"/>'
I['trend']   = '<path d="m3.6 16.4 5-5.4 3.6 3.4 7.2-8.2"/><path d="M19.4 6.2h-4.4M19.4 6.2v4.4"/>'
I['flag']    = '<path d="M6 20.4V4.2h11.4l-2.2 3.6 2.2 3.6H6"/>'
I['expand']  = '<path d="M9.4 3.6H4.6a1 1 0 0 0-1 1v4.8"/><path d="M14.6 3.6h4.8a1 1 0 0 1 1 1v4.8"/><path d="M20.4 14.6v4.8a1 1 0 0 1-1 1h-4.8"/><path d="M3.6 14.6v4.8a1 1 0 0 0 1 1h4.8"/>'
I['shrink']  = '<path d="M3.8 9.2h4.4a1 1 0 0 0 1-1V3.8"/><path d="M20.2 9.2h-4.4a1 1 0 0 1-1-1V3.8"/><path d="M20.2 14.8h-4.4a1 1 0 0 0-1 1v4.4"/><path d="M3.8 14.8h4.4a1 1 0 0 1 1 1v4.4"/>'
I['snap']    = '<path d="M3.6 7.8h3.8L9 5.2h6l1.6 2.6h3.8v11.4H3.6z"/><circle cx="12" cy="13.2" r="3.4"/>'
I['ptz']     = '<circle cx="12" cy="12" r="3"/><path d="M12 2.6 13.8 6h-3.6zM12 21.4 10.2 18h3.6zM2.6 12 6 10.2v3.6zM21.4 12 18 13.8v-3.6z"/>'
I['target']  = '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3.6"/><path d="M12 1.8v3.2M12 19v3.2M1.8 12h3.2M19 12h3.2"/>'


def sprite():
    s = ['<svg class="sprite" aria-hidden="true">']
    for k, v in I.items():
        s.append(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>')
    s.append('</svg>')
    return ''.join(s)


def ic(name, cls=''):
    if name not in I:
        raise KeyError('未定义图标: ' + name)
    c = ('si ' + cls).strip()
    return f'<svg class="{c}"><use href="#i-{name}"/></svg>'
