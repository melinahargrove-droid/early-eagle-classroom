(()=>{
 const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
 const p=new URLSearchParams(location.search),day=days.includes(p.get('day'))?p.get('day'):'Monday';
 const autumn={title:'Goodbye Summer, Hello Autumn',author:'Kenard Pak',cover:'assets/goodbye-summer-hello-autumn-01.jpg'};
 const soup={title:'Soup Day',author:'Melissa Iwai',cover:null,scene:'assets/focus-3s/unit-2/week-1/centers/cooking-soup.jpg'};
 // Page numbers follow the Focus on 3s lesson plans: autumn page 2 starts the late-summer morning;
 // Soup Day page 2 begins the soup-day narration. Use the physical books for every read.
 const plans={
  Monday:{book:autumn,read:'Read 1 · Introduce the book',steps:[
   ['BEFORE READING','What changes do we notice when summer becomes autumn?','Introduce autumn as a season. Name Kenard Pak as both author and illustrator; invite children to recall yellow, orange, or red leaves.'],
   ['READ THE BOOK','Read the full book, pausing briefly at the planned pages.','At page 4 ask who is speaking. At page 10 notice that animals and parts of nature answer the child.','assets/focus-3s/unit-2/week-1/monday/autumn-change.jpg'],
   ['PAGES 15–16','What does drizzle mean? How can you tell whether the wind is gentle?','Explain light rain and notice the breeze on pages 15–16.','assets/focus-3s/unit-2/week-1/monday/autumn-weather.jpg'],
   ['PAGES 17–18','How does a chill feel? What leaf colors do you notice?','Act out feeling a chill and notice the changing leaf colors.','assets/focus-3s/unit-2/week-1/monday/autumn-chill.jpg'],
   ['AFTER READING · PAGES 3–10','How might a flower or an insect move in the story?','Turn slowly through pages 3–10 again. Children use gestures and movement to show the animals and plants.','assets/focus-3s/unit-2/week-1/monday/autumn-act-out.jpg']
  ]},
  Tuesday:{book:autumn,read:'Read 2 · Gather details',steps:[
   ['BEFORE READING','What did we notice changing in the book yesterday?','Show chart paper. Invite children to think about a favorite part of autumn to draw or dictate afterward.'],
   ['PAGES 9–23','Look and listen for something you especially like about autumn.','Read pages 9–23 with few interruptions so children can attend to the illustrations.'],
   ['SHARED DRAWING & WRITING','What is your favorite thing about autumn?','Invite a child to find a matching page, describe it, and help add a drawing or dictated idea to the group poster. Repeat as time allows.'],
   ['CLOSE','Where could we keep adding ideas to our autumn poster?','Place the poster in Writing & Drawing for children to revisit.']
  ]},
  Wednesday:{book:autumn,read:'Read 3 · Act out the story',steps:[
   ['SET THE STAGE','What do actors and audience members do when we act out a book?','Seat children around the rug. Participation as an actor is optional; children may pass.'],
   ['ACT OUT SCENES','Which part would you like to show with your body?','Read selected scenes. Rotate roles such as the child, wind, foxes, walking stick, butterfly, beaver, chipmunks, flowers, and trees or leaves.'],
   ['REFLECT','What did you think about acting out the story?','Notice how children participated as actors or audience members and what they understood about seasonal change.']
  ]},
  Thursday:{book:soup,read:'Read 1 · Introduce and connect',steps:[
   ['BEFORE READING','What foods or soups do people in our families make together?','Show the physical cover; name Melissa Iwai as author and illustrator. Use family soup photos or recipes if available.'],
   ['PAGES 5–7','Can we count the vegetables? What does chop mean?','Read the full book. Count vegetables on pages 5–6; on page 7 model a safe chopping motion with hands.'],
   ['PAGES 10–16','What might sizzle sound like? What are broth and sprinkling?','Explain the cooking sound on page 10, broth on page 11, and demonstrate sprinkling at page 16.'],
   ['AFTER READING · PAGE 27','How might the girl feel? When have you helped prepare food?','Use the illustration to discuss her expression and invite family food connections; point children toward Making Soup play.']
  ]},
  Friday:{book:soup,read:'Read 2 · Retell and sequence',steps:[
   ['OPENING','Can we retell what happened as we reread?','Invite children to use the illustrations to remember the story in order.'],
   ['PAGES 1–10','Where do they go? What happens first, next, and after chopping?','Discuss the market, washing, chopping, and cooking the vegetables; recall the sizzling sound.'],
   ['PAGES 11–16','What goes into the pot next? What happens while they wait?','Notice broth, the other vegetables, waiting and playing, spices, and alphabet pasta.'],
   ['PAGE 29 & CLOSING','How does the recipe help us know what to do?','Look at ingredients and ordered steps. Invite a connection to another activity that follows steps.']
  ]}
 };
 const D=plans[day],$=id=>document.getElementById(id);let i=0;
 $('title').textContent=D.book.title;$('sub').textContent=D.read+' · '+D.book.author;
 $('chip').textContent='UNIT 2 · WEEK 1 · '+day.toUpperCase();
 $('backBtn').onclick=()=>location.href='daily-lessons.html?week=9&day='+days.indexOf(day);
 function state(){return{step:i,atStart:i===0,atEnd:i===D.steps.length-1}}
 window.EEASectionState=state;
 function notify(){window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}))}
 function render(){const s=D.steps[i];$('kicker').textContent=s[0];$('stepTitle').textContent=s[0];$('prompt').textContent=s[1];$('note').textContent=s[2];$('bookCue').textContent=D.book.title;const visual=s[3]||D.book.cover||D.book.scene;$('bookNote').textContent=s[3]?'Original teaching cue — use the physical classroom book.':D.book.cover?'Use the classroom book for reading.':'Illustration cue only — use the physical classroom book.';const img=$('bookImg');img.hidden=!visual;if(visual)img.src=visual;img.alt=s[3]?'Original teaching cue, not a book page':D.book.cover?'Book cover':'Soup play illustration, not a book page';$('icon').hidden=!!visual;$('count').textContent=(i+1)+' of '+D.steps.length;$('fill').style.width=((i+1)/D.steps.length*100)+'%';$('next').textContent=i===D.steps.length-1?'Finish Read Aloud →':'Next →';notify()}
 $('prev').onclick=()=>{if(i>0){i--;render()}};
 $('next').onclick=()=>{if(i<D.steps.length-1){i++;render()}};
 render();
})();