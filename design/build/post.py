# Post-process the generated pptx: split notes text with raw line breaks into real paragraphs,
# and rewrite the zip without folder entries ([Content_Types].xml first).
import zipfile,re,shutil,sys
src=sys.argv[1]
zin=zipfile.ZipFile(src)
GRAD={'010101':('2B6BFF','0A2A8A'),'020202':('00B8E6','1E4FFF'),'030303':('1ED48A','0A8FA8'),'040404':('0A2A8A','1E4FFF')}
def grad(m):
    a,b=GRAD[m.group(1)]
    return f'<p:bg><p:bgPr><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="{a}"/></a:gs><a:gs pos="100000"><a:srgbClr val="{b}"/></a:gs></a:gsLst><a:lin ang="2700000" scaled="0"/></a:gradFill><a:effectLst/></p:bgPr></p:bg>'
gpat=re.compile(r'<p:bg><p:bgPr><a:solidFill><a:srgbClr val="(0[1-4]0[1-4]0[1-4])"/></a:solidFill>(?:<a:effectLst/>)?</p:bgPr></p:bg>')
pat=re.compile(r'<a:p><a:r>(<a:rPr[^>]*/>)<a:t>([^<]*\n[^<]*)</a:t></a:r>(<a:endParaRPr[^>]*/>)?</a:p>')
def fix(m):
    rpr,t,end=m.group(1),m.group(2),m.group(3) or ''
    return ''.join(f'<a:p><a:r>{rpr}<a:t>{line}</a:t></a:r>{end}</a:p>' for line in t.split('\n') if line.strip())
MIME={'png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','gif':'image/gif','xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'rels':'application/vnd.openxmlformats-package.relationships+xml','xml':'application/xml'}
def clean_content_types(ct,names):
    # Rebuild the manifest like the original (working) deck: only extensions that exist, correct MIME types, no phantom overrides
    exts=sorted({n.rsplit('.',1)[-1].lower() for n in names if '.' in n.rsplit('/',1)[-1]} & set(MIME))
    defaults=''.join(f'<Default Extension="{e}" ContentType="{MIME[e]}"/>' for e in exts)
    ovs=[m for m in re.findall(r'<Override PartName="/([^"]+)" ContentType="[^"]+"/>',ct)]
    keep=''.join(re.search(r'<Override PartName="/'+re.escape(p)+r'" ContentType="[^"]+"/>',ct).group(0) for p in ovs if p in names)
    head=ct[:ct.index('<Types')]; types_open=re.search(r'<Types[^>]*>',ct).group(0)
    return head+types_open+defaults+keep+'</Types>'
n=0
with zipfile.ZipFile('tmp.pptx','w',zipfile.ZIP_DEFLATED) as z:
    for i in sorted([i for i in zin.infolist() if not i.filename.endswith('/')],key=lambda i:(i.filename!='[Content_Types].xml',)):
        data=zin.read(i.filename)
        if i.filename=='[Content_Types].xml':
            data=clean_content_types(data.decode('utf8'),set(zin.namelist())).encode('utf8')
        if i.filename.startswith('ppt/notesSlides/notesSlide') and i.filename.endswith('.xml'):
            s=data.decode('utf8'); s2=pat.sub(fix,s)
            s2=re.sub(r'<a:t>([^<]*)</a:t>',lambda m:'<a:t>'+m.group(1).replace('\r','').replace('\n','')+'</a:t>',s2)
            if s2!=s: n+=1
            data=s2.encode('utf8')
        if i.filename.startswith('ppt/slides/slide') and i.filename.endswith('.xml'):
            data=gpat.sub(grad,data.decode('utf8')).encode('utf8')
        z.writestr(i.filename,data)
shutil.move('tmp.pptx',src); print('notes fixed:',n)
