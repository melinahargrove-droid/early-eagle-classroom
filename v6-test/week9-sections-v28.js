(()=>{
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const p=new URLSearchParams(location.search);
  const day=days.includes(p.get('day'))?p.get('day'):'Monday';
  const requestedView=p.get('view')||'community';
  if(['feedback','storytelling','closing'].includes(requestedView)){location.replace('lesson-runner-week9.html?week=9&day='+days.indexOf(day)+'&section=9');return;}
  const view=requestedView==='smallgroups'?'building':requestedView;
  if(view==='writing'&&(day==='Monday'||day==='Wednesday')){location.replace('lesson-runner-week9.html?week=9&day='+days.indexOf(day)+'&section=4');return;}
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
  const centerDetails=[
  [
    [
      "Vocabulary",
      "Arrange: place things thoughtfully. Autumn: fall, the cooler season after summer when many leaves change color. Rough: bumpy. Smooth: even to the touch. Texture: how something feels."
    ],
    [
      "Prepare the display",
      "Gather materials with children a few days ahead. Invite family contributions. Organize leaves, sticks, pinecones, acorns and flowers in trays or bowls by color or material. Display examples from the Nature Arrangements Artist Resources."
    ],
    [
      "Model choosing and feeling",
      "Choose felt, paper, the table, or a tray as a background. Name a chosen leaf’s color. Compare a rough pinecone with a smooth leaf, using the word texture."
    ],
    [
      "Model arranging and documenting",
      "Show the artist examples. Children may make a scene, tell a story, or arrange materials in a way they enjoy. Photograph each arrangement and write down the child’s ideas before materials are returned. Keep the photographs for the second part in Week 2."
    ],
    [
      "Facilitate",
      "Invite children to explain why they chose particular materials, how they feel, and what they want others to know. Name items alongside children who need language support; offer fewer materials and remove small items when appropriate for the group."
    ],
    [
      "Extend and connect home",
      "Create a class book of arrangement photographs and children’s words. Invite families to contribute natural materials found near home or on the way to school."
    ]
  ],
  [
    [
      "Vocabulary",
      "Autumn: fall, the cooler season after summer. Treetop: the top or crown of a tree. Crimson: deep red with a little purple. Rust: orange or reddish brown; also the coating that can form on wet metal."
    ],
    [
      "Prepare the display",
      "Offer wooden unit blocks, colored blocks, fabric or real leaves, or felt leaf shapes. Translucent blocks are optional. Display Tree Images and optional Simple Block Structures. Bring the Fall Color Cards."
    ],
    [
      "Connect and read color names",
      "Show the autumn book and invite two or three children to describe changes in trees. Point to the Fall Color Cards and track the printed names while reading crimson, rust and other colors. Notice that falling leaves reveal branches and treetops."
    ],
    [
      "Build and compare",
      "Invite children to represent trunks and leaves using blocks and loose parts. Notice upward growth; sideways building is valid too. Photograph structures and compare them with real autumn trees. Continue this experience in Week 2."
    ],
    [
      "Facilitate",
      "How did you build your tree? Which colors did you choose, and why? How does your tree change in autumn? How many branches and leaves are there? How do you know?"
    ],
    [
      "Support and extend",
      "Use smaller tabletop blocks; attach real or printed leaves to blocks, or drape pipe cleaners with leaves over a trunk. Invite a story inspired by the structure. Ask families for neighborhood tree photographs and observations."
    ]
  ],
  [
    [
      "Vocabulary",
      "Choose: pick from a group. Interesting: something you want to learn more about."
    ],
    [
      "Prepare",
      "Set out fall books and photographs, markers, and sticky notes or paper slips. Bring one book, one photograph and one sticky note to the introduction. Invite families to suggest fall books and share photographs of fall activities."
    ],
    [
      "Model with a book",
      "Put the book in your lap, start at its front cover, and turn pages gently. Explain what interests you about one illustration. Draw a happy face on a sticky note and mark that page for other readers."
    ],
    [
      "Model with a photograph",
      "Show a fall photograph. Invite one or two children to describe what they see. Mark the photograph with a happy-face note too."
    ],
    [
      "Explore and care",
      "Children look at books and images, flag interesting details, explain their choices, and share questions with peers. Model book handling when needed. Return each book before choosing another or leaving."
    ],
    [
      "Facilitate",
      "Why did you choose this book? What colors do you notice? What is happening? What does it remind you of? What would you tell another reader? What interests you, and what are you wondering?"
    ],
    [
      "Support",
      "Pre-draw happy faces on notes or reduce the number of books if choices feel overwhelming."
    ]
  ],
  [
    [
      "Vocabulary",
      "Chop: cut into small pieces. Ingredients: things combined to make a dish. Peel: remove a fruit or vegetable’s skin. Prepare: make something. Recipe: ingredients and directions for food. Stir: mix by moving a spoon in a circle."
    ],
    [
      "Connect",
      "Show pages 7–8: the girl and mother wash and chop vegetables. Show pages 11–12 and ask what they do next. Invite children to share soups their families eat. This experience begins later in the week and continues into Week 2."
    ],
    [
      "Model the sequence",
      "Pretend to wash and chop vegetables, place them in the pot, and stir. Name the colors of ingredients. Add pasta, pretend to taste, and model blowing on soup that is too hot."
    ],
    [
      "Play together",
      "Children choose a soup using recipes, gather ingredients, and prepare it. Support discussion of who will play each family member or friend; model language for agreeing on roles."
    ],
    [
      "Facilitate",
      "What ingredients will you use? What comes first, second and third? Which colors and vegetables do you notice? Why do you like this soup? How can you work together?"
    ],
    [
      "Support and extend",
      "Start with fewer props or simplify the sequence to add vegetables, water, stir and eat. Model each step and use familiar words such as daal, stew or sopa. Collect children’s invented recipes. Invite family recipes, photographs or empty food containers; note interests for possible real soup-making in Week 5."
    ]
  ],
  [
    [
      "Vocabulary",
      "Improve: make better. Knead: press, fold and pull dough. Mix: put different things together. Roll: turn something over and over. Squeeze: press tightly together."
    ],
    [
      "Prepare",
      "Divide plain playdough into about five portions. Color separately: two yellow portions, one red, one brown and one purple. Keep colors apart. Provide trays, tools and Fall Color Cards. Bring yellow, red and brown dough and a tray to the introduction; flag book pages 21–22."
    ],
    [
      "Plan a color",
      "Point to red, brown, gold or orange, yellow and purple on pages 21–22. Ask which colors could be combined to make the gold in the book. Gather ideas before modeling."
    ],
    [
      "Mix",
      "Take a small piece of yellow and a pinch of red. Model kneading, squeezing and rolling until the colors combine. Hold the result beside the gold in the book."
    ],
    [
      "Compare and improve",
      "Ask how to improve the match. Add a pinch of brown and knead again. Continue collecting ideas, making small changes, and comparing with the book until the color is closer to gold. Then explore the dough with your hands."
    ],
    [
      "Explore and document",
      "Children choose a color to make and try combinations. Narrate their mixing actions. Compare colors with peers and the Fall Color Cards using lighter and darker. Record discoveries; children who are ready can describe a recipe using quantities of colored dough."
    ],
    [
      "Facilitate",
      "What color will you make, and how? How could you improve it? How could you help a friend make their color? How is it similar to or different from the book? What changes as you mix?"
    ],
    [
      "Support and extend",
      "Offer small pre-rolled balls, or place two colors in a sealed bag for children who prefer not to touch dough. Photograph recipes for a class book. Add natural materials to create an autumn scene. Invite color mixing at home with art materials."
    ]
  ],
  [
    [
      "Vocabulary",
      "Favorite: what you like most. Vegetables: plant leaves, stems or roots we eat. Fresh: just picked or new. Bright: strong, clear color or shiny. Spices: ground or chopped plant ingredients used to flavor food, such as cinnamon or pepper."
    ],
    [
      "Prepare",
      "Provide Soup Day, its final recipe and other illustrated recipes, the Favorite Foods visual, blank paper, pencils, pens, markers or crayons, and a binder with sheet protectors. Flag food illustrations, such as pages 5–6."
    ],
    [
      "Notice food colors",
      "Revisit the carrots on pages 3–4 and the soup on page 27. Explain fresh vegetables and bright colors. Invite children to identify orange carrots and broth, yellow pasta and onions, green zucchini and parsley, and white mushrooms."
    ],
    [
      "Model writing",
      "Choose a food picture from the visual. Refer to it while drawing and writing its name: a first letter or letter-like marks are welcome. Offer to write children’s dictated words."
    ],
    [
      "Create and collect",
      "Children communicate a favorite food, choose colors to represent it, and draw or make marks. Discuss lighter, darker, pale and bright colors. Record their words and labels, then help place finished pages in the class binder."
    ],
    [
      "Respect and support",
      "Welcome all communication and mark-making. Use a child’s communication-system pictures or lunchbox to support choices. Help children respond respectfully: “That’s new for me” or “I haven’t tried that before.”"
    ],
    [
      "Facilitate",
      "Which colors do you see in your favorite food? What might its color tell you about its taste? Which colors could you use to draw it?"
    ],
    [
      "Extend and connect home",
      "Read the class food book and add pages over time. Children may create books about new foods they try or sort food pictures by category. Invite family recipes, food traditions and ingredients to explore; connect children’s ideas to Dramatic Play."
    ]
  ],
  [
    [
      "Vocabulary",
      "More: a bigger amount. Less: a smaller amount. Equal: the same amount."
    ],
    [
      "Prepare",
      "Flag Goodbye Summer, Hello Autumn pages 21–22. Provide one tree and five leaves per child, 0–5 dot cards or a 0–5 cube, and five-frames. Print the linked Tree/Leaf Template and Frame Cards. The source also refers to Building Blocks Teacher’s Guide, Week 6, page 88."
    ],
    [
      "Compare leaves",
      "Show the paper leaves beside the book’s leaves. Invite children to notice similarities and differences. Explain that they will use leaves, trees and number cards to play a counting game."
    ],
    [
      "Model counting",
      "Draw a number dot card or roll the cube. Ask which number it shows and how children know. Count together to check, then count leaves one at a time onto the tree."
    ],
    [
      "Model one more",
      "Ask what to do to have one more leaf. Explain more as a bigger amount, gather ideas, and demonstrate adding one leaf. Count the new amount together."
    ],
    [
      "Model one less",
      "Ask what to do to have one less leaf. Explain less as a smaller amount, gather ideas, and demonstrate removing one leaf. Count what remains."
    ],
    [
      "Model equal",
      "Compare with a friend’s tree. Explain equal as the same amount. If the friend has one leaf and you want one too, ask what you could do. Demonstrate making the amounts equal."
    ],
    [
      "Play and discuss",
      "Children draw a card or roll, then move that many leaves from their five-frame to their tree. Ask how many they have and how they know. Compare with a friend: more, less or equal? Ask what happens after adding one."
    ]
  ]
];
  const centerResources=[
  [
    {
      "title": "01b. Fo3s U2W1 Centers: Art Studio - Nature Arrangements Artist Resources.pdf",
      "url": "https://drive.google.com/file/d/1zKpcis4t5d1NeRVumMPohgOD0eR4HR4H/view?usp=drivesdk"
    },
    {
      "title": "01a. Fo3s U2W1 Centers: Art Studio - Nature Arrangements CLS.pdf",
      "url": "https://drive.google.com/file/d/1rhujgmKYv6iuY1TkFBzF2JEdNZy1sDw3/view?usp=drivesdk"
    },
    {
      "title": "01. Fo3s U2W1 Centers: Art Studio - Nature Arrangements.pdf",
      "url": "https://drive.google.com/file/d/1raiNwTJYGlS9tJdlJlkQMEGxxI-ID59K/view?usp=drivesdk"
    }
  ],
  [
    {
      "title": "01c. Fo3s U2W1 Centers: Blocks - Building Autumn Trees Simple Blocks Structures.pdf",
      "url": "https://drive.google.com/file/d/1WC1-WAYyBftZRxqkMnB-uUiywWIJmrbU/view?usp=drivesdk"
    },
    {
      "title": "01b. Fo3s U2W1 Centers: Blocks - Building Autumn Trees Images.pdf",
      "url": "https://drive.google.com/file/d/1jwJWcjeHxZ1-fMay_BsasKN51tOT1o2_/view?usp=drivesdk"
    },
    {
      "title": "01a. Fo3s U2W1 Centers: Blocks - Building Autumn Trees CLS.pdf",
      "url": "https://drive.google.com/file/d/1uZHO0r_mRbY2PYh1u9P0lavupe35OFAO/view?usp=drivesdk"
    },
    {
      "title": "01. Fo3s U2W1 Centers: Blocks - Building Autumn Trees.pdf",
      "url": "https://drive.google.com/file/d/1sWWVvAKcnYEn-l72F8NXZOocgMsegVwm/view?usp=drivesdk"
    }
  ],
  [
    {
      "title": "01b. Fo3s U2W1 Centers: Library & Listening - Fall Images.pdf",
      "url": "https://drive.google.com/file/d/1GSwvqOxk6UiW-RpDNQrgCIaf3VML7Vaj/view?usp=drivesdk"
    },
    {
      "title": "01a. Fo3s U2W1 Centers: Library & Listening - Exploring Fall Texts CLS.pdf",
      "url": "https://drive.google.com/file/d/1GPypJNfJMae2n4qimMCyuHu3I0ar6xid/view?usp=drivesdk"
    },
    {
      "title": "01. Fo3s U2W1 Centers: Library & Listening - Exploring Fall Texts.pdf",
      "url": "https://drive.google.com/file/d/1ELb2c8ytET7k3qTRCUHXNXdojoap9lYZ/view?usp=drivesdk"
    }
  ],
  [
    {
      "title": "01b. Fo3s U2W1 Centers: Dramatic Play - Making Soup Directions.pdf",
      "url": "https://drive.google.com/file/d/16h8DGmfj1smFKpUlsIZuNUiXfdP3HuH3/view?usp=drivesdk"
    },
    {
      "title": "01a. Fo3s U2W1 Centers: Dramatic Play - Making Soup CLS.pdf",
      "url": "https://drive.google.com/file/d/1smUZLL1iK4raLjrbjF1FedCAye-A4dkU/view?usp=drivesdk"
    },
    {
      "title": "01. Fo3s U2W1 Centers: Dramatic Play - Making Soup.pdf",
      "url": "https://drive.google.com/file/d/1S12jel4RPOTjDh_MV8AUs3OGK5jhoTWT/view?usp=drivesdk"
    }
  ],
  [
    {
      "title": "01b. Fo3s U2W1 Centers: Science & Engineering - Playdough Color Mixing Color Cards.pdf",
      "url": "https://drive.google.com/file/d/1Lg3a-orgnntnvedGeN7uTsckQYcPEopr/view?usp=drivesdk"
    },
    {
      "title": "01a. Fo3s U2W1 Centers: Science & Engineering - Playdough Color Mixing CLS.pdf",
      "url": "https://drive.google.com/file/d/1AZB7bdYU3asEJNc1QwrbGaiVckVEl6XL/view?usp=drivesdk"
    },
    {
      "title": "01. Fo3s U2W1 Centers: Science & Engineering - Playdough Color Mixing.pdf",
      "url": "https://drive.google.com/file/d/1Vv6CnxUlBEK0prh2fHktPjIz2paLLObB/view?usp=drivesdk"
    }
  ],
  [
    {
      "title": "01b. Fo3s U2W1 Centers: Writing & Drawing - Favorite Foods Visuals.pdf",
      "url": "https://drive.google.com/file/d/1ibp6u7YMAtoQ7siuVXmtZ9dUrasJUdWt/view?usp=drivesdk"
    },
    {
      "title": "01a. Fo3s U2W1 Centers: Writing & Drawing - Favorite Foods CLS.pdf",
      "url": "https://drive.google.com/file/d/1VhnKzJ0EvXU7CvIGcLOyCecnz6bpLIkm/view?usp=drivesdk"
    },
    {
      "title": "01. Fo3s U2W1 Centers: Writing & Drawing - Favorite Foods.pdf",
      "url": "https://drive.google.com/file/d/196mwbPIDKOO0c5p-JwHjA1Ey7h90A19o/view?usp=drivesdk"
    }
  ],
  [
    {
      "title": "01c. Fo3s U2W1 Centers: Math - 10 Frame Cards.pdf",
      "url": "https://drive.google.com/file/d/1zYNKaj5ZP_jfboLTzfESuzmdwztmG_nX/view?usp=drivesdk"
    },
    {
      "title": "01b. Fo3s U2W1 Centers: Math - Autumn Leaves Tree Template.pdf",
      "url": "https://drive.google.com/file/d/1kysHVtaorMlPatxq5QGY52b5U5yHVqlC/view?usp=drivesdk"
    },
    {
      "title": "01a. Fo3s U2W1 Centers: Math - Autumn Leaves CLS.pdf",
      "url": "https://drive.google.com/file/d/1lamCQNJrjx6ndLwFOs3Wy5Pq20_MvqVb/view?usp=drivesdk"
    },
    {
      "title": "01. Fo3s U2W1 Centers: Math - Autumn Leaves.pdf",
      "url": "https://drive.google.com/file/d/1aQ9gsuPJqhGbotUgMQWjvEcy-QpaxXhR/view?usp=drivesdk"
    }
  ]
];
  const sourceLink=(title,url)=>({title,url});
  const weekPlan=sourceLink('Original Week 1 Plan','https://drive.google.com/file/d/1C6E9TvK6u5emApt_Imn0ouACPLimPav6/view');
  function centerCards(i){
    const x=centerData[i];
    if(i===0||i===1||i===2)return [{...card(x[0],x[2],centerDetails[i],x[3]),resources:centerResources[i],group:x[0],area:x[1],centerIntro:true}];
    if(i===3)return centerDetails[i].slice(0,4).map(step=>({...card(x[0]+' · '+step[0],x[2],[step],step[0]==='Model the sequence'?'assets/focus-3s/unit-2/week-1/centers/making-soup-model-sequence.png':x[3]),resources:centerResources[i],group:x[0],notes:centerDetails[i].slice(4)}));
    if(i===4)return [0,2,3,4,5].map(n=>{
      const step=centerDetails[i][n],label=n===5?'Explore':step[0];
      const image=n===2?'assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-11.png':n===3?'assets/focus-3s/unit-2/week-1/centers/playdough-mix.png':n===4?'assets/focus-3s/unit-2/week-1/centers/playdough-compare.png':x[3];
      return {...card(x[0]+' · '+label,x[2],[step],image),resources:centerResources[i],group:x[0],doughStep:label,notes:[centerDetails[i][1],centerDetails[i][6],centerDetails[i][7]]};
    });
    return centerDetails[i].map((b,n)=>({...card(x[0]+' · '+b[0],x[1],[[b[0],b[1]]],i===6&&n===0?'assets/focus-3s/unit-2/week-1/math/autumn-leaves-vocabulary.png':i===6&&n===1?'assets/focus-3s/unit-2/week-1/math/autumn-leaves-prepare.png':i===6&&n===2?'assets/focus-3s/unit-2/week-1/math/autumn-leaves-compare.png':i===6&&n===3?'assets/focus-3s/unit-2/week-1/math/autumn-leaves-counting.png':i===6&&n===4?'assets/focus-3s/unit-2/week-1/math/autumn-leaves-one-more.png':i===6&&n===5?'assets/focus-3s/unit-2/week-1/math/autumn-leaves-one-less.png':i===6&&n===6?'assets/focus-3s/unit-2/week-1/math/autumn-leaves-equal.png':i===6&&n===7?'assets/focus-3s/unit-2/week-1/math/autumn-leaves-play-discuss.png':x[3]),resources:centerResources[i],group:x[0]}));
  }
  const centerDays={Monday:[0,1],Tuesday:[2,6],Wednesday:[3],Thursday:[4,5],Friday:[3,1,6]};
  const card=(title,lead,boxes,img)=>({title,lead,boxes,img});
  const meetingCards={
    Monday:[card('Star Pose','Stand tall and balanced, then breathe together.',[['1 · Set up','Step feet wide and lift both arms out to the sides with fingers spread.'],['2 · Imagine','Pretend to be a strong, steady structure.'],['3 · Breathe','Take several deep breaths while holding the pose.'],['Support','A child may do the pose while seated in a chair.'],['Notice','How do children settle and participate in the group?']])],
    Tuesday:[card('Five Finger Breathing','Trace each finger while breathing slowly.',[['1 · Set up','Sit comfortably with a straight back. Hold one hand up; place the other index finger at the outside base of the thumb.'],['2 · Trace','Breathe in while tracing to the top of a finger; breathe out while tracing down the other side.'],['3 · Continue','Move across every finger to the pinky, then reverse direction back to the thumb.'],['Support','Model alongside children and slow the movement to match their breathing.']])],
    Wednesday:[card('Magic Ball','Transform a beach ball with children’s ideas.',[['1 · Invite','Hold a beach ball and ask what kind of ball it could become. Welcome playful ideas, such as a funny or very delicate ball.'],['2 · Transform','Chant: “Magic Ball, Magic Ball, what will you be?” The holder names an idea; everyone wiggles fingers and says three magic words together, such as Abracadabra, Hocus Pocus, Shazam.'],['3 · Pass','Pass the ball in a way that matches its new quality. Continue so each child gets a turn to choose during the week.'],['Support','Offer concrete choices such as big or small, or use a core board to support a choice.']])],
    Thursday:[card('Bicycles','Take an imaginary ride to places children choose.',[['1 · Prepare','Pretend to put on helmets. Children can pedal with legs in the air while lying down or use their arms while seated.'],['2 · Ride','Invite a destination. Move arms or legs while saying or singing “Pedaling, pedaling, pedaling… and stop.” Invite children to describe what they notice there.'],['3 · Solve or continue','If a problem arises on the ride, talk through a solution and use a familiar breath if helpful. Invite another destination.'],['4 · Return','Pedal back to school together and stop.'],['Ask','Where should we ride next? What do you notice when we arrive?']])],
    Friday:[card('Problem Stories','Use block people to act out a short, familiar classroom problem.',[['1 · Choose','Pick a current issue the children recognize, such as sharing materials.'],['2 · Act','Show a short scenario with block people and pause before the solution.'],['3 · Discuss','Invite children to name feelings and suggest helpful actions; act out a response.'],['Teacher note','The linked plan refers to the Community Meeting Intro Document for a sample script. Choose a real classroom situation and keep the story brief.'],['Observe','Notice participation, peer responses, and which children need more support with connection or conflict.']])]
  };
  // Keep the three Star Pose teaching steps visible; supports remain in notes.
  meetingCards.Monday[0].childSteps=meetingCards.Monday[0].boxes.splice(0,3);
  const meetingVisuals={
    Monday:'star-pose.jpg',
    Tuesday:'five-finger-breathing.jpg',
    Wednesday:'magic-ball.jpg',
    Thursday:'bicycles.jpg',
    Friday:'problem-stories.jpg'
  };
  days.forEach(d=>{meetingCards[d][0].img='assets/focus-3s/unit-2/week-1/community/'+meetingVisuals[d]});
  meetingCards[day][0].resources=[sourceLink('Original Community Meeting Plan','https://drive.google.com/file/d/1NJ7f17f-U58hHGCqCdnEnn52LR08Kk-I/view')];
  meetingCards[day][0].teacher='The Week Plan says to choose from the Community Meeting plans. These daily choices are the companion’s suggested arrangement. Repeat Magic Ball during the week so every child can choose. Observe participation, peer responses and support needed for connection and conflict.';
  const data={
    community:{title:'Community Meeting',sub:'Mindful practice and games · '+day,cards:meetingCards[day]},
    foundational:{title:'Foundational Literacy',sub:'Launchpad for Pre-K · '+day,cards:[card('Launchpad for Pre-K','',[])]},
    writing:day==='Tuesday'?{title:'Writing & Drawing',sub:'Our Autumn Poster',cards:[card('Add to Our Autumn Poster','Invite children to revisit the group poster from the read aloud.',[['Prepare','Place the class poster, drawing tools, and the classroom copy of Goodbye Summer, Hello Autumn in Writing & Drawing.'],['Invite','What is your favorite thing about autumn? Children may draw, point, make marks, or dictate an idea.'],['Revisit','Help children look for a matching detail in the book and add to the poster as interest continues.']], 'assets/focus-3s/unit-2/week-1/tuesday/revisit-autumn-poster.jpg')]}:{title:'Writing & Drawing',sub:'Favorite Foods',cards:centerCards(5)},
    centers:{title:'Centers & Play',sub:'Suggested '+day+' introductions or revisits · keep other centers available',cards:centerDays[day].flatMap(centerCards)},
    building:{title:'Math',sub:'Autumn Leaves · optional revisit; introduce Tuesday',cards:centerCards(6)},
  }[view]||null;
  if(!data)return;
  // Tuesday Writing: keep Prepare visible beside the art; other guidance is in notes.
  if(view==='writing'&&day==='Tuesday'){
    const poster=data.cards[0];
    poster.posterIntro=true;
    poster.childSteps=poster.boxes.splice(0,1);
    poster.teacherIntro=poster.lead;
    poster.lead='';
  }

  const foodWords=[
    {word:'Favorite',definition:'What you like most.',prompt:'What is your favorite food?'},
    {word:'Vegetables',definition:'Plant leaves, stems or roots we eat.'},
    {word:'Fresh',definition:'Just picked or new.'},
    {word:'Bright',definition:'Strong, clear color or shiny.'},
    {word:'Spices',definition:'Plant ingredients used to flavor food.'}
  ];
  const isFoodVocabulary=c=>c.group==='Favorite Foods'&&c.boxes[0]?.[0]==='Vocabulary';
  const isDough=c=>c.group==='Playdough Color Mixing';
  const isDoughVocabulary=c=>isDough(c)&&c.doughStep==='Vocabulary';
  const doughWords=[
    {word:'Improve',definition:'Make better.'},
    {word:'Knead',definition:'Press, fold and pull dough.'},
    {word:'Mix',definition:'Put different things together.'},
    {word:'Roll',definition:'Turn something over and over.'},
    {word:'Squeeze',definition:'Press tightly together.'}
  ];
  let doughWordIndex=0;
  // Reuse the original PNG: source slide 12 contains printed pages 21–22.
  const doughBook={img:'assets/focus-3s/unit-2/week-1/goodbye-summer-hello-autumn/page-11.png',alt:'Goodbye Summer, Hello Autumn, pages 21–22: leaves change to red, brown, gold, yellow and purple.'};
  const doughBookSource=sourceLink('Goodbye Summer, Hello Autumn · Adapted book source','https://docs.google.com/presentation/d/1fQdq6aALHc14EUWzw4dib6Q1a70uM5dYggVqIK_fWug/edit');
  const doughAlt=c=>c.doughStep==='Plan a color'?doughBook.alt:c.doughStep==='Mix'?'Teacher hands fold yellow playdough around a small pinch of red to begin mixing':c.doughStep==='Compare and improve'?'Teacher hands add a small pinch of brown to light orange playdough beside a sample of autumn-gold dough':'Preschool children explore mixing red and yellow playdough';
  const isSoupConnect=c=>c.group==='Making Soup'&&c.boxes[0]?.[0]==='Connect';
  const isFoodColors=c=>c.group==='Favorite Foods'&&c.boxes[0]?.[0]==='Notice food colors';
  const hasSoupBook=c=>isSoupConnect(c)||isFoodColors(c);
  const foodColorPages=[
    {label:'Pages 3–4',img:'assets/focus-3s/unit-2/week-1/soup-day/pages-03-04.jpg',alt:'Soup Day, pages 3–4: a mother and child choose fresh, brightly colored carrots.'},
    {label:'Pages 27–28',img:'assets/focus-3s/unit-2/week-1/soup-day/pages-27-28.jpg',alt:'Soup Day, pages 27–28: a child enjoys soup with colorful vegetables and pasta.'}
  ];
  const selectedSoupPages=c=>isFoodColors(c)?foodColorPages:soupBookPages;
  // Verified against the numbered source slides and the center plan's opening lines.
  const soupBookPages=[
    {label:'Pages 7–8',img:'assets/focus-3s/unit-2/week-1/soup-day/pages-07-08.jpg',alt:'Soup Day, pages 7–8: the girl washes vegetables; chopped vegetables have different shapes.'},
    {label:'Pages 11–12',img:'assets/focus-3s/unit-2/week-1/soup-day/pages-11-12.jpg',alt:'Soup Day, pages 11–12: broth and the remaining vegetables go into the pot.'}
  ];
  const soupBookSource=sourceLink('Soup Day · Adapted book source','https://docs.google.com/presentation/d/1zCm9Hsu3eWLCKWQHYzvwmPMACF0T3uBaxkRXvD15KZI/edit');
  let soupBookIndex=0;
  const soupPageButtons=c=>selectedSoupPages(c).map((page,n)=>`<button type="button" data-soup-page="${n}" aria-pressed="${n===soupBookIndex}">${page.label}</button>`).join('');
  const foodSchedule='Introduce Thursday after reading Soup Day. Friday is an optional revisit.';
  let foodWordIndex=0;
  let index=0;
  const $=id=>document.getElementById(id);
  document.body.classList.toggle('community-layout',view==='community');
  document.body.classList.toggle('launchpad-layout',view==='foundational');
  $('title').textContent=data.title;$('sub').textContent=data.sub;
  $('chip').textContent='UNIT 2 · WEEK 1 · '+day.toUpperCase();
  $('exit').onclick=()=>location.href='daily-lessons.html?week=9&day='+days.indexOf(day);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function cardHtml(c){
    if(view==='foundational')return `<article class="launchpad-card">
      <a class="launchpad-link" href="https://olt.reallygreatreading.com/teacher/packages/olt-launchpad-standard/" target="_blank" rel="noopener noreferrer" aria-label="Open Launchpad for Pre-K (opens in a new tab)">
        <div class="launchpad-art" aria-hidden="true"><svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="124" r="104" fill="#e5f0ed"/><circle cx="70" cy="62" r="7" fill="#e9bb60"/><circle cx="257" cy="144" r="5" fill="#8cadba"/>
          <path d="M251 51v20m-10-10h20M48 151v16m-8-8h16" stroke="#e9bb60" stroke-width="5" stroke-linecap="round"/>
          <path d="M135 175c-4 23 9 42 25 56 16-14 29-33 25-56" fill="#efb45c"/><path d="M150 176c-3 15 3 27 10 36 7-9 13-21 10-36" fill="#fff0bd"/>
          <path d="M129 114c-30 13-41 40-36 67l39-15m59-52c30 13 41 40 36 67l-39-15" fill="#739ba7" stroke="#315e77" stroke-width="4" stroke-linejoin="round"/>
          <path d="M160 29c-32 24-45 65-40 111l9 37h62l9-37c5-46-8-87-40-111Z" fill="#fffdf8" stroke="#315e77" stroke-width="4" stroke-linejoin="round"/>
          <path d="M160 29c-15 11-26 27-32 44h64c-6-17-17-33-32-44Z" fill="#e6ab64"/>
          <circle cx="160" cy="109" r="23" fill="#bddce4" stroke="#315e77" stroke-width="5"/><path d="M151 99c3-4 7-6 12-5" stroke="#fffdf8" stroke-width="5" stroke-linecap="round"/>
          <path d="M128 163h64" stroke="#315e77" stroke-width="4"/><path d="M160 146v39" stroke="#315e77" stroke-width="6" stroke-linecap="round"/>
        </svg></div>
        <div class="launchpad-copy"><span class="launchpad-label">REALLY GREAT READING</span><h2>Launchpad <span>for Pre-K</span></h2><p>Let’s get ready to read!</p><span class="launchpad-cta">Open Launchpad <span aria-hidden="true">↗</span></span><span class="launchpad-tab">Opens in a new tab</span></div>
      </a>
      <p class="launchpad-return">When you’re finished, return here to continue to ${day==='Monday'||day==='Wednesday'?'Centers':'Writing'}.</p>
    </article>`;
    const boxes=c.boxes.map(b=>`<div class="box"><b>${escape(b[0])}</b><p>${escape(b[1])}</p></div>`).join('');
    const visual=c.img?`<img class="lesson-img" src="${escape(c.img)}" alt="${escape(isDough(c)?doughAlt(c):c.title+' illustration')}">`:'';
    const links=(hasSoupBook(c)?[...c.resources,soupBookSource]:isDough(c)?[...c.resources,doughBookSource]:(c.resources||[])).map(r=>`<li><a href="${escape(r.url)}" target="_blank" rel="noopener noreferrer">${escape(r.title)}</a></li>`).join('');
    if(isDough(c)){
      const step=c.boxes[0];
      const guidance=[step,...c.notes].map(b=>`<div class="box"><b>${escape(b[0])}</b><p>${escape(b[1])}</p></div>`).join('');
      const notes=`<details class="community-notes dough-notes"><summary>Teacher Notes</summary><div class="community-notes-content"><p>${escape(c.lead)}</p><div class="grid">${guidance}</div><h3>Source materials</h3><ul>${links}</ul></div></details>`;
      if(isDoughVocabulary(c)){
        const word=doughWords[doughWordIndex];
        return `<article class="food-vocab-card dough-vocab-card"><figure class="food-vocab-visual">${visual}</figure><div class="food-vocab-copy dough-vocab-copy"><div class="kicker">WORDS TO KNOW</div><h2>Playdough Color Mixing</h2><div class="food-word-buttons" role="group" aria-label="Choose a playdough vocabulary word">${doughWords.map((w,n)=>`<button type="button" data-dough-word="${n}" aria-pressed="${n===doughWordIndex}">${escape(w.word)}</button>`).join('')}</div><div class="food-word-panel" aria-live="polite" aria-atomic="true"><h3 id="doughWord">${escape(word.word)}</h3><p id="doughDefinition">${escape(word.definition)}</p></div>${notes}</div></article>`;
      }
      const hasBook=['Plan a color','Mix','Compare and improve'].includes(c.doughStep);
      const bookDialog=hasBook?`<dialog id="doughBookDialog" class="soup-book-dialog" aria-labelledby="doughBookTitle"><div class="soup-book-dialog-content dough-book-content"><div class="soup-book-dialog-heading"><h2 id="doughBookTitle">Goodbye Summer, Hello Autumn</h2><button type="button" data-dough-close autofocus>Close book pages ×</button></div><img src="${doughBook.img}" alt="${escape(doughBook.alt)}"><p class="soup-book-caption">Kenard Pak · Pages 21–22</p></div></dialog>`:'';
      const picture=c.doughStep==='Plan a color'?`<div class="soup-book-panel dough-book-panel"><div class="soup-book-controls"><button type="button" data-dough-enlarge>Enlarge book pages</button></div><button type="button" class="soup-book-image" data-dough-enlarge aria-label="Enlarge Goodbye Summer, Hello Autumn pages 21–22"><img src="${doughBook.img}" alt="${escape(doughBook.alt)}"></button><p class="soup-book-caption">Goodbye Summer, Hello Autumn · Kenard Pak · Pages 21–22</p></div>`:`<figure class="community-visual">${visual}</figure>`;
      const text=c.doughStep==='Explore'?step[1].slice(0,step[1].indexOf('.')+1):step[1];
      return `<article class="community-card dough-step-card">${picture}<div class="community-copy dough-step-copy"><div class="kicker">PLAYDOUGH COLOR MIXING</div><h2>${escape(c.doughStep)}</h2><div class="dough-step-text"><p>${escape(text)}</p></div>${hasBook&&c.doughStep!=='Plan a color'?`<div class="soup-book-controls dough-book-link"><button type="button" data-dough-enlarge>Compare with book pages 21–22</button></div>`:''}${notes}</div></article>${bookDialog}`;
    }
    if(isFoodVocabulary(c)){
      const word=foodWords[foodWordIndex];
      return `<article class="food-vocab-card"><figure class="food-vocab-visual">${visual}</figure><div class="food-vocab-copy"><div class="kicker">WORDS TO KNOW</div><h2>Favorite Foods</h2><div class="food-word-buttons" role="group" aria-label="Choose a vocabulary word">${foodWords.map((w,n)=>`<button type="button" data-food-word="${n}" aria-pressed="${n===foodWordIndex}">${escape(w.word)}</button>`).join('')}</div><div class="food-word-panel" aria-live="polite" aria-atomic="true"><h3 id="foodWord">${escape(word.word)}</h3><p id="foodDefinition">${escape(word.definition)}</p><p id="foodPrompt" class="food-word-prompt"${word.prompt?'':' hidden'}>${escape(word.prompt||'')}</p></div><details class="community-notes food-vocab-notes"><summary>Teacher Notes</summary><div class="community-notes-content"><p>${foodSchedule}</p><p>${escape(c.boxes[0][1])}</p>${c.teacher?`<p>${escape(c.teacher)}</p>`:''}${links?`<h3>Source materials</h3><ul>${links}</ul>`:''}</div></details></div></article>`;
    }
    if(c.group==='Making Soup'||isFoodColors(c)){
      const step=c.boxes[0];
      const paragraphs=step[0]==='Vocabulary'?step[1].split(/(?<=\.) /):[step[1]];
      const notes=(c.notes||[]).map(b=>`<div class="box"><b>${escape(b[0])}</b><p>${escape(b[1])}</p></div>`).join('');
      const book=selectedSoupPages(c)[soupBookIndex];
      const bookVisual=hasSoupBook(c)?`<div class="soup-book-panel"><div class="soup-book-controls" role="group" aria-label="Choose Soup Day pages">${soupPageButtons(c)}<button type="button" data-soup-enlarge>Enlarge pages</button></div><button type="button" class="soup-book-image" data-soup-enlarge aria-label="Enlarge the selected Soup Day pages"><img data-soup-image src="${book.img}" alt="${escape(book.alt)}"></button><p class="soup-book-caption">Soup Day · Melissa Iwai · <span data-soup-label aria-live="polite">${book.label}</span></p></div><dialog id="soupBookDialog" class="soup-book-dialog" aria-labelledby="soupBookTitle"><div class="soup-book-dialog-content"><div class="soup-book-dialog-heading"><h2 id="soupBookTitle">Soup Day</h2><button type="button" data-soup-close autofocus>Close book pages ×</button></div><div class="soup-book-controls" role="group" aria-label="Choose enlarged Soup Day pages">${soupPageButtons(c)}</div><img data-soup-image src="${book.img}" alt="${escape(book.alt)}"><p class="soup-book-caption">Melissa Iwai · <span data-soup-label>${book.label}</span></p></div></dialog>`:`<figure class="community-visual">${visual}</figure>`;
      return `<article class="community-card soup-step-card">${bookVisual}<div class="community-copy soup-step-copy"><div class="kicker">${escape(c.group.toUpperCase())}</div><h2>${escape(step[0])}</h2><div class="soup-step-text">${paragraphs.map(t=>`<p>${escape(t)}</p>`).join('')}</div><details class="community-notes"><summary>Teacher Notes</summary><div class="community-notes-content"><p>${escape(c.lead)}</p>${isFoodColors(c)?`<p>${foodSchedule}</p>${c.teacher?`<p>${escape(c.teacher)}</p>`:''}`:''}<div class="grid">${notes}</div>${links?`<h3>Source materials</h3><ul>${links}</ul>`:''}</div></details></div></article>`;
    }
    if(c.group==='Autumn Leaves'){
      const step=c.boxes[0];
      const paragraphs=step[0]==='Vocabulary'?step[1].split(/(?<=\.) /):[step[1]];
      return `<article class="community-card math-step-card"><figure class="community-visual">${visual}</figure><div class="community-copy math-step-copy"><div class="kicker">AUTUMN LEAVES</div><h2>${escape(step[0])}</h2><div class="math-step-text">${paragraphs.map(t=>`<p>${escape(t)}</p>`).join('')}</div>${links?`<details class="community-notes"><summary>Teacher Notes</summary><div class="community-notes-content"><h3>Source materials</h3><ul>${links}</ul></div></details>`:''}</div></article>`;
    }
    if(view==='community'||c.centerIntro||c.posterIntro){
      const steps=(c.childSteps||[]).map(b=>`<li><b>${escape(b[0])}</b><p>${escape(b[1])}</p></li>`).join('');
      return `<article class="community-card"><figure class="community-visual">${visual}</figure><div class="community-copy${steps?' with-steps':''}"><div class="kicker">${c.centerIntro?escape(c.area):day.toUpperCase()+' · WORLD OF COLOR'}</div><h2>${escape(c.title)}</h2>${c.lead?`<div class="lead">${escape(c.lead)}</div>`:''}${steps?`<ol class="teaching-steps" aria-label="Activity steps">${steps}</ol>`:''}<details class="community-notes"><summary>Teacher Notes</summary><div class="community-notes-content">${c.teacherIntro?`<p>${escape(c.teacherIntro)}</p>`:''}<div class="grid">${boxes}</div>${c.teacher?`<p>${escape(c.teacher)}</p>`:''}${links?`<h3>Source materials</h3><ul>${links}</ul>`:''}</div></details></div></article>`;
    }
    const schedule=view==='writing'&&c.group==='Favorite Foods'?`<p>${foodSchedule}</p>`:'';
    const teacher=c.teacher||links||schedule?`<details class="teacher"><summary>Teacher notes &amp; source materials</summary>${schedule}${c.teacher?`<p>${escape(c.teacher)}</p>`:''}${links?`<ul>${links}</ul>`:''}</details>`:'';
    return `<div class="kicker">${day.toUpperCase()} · WORLD OF COLOR</div><h2>${escape(c.title)}</h2>${visual}<div class="lead">${escape(c.lead)}</div><div class="grid">${boxes}</div>${teacher}`;
  }
  $('lesson').addEventListener('click',event=>{
    const doughButton=event.target.closest('[data-dough-word],[data-dough-enlarge],[data-dough-close]');
    if(doughButton&&isDough(data.cards[index])){
      if(doughButton.hasAttribute('data-dough-enlarge'))$('doughBookDialog').showModal();
      else if(doughButton.hasAttribute('data-dough-close'))$('doughBookDialog').close();
      else if(isDoughVocabulary(data.cards[index])){
        doughWordIndex=Number(doughButton.dataset.doughWord);const word=doughWords[doughWordIndex];
        $('doughWord').textContent=word.word;$('doughDefinition').textContent=word.definition;
        $('lesson').querySelectorAll('[data-dough-word]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.doughWord)===doughWordIndex)));
      }
      return;
    }
    const bookButton=event.target.closest('[data-soup-page],[data-soup-enlarge],[data-soup-close]');
    if(bookButton&&hasSoupBook(data.cards[index])){
      if(bookButton.hasAttribute('data-soup-enlarge'))$('soupBookDialog').showModal();
      else if(bookButton.hasAttribute('data-soup-close'))$('soupBookDialog').close();
      else{
        soupBookIndex=Number(bookButton.dataset.soupPage);
        const page=selectedSoupPages(data.cards[index])[soupBookIndex];
        $('lesson').querySelectorAll('[data-soup-image]').forEach(img=>{img.src=page.img;img.alt=page.alt});
        $('lesson').querySelectorAll('[data-soup-label]').forEach(label=>label.textContent=page.label);
        $('lesson').querySelectorAll('[data-soup-page]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.soupPage)===soupBookIndex)));
      }
      return;
    }
    const button=event.target.closest('button[data-food-word]');
    if(!button||!isFoodVocabulary(data.cards[index]))return;
    foodWordIndex=Number(button.dataset.foodWord);const word=foodWords[foodWordIndex];
    $('foodWord').textContent=word.word;$('foodDefinition').textContent=word.definition;
    $('foodPrompt').textContent=word.prompt||'';$('foodPrompt').hidden=!word.prompt;
    $('lesson').querySelectorAll('[data-food-word]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.foodWord)===foodWordIndex)));
  });
  const menu=$('activityMenu');
  if(menu){menu.hidden=data.cards.length<2;menu.innerHTML=data.cards.map((c,n)=>`<option value="${n}">${escape(c.title)}</option>`).join('');menu.onchange=()=>{index=Number(menu.value);render();notify()};}
  function render(){const cards=data.cards;if(!hasSoupBook(cards[index]))soupBookIndex=0;document.body.classList.toggle('soup-connect-layout',hasSoupBook(cards[index]));document.body.classList.toggle('community-layout',view==='community'||!!cards[index].centerIntro||!!cards[index].posterIntro||cards[index].group==='Autumn Leaves'||(cards[index].group==='Making Soup'||isFoodColors(cards[index]))||(isDough(cards[index])&&!isDoughVocabulary(cards[index])));document.body.classList.toggle('center-intro-layout',!!cards[index].centerIntro);document.body.classList.toggle('poster-intro-layout',!!cards[index].posterIntro);document.body.classList.toggle('math-step-layout',cards[index].group==='Autumn Leaves');document.body.classList.toggle('soup-step-layout',(cards[index].group==='Making Soup'||isFoodColors(cards[index])));document.body.classList.toggle('food-vocab-layout',isFoodVocabulary(cards[index])||isDoughVocabulary(cards[index]));document.body.classList.toggle('dough-layout',isDough(cards[index]));document.body.classList.toggle('dough-vocab-layout',isDoughVocabulary(cards[index]));document.body.classList.toggle('dough-book-layout',isDough(cards[index])&&cards[index].doughStep==='Plan a color');$('lesson').innerHTML=cardHtml(cards[index]);$('count').textContent=(index+1)+' of '+cards.length;$('fill').style.width=((index+1)/cards.length*100)+'%';$('done').textContent=index===cards.length-1?'Done ✓':'Next →';if(menu)menu.value=String(index);document.querySelector('.stage').scrollTop=0;}
  function state(){return{atStart:index===0,atEnd:index===data.cards.length-1,index,total:data.cards.length}}
  window.EEASectionState=state;
  function notify(){window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}))}
  $('prev').onclick=()=>{if(index>0){index--;render();notify()}};
  $('done').onclick=()=>{if(index<data.cards.length-1){index++;render();notify()}};
  render();notify();
})();
