import React, {useEffect, useRef, useState} from 'react';
import {ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, ClipboardCheck, HeartHandshake, House, MapPin, MessageCircle, Phone, Shield, TriangleAlert, Users, CircleHelp, Download} from 'lucide-react';

const situations = [
  [TriangleAlert, 'Someone is controlling or threatening me', 'It could be a sign of controlling behavior.', 'You can start by thinking about which choices you want support with.', '/plan/', 'Explore safer next steps', 'coral'],
  [House, 'I feel unsafe at home or elsewhere', 'Find someone you can speak to.', 'Explore the available services and choose how you would like to reach them.', '/helplines/', 'Find support', 'teal'],
  [Users, 'I’m worried about someone else', 'Support someone you care about.', 'Explore ways to listen and share options with someone you trust.', '/support-someone/', 'Explore the guide', 'indigo'],
  [MessageCircle, 'I need someone to talk to', 'Prepare for a conversation.', 'Explore questions you can ask before speaking with a counsellor.', '/articles/first-conversation/', 'Read the guide', 'ochre'],
  [CircleHelp, 'I’m not sure what’s happening', 'You can start with a question.', 'Browse short guides about getting support, counselling and digital privacy.', '/articles/', 'Learn & recognize', 'plum'],
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
        <button className="situation-back" onClick={()=>setChoice(null)}><ChevronLeft size={18}/>Back to situations</button>
        <h2 tabIndex={-1}>{selected[2]}</h2>
        <p>{selected[3]}</p>
        {!embedded && <img className="flow-picture" src="/art/welcome.jpg" alt=""/>}
        <a className="flow-row" href="/articles/finding-support/"><BookOpen/>Finding support, one step at a time<ChevronRight/></a>
        <a className="button flow-action" href={selected[4]}>{selected[5]}<ArrowRight/></a>
      </div> : <div key="choices" className={lastChoice.current === null ? undefined : 'situation-return'}>
        {situations.map(([Icon,label,,,,,color],i)=><button key={label} className="flow-row" data-tone={color} onClick={()=>{lastChoice.current=i;setChoice(i)}}><Icon/>{label}<ChevronRight/></button>)}
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
