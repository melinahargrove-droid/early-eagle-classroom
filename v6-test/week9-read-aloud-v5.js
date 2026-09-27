(()=>{
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const p=new URLSearchParams(location.search),day=days.includes(p.get('day'))?p.get('day'):'Monday';
  const autumn={title:'Goodbye Summer, Hello Autumn',author:'Kenard Pak',cover:'assets/goodbye-summer-hello-autumn-01.jpg',source:'https://drive.google.com/file/d/1RGLQXzGP-plg36a6Xb3i6421VSA1yTZB/view'};
  const soup={title:'Soup Day',author:'Melissa Iwai',source:'https://drive.google.com/file/d/10pRRgivMQy67pCwikuDXxwQpK1uIqsrz/view'};
  // Physical-book teaching cues, not adapted book pages. The numbered stops follow
  // the linked BPS plans; original supplemental art does not establish page mapping.
  const changeVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/change-summer-autumn.png';
  const investigateVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/investigate-autumn-leaf.png';
  const chillyVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/chilly-autumn-breeze.png';
  const art={
    change:'assets/focus-3s/unit-2/week-1/monday/autumn-change.jpg',
    weather:'assets/focus-3s/unit-2/week-1/monday/autumn-weather.jpg',
    chill:'assets/focus-3s/unit-2/week-1/monday/autumn-chill.jpg',
    act:'assets/focus-3s/unit-2/week-1/monday/autumn-act-out.jpg',
    details:'assets/focus-3s/unit-2/week-1/tuesday/notice-autumn-details.jpg',
    poster:'assets/focus-3s/unit-2/week-1/tuesday/shared-autumn-poster.jpg',
    revisit:'assets/focus-3s/unit-2/week-1/tuesday/revisit-autumn-poster.jpg',
    stage:'assets/focus-3s/unit-2/week-1/wednesday/set-the-stage.jpg',
    scenes:'assets/focus-3s/unit-2/week-1/wednesday/act-out-scenes.jpg',
    reflect:'assets/focus-3s/unit-2/week-1/wednesday/reflect-on-acting.jpg',
    family:'assets/focus-3s/unit-2/week-1/thursday/family-soup-connections.jpg',
    count:'assets/focus-3s/unit-2/week-1/thursday/count-and-chop.jpg',
    cook:'assets/focus-3s/unit-2/week-1/thursday/sizzle-broth-sprinkle.jpg',
    meals:'assets/focus-3s/unit-2/week-1/thursday/after-reading-family-meals.jpg',
    retell:'assets/focus-3s/unit-2/week-1/friday/retell-the-story.png',
    sequence:'assets/focus-3s/unit-2/week-1/friday/market-wash-chop-cook.png',
    pasta:'assets/focus-3s/unit-2/week-1/friday/broth-wait-spices-pasta.png',
    recipe:'assets/focus-3s/unit-2/week-1/friday/follow-a-recipe.png'
  };
  const cue=(title,prompt,note,img,stop='')=>({title,prompt,note,img,stop});
  const word=(title,definition,note,img)=>({...cue(title,definition,note,img),vocabulary:true});
  const plans={
    Monday:{book:autumn,read:'Read 1 · Introduce the book',teacher:'Number the physical book so page 2 starts “Hello, late summer morning.” Read the whole book with the brief stops shown. Observe active listening, use and enactment of new words, and connections to children’s experiences. Invite families to share experiences of changing weather or seasons.',steps:[
      cue('Before Reading','We are exploring colors as summer changes to autumn.','Introduce Kenard Pak as author and illustrator. Invite children who have seen yellow, orange or red leaves to put a hand on their head. Introduce autumn, season and change before reading.',art.change),
      word('Autumn','Another name for fall: the cooler season after summer when many leaves turn yellow, orange and red.','Recall leaves children have noticed.',art.change),
      word('Season','A part of the year, such as winter, spring, summer or autumn.','Summer and autumn are both seasons.',art.change),
      word('Change','To make different.','The child in the book notices a different season beginning.',changeVocabulary),
      cue('Page 4','Begin reading at the start of the book. Pause at page 4.','Read fluently; keep this pause brief.',art.change,'Who is talking?'),
      cue('Page 10','Continue reading through page 10.','Show the corresponding illustration in the physical book.',art.change,'The animals and things the child greets talk back. Notice how they describe the changing season.'),
      cue('Pages 15–16','Continue reading through the rain and wind on pages 15–16.','The vocabulary screen follows this page cue.',art.weather,'What does the breezy wind do to people and things? Is it strong or gentle? What in the illustration helps you tell?'),
      word('Drizzle','To rain very lightly.','Explain the light rain on pages 15–16.',art.weather),
      cue('Pages 17–18','Continue reading through pages 17–18.','Introduce the word chill at this point in the book.',art.chill),
      word('Chill','Something cold.','Gesture shivering. Invite children to show how they look when chilled; mention putting on a jacket and hat.',art.chill),
      cue('Pages 17–18 · Colors','Look again at the leaves on these pages.','The season and the leaves are changing.',art.chill,'What colors do you see in this picture?'),
      cue('Finish the Book','Continue from page 19 to the end.','Finish reading before returning to earlier illustrations.',art.change),
      cue('After Reading · Pages 3–10','Turn slowly through pages 3–10 again.','Join children as they use gestures and body movements.',art.act,'Act like the animals, plants and other things affected by summer ending. For example, invite everyone to be a flower or a stick insect as you show that page.')
    ]},
    Tuesday:{book:autumn,read:'Read 2 · Gather details',teacher:'Prepare chart paper and writing/drawing tools. Suggested timing: opening 1 minute, reading 4 minutes, shared drawing/writing 4 minutes, closing 1 minute. Observe how children describe illustrations and connect ideas to print.',steps:[
      cue('Before Reading','What did we notice changing yesterday?','Show the book and chart paper. Ask children to think of a favorite thing about autumn; after reading, the group will draw and write ideas.',art.details),
      cue('Pages 9–23 Only','Look and listen for a favorite thing about autumn.','Read only pages 9–23, with little or no stopping. Do not continue to the rest of the book in this read.',art.details),
      cue('Shared Drawing & Writing','What is your favorite thing about autumn?','Invite one response. Find the matching book page, ask the child to describe the illustration, and draw or write the idea on chart paper. Label drawings. Repeat once or twice as appropriate.',art.poster),
      cue('Closing','We made an autumn poster together.','Place the poster in Writing & Drawing so children can continue adding ideas.',art.revisit)
    ]},
    Wednesday:{book:autumn,read:'Read 3 · Act out the story',teacher:'Tag selected scenes before the read. Observe participation as actors and audience, what works or is challenging, and what children understand about seasonal change through acting.',steps:[
      cue('Before Reading · Stage','Today we will act out what happens in the book.','Seat children around the rug’s perimeter. Discuss where actors sit and the audience’s job. Invite children around the circle to play people, animals or objects. Children may say “pass.”',art.stage),
      cue('Act Out Scenes','Show and read the selected scenes.','Invite different children to play the child and other roles: wind, foxes, walking stick, butterfly, beaver, chipmunks, flowers, trees and leaves. Rotate roles to include more actors.',art.scenes),
      cue('Reflect','Talk about the acting experience.','Listen to children’s responses and acknowledge actor and audience participation.',art.reflect,'What did you think about acting out the story today? Remind children that the class will act out other stories soon.')
    ]},
    Thursday:{book:soup,read:'Read 1 · Introduce and connect',teacher:'Number the book so page 2 begins “Today is soup day.” Have The Little Red Hen (Makes a Pizza), by Philemon Sturges, and family soup photographs or recipes available. Read Soup Day cover to cover. Observe expressions, understanding of events and characters, and personal connections.',steps:[
      cue('Before Reading','What soups do our families enjoy?','Show the physical cover. Melissa Iwai wrote the words and made the illustrations. Explain that a girl makes soup with her mother. Share family soup photographs or recipes.',art.family),
      cue('Connect to Another Book','Remember The Little Red Hen Makes a Pizza.','Show that book’s cover. The hen buys pizza ingredients at the supermarket; the girl and mother buy ingredients at the market for soup. Read to discover the kind of soup they make.',art.family),
      cue('Pages 5–6','Start the book and read through pages 5–6.','Read each sentence, then point to its vegetables.',art.count,'Count the vegetables together after each sentence, letting children join in.'),
      cue('Page 7','Continue to the chopping on page 7.','Pause for the next vocabulary screen.',art.count),
      word('Chop','Cut by moving a knife up and down.','Act out the motion. Notice that the big carrots have become many small pieces.',art.count),
      cue('Page 10','Continue reading to page 10.','Notice the vegetables cooking in oil.',art.cook),
      word('Sizzle','Make a hissing sound while cooking.','Demonstrate the sound the vegetables make in the oil.',art.cook),
      cue('Page 11','Continue to page 11.','Notice what the mother pours into the pot.',art.cook),
      word('Broth','Soup made by boiling vegetables or meat in water.','Explain broth while referring to the illustration.',art.cook),
      cue('Page 16','Continue reading through page 16.','Notice the small pieces being added.',art.cook),
      word('Sprinkle','Drop small pieces bit by bit.','Demonstrate a sprinkling movement.',art.cook),
      cue('Finish the Book','Continue from page 17 to the end.','Read the rest fluently before the discussion.',art.meals),
      cue('After Reading · Page 27','Return to the girl’s smiling face on page 27.','Invite children to use the illustration and their own experiences.',art.meals,'How does she feel? Why might she feel happy? When have you helped prepare food with someone in your family? What did you make, and who helped?'),
      cue('Closing','Use the book’s ideas when you pretend to make soup.','Connect to Making Soup in Dramatic Play. Tell children the class will read Soup Day again tomorrow.',art.meals)
    ]},
    Friday:{book:soup,read:'Read 2 · Retell and sequence',teacher:'Reread and pause at the specified pages so children can retell. Keep the broth sound cue and pasta completion prompt. Observe the sequence children remember, the prompting they need and their understanding of the week’s ideas.',steps:[
      cue('Before Reading','Let’s remember and retell what happened in Soup Day.','Use the physical book’s illustrations as you reread.',art.retell),
      cue('Page 1','Begin rereading; pause at page 1.','Invite children to retell before supplying the response.',art.sequence,'Where are the girl and her mother going? What will they cook? They go to the market for vegetables, ingredients for soup.'),
      cue('Page 7','Continue through page 7.','Use the illustration to recall the first preparation step.',art.sequence,'What is the first thing the girl does to help? She washes and cleans the vegetables.'),
      cue('Pages 8–9','Continue through pages 8–9.','Recall what follows washing.',art.sequence,'What do the girl and her mother do next? They chop the vegetables into small pieces.'),
      cue('Page 10','Continue through page 10.','Connect washing, chopping and cooking in sequence.',art.sequence,'After washing and chopping, what happens? They cook onions, carrots and celery in the pot. What sound do the vegetables make? They sizzle, making a hissing sound.'),
      cue('Page 11','Continue to page 11.','Give the beginning sound and pause for children to complete the word.',art.pasta,'Next, Mom pours the /br/, /br/, /br/… ____ into the pot. What is it? Broth! She also adds the remaining vegetables.'),
      cue('Pages 13–16','Continue through pages 13–16.','Pause before naming the final ingredient.',art.pasta,'While the soup cooks, they play and wait. Then they add spices and the final ingredient, the… ____. The girl chooses alphabet pasta.'),
      cue('Page 29 · Recipe','Continue to the recipe on page 29.','Show the ingredients and directions.',art.recipe,'The recipe lists vegetables, spices and other ingredients, and gives steps to follow. Recall how the girl and her mother followed steps to make soup.'),
      cue('After Reading','When have you needed to follow steps?','Invite a connection to making or doing something in a sequence.',art.recipe,'What did you do first, then next, and then next? You may have watched someone in your family follow steps too.'),
      cue('Closing','Today we retold Soup Day.','Acknowledge how children remembered the events in order.',art.retell)
    ]}
  };
  const myAutumn={title:'My Autumn Book',author:'Wong Herbert Yee',cover:'assets/focus-3s/unit-2/week-1/my-autumn-book/cover.png',source:'https://drive.google.com/file/d/1bmzMgck416qYVqLtigfFVYlVsHcR9AOy/view'};
  const pageImage=n=>'assets/focus-3s/unit-2/week-1/my-autumn-book/page-'+String(n).padStart(2,'0')+'.png';
  const spread=(n,stop='',note='')=>({...cue('Story spread '+n,'',note,pageImage(n),stop),bookPage:true,spread:n});
  const myPlans={
    Monday:{book:myAutumn,read:'Read 1 · Introduce the book',teacher:'Read the full book. Wong Herbert Yee wrote the words and created the pictures. Observe active listening, discussion and enactment of new words, and connections to children’s experiences. Invite families to share seasonal experiences and take an autumn walk.',steps:[
      cue('Before Reading','We are exploring colors as summer changes to autumn.','Point to the cover’s trees. Invite children who have seen yellow, orange or red leaves to put a hand on their head. The child notices the changing season. Read to discover what an autumn book is about.',myAutumn.cover),
      word('Autumn','Another word for fall: the cooler season after summer when leaves turn yellow, orange and red.','Use the trees on the cover to introduce autumn.',myAutumn.cover),
      word('Change','To make different.','The child notices the seasons changing.',changeVocabulary),
      spread(1,'Point to the green leaves. The leaves on this tree are green. I wonder if they will change with the season.'),
      spread(2),
      word('Investigate','To learn more about something.','The child wants to learn more, like a scientist.',investigateVocabulary),
      spread(3),spread(4),
      word('Chilly','Cold.','Gesture shivering. Show us what you look like when you are chilly. You might put on a jacket and hat.',chillyVocabulary),
      spread(5,'Invite one or two children to share an experience with a squirrel.'),
      spread(6),
      spread(7,'Remember the green tree at the beginning? What do you notice about these trees? What have you noticed about the trees around us?'),
      word('Celebrate','To do something special for a person or an important day.','A celebration is a special way to mark an important time. We are celebrating autumn!',pageImage(7)),
      spread(8),spread(9),spread(10),spread(11),spread(12),spread(13),spread(14),spread(15),
      word('Return','To happen again.','Autumn will come again next year. It will return next September.',pageImage(15)),
      {...spread(9,'Stand up and act like trees and leaves. What do you love about autumn? Invite personal connections, such as seeing leaves blow in the wind or noticing a spider web.'),title:'After Reading · Trees & Leaves'},
      cue('Closing','Today we learned about the many changes in autumn.','We will read My Autumn Book again tomorrow.',myAutumn.cover)
    ]},
    Tuesday:{book:myAutumn,read:'Read 2 · Gather details',teacher:'Prepare chart paper titled “Autumn Poster” and markers. Show the scrapbook spread during the opening, then read only printed pages 1–18 (story spreads 1–9), with little or no stopping. Observe how children describe illustrations and connect ideas to print.',steps:[
      cue('Before Reading','Today we will create an Autumn Poster.','Recall yesterday’s reading. Show the child’s scrapbook on this spread (printed pages 25–26) and the chart paper. As we read, decide on your favorite thing about autumn.',pageImage(13)),
      ...[1,2,3,4,5,6,7,8,9].map(n=>spread(n)),
      cue('Shared Drawing & Writing','What is your favorite part about autumn?','Invite a response. Use “Revisit a picture” to find the matching illustration and ask the child to describe it. Draw or write the idea on the chart and label it as appropriate. Repeat once or twice.',art.poster),
      cue('Closing','We made an autumn poster together.','Place the poster in Writing & Drawing so children can continue adding ideas.',art.revisit)
    ]},
    Wednesday:{book:myAutumn,read:'Read 3 · Act out the story',teacher:'Choose several scenes. The sequence includes the source plan’s suggested spider/web, chipmunk/squirrel, caterpillar/cocoon, and trees/leaves scenes. Rotate actors, including the child’s role. Observe participation as actors and audience, successes, challenges and understanding of seasonal change.',steps:[
      cue('Before Reading · Stage','Today we will act out what happens in the book.','Seat children around the rug’s perimeter. Where do actors sit? What is the audience’s job? Invite children around the circle to play the child, animals or objects. Children may say “pass.”',myAutumn.cover),
      spread(3,'Invite children to act as the child and the spider or web. Children may pass.'),
      spread(5,'Invite different children to act as the child, chipmunk and squirrel.'),
      spread(6,'Invite children to act as the child, caterpillar and cocoon.'),
      spread(7,'Invite children to act as trees and leaves. Rotate roles to include more actors.'),
      spread(8),spread(9),
      cue('Reflect','What did you think about acting out the story today?','Listen to children’s reflections. Acknowledge actors and audience. We will act out other stories soon!',art.reflect)
    ]}
  };
  const $=id=>document.getElementById(id),choiceKey='eea-u2w1-autumn-book';
  let selected='my-autumn';try{if(localStorage.getItem(choiceKey)==='goodbye-summer')selected='goodbye-summer'}catch(e){}
  let D,i=0,stopShown=false;
  $('chip').textContent='UNIT 2 · WEEK 1 · '+day.toUpperCase();
  $('backBtn').onclick=()=>location.href='daily-lessons.html?week=9&day='+days.indexOf(day);
  $('bookChoice').hidden=days.indexOf(day)>2;
  $('bookSelect').value=selected;
  function chooseBook(){
    D=days.indexOf(day)<3&&selected==='my-autumn'?myPlans[day]:plans[day];i=0;stopShown=false;
    $('title').textContent=D.book.title;$('sub').textContent=D.read+' · '+D.book.author;
    $('sourceLink').href=D.book.source;$('teacherText').textContent=D.teacher;
    $('revisit').hidden=!(D.book===myAutumn&&day==='Tuesday');
    $('bookResources').hidden=D.book!==myAutumn;
    $('teacherNotes').open=false;render();
  }
  $('bookSelect').onchange=()=>{selected=$('bookSelect').value;try{localStorage.setItem(choiceKey,selected)}catch(e){}chooseBook()};
  function state(){return{step:i,index:i,total:D.steps.length,atStart:i===0,atEnd:i===D.steps.length-1&&(!D.steps[i].stop||stopShown),stopPending:!!D.steps[i].stop&&!stopShown,vocabulary:!!D.steps[i].vocabulary}}
  window.EEASectionState=state;
  function notify(){window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}))}
  function render(){
    const s=D.steps[i];document.querySelector('.stage').classList.toggle('spread',!!s.bookPage);
    $('kicker').textContent=s.vocabulary?'VOCABULARY':D.book===myAutumn?'READ ALOUD':'PHYSICAL BOOK · TEACHING CUE';$('stepTitle').textContent=s.title;
    $('prompt').textContent=s.prompt;$('note').textContent=s.note;$('note').hidden=!s.note;$('bookCue').textContent=D.book.title;
    const original=D.book===myAutumn&&s.img?.includes('/my-autumn-book/');
    $('bookNote').textContent=(s.img===changeVocabulary||s.img===investigateVocabulary||s.img===chillyVocabulary)?'Original vocabulary illustration':original?'':'Supplemental teaching illustration — read from the physical classroom book.';
    const visual=s.img||D.book.cover,img=$('bookImg');img.hidden=!visual;if(visual)img.src=visual;img.alt=s.img===chillyVocabulary?'A child hugs their arms against a chilly autumn breeze':s.img===investigateVocabulary?'A child investigates an autumn leaf with a magnifying glass':s.img===changeVocabulary?'The same tree changes from green summer leaves to colorful autumn leaves':original?(s.bookPage?D.book.title+' — '+s.title:D.book.title+' illustration'):'Supplemental teaching illustration, not a book page';$('icon').hidden=!!visual;
    $('teachingStop').hidden=!s.stop||!stopShown;$('stopText').textContent=s.stop||'';
    $('count').textContent=(i+1)+' of '+D.steps.length+(s.bookPage?' · '+s.title:'');$('fill').style.width=((i+1)/D.steps.length*100)+'%';
    $('next').textContent=s.stop&&!stopShown?'Show Teaching Stop →':i===D.steps.length-1?'Finish Read Aloud →':s.vocabulary?'Continue →':'Next →';notify();
  }
  $('prev').onclick=()=>{if(i>0){i--;stopShown=false;$('teacherNotes').open=false;render()}};
  $('next').onclick=()=>{if(D.steps[i].stop&&!stopShown){stopShown=true;render();return}if(i<D.steps.length-1){i++;stopShown=false;$('teacherNotes').open=false;render()}};
  $('revisit').onclick=()=>{$('pictureDialog').showModal();$('revisitSelect').value='1';showRevisit()};
  function showRevisit(){$('revisitImg').src=pageImage(Number($('revisitSelect').value));$('revisitImg').alt='My Autumn Book — story spread '+$('revisitSelect').value}
  $('revisitSelect').onchange=showRevisit;
  $('closePictures').onclick=()=>$('pictureDialog').close();
  chooseBook();
})();
