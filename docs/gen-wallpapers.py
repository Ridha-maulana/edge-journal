#!/usr/bin/env python3
"""Pembuat js/lib/wallpapers.js (latar aplikasi, v5.9.53). Jalankan dari akar repo:  python3 docs/gen-wallpapers.py
Semua latar adalah SVG buatan sendiri (tanpa karakter/merek). Id unik ditandai '@' lalu diganti saat dipakai.
Tiap entri: [kategori, nama, nada (l terang / d gelap / m sedang / a ikut tema), svg thumbnail 3:4, svg layar penuh atau 0 bila sama]."""
import random, math
# semua latar digambar di kanvas 120x160 (3:4), dipakai untuk thumbnail & latar layar penuh
def R(seed): return random.Random(seed)
def wrap(i, body, defs=''): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs>{defs}</defs>{body}</svg>'
def grad(id,c1,c2,x2=0,y2=1,mid=None):
    m=f'<stop offset=".5" stop-color="{mid}"/>' if mid else ''
    return f'<linearGradient id="{id}" x1="0" y1="0" x2="{x2}" y2="{y2}"><stop offset="0" stop-color="{c1}"/>{m}<stop offset="1" stop-color="{c2}"/></linearGradient>'
# ---------- DASAR ----------
def dasar(i,c1,c2): return wrap(i,f'<rect width="120" height="160" fill="url(#g{i})"/>',grad(f'g{i}',c1,c2))
DASAR=[('Putih','#f8f9fb','#eceef2'),('Abu terang','#e6e8ec','#d2d6dc'),('Hitam','#0d0f12','#181b20'),('Navy','#11203b','#0a1324'),('Hijau tua','#103026','#0a2019'),('Krem','#f6eddc','#eadcc0'),('Biru langit','#e2effc','#c8dff4'),('Cokelat','#2d221c','#1e1612')]
# ---------- DOFF ----------
def doff(i,c1,c2):
    d=f'{grad(f"g{i}",c1,c2)}<filter id="n{i}"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/></filter><radialGradient id="v{i}" cx=".5" cy=".4" r=".8"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>'
    return wrap(i,f'<rect width="120" height="160" fill="url(#g{i})"/><rect width="120" height="160" filter="url(#n{i})" opacity=".35"/><rect width="120" height="160" fill="url(#v{i})"/>',d)
DOFF=[('Pasir','#dccfb9','#cdbda3'),('Batu','#9a9da4','#80848c'),('Terracotta','#bd6e52','#a35a40'),('Sage','#9db39d','#869e88'),('Arang','#34363b','#232529'),('Tulang','#efebe3','#e0dacd')]
# ---------- KACA ----------
def kaca(i,base1,base2,orbs):
    d=grad(f'g{i}',base1,base2,1,1)+f'<filter id="b{i}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>'
    o=''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" opacity="{a}"/>' for x,y,r,c,a in orbs)
    glare='<path d="M-10 40 L70 -10 L100 -10 L-10 70Z" fill="#fff" opacity=".10"/><path d="M40 170 L130 100 L130 130 L70 170Z" fill="#fff" opacity=".08"/>'
    return wrap(i,f'<rect width="120" height="160" fill="url(#g{i})"/><g filter="url(#b{i})">{o}</g>{glare}',d)
KACA=[('Aurora','#0b3a3a','#0a2a4a',[(30,40,30,'#35e0a1',.8),(90,70,34,'#3aa6ff',.75),(40,130,32,'#2bd6c8',.7)]),
('Senja kaca','#ff9a62','#ff5f7a',[(25,35,30,'#ffd36b',.85),(95,90,34,'#ff6f91',.8),(30,140,30,'#ff9f5a',.7)]),
('Laut','#1778c8','#0a3a6e',[(90,30,30,'#7ad7ff',.8),(25,90,34,'#25b7d3',.8),(85,140,30,'#2f6fe0',.7)]),
('Mint','#c9f2e0','#9fe0cc',[(30,35,30,'#ffffff',.9),(95,85,30,'#6fe0b8',.8),(35,135,28,'#a6e8ff',.8)]),
('Embun','#f3f5f8','#d5dae2',[(25,40,28,'#ffffff',.95),(95,75,32,'#c8d4e6',.9),(40,135,30,'#e9eef6',.9)]),
('Malam kaca','#0b1630','#060b18',[(30,40,28,'#1fb6c9',.7),(95,95,32,'#2a62d6',.7),(45,140,28,'#ff7a59',.5)])]
# ---------- ANIME (ilustrasi orisinal) ----------
def stars(r,n,y0,y1,w=120,op=(.5,1),rr=(.3,.8)):
    return ''.join(f'<circle cx="{r.uniform(0,w):.1f}" cy="{r.uniform(y0,y1):.1f}" r="{r.uniform(*rr):.2f}" fill="#fff" opacity="{r.uniform(*op):.2f}"/>' for _ in range(n))
def cloud(x,y,s,c,o):
    return f'<g transform="translate({x} {y}) scale({s})" fill="{c}" opacity="{o}"><ellipse cx="0" cy="0" rx="22" ry="5"/><ellipse cx="-8" cy="-4" rx="10" ry="6"/><ellipse cx="6" cy="-6" rx="12" ry="7"/></g>'
def senja(i):
    d=grad(f'g{i}','#ff9966','#ffe3a8',0,1,'#ff7f7a')+f'<radialGradient id="s{i}"><stop offset="0" stop-color="#fff6d6"/><stop offset=".45" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>'
    b=f'<rect width="120" height="160" fill="url(#g{i})"/><circle cx="78" cy="92" r="40" fill="url(#s{i})"/><circle cx="78" cy="92" r="13" fill="#fff4cf"/>'
    b+=cloud(25,40,1.1,'#fff',.55)+cloud(90,58,.9,'#ffe2d0',.7)+cloud(40,80,1,'#ffd1b0',.6)+cloud(100,110,.8,'#ffc3a0',.6)
    b+='<path d="M0 112 Q25 98 50 110 T120 104 V160 H0Z" fill="#d9776a"/><path d="M0 126 Q30 112 65 124 T120 120 V160 H0Z" fill="#a8514f"/><path d="M0 142 Q35 130 70 140 T120 136 V160 H0Z" fill="#4a2c33"/>'
    b+='<g stroke="#3a2229" stroke-width=".7" fill="none"><path d="M10 160 V120"/><path d="M4 126 H16"/><path d="M-5 128 Q30 140 60 130" /></g>'
    b+='<path d="M30 62 q3 -3 6 0 q3 -3 6 0" stroke="#7a3a3a" stroke-width=".8" fill="none"/><path d="M48 54 q2 -2 4 0 q2 -2 4 0" stroke="#7a3a3a" stroke-width=".7" fill="none"/>'
    return wrap(i,b,d)
def kota(i):
    r=R(7); d=grad(f'g{i}','#0a1a3a','#e98a5a',0,1,'#1d5a78')
    b=f'<rect width="120" height="160" fill="url(#g{i})"/>'+stars(r,45,0,70)
    b+='<circle cx="30" cy="34" r="12" fill="#fff6dd"/><circle cx="26" cy="31" r="2.2" fill="#eadfbe"/><circle cx="35" cy="38" r="1.6" fill="#eadfbe"/>'
    def bl(seed,col,y0,minw,maxw,minh,maxh,win):
        rr=R(seed);x=-4;out=''
        while x<124:
            w=rr.uniform(minw,maxw);h=rr.uniform(minh,maxh);out+=f'<rect x="{x:.0f}" y="{y0-h:.0f}" width="{w:.0f}" height="{h+60:.0f}" fill="{col}"/>'
            if win:
                for _ in range(int(w*h/30)):
                    wx=x+rr.uniform(1,w-2);wy=y0-rr.uniform(2,h-1);out+=f'<rect x="{wx:.0f}" y="{wy:.0f}" width="1.4" height="1.7" fill="{rr.choice(["#ffd27a","#ffe9a8","#ff9f5a","#9fe8ff"])}"/>'
            x+=w+rr.uniform(0,1.5)
        return out
    b+=bl(3,'#17314d',118,8,16,20,44,False)+bl(5,'#0f2238',134,9,17,16,40,True)+bl(9,'#08121f',152,10,20,12,30,True)
    return wrap(i,b,d)
def sakura(i):
    r=R(11); d=grad(f'g{i}','#ffd9e4','#fff3e8',0,1,'#ffe8ef')
    b=f'<rect width="120" height="160" fill="url(#g{i})"/><path d="M0 120 L25 96 L45 112 L70 88 L95 110 L120 94 V160 H0Z" fill="#cfe0f0" opacity=".7"/><path d="M0 138 L30 118 L60 134 L90 116 L120 130 V160H0Z" fill="#b8d0e6" opacity=".8"/>'
    b+='<path d="M128 -4 C100 18 78 14 58 40 S28 52 8 76" stroke="#5a3a32" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M92 14 C80 28 74 30 64 44" stroke="#5a3a32" stroke-width="1.8" fill="none"/><path d="M60 42 C56 56 44 60 36 70" stroke="#5a3a32" stroke-width="1.4" fill="none"/>'
    pts=[(100,6),(88,14),(76,24),(66,34),(56,44),(46,52),(36,62),(22,72),(98,18),(84,28),(70,40),(52,56),(14,80),(106,12),(60,50)]
    for (x,y) in pts:
        for k in range(5):
            a=k*72;rx=x+3*math.cos(math.radians(a));ry=y+3*math.sin(math.radians(a))
            b+=f'<circle cx="{rx:.1f}" cy="{ry:.1f}" r="2.6" fill="{r.choice(["#ff9fba","#ffb7cc","#ffd0de"])}"/>'
        b+=f'<circle cx="{x}" cy="{y}" r="1.2" fill="#fff4f6"/>'
    for _ in range(26):
        x=r.uniform(0,120);y=r.uniform(40,150);b+=f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="1.8" ry="1" fill="{r.choice(["#ff9fba","#ffc1d3","#ffe0ea"])}" transform="rotate({r.randint(0,180)} {x:.1f} {y:.1f})" opacity=".9"/>'
    return wrap(i,b,d)
def bintang(i):
    r=R(21); d=grad(f'g{i}','#050f26','#14507a',0,1,'#0d2c55')
    b=f'<rect width="120" height="160" fill="url(#g{i})"/>'+stars(r,90,0,110,rr=(.3,1))
    b+='<path d="M20 14 L52 40" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".9"/><circle cx="20" cy="14" r="1.6" fill="#fff"/><path d="M84 6 L104 22" stroke="#bfe6ff" stroke-width=".7" opacity=".8"/><circle cx="84" cy="6" r="1.2" fill="#fff"/>'
    b+='<path d="M0 112 L22 88 L40 104 L66 76 L92 102 L120 84 V160 H0Z" fill="#0b2a47"/><path d="M0 128 L28 108 L54 124 L84 104 L120 126 V160 H0Z" fill="#071a2d"/>'
    b+='<ellipse cx="60" cy="140" rx="48" ry="6" fill="#2a7fb0" opacity=".5"/>'
    for x in (10,22,34,96,108):
        b+=f'<path d="M{x} 160 l-5 -16 h3 l-3 -9 h3 l-3 -8 l8 17 h-3 l3 9 h3Z" fill="#03101c"/>'
    return wrap(i,b,d)
def musim(i):
    d=grad(f'g{i}','#56b9ff','#d4f0ff',0,1)
    b=f'<rect width="120" height="160" fill="url(#g{i})"/>'
    def cum(x,y,s): return f'<g transform="translate({x} {y}) scale({s})" fill="#fff"><circle cx="0" cy="0" r="9"/><circle cx="11" cy="-4" r="12"/><circle cx="24" cy="0" r="9"/><circle cx="12" cy="4" r="9"/></g>'
    b+=cum(8,34,1.1)+cum(66,58,.9)+cum(30,92,.7)
    b+='<path d="M0 108 Q30 90 62 104 T120 98 V160H0Z" fill="#7ad87f"/><path d="M0 124 Q35 108 70 122 T120 116 V160H0Z" fill="#4cc06c"/><path d="M0 142 Q40 128 80 140 T120 136 V160H0Z" fill="#2fa05a"/>'
    b+='<path d="M52 160 Q60 140 82 128" stroke="#f3e2b3" stroke-width="4" fill="none" opacity=".85"/><rect x="84" y="118" width="12" height="8" fill="#fff"/><path d="M82 118 L90 111 L98 118Z" fill="#e0553d"/>'
    return wrap(i,b,d)
def neon(i):
    r=R(31); d=grad(f'g{i}','#071d24','#0c3a46',0,1)+f'<filter id="n{i}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>'
    b=f'<rect width="120" height="160" fill="url(#g{i})"/>'
    b+=f'<g filter="url(#n{i})"><rect x="14" y="30" width="30" height="8" rx="2" fill="#ff5c8a"/><rect x="70" y="50" width="34" height="6" rx="2" fill="#29e0e8"/><rect x="26" y="76" width="22" height="22" rx="3" fill="#ffb347"/><rect x="78" y="88" width="26" height="8" rx="2" fill="#ff5c8a"/></g>'
    b+='<rect x="14" y="30" width="30" height="8" rx="2" fill="none" stroke="#ffd1de" stroke-width=".6"/><rect x="70" y="50" width="34" height="6" rx="2" fill="none" stroke="#d2fbff" stroke-width=".6"/><rect x="26" y="76" width="22" height="22" rx="3" fill="none" stroke="#fff0cf" stroke-width=".6"/>'
    b+='<rect y="118" width="120" height="42" fill="#06151b"/><rect x="0" y="118" width="120" height="1" fill="#29e0e8" opacity=".6"/>'
    b+='<rect x="14" y="122" width="30" height="10" fill="#ff5c8a" opacity=".25"/><rect x="70" y="122" width="34" height="14" fill="#29e0e8" opacity=".22"/>'
    for _ in range(46):
        x=r.uniform(0,120);y=r.uniform(-10,150);b+=f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x-1.2:.1f}" y2="{y+7:.1f}" stroke="#bfeaf2" stroke-width=".35" opacity="{r.uniform(.25,.6):.2f}"/>'
    return wrap(i,b,d)
ANIME=[('Langit senja',senja),('Kota malam',kota),('Sakura',sakura),('Bintang jatuh',bintang),('Musim panas',musim),('Hujan neon',neon)]

# ---------- POLA ----------
def organik(i,vh,full):
    k=vh/2435.0
    def c(cx,cy,r,col): return f'<circle cx="{cx}" cy="{cy*k:.0f}" r="{r}" style="fill:{col}"/>'
    p='#efc7b2'
    b=f'<rect width="1125" height="{vh}" style="fill:var(--ej-cv)"/>'
    b+=c(855,60,270,f'color-mix(in srgb,{p} 46%,var(--ej-cv))')+c(1125,135,175,'color-mix(in srgb,var(--ej-pr) 52%,var(--ej-cv))')+c(0,1020,150,'color-mix(in srgb,var(--ej-pr) 40%,var(--ej-cv))')+c(1125,1240,200,f'color-mix(in srgb,{p} 38%,var(--ej-cv))')+c(0,1820,120,'color-mix(in srgb,var(--ej-pr) 32%,var(--ej-cv))')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1125 {vh}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">{b}</svg>'
def px(body,defs=''): return f'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs>{defs}</defs>{body}</svg>'
def vb(body,w,h): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">{body}</svg>'
def patp(base,defs,i): return px(f'<rect width="100%" height="100%" fill="{base}"/><rect width="100%" height="100%" fill="url(#p{i})"/>',defs)
def titik(i,full):
    s=16 if full else 8; r=1.6 if full else 1
    return patp('#f3f4f6',f'<pattern id="p{i}" width="{s}" height="{s}" patternUnits="userSpaceOnUse"><circle cx="{s/2}" cy="{s/2}" r="{r}" fill="#9aa3b2"/></pattern>',i)
def garis(i,full):
    s=14 if full else 7
    return patp('#10241f',f'<pattern id="p{i}" width="{s}" height="{s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="{2 if full else 1}" height="{s}" fill="#1f4a3e"/></pattern>',i)
def kisi(i,full):
    s=36 if full else 12
    return patp('#eef3f8',f'<pattern id="p{i}" width="{s}" height="{s}" patternUnits="userSpaceOnUse"><path d="M{s} 0H0V{s}" fill="none" stroke="#b9c8da" stroke-width="{1 if full else .5}"/></pattern>',i)
def heksa(i,full):
    k=2.4 if full else 1
    return patp('#e9efe9',f'<pattern id="p{i}" width="{14*k:.1f}" height="{24.2*k:.1f}" patternUnits="userSpaceOnUse"><path transform="scale({k})" d="M7 0 L14 4 V12 L7 16 L0 12 V4Z M0 16 V20 L7 24 L14 20 V16" fill="none" stroke="#a9c1b0" stroke-width=".6"/></pattern>',i)
def gelombang(i,full):
    W,H,n,st=(390,844,40,22) if full else (120,160,14,11)
    b=f'<rect width="{W}" height="{H}" fill="#0d2233"/>'
    for k in range(n):
        y=(8 if not full else 14)+k*st;a=W/8
        b+=f'<path d="M0 {y} Q{a:.0f} {y-st*.55:.1f} {2*a:.0f} {y} T{4*a:.0f} {y} T{6*a:.0f} {y} T{8*a:.0f} {y}" fill="none" stroke="#2c6d8f" stroke-width="{1.1 if full else .7}" opacity="{min(.8,.3+.4*k/n):.2f}"/>'
    return vb(b,W,H)
def topo(i,full):
    W,H=(390,844) if full else (120,160); s=H/160.0; cx,cy=W/2,H/2
    b=f'<rect width="{W}" height="{H}" fill="#f1ede2"/>'
    for k in range(1,(18 if full else 11)):
        sc=7*s*(11.0/(18 if full else 11)) if full else 7
        rx=(sc*k)*(W/120.0 if full else 1)*(0.62 if full else 1);ry=(9*k*s*(11.0/18)) if full else 9*k
        b+=f'<path d="M{cx-rx:.1f} {cy:.1f} C{cx-rx:.1f} {cy-ry*1.2:.1f} {cx+rx*.4:.1f} {cy-ry*1.1:.1f} {cx+rx:.1f} {cy-ry*.2:.1f} S{cx+rx*.6:.1f} {cy+ry:.1f} {cx-rx*.2:.1f} {cy+ry:.1f} S{cx-rx:.1f} {cy+ry*.5:.1f} {cx-rx:.1f} {cy:.1f}Z" fill="none" stroke="#b49c74" stroke-width="{1 if full else .55}" opacity=".75" transform="translate({k*(2 if full else .6)} {-k*(1.5 if full else .4)})"/>'
    return vb(b,W,H)
def candle(i,full):
    r=R(41);W,H=(390,844) if full else (120,160);cw,gap=(8,15) if full else (4,7);b=f'<rect width="{W}" height="{H}" fill="#0e1218"/>';x=4;y=H*.62;sc=H/160.0
    while x<W-4:
        y+=r.uniform(-9,8)*sc;y=max(40*sc,min(130*sc,y));h=r.uniform(8,22)*sc;up=r.random()>.45;c='#2ecf8f' if up else '#ff5c78'
        b+=f'<line x1="{x+cw/2}" y1="{y-h*.7:.1f}" x2="{x+cw/2}" y2="{y+h*1.3:.1f}" stroke="{c}" stroke-width="{1.2 if full else .6}" opacity=".5"/><rect x="{x}" y="{y:.1f}" width="{cw}" height="{h:.1f}" fill="{c}" opacity=".45"/>';x+=gap
    return vb(b,W,H)
POLA=[('Organik hijau','a',organik),('Titik','l',titik),('Garis','d',garis),('Kisi','l',kisi),('Heksagon','l',heksa),('Gelombang','d',gelombang),('Topografi','l',topo),('Candlestick','d',candle)]
TONE={'Putih':'l','Abu terang':'l','Hitam':'d','Navy':'d','Hijau tua':'d','Krem':'l','Biru langit':'l','Cokelat':'d',
'Pasir':'l','Batu':'m','Terracotta':'m','Sage':'m','Arang':'d','Tulang':'l',
'Aurora':'d','Senja kaca':'m','Laut':'d','Mint':'l','Embun':'l','Malam kaca':'d',
'Langit senja':'m','Kota malam':'d','Sakura':'l','Bintang jatuh':'d','Musim panas':'m','Hujan neon':'d'}
import json,os
rows=[]
for n,c1,c2 in DASAR: rows.append(['dasar',n,TONE[n],dasar('@',c1,c2),0])
for n,c1,c2 in DOFF: rows.append(['doff',n,TONE[n],doff('@',c1,c2),0])
for n,b1,b2,o in KACA: rows.append(['kaca',n,TONE[n],kaca('@',b1,b2,o),0])
for n,f in ANIME: rows.append(['anime',n,TONE[n],f('@'),0])
for n,t,f in POLA:
    if f is organik: rows.append(['pola',n,t,f('@',1500,False),f('@',2435,True)])
    else: rows.append(['pola',n,t,f('@',False),f('@',True)])
out='/* Dibuat oleh docs/gen-wallpapers.py: jangan diedit langsung. [kategori, nama, nada, thumbnail, layar penuh|0] */\nwindow.EJ_WP='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n'
open('js/lib/wallpapers.js','w').write(out)
print(len(out),'bytes',len(rows),'rows')
