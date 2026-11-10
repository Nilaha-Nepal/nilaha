import React, {useEffect, useRef, useState} from 'react';
import {ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, ClipboardCheck, HeartHandshake, House, MapPin, MessageCircle, Phone, Shield, TriangleAlert, Users, CircleHelp, Download} from 'lucide-react';

const talk = {label:'Talk to someone', href:'/request-support/', icon:MessageCircle};
const message = {label:'Send us a message', href:'/request-support/', icon:MessageCircle};
const helpline = {label:'Call 1145', href:'tel:1145', icon:Phone};

const situations = [
  {
    icon:TriangleAlert, tone:'coral', label:"Someone is controlling or threatening me",
    title:"If someone is controlling or threatening you",
    paragraphs:["If someone checks your messages without permission, decides who you can see, or threatens you when you disagree, it can be a sign of controlling behavior. You might find yourself changing everyday plans because you’re worried about their reaction.", "You can talk about one thing that happened, even if you’re still figuring out how you feel about it. You choose what to share."],
    actions:[{label:"Read other stories", href:"#", icon:ArrowRight}, talk]
  },
  {
    icon:House, tone:'teal', label:"I feel unsafe at home or at work",
    title:"If you feel unsafe at home or at work",
    paragraphs:["At home, someone might block the doorway during an argument or make you afraid to say no. At work, unwanted touching, repeated comments, or threats about your shifts can leave you feeling unsafe.", "If you want support now, you can choose a helpline to call. If you’d prefer a conversation later, tell us how and when it feels safe to reach you."],
    actions:[{label:"Find support", href:"/helplines/", icon:ArrowRight}, talk]
  },
  {
    icon:Users, tone:'indigo', label:"I’m worried about someone else",
    title:"Support someone you care about",
    paragraphs:["If someone you care about seems worried or withdrawn, you can start by asking how they’re doing and giving them time to answer. If you’d like help thinking through what to say, tell us a little about your concern. You can leave out their name."],
    actions:[message]
  },
  {
    icon:MessageCircle, tone:'ochre', label:"I need someone to talk to",
    title:"If you’re looking for someone to talk to",
    paragraphs:["We’re here to help you find someone who will listen. Explore counselling options or call Nepal’s National Women Commission helpline for support with gender-based violence."],
    actions:[{label:'Talk to a counsellor', href:'/counsellors/', icon:Users}, {label:'Anonymous peer chat', href:'#', icon:MessageCircle}, helpline]
  },
  {
    icon:CircleHelp, tone:'plum', label:"I’m not sure what’s happening",
    title:"Not sure what’s happening?",
    paragraphs:["You can start with a question, even if you don’t know how to describe what happened. Send us a message in your own words, or call the National Women Commission helpline if you have a question about violence or threats."],
    actions:[message, helpline]
  },
];

function JourneyFrame({title, description, children, step, back, embedded=false}) {
  const intro = <><h1>{title}</h1><p>{description}</p></>;
  return <section className="flow-frame">
    {(!embedded || back) && <div className="flow-bar">{back ? <button onClick={back} aria-label="Back to situations"><ChevronLeft/></button> : <a href="/" aria-label="Back to home"><ChevronLeft/></a>}
      <div className="flow-dots" aria-hidden="true">{[0,1,2].map(i=><i key={i} className={i===step?'current':''}/>)}</div>
    </div>}
    {embedded && !back ? <div className="situation-intro">{intro}</div> : intro}
    {children}
  </section>;
}

export function SituationNavigator({embedded=false}) {
  const [choice,setChoice]=useState(null);
  const lastChoice = useRef(null);
  const panel = useRef(null);
  useEffect(() => {
    if (lastChoice.current === null) return;
    const target = choice === null
      ? panel.current.querySelectorAll('button.flow-row')[lastChoice.current]
      : panel.current.querySelector('h2');
    target?.focus({preventScroll:true});
  }, [choice]);
  const selected = situations[choice];
  return <JourneyFrame embedded={embedded} title="What would you like help with today?" description="Choose the option that feels closest to your situation. You can explore anonymously." step={selected ? 1 : 0}>
    <div className="situation-panel" ref={panel}>
      {selected ? <div key="detail" className="situation-detail">
        <button className="situation-back" onClick={()=>setChoice(null)}><ChevronLeft size={18} aria-hidden="true"/>Back to situations</button>
        <h2 tabIndex={-1}>{selected.title}</h2>
        {selected.paragraphs.map(text=><p key={text}>{text}</p>)}
        {!embedded && <img className="flow-picture" src="/art/welcome.jpg" alt=""/>}
        <div className="situation-actions">
          {selected.actions.map(({label,href,icon:Icon},index)=>
            <a key={href} className={'button'+(index?' secondary':'')} href={href} aria-disabled={href === '#' || undefined}
              onClick={href === '#' ? event => event.preventDefault() : undefined}><Icon size={17}/>{label}</a>
          )}
        </div>
      </div> : <div key="choices" className={lastChoice.current === null ? undefined : 'situation-return'}>
        {situations.map(({icon:Icon,label,tone},i)=><button key={label} className="flow-row" data-tone={tone} onClick={()=>{lastChoice.current=i;setChoice(i)}}><Icon/>{label}<ChevronRight/></button>)}
      </div>}
    </div>
  </JourneyFrame>;
}

const fields=[[Phone,'Trusted contacts','People you can reach out to'],[MapPin,'Safer places','Places you can go if needed'],[ClipboardCheck,'My next steps','A few actions you can take now']];
export function SafetyPlan() {
  const [notes,setNotes]=useState(['','','']),[ready,setReady]=useState(false);
  function download(){
    const body=fields.map(([,title],i)=>notes[i].trim()?title+'\n'+notes[i].trim():'').filter(Boolean).join('\n\n');
    const url=URL.createObjectURL(new Blob(['My Safety Plan\n\n'+body],{type:'text/plain'}));
    const link=document.createElement('a');link.href=url;link.download='my-plan.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <JourneyFrame title="My Safety Plan" description="Choose what to include. Your notes stay on this page and clear when you leave or refresh." step={1}>
    {fields.map(([Icon,title,hint],i)=>ready ? notes[i].trim()&&<section className="plan-summary" key={title}><h2><Icon/>{title}</h2><p>{notes[i]}</p></section> :
      <details className="plan-field" key={title}><summary><Icon/><span><strong>{title}</strong><small>{hint}</small></span><ChevronRight/></summary>
        <textarea aria-label={title} value={notes[i]} onChange={e=>setNotes(notes.map((v,j)=>i===j?e.target.value:v))} maxLength={3000}/></details>)}
    {ready ? <><p className="micro">Downloading leaves a file on this device.</p><button className="button flow-action" onClick={download}><Download/>Download my plan</button><button className="flow-row" onClick={()=>setReady(false)}>Edit my plan<ChevronRight/></button></> :
      <button className="button flow-action" disabled={!notes.some(v=>v.trim())} onClick={()=>setReady(true)}>Create my plan<Check/></button>}
    <a className="flow-row" href="/helplines/"><HeartHandshake/>Find support<ChevronRight/></a>
  </JourneyFrame>;
}
