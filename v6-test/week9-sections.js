(()=>{
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const p=new URLSearchParams(location.search);
  const day=days.includes(p.get('day'))?p.get('day'):'Monday';
  const view=p.get('view')||'community';
  const centerData=[
    ['Nature Arrangements','Art Studio','Arrange leaves and other natural materials. Notice their colors, shapes, and placement.','assets/focus-3s/unit-2/week-1/centers/nature-arrangements.png'],
    ['Building Autumn Trees','Blocks','Build trees with blocks and loose parts. Look at trunks, branches, and leaves.','assets/focus-3s/unit-2/week-1/centers/building-autumn-trees.png'],
    ['Exploring Fall Texts','Library & Listening','Look closely at fall books and talk about the colors you see.','assets/focus-3s/unit-2/week-1/centers/exploring-fall-texts.jpg'],
    ['Making Soup','Dramatic Play','Pretend to prepare and share soup. Describe the colors of the ingredients.','assets/focus-3s/unit-2/week-1/centers/cooking-soup.jpg'],
    ['Playdough Color Mixing','Science & Engineering','Explore what happens when playdough colors are combined.','assets/focus-3s/unit-2/week-1/centers/playdough-color-mixing.jpg'],
    ['Favorite Foods','Writing & Drawing','Draw or write about a food you enjoy and the colors you notice.','assets/focus-3s/unit-2/week-1/centers/favorite-foods.jpg'],
    ['Autumn Leaves','Math','Count leaves onto a tree using number dot cards from 0 to 5.','assets/focus-3s/unit-2/week-1/centers/autumn-leaves.png']
  ];
  // The weekly plan suggests these introductions by day. Centers remain available for child-led revisits.
  const centerLessons=[
    [['Prepare','Collect colorful leaves, sticks and other safe natural materials; offer felt or paper backgrounds and a camera.'],['1 · Connect','Revisit pages 21–22 of Goodbye Summer, Hello Autumn. Name colors and compare rough and smooth textures.'],['2 · Model','Choose a background and thoughtfully place a leaf and another natural material. Explain that an arrangement can change.'],['3 · Explore','Children arrange materials, tell about their work, and photograph it before returning pieces for others. Save photos for Week 2.'],['Ask','Why did you choose that piece? How does it feel? What should others know about your arrangement?'],['Support & extend','Offer fewer items or name choices with a child. Record their words with the photograph.']],
    [['Prepare','Wooden and colored blocks, fabric or real leaves, tree images and fall color cards.'],['1 · Connect','Look at autumn tree images and notice branches, treetops and changing leaf colors.'],['2 · Model','Show how unit blocks and colored blocks can represent a trunk and leaves. Children may build upward or sideways.'],['3 · Explore','Children construct trees. Photograph their structures and compare them with real trees.'],['Ask','How did you build it? Which colors did you choose? How many branches or leaves?'],['Support & extend','Offer smaller tabletop blocks or leaf images attached to blocks; invite a story about the tree.']],
    [['Prepare','Fall books and photographs, markers, sticky notes, and a place to return books.'],['1 · Connect','Choose a fall book or image and notice its colors and details.'],['2 · Model','Hold the book right-side-up, open at the front, turn pages gently, and mark an interesting page with a happy-face sticky note.'],['3 · Explore','Children explore and flag pages or photos that interest them, explain why, and return books carefully.'],['Ask','Why this book? What is interesting or surprising in this picture?'],['Support & extend','Pre-draw sticky-note faces or offer fewer books when choices feel overwhelming.']],
    [['Prepare','Soup Day pages 7–8 and 11–12, play kitchen, pot, ladle, pretend vegetables and pasta, and a visual recipe.'],['1 · Connect','Recall how the girl and her mother wash, chop and cook ingredients in Soup Day. Talk about family soups.'],['2 · Model','Wash and chop pretend vegetables, add them to the pot, stir, add pasta, and blow on the hot soup before tasting.'],['3 · Explore','Children choose a soup, gather ingredients, follow a recipe, and negotiate cooking and serving roles.'],['Ask','What comes first or next? What colors and ingredients are in your soup?'],['Support & extend','Begin with fewer tools or fewer steps. Welcome familiar names such as stew, daal or sopa; collect pretend recipes.']],
    [['Prepare','Separate small batches of colored playdough, trays, tools, fall color cards and the autumn book at pages 21–22.'],['1 · Connect','Notice red, brown, gold, yellow and purple in the autumn leaves. Choose a color to try to make.'],['2 · Model','Mix a little yellow and red by kneading, squeezing and rolling; add a pinch of brown to move toward gold.'],['3 · Explore','Children try combinations and compare lighter and darker results with the color cards. Record a color recipe if useful.'],['Ask','What color are you trying to make? How could you improve it?'],['Support & extend','Use small pre-rolled pieces or let a child knead two colors inside a sealed bag.']],
    [['Prepare','Soup Day pages 3–4 and 27, food visuals, paper, drawing tools and a class-book binder.'],['1 · Connect','Notice the colorful ingredients in Soup Day, then invite children to think of foods they enjoy.'],['2 · Model','Choose a food visual, draw the food, and make a letter, marks or dictated label for its name.'],['3 · Explore','Children represent favorite foods; record their words and collect finished pages in a class book.'],['Ask','Which colors show your food? What would you like me to write?'],['Support & extend','Welcome any communication and mark making. Help children speak respectfully about foods others enjoy.']],
    [['Prepare','Tree and leaf templates, five leaves per child, 0–5 number dot cards or a 0–5 number cube.'],['1 · Connect','Compare the leaves with pages 21–22 of Goodbye Summer, Hello Autumn.'],['2 · Model','Draw a dot card or roll. Count the dots, then put that many leaves on the tree one at a time.'],['3 · Explore','Children repeat with new cards and compare one more, one less and equal amounts.'],['Ask','How many leaves are on your tree? What happens if you add one more?'],['Support & extend','Use larger felt leaves, Velcro or a tactile five-frame. Extend beyond five when ready.']]
  ];
  const centerDays={Monday:[0,1],Tuesday:[2,6],Wednesday:[3,5],Thursday:[4],Friday:[3,1,6]};
  const card=(title,lead,boxes,img)=>({title,lead,boxes,img});
  const meetingCards={
    Monday:[card('Star Pose','Stand tall and balanced, then breathe together.',[['1 · Set up','Step feet wide and lift both arms out to the sides with fingers spread.'],['2 · Imagine','Pretend to be a strong, steady structure.'],['3 · Breathe','Take several deep breaths while holding the pose.'],['Support','A child may do the pose while seated in a chair.'],['Notice','How do children settle and participate in the group?']])],
    Tuesday:[card('Five Finger Breathing','Trace each finger while breathing slowly.',[['1 · Set up','Sit comfortably with a straight back. Hold one hand up; place the other index finger at the outside base of the thumb.'],['2 · Trace','Breathe in while tracing to the top of a finger; breathe out while tracing down the other side.'],['3 · Continue','Move across every finger to the pinky, then reverse direction back to the thumb.'],['Support','Model alongside children and slow the movement to match their breathing.']])],
    Wednesday:[card('Magic Ball','Transform a beach ball with children’s ideas.',[['1 · Invite','Hold a beach ball and ask what kind of ball it could become. Welcome playful ideas, such as a funny or very delicate ball.'],['2 · Transform','The group asks what the ball will be. The holder names an idea; everyone wiggles fingers and says three magic words.'],['3 · Pass','Pass the ball in a way that matches its new quality. Continue so each child gets a turn to choose during the week.'],['Support','Offer concrete choices such as big or small, or use a core board to support a choice.']])],
    Thursday:[card('Bicycles','Take an imaginary ride to places children choose.',[['1 · Prepare','Pretend to put on helmets. Children can pedal with legs in the air while lying down or use their arms while seated.'],['2 · Ride','Invite a destination, pedal together, then stop and notice what is there.'],['3 · Solve or continue','If a problem arises on the ride, talk through a solution and use a familiar breath if helpful. Invite another destination.'],['4 · Return','Pedal back to school together and stop.'],['Ask','Where should we ride next? What do you notice when we arrive?']])],
    Friday:[card('Problem Stories','Use block people to act out a short, familiar classroom problem.',[['1 · Choose','Pick a current issue the children recognize, such as sharing materials.'],['2 · Act','Show a short scenario with block people and pause before the solution.'],['3 · Discuss','Invite children to name feelings and suggest helpful actions; act out a response.'],['Teacher note','The linked plan refers to the Community Meeting Intro Document for a sample script. Choose a real classroom situation and keep the story brief.'],['Observe','Notice participation, peer responses, and which children need more support with connection or conflict.']])]
  };
  const meetingVisuals={
    Monday:'star-pose.jpg',
    Tuesday:'five-finger-breathing.jpg',
    Wednesday:'magic-ball.jpg',
    Thursday:'bicycles.jpg',
    Friday:'problem-stories.jpg'
  };
  days.forEach(d=>{meetingCards[d][0].img='assets/focus-3s/unit-2/week-1/community/'+meetingVisuals[d]});
  const data={
    community:{title:'Community Meeting',sub:'Mindful practice and games · '+day,cards:meetingCards[day]},
    foundational:{title:'Foundational Literacy',sub:'Use your current routine',cards:[card('Listen and Play With Words','The source weekly plan assigns Heggerty Week 6, Days 1–3 at the start of the week.',[['Monday–Wednesday','Use the corresponding Week 6 daily sequence in your replacement Foundational Literacy materials.'],['Thursday–Friday','The source weekly plan leaves these days unassigned; use the current classroom routine.'],['Teacher note','The linked center support cards are resources, not a complete replacement daily script.']], 'assets/focus-3s/unit-2/week-1/monday/foundational-listening.jpg')]},
    writing:{title:'Writing & Drawing',sub:'Favorite Foods',cards:[card('Favorite Foods','Introduce Wednesday; keep available for revisits.',centerLessons[5],centerData[5][3])]},
    centers:{title:'Centers & Play',sub:'Suggested '+day+' introductions or revisits · keep other centers available',cards:centerDays[day].map(i=>{const x=centerData[i];return card(x[0],x[1]+' · '+x[2],centerLessons[i],x[3])})},
    smallgroups:{title:'Literacy Small Groups',sub:'Responsive groups',cards:[card('Listen, Notice, Respond','Select the group activity that fits children’s current needs.',[['Literacy focus','Rhyme, initial sounds, and compound-word blending.'],['Observation','Notice engagement, language, and how children share their ideas.'],['Teacher note','Use the current small-group lesson plan for exact materials and sequence.']], 'assets/focus-3s/unit-2/week-1/monday/literacy-small-group.jpg')]},
    building:{title:'Math',sub:'Autumn Leaves · count to 5',cards:[card('Autumn Leaves','Introduce Tuesday; use number dot cards to count leaves onto a tree.',centerLessons[6],centerData[6][3])]},
    storytelling:{title:'Thinking & Feedback',sub:'Notice and document learning',cards:[card('What Did We Notice?','Invite children to talk about their play and color discoveries.',[['Ask','What color did you notice today? Did any material change?'],['Document','Note children’s words, gestures, self-regulation, and engagement.']], 'assets/focus-3s/unit-2/week-1/monday/thinking-feedback.jpg')]},
    closing:{title:'Closing Circle',sub:'Return to the week’s question',cards:[card('Colors All Around Us','Close with one color or discovery children noticed.',[['Share','Accept words, pointing, gestures, and home-language responses.'],['Family connection','Invite families to notice colors together at home.']], 'assets/focus-3s/unit-2/week-1/monday/closing-circle.jpg')]}
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