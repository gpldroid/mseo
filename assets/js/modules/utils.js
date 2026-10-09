export const $=(selector,root=document)=>root.querySelector(selector);
export const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));

export const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,char=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

export const storage={
  get(key){try{return globalThis.localStorage?.getItem(key)??null}catch{return null}},
  set(key,value){try{globalThis.localStorage?.setItem(key,String(value));return true}catch{return false}},
  remove(key){try{globalThis.localStorage?.removeItem(key);return true}catch{return false}}
};

export const articleURL=(article,root="")=>{
  const file=String(article?.file??"").replace(/^\\/+/, "");
  return file && !file.split("/").some(part=>part===".."||part===".")
    ? root+"articles/"+file
    : root+"articles/";
};

export function safeText(node,value){if(node)node.textContent=String(value??"")}

export function announce(container,message){
  if(!container)return;
  const status=document.createElement("p");
  status.className="site-empty";
  status.setAttribute("role","status");
  status.textContent=String(message??"");
  container.replaceChildren(status);
}

export function onReady(callback){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",callback,{once:true});
  else callback();
}
