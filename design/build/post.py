# Post-process the generated pptx: split notes text with raw line breaks into real paragraphs,
# and rewrite the zip without folder entries ([Content_Types].xml first).
import zipfile,re,shutil,sys
src=sys.argv[1]
zin=zipfile.ZipFile(src)
pat=re.compile(r'<a:p><a:r>(<a:rPr[^>]*/>)<a:t>([^<]*\n[^<]*)</a:t></a:r>(<a:endParaRPr[^>]*/>)?</a:p>')
def fix(m):
    rpr,t,end=m.group(1),m.group(2),m.group(3) or ''
    return ''.join(f'<a:p><a:r>{rpr}<a:t>{line}</a:t></a:r>{end}</a:p>' for line in t.split('\n') if line.strip())
n=0
with zipfile.ZipFile('tmp.pptx','w',zipfile.ZIP_DEFLATED) as z:
    for i in sorted([i for i in zin.infolist() if not i.filename.endswith('/')],key=lambda i:(i.filename!='[Content_Types].xml',)):
        data=zin.read(i.filename)
        if i.filename.startswith('ppt/notesSlides/notesSlide') and i.filename.endswith('.xml'):
            s=data.decode('utf8'); s2=pat.sub(fix,s)
            s2=re.sub(r'<a:t>([^<]*)</a:t>',lambda m:'<a:t>'+m.group(1).replace('\r','').replace('\n','')+'</a:t>',s2)
            if s2!=s: n+=1
            data=s2.encode('utf8')
        z.writestr(i.filename,data)
shutil.move('tmp.pptx',src); print('notes fixed:',n)
