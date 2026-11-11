#!/usr/bin/env python3
import re
# Pembuat css/23-surfaces.css (efek permukaan kartu). Jalankan dari akar proyek: python3 docs/gen-surfaces.py
import urllib.parse
def svg(s): return 'url("data:image/svg+xml;utf8,'+urllib.parse.quote(s.replace('%23','#'),safe="/:=' ;,-.()")+'")'
def noise(freq,alpha,oct=2,rgb='1 1 1',type='fractalNoise',w=140):
    r,g,b=rgb.split()
    return svg(f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{w}'><filter id='n'><feTurbulence type='{type}' baseFrequency='{freq}' numOctaves='{oct}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 {r} 0 0 0 0 {g} 0 0 0 0 {b} 0 0 0 {alpha} 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")
MARBLE=svg("<svg xmlns='http://www.w3.org/2000/svg' width='420' height='300' viewBox='0 0 420 300'><filter id='b'><feGaussianBlur stdDeviation='.7'/></filter><filter id='bb'><feGaussianBlur stdDeviation='5'/></filter><g fill='none' stroke-linecap='round'><path d='M-10 60 C60 90 90 40 160 80 S250 150 320 110 S400 60 440 90' stroke='%238a919c' stroke-opacity='.18' stroke-width='16' filter='url(%23bb)'/><path d='M-10 60 C60 90 90 40 160 80 S250 150 320 110 S400 60 440 90' stroke='%236f7681' stroke-opacity='.55' stroke-width='1.4' filter='url(%23b)'/><path d='M120 -10 C130 40 100 70 140 120 S190 200 170 310' stroke='%237d848f' stroke-opacity='.5' stroke-width='1.1' filter='url(%23b)'/><path d='M60 310 C90 250 150 230 200 240 S300 200 340 150 S400 120 430 130' stroke='%236f7681' stroke-opacity='.5' stroke-width='1.6' filter='url(%23b)'/><path d='M60 310 C90 250 150 230 200 240 S300 200 340 150 S400 120 430 130' stroke='%238a919c' stroke-opacity='.16' stroke-width='14' filter='url(%23bb)'/><path d='M300 -10 C280 50 320 90 290 150 S270 240 300 310' stroke='%238a919c' stroke-opacity='.4' stroke-width='.9' filter='url(%23b)'/><path d='M200 90 C230 110 240 150 220 190' stroke='%23878e99' stroke-opacity='.35' stroke-width='.8' filter='url(%23b)'/><path d='M20 180 C60 170 80 200 120 190' stroke='%23878e99' stroke-opacity='.35' stroke-width='.8' filter='url(%23b)'/></g></svg>")
LEATHER=svg("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='l'><feTurbulence type='fractalNoise' baseFrequency='.06 .09' numOctaves='3' seed='3'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .22 -.04'/></filter><rect width='100%' height='100%' filter='url(%23l)'/></svg>")
PAPER=svg("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='.55 .9' numOctaves='3' seed='5'/><feColorMatrix values='0 0 0 0 .35 0 0 0 0 .24 0 0 0 0 .1 0 0 0 .35 -.05'/></filter><rect width='100%' height='100%' filter='url(%23p)'/></svg>")
N=noise(.9,.07); NB=noise(.9,.06,2,'0 0 0'); SPARK=noise(1.4,.28,1,'1 1 1')

def _h(c): c=c.lstrip('#'); return [int(c[i:i+2],16) for i in (0,2,4)]
def _x(rgb): return '#%02x%02x%02x'%tuple(max(0,min(255,round(v))) for v in rgb)
def mix(a,b,t): A,B=_h(a),_h(b); return _x([A[i]*(1-t)+B[i]*t for i in range(3)])
def lum(c):
    def f(v):
        v/=255; return v/12.92 if v<=.03928 else ((v+.055)/1.055)**2.4
    r,g,b=_h(c); return .2126*f(r)+.7152*f(g)+.0722*f(b)

def cr(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+.05)/(lo+.05)
POS=['#07804d','#0a6b42','#2ee6a0','#7dffc4','#c8ffe3','#04442a']; NEG=['#cf1f3a','#a3122b','#ff6b81','#ffa0ae','#ffd0d6','#5c0715']
def pick(cands,bg,default,need=4.0):
    ok=[c for c in cands+[default] if cr(c,bg)>=need]
    if default in ok: return default
    return min(ok,key=lambda c:cr(c,bg)) if ok else max(cands,key=lambda c:cr(c,bg))
def tone(c,fam):
    inkc='#000000' if fam=='l' else '#ffffff'
    dp,dn=('#07804d','#cf1f3a') if fam=='l' else ('#2ee6a0','#ff6b81')
    return dict(sf=c,mu=mix(c,inkc,.80 if fam=='l' else .86),mu2=mix(c,inkc,.62 if fam=='l' else .68),ln=mix(c,inkc,.22),pos=pick(POS,c,dp),neg=pick(NEG,c,dn))
NW=noise(.9,.05); NK=noise(.9,.05,2,'0 0 0')
def doff(c):
    fam='l' if lum(c)>.30 else 'd'
    lo=mix(c,'#ffffff',.045); hi=mix(c,'#000000',.06)
    n=NK if fam=='l' else NW
    edge='#00000014' if fam=='l' else '#ffffff12'
    top='#ffffffb0' if fam=='l' else '#ffffff16'
    css=f"background:{n},linear-gradient(160deg,{lo},{hi});border:1px solid {edge}!important;box-shadow:0 1px 2px #00000040,0 10px 22px #0000005c,inset 0 1px 0 {top},inset 0 -2px 0 #0000001a!important;"
    ink,ink2=('#17181b','#4b5058') if fam=='l' else ('#f5f6f8','#cfd3da')
    return fam,css,tone(c,fam)
def flat(c,shadow='0 1px 2px #00000040,0 8px 20px #00000045'):
    fam='l' if lum(c)>.30 else 'd'
    return fam,f"background:{c};border:1px solid {'#00000012' if fam=='l' else '#ffffff14'}!important;box-shadow:{shadow}!important;",tone(c,fam)
# id: (nama, grup, keluarga, css gelap, css terang|None, extra)  — keluarga: d/l = paksa palet, a = ikut mode aplikasi
S={}
def add(k,name,grp,fam,css,cssL=None,ex=None): S[k]=(name,grp,fam,css,cssL,ex or {})
# ---- Dasar (id 1-10)
f,c,e=flat('#fafafa'); add(1,'Putih Solid','dasar',f,c,None,e)
f,c,e=flat('#1c1c1e'); add(2,'Hitam Solid','dasar',f,c,None,e)
f,c,e=flat('#adb1b9'); add(3,'Abu Solid','dasar',f,c,None,e)
add(4,'Transparan Ringan','dasar','a',
  "background-image:linear-gradient(135deg,#ffffff16,#ffffff05);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid #ffffff30!important;box-shadow:0 6px 18px #00000040,inset 0 1px 0 #ffffff26!important;",
  "background:#ffffff70;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid #ffffffd0!important;box-shadow:0 6px 18px #00000018,inset 0 1px 0 #ffffffe0!important;")
add(5,'Transparan Gelap','dasar','d',
  "background:linear-gradient(135deg,#8b909a8c,#6d727b8c);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid #ffffff30!important;box-shadow:0 8px 22px #00000055,inset 0 1px 0 #ffffff30!important;",None,
  tone('#6d727b','d'))
add(6,'Border Berwarna','dasar','a',
  "background-image:linear-gradient(#2f6fe414,#2f6fe414);border:1px solid #2f6fe4!important;box-shadow:inset 0 0 0 1px #2f6fe4,0 0 0 3px #2f6fe41f,0 8px 20px #00000045!important;",
  "background-image:linear-gradient(#2f6fe410,#2f6fe410);border:1px solid #2f6fe4!important;box-shadow:inset 0 0 0 1px #2f6fe4,0 0 0 3px #2f6fe422,0 8px 20px #0000001a!important;")
add(7,'Bayangan Lembut','dasar','a',
  "box-shadow:0 1px 3px #0000004a,0 8px 22px #00000050!important;",
  "box-shadow:0 1px 3px #00000014,0 8px 22px #00000020!important;")
add(8,'Bayangan Tebal','dasar','a',
  "box-shadow:0 6px 12px #000000a0,0 24px 44px #000000c4!important;",
  "box-shadow:0 6px 12px #00000030,0 22px 42px #00000048!important;")
add(9,'Kaca Buram','dasar','a',
  f"background:{NW},#ffffff10;backdrop-filter:blur(24px) saturate(1.25);-webkit-backdrop-filter:blur(24px) saturate(1.25);border:1px solid #ffffff26!important;box-shadow:0 8px 24px #00000050,inset 0 1px 0 #ffffff2a!important;",
  f"background:{NK},#ffffff88;backdrop-filter:blur(24px) saturate(1.25);-webkit-backdrop-filter:blur(24px) saturate(1.25);border:1px solid #ffffffe0!important;box-shadow:0 8px 24px #0000001c,inset 0 1px 0 #fff!important;")
add(10,'Border Tipis','dasar','a',
  "background-image:linear-gradient(#ffffff04,#ffffff04);border:1px solid #ffffff44!important;box-shadow:none!important;",
  "background-image:none;border:1px solid #00000033!important;box-shadow:none!important;")
# ---- Doff (id 11-25)
DOFF=[('Doff Hitam','#1d1e21'),('Doff Putih','#efeeea'),('Doff Abu Muda','#a4a7ae'),('Doff Abu Tua','#46494e'),('Doff Navy','#2b3d5e'),('Doff Biru','#5878a0'),
('Doff Hijau Sage','#94ab95'),('Doff Hijau Tua','#2e4a3c'),('Doff Olive','#62694a'),('Doff Krem','#ecdcc3'),('Doff Terracotta','#b4664a'),('Doff Merah Marun','#5c2a35'),
('Doff Pink Dusty','#cf9b9b'),('Doff Ungu Plum','#583d58'),('Doff Cokelat','#624a3e')]
for i,(n,c) in enumerate(DOFF):
    f,css,e=doff(c); add(11+i,n,'doff',f,css,None,e)
S_=S

# ---------------------------------------------------------------------------------------------
# Selektor yang ikut permukaan: kartu + header + menu bawah (semua varian)
CARDS=(".tp-card,.hero-card,.pe-card,.tool-card:not(.acct-inline),.adv-card,.chart-card,.scan-card,.week-head,.trade-card,.gj-chart,"
       ".flat-sec.card-sec,.hd-card,.backup-panel,.panel,.pe-tile,.tp-act")
CHROME=(".brand-mark,.header-icon,.account-switcher,.hd-strip,.ht-logo,.ht-cal,.ht-acc,.ht-date,.ht-dcard,"
        '.topbar[class*="hd-v"],.bottom-nav')
CONTROLS=("button.icon-btn,.performance-detail-badge,button.tsel,button.sel,.search-box,button.pill:not(.active),button.dfield,"
  "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not([type=hidden]),textarea,select,"
  ".direction,.calc-result,.secondary-btn,.dna-grade,.dna-quick,.pe-link,.dna-item,.dna-badge,.t5-fb,.tp-fx,"
  "button.tp-kind.is-line,.k-thumb,.t5-st,.t5-dt,.t5-mi,.prof-av,.pick-ic,.account-avatar,"
  "")
ALL=CARDS+','+CHROME+','+CONTROLS
def small(css):
    m=re.search(r'box-shadow:([^;]*(?:\([^)]*\)[^;]*)*?)(!important)?;',css)
    if not m: return css
    parts=[];d=0;cur=''
    for ch in m.group(1):
        if ch=='(': d+=1
        if ch==')': d-=1
        if ch==',' and d==0: parts.append(cur);cur=''
        else: cur+=ch
    parts.append(cur);o=[]
    for q in parts:
        q=q.strip()
        if q.startswith('inset') or q=='none': o.append(q);continue
        t=q.split(' ',4)
        try:
            x,y,b=[int(v.replace('px','')) for v in t[:3]]
        except Exception: o.append(q);continue
        o.append('0 %dpx %dpx %s'%(min(y,3) if y else 0,min(b,8),' '.join(t[3:])))
    return css[:m.start()]+'box-shadow:'+','.join(o)+(m.group(2) or '')+';'+css[m.end():]
def imp(css):
    parts=[];cur='';d=0;q=False
    for ch in css:
        if ch=='"': q=not q
        if not q:
            if ch=='(': d+=1
            elif ch==')': d-=1
        if ch==';' and d==0 and not q: parts.append(cur);cur=''
        else: cur+=ch
    if cur.strip(): parts.append(cur)
    return ';'.join(p if p.strip().endswith('!important') else p+'!important' for p in parts if p.strip())+';'
NC,NR=275,25   # jumlah warna di js/lib/color-table.js (EJ_HEX / EJ_RGB)
out=['/* Efek permukaan kartu (v5.9.40). DIBUAT OTOMATIS oleh docs/gen-surfaces.py - jangan diedit tangan.',
     '   html[data-sfc="N"] (N=1..25; 0/tanpa atribut = tampilan standar). data-sfcf = keluarga warna teks: d (teks terang di atas gelap) / l (teks gelap di atas terang) / a (ikut mode aplikasi).',
     '   Berlaku untuk kartu, header, dan menu bawah. Palet keluarga d/l dipasang appearance.js sebagai --sp-*. */']
m=[f'--c{i}:var(--sp-c{i})' for i in range(NC)]+[f'--r{i}:var(--sp-r{i})' for i in range(NR)]
m+=['--t-dk:var(--sp-pr)','--t-soft:color-mix(in srgb,var(--sp-pr) 16%,transparent)','--bg:var(--c1)','--panel:var(--c2)','--panel2:var(--c3)','--border:var(--c4)','--muted:var(--c5)','--blue:var(--c6)','--purple:var(--c9)','--orange:var(--c10)','--ej-ik:var(--sp-ik)','--ej-bd:var(--sp-bd)','--fx-bd:var(--sp-bd)','--ej-so:var(--sp-so)','--ej-pr:var(--sp-pr)','--ej-pru:var(--sp-pru)','--fx-gl:var(--sp-gl)','--fx-so:var(--sp-so3)','--onacc:var(--sp-onacc)','--accg:var(--sp-accg)','color:var(--sp-ik)']
out.append('html[data-sfcf="d"][data-sfc] :is(%s):not(.acc-panel *),html[data-sfcf="l"][data-sfc] :is(%s):not(.acc-panel *){%s}'%(ALL,ALL,';'.join(m)))
FAM={'d':'--ej-sf:#17181b;--t-mu:color-mix(in srgb,var(--ej-ik) 62%,var(--ej-sf));--t-mu2:color-mix(in srgb,var(--ej-ik) 44%,var(--ej-sf));--t-ln:var(--ej-bd);--t-soft:color-mix(in srgb,var(--ej-so) 55%,var(--ej-sf));--t-pos:#2ee6a0;--t-neg:#ff6b81;--green:#2ee6a0;--red:#ff6b81;',
     'l':'--ej-sf:#f1f2f4;--t-mu:#3d4452;--t-mu2:#6b7380;--t-ln:#00000026;--t-soft:#0000000d;--t-pos:#07804d;--t-neg:#cf1f3a;--green:#07804d;--red:#cf1f3a;'}
for f in 'dl': out.append('html[data-sfcf="%s"][data-sfc] :is(%s):not(.acc-panel *){%s}'%(f,ALL,FAM[f]))
SEL='html[data-sfc="%d"][data-mode%s][data-sfcf] :is(%s):not(.acc-panel *)'
def xs_of(ex):
    return f"--ej-sf:{ex['sf']};--t-mu:{ex['mu']};--t-mu2:{ex['mu2']};--t-ln:{ex['ln']};--t-pos:{ex['pos']};--t-neg:{ex['neg']};--green:{ex['pos']};--red:{ex['neg']};--muted:{ex['mu']};--border:{ex['ln']};--c4:{ex['ln']};--c5:{ex['mu']};" if ex else ''
for k,(n,grp,fam,css,cssL,ex) in S.items():
    xs=xs_of(ex)
    out.append(f'/* {k}. {n} ({grp}, {fam}) */')
    out.append((SEL%(k,'',ALL))+'{'+imp(css)+xs+'}')
    if cssL: out.append(SEL%(k,'="light"',ALL)+'{'+imp(cssL)+xs+'}')
    c=ex['sf'] if ex and grp=='doff' else None
    ga,gb=(mix(c,'#ffffff',.18)+'cc',c+'aa') if c else ('rgba(var(--fx-gl),.55)','rgba(var(--fx-gl),.4)')
    out.append((SEL%(k,'',CONTROLS))+'{'+imp(small(css))+'}')
    if cssL: out.append(SEL%(k,'="light"',CONTROLS)+'{'+imp(small(cssL))+'}')
    out.append(f'html[data-sfc="{k}"]{{--sg-a:{ga};--sg-b:{gb};}}')
    act={'d':'#ffffff1f','l':'#0000001a','a':'#ffffff1f'}[fam]


out.append("""/* menu bawah: bentuk asli, hanya warna */

html[data-sfc] .bottom-nav .nav-item:not(.active),html[data-sfc] .bottom-nav .bt-item:not(.on){color:color-mix(in srgb,var(--ej-ik) 74%,transparent)!important}
html[data-sfc] .bottom-nav.nv-1 .nav-item.active,html[data-sfc] .bottom-nav.nv-3 .nav-item.active{color:var(--ej-ik)!important;box-shadow:inset 0 1px 0 #ffffff1a!important}
html[data-sfc] .bottom-nav.nv-1 .nav-item.active svg,html[data-sfc] .bottom-nav.nv-3 .nav-item.active svg{color:inherit!important}
html[data-sfc] :is(input,textarea)::placeholder{color:color-mix(in srgb,var(--ej-ik) 58%,transparent)!important;opacity:1!important}
html[data-sfc] .direction button:not(.selected){color:color-mix(in srgb,var(--ej-ik) 70%,transparent)!important}
html[data-sfc][data-mode="light"][data-sfcf="a"] .ht-logo,html[data-sfc][data-mode="light"][data-sfcf="a"] .brand-mark{color:#0f7a57!important}""")
out.append("""/* elemen di dalam kartu: tint rata (tanpa bayangan ganda) */""")
CONT=CARDS
NEST=':is(%s) :is(%s,%s)'%(CONT,CARDS,CONTROLS)
def tint(fam,mode,bg,bd):
    sel='html[data-sfc][data-sfcf="%s"]%s[data-sfc][data-mode] '%(fam,'[data-mode="%s"]'%mode if mode else '')+NEST
    out.append(sel+'{background:%s!important;background-image:none!important;border-color:%s!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}'%(bg,bd))
tint('l',None,'#0000000b','#00000014'); tint('d',None,'#ffffff12','#ffffff1c')
tint('a','dark','#ffffff12','#ffffff1c'); tint('a','light','#0000000a','#00000014')
# controles di dalam kontrol (input di search-box dsb) & panel akun: polos
FLAT='background:transparent!important;background-image:none!important;border-color:transparent!important;box-shadow:none!important;'
out.append('html[data-sfc][data-sfcf][data-sfc][data-mode][data-sfcf][data-sfc][data-mode] :is(%s) :is(%s,%s){%s}'%(CONTROLS,CARDS,CONTROLS,FLAT))
FN='.gj-chart,.week-head'
out.append('html[data-sfc][data-sfcf][data-sfc][data-mode][data-sfcf][data-sfc][data-mode] :is(%s) :is(%s){%s}'%(CONT,FN,FLAT))
out.append("""/* latar berpendar */
html[data-sfc][data-sfcg="1"] .app-shell{position:relative;isolation:isolate}
html[data-sfc][data-sfcg="1"] .app-shell:before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;filter:blur(26px);background:radial-gradient(62% 17% at 92% 2%,var(--sg-a),transparent 74%),radial-gradient(45% 14% at 0% 6%,var(--sg-b),transparent 74%),radial-gradient(70% 20% at 85% 100%,var(--sg-a),transparent 74%),radial-gradient(50% 16% at 5% 96%,var(--sg-b),transparent 74%)}""")
for k,(n,grp,fam,css,cssL,ex) in S.items():
    ink='#17181b' if fam=='l' else '#f5f6f8' if fam=='d' else 'var(--ej-ik)'
    out.append(f'.sfc-pv[data-k="{k}"]{{{imp(css)}color:{ink};}}')
    if cssL: out.append(f'html[data-mode="light"] .sfc-pv[data-k="{k}"]{{{imp(cssL)}}}')
open('css/23-surfaces.css','w').write('\n'.join(out)+'\n')
import json
meta=[None]+[[n,fam,grp]+([ex['sf']] if ex else []) for k,(n,grp,fam,css,cssL,ex) in sorted(S.items())]
print(len('\n'.join(out)),'bytes'); print(json.dumps(meta,ensure_ascii=False))
