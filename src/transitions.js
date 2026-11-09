import {gsap} from 'gsap';
export const TRANSITION_KEY='nilaha-page-transition';
const labels={'/':'Support hub','/helplines/':'Helplines','/request-support/':'Request support','/counsellors/':'Counselling','/children/':'Children & families','/articles/':'Guides & resources','/support-someone/':'Help someone else','/about/':'About Nilaha','/privacy/':'Privacy & safety','/help/':'Get help'};
export function canTransition(event,link,currentURL){
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!link||link.hasAttribute('download')||link.hasAttribute('data-no-transition')||(link.target&&link.target!=='_self'))return false;
 const url=new URL(link.href,currentURL),current=new URL(currentURL);
 if(url.origin!==current.origin||!['https:','http:'].includes(url.protocol)||url.pathname.startsWith('/calculator'))return false;
 if(url.pathname===current.pathname&&url.search===current.search)return false;
 return true;
}
export function installPageTransitions({navigate=url=>window.location.assign(url)}={}){
 if(!window.matchMedia||window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.remove('page-arriving');return()=>{}};
 const sheet=document.getElementById('page-transition'),label=sheet?.querySelector('[data-transition-label]');
 if(!sheet||!label)return()=>{};
 const content=document.querySelector('.workspace');
 let busy=false,failsafe;
 const reset=()=>{clearTimeout(failsafe);busy=false;gsap.killTweensOf(sheet);gsap.killTweensOf(label);if(content){gsap.killTweensOf(content);gsap.set(content,{clearProps:'transform,opacity'})}gsap.set(sheet,{yPercent:130});gsap.set(label,{opacity:0,y:0});document.documentElement.classList.remove('page-arriving');};
 if(document.documentElement.classList.contains('page-arriving')){
  label.textContent=document.title.replace(/ — Nilaha$/, '');
  gsap.set(sheet,{yPercent:0});gsap.set(label,{opacity:1,y:0});
  gsap.to(label,{opacity:0,y:-12,duration:.18,ease:'power2.in'});
  gsap.to(sheet,{yPercent:-130,duration:.56,delay:.04,ease:'power3.inOut',onComplete:reset});
 }
 const click=event=>{
  if(preference.matches)return;
  const link=event.target.closest?.('a');
  // Phone, message and quick-exit actions always cancel a pending decorative transition.
  if(event.target.closest?.('.quick-exit')||(link&&/^(tel:|sms:|mailto:)/i.test(link.getAttribute('href')||''))){reset();try{sessionStorage.removeItem(TRANSITION_KEY)}catch{}return;}
  if(!canTransition(event,link,window.location.href))return;
  if(busy){event.preventDefault();return;}
  const url=new URL(link.href,window.location.href),path=url.pathname+url.search;
  const title=labels[url.pathname]||link.querySelector('h2,h3')?.textContent||link.textContent.trim().slice(0,60)||'Nilaha';
  // If storage is unavailable, retain ordinary instant document navigation.
  try{sessionStorage.setItem(TRANSITION_KEY,JSON.stringify({path,at:Date.now(),label:title}))}catch{return;}
  event.preventDefault();busy=true;clearTimeout(failsafe);
  label.textContent=title;
  gsap.killTweensOf(sheet);gsap.set(sheet,{yPercent:130});gsap.set(label,{opacity:0,y:18});
  if(content)gsap.to(content,{y:-24,duration:.4,ease:'power2.inOut'});
  gsap.to(label,{opacity:1,y:0,duration:.2,delay:.16,ease:'power2.out'});
  gsap.to(sheet,{yPercent:0,duration:.42,ease:'power3.inOut',onComplete:()=>{navigate(url.href);failsafe=setTimeout(reset,2200)}});
 };
 const restore=()=>{reset();try{sessionStorage.removeItem(TRANSITION_KEY)}catch{}};
 const onPageShow=event=>{if(event.persisted)restore()};
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 const change=event=>{if(event.matches)restore()};
 document.addEventListener('click',click,true);window.addEventListener('pageshow',onPageShow);preference.addEventListener?.('change',change);
 return()=>{document.removeEventListener('click',click,true);window.removeEventListener('pageshow',onPageShow);preference.removeEventListener?.('change',change);reset();};
}
