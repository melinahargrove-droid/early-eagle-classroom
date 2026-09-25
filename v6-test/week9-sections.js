(()=>{
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const p=new URLSearchParams(location.search);
  const day=days.includes(p.get('day'))?p.get('day'):'Monday';
  const view=p.get('view')||'community';
  const meetings={
    Monday:['Star Pose','Gather and settle together. Stretch arms and legs out like a star, breathe, and name a color you notice. Children may choose a seated pose.'],
    Tuesday:['Five Finger Breathing','Trace a finger up and down each finger while breathing slowly. Then share a color noticed indoors or outdoors.'],
    Wednesday:['Magic Ball','Pass an imaginary ball around the circle. Notice and describe the colors children imagine.'],
    Thursday:['Bicycles','Pretend to pedal together. Pause and describe colors you might see along the way.'],
    Friday:['Problem Stories','Use a familiar classroom problem story to listen, name feelings, and practice a helpful response.']
  };
  const centerData=[
    ['Nature Arrangements','Art Studio','Arrange leaves and other natural materials. Notice their colors, shapes, and placement.','assets/focus-3s/unit-2/week-1/centers/nature-arrangements.png'],
    ['Building Autumn Trees','Blocks','Build trees with blocks and loose parts. Look at trunks, branches, and leaves.','assets/focus-3s/unit-2/week-1/centers/building-autumn-trees.png'],
    ['Exploring Fall Texts','Library & Listening','Look closely at fall books and talk about the colors you see.','assets/reading.webp'],
    ['Cooking Soup','Dramatic Play','Pretend to prepare and share soup. Describe the colors of the ingredients.','assets/dramatic-play.webp'],
    ['Playdough Color Mixing','Discovery','Explore what happens when playdough colors are combined.','assets/science.webp'],
    ['Favorite Foods','Writing & Drawing','Draw or write about a food you enjoy and the colors you notice.','assets/writing.webp'],
    ['Autumn Leaves','Building Blocks (Math)','Compare, sort, and make patterns with autumn leaves.','assets/focus-3s/unit-2/week-1/centers/autumn-leaves.png']
  ];
  const card=(title,lead,boxes,img)=>({title,lead,boxes,img});
  const data={
    community:{title:'Community Meeting',sub:'World of Color · '+day, cards:[card(meetings[day][0],meetings[day][1],[['Invite','What colors do we notice all around us?'],['Respond','Welcome words, gestures, pointing, and home-language color words.']],null)]},
    foundational:{title:'Foundational Literacy',sub:'Rhyme · initial sounds · compound words',cards:[card('Listen and Play With Words','Use the current Foundational Literacy routine for this day.',[['Listen','Notice rhyme and initial sounds during familiar songs and words.'],['Blend','Invite children to join two spoken word parts to make a compound word.'],['Teacher note','Use the assigned daily curriculum sequence; this week overview does not specify a letter or day-by-day script.']])]},
    writing:{title:'Writing & Drawing',sub:'Favorite Foods',cards:[card('Favorite Foods','Offer paper and drawing or writing tools during play.',[['Invite','What food do you like? What colors do you notice in it?'],['Document','Record children’s words when they want support. Welcome drawings, marks, and home-language words.']], 'assets/writing.webp')]},
    centers:{title:'Centers & Play',sub:'Offer and follow children’s interests; centers are not assigned by day.',cards:centerData.map(x=>card(x[0],x[2],[['Center',x[1]],['Invitation',x[2]],['Teacher note','Offer this investigation across the week and follow children’s interests.']],x[3]))},
    smallgroups:{title:'Literacy Small Groups',sub:'Responsive groups',cards:[card('Listen, Notice, Respond','Select the group activity that fits children’s current needs.',[['Literacy focus','Rhyme, initial sounds, and compound-word blending.'],['Observation','Notice engagement, language, and how children share their ideas.'],['Teacher note','Use the current small-group lesson plan for exact materials and sequence.']])]},
    building:{title:'Building Blocks (Math)',sub:'Number · space · comparison · pattern · sorting',cards:[card('Autumn Leaves','Explore mathematical ideas with leaves and play materials.',[['Notice','Compare colors, sizes, and shapes.'],['Try','Sort leaves or make a pattern; invite children to explain their choices.'],['Teacher note','The week overview names the math focus but does not assign a daily Building Blocks lesson.']], 'assets/focus-3s/unit-2/week-1/centers/autumn-leaves.png')]},
    storytelling:{title:'Thinking & Feedback',sub:'Notice and document learning',cards:[card('What Did We Notice?','Invite children to talk about their play and color discoveries.',[['Ask','What color did you notice today? Did any material change?'],['Document','Note children’s words, gestures, self-regulation, and engagement.']])]},
    closing:{title:'Closing Circle',sub:'Return to the week’s question',cards:[card('Colors All Around Us','Close with one color or discovery children noticed.',[['Share','Accept words, pointing, gestures, and home-language responses.'],['Family connection','Invite families to notice colors together at home.']])]}
  }[view]||null;
  if(!data)return;
  let index=0;
  const $=id=>document.getElementById(id);
  $('title').textContent=data.title;$('sub').textContent=data.sub;
  $('chip').textContent='UNIT 2 · WEEK 1 · '+day.toUpperCase();
  $('exit').onclick=()=>location.href='daily-lessons.html?week=9&day='+days.indexOf(day);
  function cardHtml(c){
    const boxes=c.boxes.map(b=>`<div class="box"><b>${b[0]}</b><p>${b[1]}</p></div>`).join('');
    const visual=c.img?`<img class="lesson-img" src="${c.img}" alt="${c.title} illustration">`:'';
    return `<div class="kicker">${day.toUpperCase()} · WORLD OF COLOR</div><h2>${c.title}</h2>${visual}<div class="lead">${c.lead}</div><div class="grid">${boxes}</div>`;
  }
  function render(){const cards=data.cards;$('lesson').innerHTML=cardHtml(cards[index]);$('count').textContent=(index+1)+' of '+cards.length;$('fill').style.width=((index+1)/cards.length*100)+'%';$('done').textContent=index===cards.length-1?'Done ✓':'Next →'}
  function state(){return{atStart:index===0,atEnd:index===data.cards.length-1,index,total:data.cards.length}}
  window.EEASectionState=state;
  function notify(){window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}))}
  $('prev').onclick=()=>{if(index>0){index--;render();notify()}};
  $('done').onclick=()=>{if(index<data.cards.length-1){index++;render();notify()}};
  render();notify();
})();
