(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = ['x','y','blur','spread','opacity'];
  const presets = {
    soft:{x:0,y:8,blur:24,spread:-2,opacity:14,color:'#18233a',inset:false},
    float:{x:0,y:18,blur:36,spread:-5,opacity:24,color:'#18233a',inset:false},
    subtle:{x:0,y:2,blur:8,spread:-2,opacity:12,color:'#172033',inset:false},
    card:{x:0,y:12,blur:28,spread:-6,opacity:18,color:'#263858',inset:false},
    glow:{x:0,y:0,blur:30,spread:2,opacity:35,color:'#647dff',inset:false},
    inset:{x:0,y:3,blur:10,spread:0,opacity:22,color:'#18233a',inset:true}
  };
  function hexToRgba(hex, opacity) {
    const value=hex.replace('#','');
    if(!/^[0-9a-f]{6}$/i.test(value)) return null;
    return 'rgba('+parseInt(value.slice(0,2),16)+', '+parseInt(value.slice(2,4),16)+', '+parseInt(value.slice(4,6),16)+', '+(opacity/100).toFixed(2)+')';
  }
  function render() {
    const hex=$('shadow-color-hex').value.trim();
    const color=hexToRgba(hex,$('shadow-opacity').value);
    if(!color){$('shadow-status').textContent='أدخل لون HEX صحيحًا مثل #18233A.';return;}
    $('shadow-color').value='#'+hex.replace('#','');
    const values={x:+$('shadow-x').value,y:+$('shadow-y').value,blur:+$('shadow-blur').value,spread:+$('shadow-spread').value,opacity:+$('shadow-opacity').value};
    fields.forEach(key=>$( 'shadow-'+key+'-value').textContent=values[key]+(key==='opacity'?'%':'px'));
    const inset=$('shadow-inset').checked?'inset ':'';
    const shadow=inset+values.x+'px '+values.y+'px '+values.blur+'px '+values.spread+'px '+color;
    $('shadow-preview').style.boxShadow=shadow;
    $('shadow-code').value='box-shadow: '+shadow+';';
    $('shadow-status').textContent='تم تحديث المعاينة والكود.';
    $('shadow-status').classList.add('is-success');$('shadow-status').classList.remove('is-error');
  }
  function applyPreset(name) {
    const p=presets[name];if(!p)return;
    fields.forEach(key=>{if(p[key]!==undefined)$('shadow-'+key).value=p[key];});
    $('shadow-color').value=p.color;$('shadow-color-hex').value=p.color.toUpperCase();$('shadow-inset').checked=p.inset;render();
  }
  fields.forEach(key=>$('shadow-'+key).addEventListener('input',render));
  $('shadow-color').addEventListener('input',()=>{$('shadow-color-hex').value=$('shadow-color').value.toUpperCase();render();});
  $('shadow-color-hex').addEventListener('change',()=>{const h=$('shadow-color-hex').value.trim();if(!hexToRgba(h,100)){$('shadow-status').textContent='قيمة HEX غير صحيحة؛ استخدم ست خانات مثل #18233A.';return;}$('shadow-color-hex').value='#'+h.replace('#','').toUpperCase();$('shadow-color').value=$('shadow-color-hex').value;render();});
  $('shadow-inset').addEventListener('change',render);
  $('shadow-preset-soft').addEventListener('click',()=>applyPreset('soft'));
  $('shadow-preset-float').addEventListener('click',()=>applyPreset('float'));
  document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>applyPreset(button.dataset.preset)));
  $('shadow-reset').addEventListener('click',()=>applyPreset('soft'));
  $('shadow-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('shadow-code').value);$('shadow-status').textContent='تم نسخ كود CSS.';}catch{$('shadow-code').focus();$('shadow-code').select();$('shadow-status').textContent='تعذر النسخ التلقائي؛ حُدد الكود لنسخه يدويًا.';}});
  applyPreset('soft');
})();