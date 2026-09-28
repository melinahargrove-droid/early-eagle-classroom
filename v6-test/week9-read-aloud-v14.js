(()=>{
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const p=new URLSearchParams(location.search),day=days.includes(p.get('day'))?p.get('day'):'Monday';
  const autumn={title:'Goodbye Summer, Hello Autumn',author:'Kenard Pak',cover:'assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/cover.png',source:'https://drive.google.com/file/d/1RGLQXzGP-plg36a6Xb3i6421VSA1yTZB/view'};
  const soup={title:'Soup Day',author:'Melissa Iwai',cover:'assets/focus-3s/unit-2/week-1/soup-day/cover.jpg',source:'https://drive.google.com/file/d/10pRRgivMQy67pCwikuDXxwQpK1uIqsrz/view'};
  // Physical-book teaching cues, not adapted book pages. The numbered stops follow
  // the linked BPS plans; original supplemental art does not establish page mapping.
  const changeVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/change-summer-autumn.png';
  const investigateVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/investigate-autumn-leaf.png';
  const chillyVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/chilly-autumn-breeze.png';
  const celebrateVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/celebrate-birthday.png';
  const returnVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/return-autumn-seasons.png';
  const seasonVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/season-four-seasons.png';
  const drizzleVocabulary='assets/focus-3s/unit-2/week-1/vocabulary/drizzle-autumn-rain.png';
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
  const goodbyePages=[{"sourceSlide": 2, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-01.png", "printedPages": [1, 2], "adaptedText": "Hello, late summer morning.", "dimensions": [1282, 482], "sha256": "f715a74df8adb625e05d12c4c157576a1dad358915bbc2c0df4d25fbaad5b0f2", "sourceMedia": "../media/image3.png"}, {"sourceSlide": 3, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-02.png", "printedPages": [3, 4], "adaptedText": "Hello, moving trees.", "dimensions": [1278, 489], "sha256": "ca10ba71e2daecf5c83d2e070bc44abec7aa5246001608a0165695d9f3b2f75a", "sourceMedia": "../media/image2.png"}, {"sourceSlide": 4, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-03.png", "printedPages": [5, 6], "adaptedText": "Hello, blue jays and foxes looking for food.", "dimensions": [1280, 485], "sha256": "c62827d44d3adb800cef1b85b4fa45cc024fb076ad8666da68a2198571a206e0", "sourceMedia": "../media/image8.png"}, {"sourceSlide": 5, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-04.png", "printedPages": [7, 8], "adaptedText": "Hello, butterflies blending in on the stick.", "dimensions": [1278, 486], "sha256": "26955c32d2d34d1fd3984255fb60773513d6409a0049ba4c064309ef5b1edce7", "sourceMedia": "../media/image6.png"}, {"sourceSlide": 6, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-05.png", "printedPages": [9, 10], "adaptedText": "Hello, beavers and chipmunks making your winter homes.", "dimensions": [1280, 485], "sha256": "94841d107446d3ef639ac55c33562d8a1816b4b84d471599fa686331f9c920e9", "sourceMedia": "../media/image5.png"}, {"sourceSlide": 7, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-06.png", "printedPages": [11, 12], "adaptedText": "Hello to the colorful flowers", "dimensions": [1656, 627], "sha256": "017cbe004d9f3ce2e6d679a7f5efdd0dc33af89159119598adcd7c40ba35c99f", "sourceMedia": "../media/image11.png"}, {"sourceSlide": 8, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-07.png", "printedPages": [13, 14], "adaptedText": "Hello to the rumbling thunder.", "dimensions": [1657, 629], "sha256": "3b79ee42c72c920d9e9543e4204ef3433c00bac7fffc2ee18b36162591feec05", "sourceMedia": "../media/image13.png"}, {"sourceSlide": 9, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-08.png", "printedPages": [15, 16], "adaptedText": "Hello, wind blowing around the leaves and rain.", "dimensions": [1653, 627], "sha256": "130d4cc62d8b52e5cdb0897fd653cf13478a15c1047d4ae0fce6c0cb5ba09a43", "sourceMedia": "../media/image7.png"}, {"sourceSlide": 10, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-09.png", "printedPages": [17, 18], "adaptedText": "Hello, chilly air.", "dimensions": [1656, 621], "sha256": "7c6a0d25ff5f45fca266bde5e95be9ee758433582840d886f2b8a6b060c7d35d", "sourceMedia": "../media/image12.png"}, {"sourceSlide": 11, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-10.png", "printedPages": [19, 20], "adaptedText": "Hello, puddle with the fallen leaves.", "dimensions": [1655, 627], "sha256": "f0357a3de6afcfa9e326220a2bde1fab4a5e53ea4197b48cad663037dcc0314f", "sourceMedia": "../media/image10.png"}, {"sourceSlide": 12, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-11.png", "printedPages": [21, 22], "adaptedText": "Hello to the changing leaves.", "dimensions": [1657, 628], "sha256": "151e40329c278b6aa02935357b5f65fdea63ae430d32c5acf7c2f4ea5a4f1262", "sourceMedia": "../media/image16.png"}, {"sourceSlide": 13, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-12.png", "printedPages": [23, 24], "adaptedText": "Hello, big, orange sun", "dimensions": [1655, 626], "sha256": "db6c3851824084f2637711695aa6bc6050449b94dd12c994bd032df82fbaa330", "sourceMedia": "../media/image14.png"}, {"sourceSlide": 14, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-13.png", "printedPages": [25, 26], "adaptedText": "Goodbye, Summer.", "dimensions": [1655, 626], "sha256": "111bd06b2ef91598c1cf91385fa0618d7ebcaaf3ca99205dfefd5dd9ba3a4eae", "sourceMedia": "../media/image4.png"}, {"sourceSlide": 15, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-14.png", "printedPages": [27, 28], "adaptedText": "It’s nighttime.", "dimensions": [1656, 629], "sha256": "0798770b496346f75eb1a0a963442a6b69d6c23cd751f51be26ee28ede25111e", "sourceMedia": "../media/image15.png"}, {"sourceSlide": 16, "path": "assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-15.png", "printedPages": [29, 30], "adaptedText": "Hello, Autumn.", "dimensions": [1657, 627], "sha256": "ef3a3ff54b8f9bf5b190b492cfc9a82813f155b9650922d398bf5aad4d8d10ee", "sourceMedia": "../media/image9.png"}];
  const goodbyeImage=n=>goodbyePages[n-1].path;
  const goodbyeSpread=(n,stop='',note='')=>({...cue('Pages '+goodbyePages[n-1].printedPages.join('–'),'',note,goodbyeImage(n),stop),bookPage:true,spread:n,adaptedText:goodbyePages[n-1].adaptedText});
  const plans={
    Monday:{book:autumn,read:'Read 1 · Introduce the book',teacher:'Read the supplied adapted text with its original illustrations. Kenard Pak wrote and illustrated the book. The page numbers are printed book pages, as labeled in the supplied slides. Read the whole book with the brief stops shown. Observe active listening, new vocabulary and connections to children’s experiences. Invite families to share experiences of changing weather or seasons.',steps:[
      cue('Before Reading','We are exploring colors as summer changes to autumn.','Introduce Kenard Pak as author and illustrator. Invite children who have seen yellow, orange or red leaves to put a hand on their head. Introduce season after the flower spread on pages 11–12.',autumn.cover),
      word('Autumn','Another name for fall: the cooler season after summer when many leaves turn yellow, orange and red.','Recall leaves children have noticed.',autumn.cover),
      goodbyeSpread(1),
      goodbyeSpread(2,'Who is talking?','Keep this pause brief. The original illustration includes the trees’ reply.'),
      goodbyeSpread(3),goodbyeSpread(4),
      goodbyeSpread(5,'The animals and things the child greets talk back. Notice how they describe the changing season.'),
      goodbyeSpread(6),
      word('Season','A part of the year, such as winter, spring, summer or autumn.','Summer and autumn are both seasons.',seasonVocabulary),
      goodbyeSpread(7),
      goodbyeSpread(8,'What does the breezy wind do to people and things? Is it strong or gentle? What in the illustration helps you tell?'),
      word('Drizzle','To rain very lightly.','Explain the light rain on pages 15–16.',drizzleVocabulary),
      goodbyeSpread(9),
      word('Chill','Something cold.','Gesture shivering. Invite children to show how they look when chilled; mention putting on a jacket and hat.',chillyVocabulary),
      {...goodbyeSpread(9,'What colors do you see in this picture?','The season and the leaves are changing.'),title:'Pages 17–18 · Colors'},
      goodbyeSpread(10),goodbyeSpread(11),
      word('Change','To make different.','Notice how the leaves change color on pages 21–22.',changeVocabulary),
      ...[12,13,14,15].map(n=>goodbyeSpread(n)),
      {...goodbyeSpread(2,'Act like the animals, plants and other things affected by summer ending. As we revisit the pictures, use gestures and body movements.','Turn slowly through printed pages 3–10 again.'),title:'After Reading · Trees'},
      {...goodbyeSpread(3,'','Invite children to act like the blue jays and foxes.'),title:'After Reading · Blue Jays & Foxes'},
      {...goodbyeSpread(4,'','Invite children to act like a walking stick or butterfly.'),title:'After Reading · Walking Stick & Butterflies'},
      {...goodbyeSpread(5,'','Invite children to act like beavers and chipmunks.'),title:'After Reading · Beavers & Chipmunks'},
      cue('Closing','Today we noticed how summer changes to autumn.','We will read Goodbye Summer, Hello Autumn again tomorrow.',autumn.cover)
    ]},
    Tuesday:{book:autumn,read:'Read 2 · Gather details',teacher:'Prepare chart paper and writing/drawing tools. Read printed pages 9–23 only, with little or no stopping. The final supplied spread shows pages 23–24; read page 23 only. Suggested timing: opening 1 minute, reading 4 minutes, shared drawing/writing 4 minutes, closing 1 minute. Observe descriptions of illustrations and connections to print.',steps:[
      cue('Before Reading','What did we notice changing yesterday?','Show the book and chart paper. Think of a favorite thing about autumn; after reading, we will draw and write ideas.',autumn.cover),
      ...[5,6,7,8,9,10,11].map(n=>goodbyeSpread(n)),
      {...goodbyeSpread(12,'','Read page 23 only. Stop here for this read; do not read page 24 or continue to the rest of the book.'),title:'Page 23 · Stop Here'},
      cue('Shared Drawing & Writing','What is your favorite thing about autumn?','Invite one response. Use “Revisit a picture” to find the matching book page. Ask the child to describe the illustration, then draw or write the idea on chart paper. Label drawings. Repeat once or twice as appropriate.',art.poster),
      cue('Closing','We made an autumn poster together.','Place the poster in Writing & Drawing so children can continue adding ideas.',art.revisit)
    ]},
    Wednesday:{book:autumn,read:'Read 3 · Act out the story',teacher:'Act out selected scenes using the original illustrations and adapted text. Rotate the child’s role and other roles to include more actors. Children may say “pass.” Observe participation as actors and audience, successes, challenges and understanding of seasonal change.',steps:[
      cue('Before Reading · Stage','Today we will act out what happens in the book.','Seat children around the rug’s perimeter. Discuss where actors sit and the audience’s job. Invite children to play people, animals or objects. Children may say “pass.”',autumn.cover),
      goodbyeSpread(2,'Invite children to act as the child and moving trees.'),
      goodbyeSpread(3,'Invite different children to act as the child, blue jays and foxes.'),
      goodbyeSpread(4,'Invite children to act as the walking stick and butterflies. Rotate the child’s role.'),
      goodbyeSpread(5,'Invite children to act as beavers and chipmunks preparing their homes.'),
      goodbyeSpread(6,'Invite children to act as flowers. Rotate roles to include more actors.'),
      goodbyeSpread(8,'Invite children to act as the wind, leaves and people.'),
      goodbyeSpread(11,'Invite children to act as trees and changing leaves.'),
      cue('Reflect','Talk about the acting experience.','Listen to children’s responses and acknowledge actor and audience participation.',art.reflect,'What did you think about acting out the story today? Remind children that the class will act out other stories soon.')
    ]},
    Thursday:{book:soup,read:'Read 1 · Introduce and connect',teacher:'Number the book so page 2 begins “Today is soup day.” Have The Little Red Hen (Makes a Pizza), by Philemon Sturges, and family soup photographs or recipes available. Read Soup Day cover to cover. Observe expressions, understanding of events and characters, and personal connections.',steps:[
      cue('Before Reading','What soups do our families enjoy?','Show the physical cover. Melissa Iwai wrote the words and made the illustrations. Explain that a girl makes soup with her mother. Share family soup photographs or recipes.',soup.cover),
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
      word('Celebrate','To do something special for a person or an important day.','A celebration is a special way to mark an important time. We are celebrating autumn!',celebrateVocabulary),
      spread(8),spread(9),spread(10),spread(11),spread(12),spread(13),spread(14),spread(15),
      word('Return','To happen again.','Autumn will come again next year. It will return next September.',returnVocabulary),
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
    $('revisit').hidden=!(D.book!==soup&&day==='Tuesday');
    $('bookResources').hidden=D.book!==myAutumn;
    $('teacherNotes').open=false;render();
  }
  $('bookSelect').onchange=()=>{selected=$('bookSelect').value;try{localStorage.setItem(choiceKey,selected)}catch(e){}chooseBook()};
  function state(){return{step:i,index:i,total:D.steps.length,atStart:i===0,atEnd:i===D.steps.length-1&&(!D.steps[i].stop||stopShown),stopPending:!!D.steps[i].stop&&!stopShown,vocabulary:!!D.steps[i].vocabulary}}
  window.EEASectionState=state;
  function notify(){window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}))}
  function render(){
    const s=D.steps[i];document.querySelector('.stage').classList.toggle('spread',!!s.bookPage);
    $('kicker').textContent=s.vocabulary?'VOCABULARY':D.book!==soup?'READ ALOUD':'PHYSICAL BOOK · TEACHING CUE';$('stepTitle').textContent=s.title;
    $('prompt').textContent=s.prompt;$('note').textContent=s.note;$('note').hidden=!s.note;$('bookCue').textContent=D.book.title;
    const original=!!(s.img===soup.cover||s.img?.includes('/my-autumn-book/')||s.img?.includes('/goodbye-summer-hello-autumn/'));
    const adapted=s.adaptedText||'';document.querySelector('.stage').classList.toggle('has-adapted',!!adapted);$('adaptedText').textContent=adapted;$('adaptedText').hidden=!adapted;
    $('teacherText').textContent=D.teacher+(s.bookPage&&s.note?' '+s.note:'');
    $('bookNote').textContent=(s.img===changeVocabulary||s.img===investigateVocabulary||s.img===chillyVocabulary||s.img===celebrateVocabulary||s.img===returnVocabulary||s.img===seasonVocabulary||s.img===drizzleVocabulary)?'Original vocabulary illustration':original?'':'Supplemental teaching illustration — read from the physical classroom book.';
    const visual=s.img||D.book.cover,img=$('bookImg');img.hidden=!visual;if(visual)img.src=visual;img.alt=s.img===soup.cover?'Soup Day book cover by Melissa Iwai':s.img===drizzleVocabulary?'A child in a yellow raincoat holds out a hand to feel light autumn drizzle':s.img===seasonVocabulary?'The same tree in winter, spring, summer and autumn':s.img===returnVocabulary?'The same tree in autumn, winter, spring, summer, and autumn again as the season returns':s.img===celebrateVocabulary?'Preschool friends celebrate a birthday together with smiles and clapping':s.img===chillyVocabulary?'A child hugs their arms against a chilly autumn breeze':s.img===investigateVocabulary?'A child investigates an autumn leaf with a magnifying glass':s.img===changeVocabulary?'The same tree changes from green summer leaves to colorful autumn leaves':original?(s.bookPage?D.book.title+' — '+s.title:D.book.title+' illustration'):'Supplemental teaching illustration, not a book page';$('icon').hidden=!!visual;
    $('teachingStop').hidden=!s.stop||!stopShown;$('stopText').textContent=s.stop||'';
    $('count').textContent=(i+1)+' of '+D.steps.length+(s.bookPage?' · '+s.title:'');$('fill').style.width=((i+1)/D.steps.length*100)+'%';
    $('next').textContent=s.stop&&!stopShown?'Show Teaching Stop →':i===D.steps.length-1?'Finish Read Aloud →':s.vocabulary?'Continue →':'Next →';notify();
  }
  $('prev').onclick=()=>{if(i>0){i--;stopShown=false;$('teacherNotes').open=false;render()}};
  $('next').onclick=()=>{if(D.steps[i].stop&&!stopShown){stopShown=true;render();return}if(i<D.steps.length-1){i++;stopShown=false;$('teacherNotes').open=false;render()}};
  $('revisit').onclick=()=>{$('pictureDialog').showModal();$('revisitSelect').value='1';showRevisit()};
  function showRevisit(){const n=Number($('revisitSelect').value),isGoodbye=D.book===autumn;$('revisitImg').src=isGoodbye?goodbyeImage(n):pageImage(n);$('revisitImg').alt=D.book.title+' — '+(isGoodbye?'pages '+goodbyePages[n-1].printedPages.join('–'):'story spread '+n);$('revisitCaption').textContent=isGoodbye?goodbyePages[n-1].adaptedText:'';$('revisitCaption').hidden=!isGoodbye;$('pictureDialog').classList.toggle('has-adapted',isGoodbye);}
  $('revisitSelect').onchange=showRevisit;
  $('closePictures').onclick=()=>$('pictureDialog').close();
  chooseBook();
})();
