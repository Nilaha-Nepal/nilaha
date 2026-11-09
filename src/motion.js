import {useEffect} from 'react';
import {gsap} from 'gsap';
export function usePageMotion(route){
 useEffect(()=>{
  // Never hide content when motion APIs are unavailable or animation is unwanted.
  if(!window.matchMedia||!window.IntersectionObserver||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let disposed=false,context,media;
  import('gsap/ScrollTrigger').then(plugin=>{
   if(disposed)return;
   const ScrollTrigger=plugin.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   media=gsap.matchMedia();
   media.add('(prefers-reduced-motion: no-preference)',()=>{
    context=gsap.context(()=>{
     const arrivalDelay=document.documentElement.classList.contains('page-arriving') ? .24 : 0;
     const intro=document.querySelector('.hub-heading, .page-intro .container');
     if(intro)gsap.fromTo([...intro.children],{y:18,opacity:0},{y:0,opacity:1,duration:.7,delay:arrivalDelay,stagger:.075,ease:'power2.out',clearProps:'transform,opacity'});
     const picture=document.querySelector('.hero-visual');
     if(picture)gsap.fromTo(picture,{y:22,opacity:0},{y:0,opacity:1,duration:.95,delay:.12,ease:'power2.out',clearProps:'transform,opacity'});
     const targets=document.querySelectorAll('main .hub-task, main .hub-panel, main .resource-list > a, main .hub-bottom, main .request-guidance, main .section-heading, main .path-card, main .care-grid > div, main .article-card, main .community-banner, main .tool-strip, main .helpline-card, main .request-panel, main .profile-card, main .reading > section, main .principle, main .about-grid > div');
     targets.forEach(el=>gsap.fromTo(el,{y:24,opacity:0},{y:0,opacity:1,duration:.7,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:el,start:'top 94%',once:true}}));
    },document.querySelector('main'));
    return()=>context?.revert();
   });
   document.fonts?.ready.then(()=>{if(!disposed)ScrollTrigger.refresh()});
  }).catch(()=>{});
  return()=>{disposed=true;media?.revert();context?.revert()};
 },[route]);
}
