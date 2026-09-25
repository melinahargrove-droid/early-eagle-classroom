(()=>{
 const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
 const p=new URLSearchParams(location.search),day=days.includes(p.get('day'))?p.get('day'):'Monday';
 const autumn={title:'Goodbye Summer, Hello Autumn',author:'Kenard Pak',cover:'assets/goodbye-summer-hello-autumn-01.jpg'};
 const soup={title:'Soup Day',author:'Melissa Iwai',cover:null,scene:'assets/focus-3s/unit-2/week-1/centers/cooking-soup.jpg'};
 const plans={
  Monday:{book:autumn,read:'Read 1',steps:[
   ['BEFORE READING','Look at the title and cover. What colors do you notice?','Introduce the book and invite children to look closely at its illustrations.'],
   ['READ TOGETHER','Read the book with the physical copy or approved classroom pages. Pause to look carefully at the pictures.','Invite children to notice colors and signs of seasonal change.'],
   ['LOOK CLOSELY','Find a picture where the season looks different. What do you see?','Follow the children’s observations. Compare the colors in two outdoor scenes without requiring one right answer.'],
   ['AFTER READING','What colors did we see? What changed as summer became autumn?','Accept words, gestures, pointing, and home-language responses.']
  ]},
  Tuesday:{book:autumn,read:'Read 2',steps:[
   ['RETURN TO THE BOOK','What do you remember noticing in the pictures?','Revisit the title and a few illustrations.'],
   ['REREAD','Read again and pause where children notice colors or changes outdoors.','Invite children to describe what they see in their own words.'],
   ['COMPARE','Choose two illustrations. What looks the same and what looks different?','Invite pointing and descriptive words; allow children time to study each image.'],
   ['CONNECT','Where have you seen a color like that near our classroom?','Welcome words, gestures, pointing, and home-language responses.']
  ]},
  Wednesday:{book:soup,read:'Read 1',steps:[
   ['BEFORE READING','What do you think we might notice in a book called Soup Day?','Show the physical book and invite children to study the cover.'],
   ['READ TOGETHER','Read the story and look for colors in the ingredients and pictures.','Pause to invite children to name or point to a color they see.'],
   ['LOOK CLOSELY','Which ingredients can you find in the pictures?','Let children point, name a food, or describe its color. Follow connections to foods they know.'],
   ['AFTER READING','What colors did we notice?','Connect to children’s cooking play and family foods.']
  ]},
  Thursday:{book:autumn,read:'Read 3',steps:[
   ['RETURN TO THE BOOK','What colors and changes do you remember?','Revisit a few illustrations before reading.'],
   ['REREAD','Read and invite children to share what they notice in the outdoor scenes.','Follow children’s observations and compare colors across illustrations.'],
   ['NOTICE CHANGE','Return to an earlier illustration. What changed by this part of the story?','Compare two scenes and invite children to explain with words or gestures.'],
   ['CONNECT','What colors can we find outside today?','Invite an outdoor color hunt when it fits the day.']
  ]},
  Friday:{book:soup,read:'Read 2',steps:[
   ['RETURN TO THE BOOK','What do you remember about Soup Day?','Invite children to look at the cover and recall the story.'],
   ['REREAD','Read again and notice the colors of foods and materials.','Invite children to compare what they notice with their cooking play.'],
   ['SEQUENCE','What happened first? What did the family do next?','Use the pictures to support children’s retelling, then connect to their pretend cooking.'],
   ['AFTER READING','What colors could you use in your pretend soup?','Welcome children’s family and home-language connections.']
  ]}
 };
 const D=plans[day],$=id=>document.getElementById(id);let i=0;
 $('title').textContent=D.book.title;$('sub').textContent=D.read+' · '+D.book.author;
 $('chip').textContent='UNIT 2 · WEEK 1 · '+day.toUpperCase();
 $('backBtn').onclick=()=>location.href='daily-lessons.html?week=9&day='+days.indexOf(day);
 function render(){const s=D.steps[i];$('kicker').textContent=s[0];$('stepTitle').textContent=s[0];$('prompt').textContent=s[1];$('note').textContent=s[2];$('bookCue').textContent=D.book.title;$('bookNote').textContent=D.book.cover?'Use the classroom book for reading.':'Illustration cue only — use the physical classroom book.';const img=$('bookImg');img.hidden=!(D.book.cover||D.book.scene);if(D.book.cover||D.book.scene)img.src=D.book.cover||D.book.scene;img.alt=D.book.cover?'Book cover':'Soup play illustration, not a book page';$('icon').hidden=!!(D.book.cover||D.book.scene);$('count').textContent=(i+1)+' of '+D.steps.length;$('fill').style.width=((i+1)/D.steps.length*100)+'%';$('next').textContent=i===D.steps.length-1?'Finish Read Aloud →':'Next →';notify()}
 function state(){return{step:i,atStart:i===0,atEnd:i===D.steps.length-1}}
 window.EEASectionState=state;
 function notify(){window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}))}
 $('prev').onclick=()=>{if(i>0){i--;render()}};
 $('next').onclick=()=>{if(i<D.steps.length-1){i++;render()}};
 render();
})();
