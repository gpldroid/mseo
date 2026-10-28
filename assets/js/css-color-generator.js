(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const base = $('color-base'), hex = $('color-hex'), end = $('gradient-end'), endHex = $('gradient-end-hex');
  const angle = $('gradient-angle'), harmony = $('color-harmony');
  const cleanHex = (value) => {
    let v = value.trim().replace(/^#/, '');
    if (!/^[\da-f]{6}$/i.test(v)) return null;
    return '#' + v.toUpperCase();
  };
  const toRgb = (h) => {
    const v = h.slice(1);
    return { r: parseInt(v.slice(0,2),16), g: parseInt(v.slice(2,4),16), b: parseInt(v.slice(4,6),16) };
  };
  const toHsl = (h) => {
    const {r:R,g:G,b:B}=toRgb(h), r=R/255,g=G/255,b=B/255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
    let hue=0, sat=0, light=(max+min)/2;
    if(d){sat=d/(1-Math.abs(2*light-1));switch(max){case r:hue=((g-b)/d)%6;break;case g:hue=(b-r)/d+2;break;default:hue=(r-g)/d+4;}hue=Math.round(hue*60);if(hue<0)hue+=360;}
    return {h:hue,s:Math.round(sat*100),l:Math.round(light*100)};
  };
  const hslHex = (h,s,l) => {
    s/=100;l/=100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
    let rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
    return '#'+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,'0')).join('').toUpperCase();
  };
  function paletteFor(color){
    const hsl=toHsl(color);
    if(harmony.value==='complementary') return [hslHex(hsl.h, hsl.s,hsl.l),hslHex((hsl.h+180)%360,hsl.s,hsl.l),hslHex(hsl.h,hsl.s,Math.min(92,hsl.l+24)),hslHex((hsl.h+180)%360,hsl.s,Math.max(10,hsl.l-20)),hslHex((hsl.h+12)%360,Math.min(100,hsl.s+8),hsl.l)];
    if(harmony.value==='triadic') return [0,120,240,30,180].map((shift)=>hslHex((hsl.h+shift)%360,hsl.s,shift===30?Math.min(85,hsl.l+10):hsl.l));
    if(harmony.value==='monochromatic') return [18,32,46,60,74].map((shift)=>hslHex(hsl.h,hsl.s,Math.max(8,Math.min(94,hsl.l+(shift-46)*1.35))));
    return [-35,-18,0,18,35].map(shift=>hslHex((hsl.h+shift+360)%360,hsl.s,Math.max(10,Math.min(90,hsl.l+(shift===0?0:shift>0?5:-5)))));
  }
  function contrastText(color){const {r,g,b}=toRgb(color);const luminance=(0.2126*r+0.7152*g+0.0722*b)/255;return luminance>0.58?'#172033':'#FFFFFF';}
  function render(){
    const c=cleanHex(base.value), e=cleanHex(end.value);
    if(!c||!e){$('color-status').textContent='أدخل قيم HEX صحيحة من ست خانات.';return;}
    hex.value=c;endHex.value=e;
    const gradient='linear-gradient('+angle.value+'deg, '+c+', '+e+')';
    $('gradient-angle-value').textContent=angle.value+'°';
    $('color-gradient-preview').style.background=gradient;
    $('gradient-code').textContent='background: '+gradient+';';
    const colors=paletteFor(c);
    $('color-palette').replaceChildren();
    colors.forEach(color=>{
      const card=document.createElement('div');card.className='color-swatch';
      const swatch=document.createElement('button');swatch.type='button';swatch.className='color-swatch-chip';swatch.style.background=color;swatch.setAttribute('aria-label','نسخ اللون '+color);swatch.title='اضغط لنسخ '+color;
      swatch.addEventListener('click',()=>copyText(color));
      const label=document.createElement('code');label.textContent=color;
      const rgb=toRgb(color),hsl=toHsl(color);
      const detail=document.createElement('small');detail.textContent='RGB '+rgb.r+', '+rgb.g+', '+rgb.b+' · HSL '+hsl.h+', '+hsl.s+'%, '+hsl.l+'%';
      card.append(swatch,label,detail);$('color-palette').append(card);
    });
    const rgb=toRgb(c), hsl=toHsl(c);
    $('color-values').innerHTML='';
    [['HEX',c],['RGB',`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],['HSL',`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`]].forEach(([label,value])=>{
      const row=document.createElement('div');row.className='color-code-row';
      const text=document.createElement('code');text.textContent=label+': '+value;
      const button=document.createElement('button');button.type='button';button.className='seo-button';button.textContent='نسخ';button.addEventListener('click',()=>copyText(value));
      row.append(text,button);$('color-values').append(row);
    });
    $('color-demo').style.setProperty('--demo-color',c);
    $('color-demo').style.setProperty('--demo-text',contrastText(c));
    $('color-status').textContent='تم تحديث اللوحة والمعاينة.';
    $('color-status').classList.add('is-success');$('color-status').classList.remove('is-error');
  }
  async function copyText(value){
    try{await navigator.clipboard.writeText(value);$('color-status').textContent='تم النسخ إلى الحافظة.';}
    catch{$('color-status').textContent='تعذر النسخ التلقائي. انسخ القيمة يدويًا: '+value;}
  }
  base.addEventListener('input',()=>{hex.value=base.value.toUpperCase();render();});
  end.addEventListener('input',()=>{endHex.value=end.value.toUpperCase();render();});
  hex.addEventListener('change',()=>{const v=cleanHex(hex.value);if(!v){$('color-status').textContent='قيمة HEX غير صحيحة؛ استخدم ست خانات مثل #3156D9.';return;}base.value=v;hex.value=v;render();});
  endHex.addEventListener('change',()=>{const v=cleanHex(endHex.value);if(!v){$('color-status').textContent='قيمة HEX غير صحيحة؛ استخدم ست خانات مثل #48D4C8.';return;}end.value=v;endHex.value=v;render();});
  [angle,harmony].forEach(el=>el.addEventListener('input',render));
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',()=>copyText($(button.dataset.copy).textContent)));
  $('color-random').addEventListener('click',()=>{const random=()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0');base.value='#'+[random(),random(),random()].join('');hex.value=base.value.toUpperCase();render();});
  $('color-reset').addEventListener('click',()=>{base.value='#3156d9';hex.value='#3156D9';end.value='#48d4c8';endHex.value='#48D4C8';angle.value=135;harmony.value='analogous';render();});
  render();
})();