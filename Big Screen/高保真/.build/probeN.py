# -*- coding: utf-8 -*-
"""顶栏布局探针：菜单是否溢出 / 与两侧是否重叠 / 文字是否换行"""
import io,glob,os,re,subprocess,json
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROBE='''<script>setTimeout(function(){var o=[];
var br=document.querySelector('.brand'), mn=document.querySelector('.menu'), nr=document.querySelector('.navr .wx');
var rb=br.getBoundingClientRect(), rm=mn.getBoundingClientRect(), rn=nr.getBoundingClientRect();
o.push(['brand右', Math.round(rb.right), '菜单左', Math.round(rm.left), '菜单右', Math.round(rm.right), '右区左', Math.round(rn.left)]);
if(rm.left < rb.right) o.push(['重叠:菜单压住标题', Math.round(rb.right-rm.left)]);
if(rn.left < rm.right) o.push(['重叠:右区压住菜单', Math.round(rm.right-rn.left)]);
document.querySelectorAll('.mi').forEach(function(m){
  var b=m.querySelector('.tt b'), i=m.querySelector('.tt i');
  if(b.scrollWidth>b.clientWidth+1) o.push(['截断:'+b.textContent, b.scrollWidth-b.clientWidth]);
  if(i.scrollWidth>i.clientWidth+1) o.push(['截断EN:'+i.textContent, i.scrollWidth-i.clientWidth]);
  if(m.querySelector('.tt').scrollHeight>m.clientHeight) o.push(['超高:'+b.textContent,0]);
});
document.title='PROBE'+JSON.stringify(o);},900);</script>'''
f='S1-系统首页.html'
io.open('.proben.html','w',encoding='utf8').write(io.open(f,encoding='utf8').read().replace('</body>',PROBE+'</body>'))
r=subprocess.run(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','--headless','--disable-gpu',
    '--window-size=3840,2160','--virtual-time-budget=3000','--dump-dom','file://'+os.path.abspath('.proben.html')],
    capture_output=True,text=True)
m=re.search(r'<title>PROBE(.*?)</title>',r.stdout,re.S)
for x in (json.loads(m.group(1)) if m else [['ERR']]): print(x)
os.remove('.proben.html')
