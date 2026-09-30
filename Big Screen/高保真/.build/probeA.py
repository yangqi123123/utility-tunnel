# -*- coding: utf-8 -*-
"""对齐探针：各面板标题栏图标 / 标题 / 内容区的左起点是否一致"""
import io,glob,os,re,subprocess,json
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROBE='''<script>setTimeout(function(){var o=[];
document.querySelectorAll('.pnl').forEach(function(p){
  var t=p.querySelector('.ph h3').textContent, pr=p.getBoundingClientRect();
  var pi=p.querySelector('.ph .pi'), pb=p.querySelector('.pb'), f=pb.firstElementChild;
  var a=Math.round(pi.getBoundingClientRect().left-pr.left);
  var b=f?Math.round(f.getBoundingClientRect().left-pr.left):-1;
  if(Math.abs(a-18)>3||Math.abs(b-20)>3) o.push([t,'图标左',a,'内容左',b]);
});
document.title='PROBE'+JSON.stringify(o);},900);</script>'''
tot=0
for f in sorted(glob.glob('S?-*.html')):
    io.open('.probea.html','w',encoding='utf8').write(io.open(f,encoding='utf8').read().replace('</body>',PROBE+'</body>'))
    r=subprocess.run(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','--headless','--disable-gpu',
        '--window-size=3840,2160','--virtual-time-budget=3000','--dump-dom','file://'+os.path.abspath('.probea.html')],
        capture_output=True,text=True)
    m=re.search(r'<title>PROBE(.*?)</title>',r.stdout,re.S); d=json.loads(m.group(1)) if m else []
    tot+=len(d)
    if d:
        print('==',f)
        for x in d: print('   ',x)
os.remove('.probea.html'); print('错位面板合计',tot)
