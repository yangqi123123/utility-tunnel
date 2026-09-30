# -*- coding: utf-8 -*-
"""面板溢出探针：3840×2160 下检查各面板内容是否超出可视区"""
import io,glob,os,re,subprocess,json
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROBE = '''<script>
setTimeout(function(){
  var out=[];
  document.querySelectorAll('.pnl').forEach(function(p){
    var t=p.querySelector('.ph h3').textContent, b=p.querySelector('.pb');
    p.querySelectorAll('.tb,.mx,.alist,.flow,.ctl,.plist,.cts').forEach(function(c){
      var rows=c.querySelectorAll('table tr, .al, .fw, .row, .pp, .ct');
      var tb=c.querySelector('table'), ch=tb?tb.scrollHeight:c.scrollHeight, over=ch-c.clientHeight;
      if(over>4) out.push([t,c.className.split(' ')[0],rows.length,rows.length?Math.round(ch/rows.length):0,over]);
    });
    var ov=b.scrollHeight-b.clientHeight; if(ov>4) out.push([t,'PB',0,0,ov]);
  });
  document.title='PROBE'+JSON.stringify(out);
},900);
</script>'''
tot=0
for f in sorted(glob.glob('S?-*.html')):
    io.open('.probe.html','w',encoding='utf8').write(io.open(f,encoding='utf8').read().replace('</body>',PROBE+'</body>'))
    r=subprocess.run(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','--headless','--disable-gpu',
        '--window-size=3840,2160','--virtual-time-budget=3000','--dump-dom','file://'+os.path.abspath('.probe.html')],
        capture_output=True,text=True)
    m=re.search(r'<title>PROBE(.*?)</title>',r.stdout,re.S); d=json.loads(m.group(1)) if m else []
    tot+=len(d)
    if d:
        print('==',f)
        for x in d: print('   %s | %s | 行数%s 行高%s 溢出%s' % tuple(x))
os.remove('.probe.html')
print('溢出项合计',tot)
