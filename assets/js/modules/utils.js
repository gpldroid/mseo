export const $=(selector,root=document)=>root.querySelector(selector);
export const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
export const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
export const storage={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}};
export const articleURL=(article,root="")=>root+"articles/"+article.file;
export function safeText(node,value){if(node)node.textContent=value}
export function announce(container,message){if(container)container.innerHTML='<p class="site-empty" role="status"></p>';const status=container?.querySelector('[role="status"]');safeText(status,message)}
