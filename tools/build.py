"""src/meta.css + src/meta_*.js 를 index.html 의 마커 사이에 끼워 넣는다. (python3 tools/build.py)"""
import glob,re
P='/home/user/-07/'
s=open(P+'index.html',encoding='utf-8').read()
css=open(P+'src/meta.css',encoding='utf-8').read()
js=''.join(open(f,encoding='utf-8').read()+'\n' for f in sorted(glob.glob(P+'src/meta_*.js')))
def sub(a,b,body):
    global s
    i=s.index(a); j=s.index(b)
    s=s[:i+len(a)]+'\n'+body+'\n'+s[j:]
sub('/*META_CSS_START*/','/*META_CSS_END*/',css)
sub('/*META_JS_START*/','/*META_JS_END*/',js)
open(P+'index.html','w',encoding='utf-8').write(s); print('built',len(s)//1024,'KB')
