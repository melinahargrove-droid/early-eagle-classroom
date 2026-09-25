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
    ['Exploring Fall Texts','Library & Listening','Look closely at fall books and talk about the colors you see.','assets/focus-3s/unit-2/week-1/centers/exploring-fall-texts.jpg'],
    ['Cooking Soup','Dramatic Play','Pretend to prepare and share soup. Describe the colors of the ingredients.','assets/focus-3s/unit-2/week-1/centers/cooking-soup.jpg'],
    ['Playdough Color Mixing','Discovery','Explore what happens when playdough colors are combined.','assets/focus-3s/unit-2/week-1/centers/playdough-color-mixing.jpg'],
    ['Favorite Foods','Writing & Drawing','Draw or write about a food you enjoy and the colors you notice.','assets/focus-3s/unit-2/week-1/centers/favorite-foods.jpg'],
    ['Autumn Leaves','Building Blocks (Math)','Compare, sort, and make patterns with autumn leaves.','assets/focus-3s/unit-2/week-1/centers/autumn-leaves.png']
  ];
  // Teacher invitations expand the weekly overview; exact daily center assignments are not specified there.
  const centerLessons=[
    [['Prepare','Leaves, safe natural materials, trays or paper.'],['1 · Notice','Look closely at colors, shapes, and textures.'],['2 · Model','Move two or three pieces around a tray to try an arrangement.'],['3 · Explore','Let children arrange and rearrange; photograph a design before it changes.'],['Ask','What might you move or add?'],['Support & extend','Offer fewer choices or invite pointing. Extend with repeated shapes or color groups.']],
    [['Prepare','Blocks, loose parts, and photos or observations of trees.'],['1 · Notice','Look at trunks, branches, and autumn leaves together.'],['2 · Model','Build a broad base and add branches or leaves. Wonder how it will stand.'],['3 · Explore','Children build, revise, and compare their trees.'],['Ask','How could your tree stand tall? Where will its leaves go?'],['Support & extend','Start with a sturdy base. Extend by comparing heights or counting pieces.']],
    [['Prepare','A small selection of fall picture books and a comfortable reading space.'],['1 · Notice','Let children choose a cover and say or show what they notice.'],['2 · Model','Turn pages gently and look closely before talking.'],['3 · Explore','Follow observations about colors, weather, trees, and foods.'],['Ask','What do you see? Have you seen that color outdoors?'],['Support & extend','Welcome pointing and home-language words. Compare two illustrations.']],
    [['Prepare','Pretend pot, bowls, spoons, play-food ingredients, and optional recipe paper.'],['1 · Notice','Explore the play kitchen and the colors of its ingredients.'],['2 · Model','Choose ingredients, stir, and offer soup to a friend.'],['3 · Explore','Children take roles, cook, serve, and share family food ideas.'],['Ask','What will go in your soup? What color is it?'],['Support & extend','Offer a cook or server role. Extend with a menu or counting spoonfuls.']],
    [['Prepare','Two or more playdough colors, a mat, and child-safe tools.'],['1 · Notice','Place separate colors together and invite predictions.'],['2 · Model','Press small pieces together; keep some original colors for comparison.'],['3 · Explore','Knead, roll, and describe what changes. Any result is welcome.'],['Ask','What do you notice as you mix?'],['Support & extend','Allow extra sensory time. Draw a before-and-after picture or try another pair.']],
    [['Prepare','Paper, crayons or markers, clipboards, and optional food photos.'],['1 · Notice','Talk about foods children enjoy and their colors.'],['2 · Model','Draw one food and add a mark, label, or dictated words.'],['3 · Explore','Children draw or write an idea and tell someone about it.'],['Ask','What food will you show? Which colors will you use?'],['Support & extend','Accept marks, pointing, and home-language names. Extend with a menu or recipe.']],
    [['Prepare','Leaves or leaf counters in several colors, shapes, and sizes; trays or mats.'],['1 · Notice','Describe leaf attributes children can see or feel.'],['2 · Model','Sort by one rule or start a simple repeating pattern.'],['3 · Explore','Children choose a rule, move leaves, and explain or show their thinking.'],['Ask','How are these alike? What could come next?'],['Support & extend','Start with two clear groups. Extend by changing the rule or comparing amounts.']]
  ];
  const card=(title,lead,boxes,img)=>({title,lead,boxes,img});
  const data={
    community:{title:'Community Meeting',sub:'World of Color · '+day, cards:[card(meetings[day][0],meetings[day][1],[['Invite','What colors do we notice all around us?'],['Respond','Welcome words, gestures, pointing, and home-language color words.']],null)]},
    foundational:{title:'Foundational Literacy',sub:'Rhyme · initial sounds · compound words',cards:[card('Listen and Play With Words','Use the current Foundational Literacy routine for this day.',[['Listen','Notice rhyme and initial sounds during familiar songs and words.'],['Blend','Invite children to join two spoken word parts to make a compound word.'],['Teacher note','Use the assigned daily curriculum sequence; this week overview does not specify a letter or day-by-day script.']])]},
    writing:{title:'Writing & Drawing',sub:'Favorite Foods',cards:[card('Favorite Foods','Offer paper and drawing or writing tools during play.',[['Invite','What food do you like? What colors do you notice in it?'],['Document','Record children’s words when they want support. Welcome drawings, marks, and home-language words.']], 'assets/focus-3s/unit-2/week-1/centers/favorite-foods.jpg')]},
    centers:{title:'Centers & Play',sub:'Offer and follow children’s interests; centers are not assigned by day.',cards:centerData.map((x,i)=>card(x[0],x[1]+' · '+x[2],centerLessons[i],x[3]))},
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
