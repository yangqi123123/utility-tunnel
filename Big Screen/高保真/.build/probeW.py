# -*- coding: utf-8 -*-
"""中心工具条横向溢出探针"""
import io,glob,os,re,subprocess,json
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROBE='''<script>setTimeout(function(){var o=[];
document.querySelectorAll('.ctop').forEach(function(c){
  var ov=c.scrollWidth-c.clientWidth; if(ov>2) o.push(['ctop',ov]);
  c.querySelectorAll('.seg b').forEach(function(b){
    if(b.scrollHeight>b.clientHeight+2||b.offsetHeight>62) o.push(['wrap:'+b.textContent,b.offsetHeight]);});
});
document.title='PROBE'+JSON.stringify(o);},900);</script>'''
tot=0
for f in sorted(glob.glob('S?-*.html')):
    io.open('.probew.html','w',encoding='utf8').write(io.open(f,encoding='utf8').read().replace('</body>',PROBE+'</body>'))
    r=subprocess.run(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','--headless','--disable-gpu',
        '--window-size=3840,2160','--virtual-time-budget=3000','--dump-dom','file://'+os.path.abspath('.probew.html')],
        capture_output=True,text=True)
    m=re.search(r'<title>PROBE(.*?)</title>',r.stdout,re.S); d=json.loads(m.group(1)) if m else []
    tot+=len(d)
    if d: print('==',f,d)
os.remove('.probew.html'); print('横向问题合计',tot)
