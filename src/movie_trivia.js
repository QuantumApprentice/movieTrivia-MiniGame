"use strict";
// import text from './assets/movie_bgs.json'
// const fs = require('node:fs');

//got this from stackoverflow
//https://stackoverflow.com/questions/32509885/scan-folder-content-in-javascript
//doesn't work, but not sure why
function load_stuff()
{
  var dir = "/assets";
  var ext = ".gif";
  $.ajax({
    url: dir,
    success: (data)=>{
      $(data).find("a:contains("+ ext + ")")
      .each(()=>{
          let filename = this.href.replace(window.location.host, "")
          .replace("http:///", "");
          $("body").append($("<img src=" + dir + filename + "></img>"));
         });
    }
  });
}

async function play_movie_trivia()
{

  let bgs = [
    "die-hard-for-sure-sure.gif",
    "jurassic-park-samuel-l-jackson.gif",
    "kung-pow-thats-a-lot-of-nuts.gif",
    "junior-arnold-schwarzenegger.gif",
    "its-a-wonderful-life-how-do-you-do-james-stewart.gif",
    "jingle-all-the-way.gif",
    "planes-trains-and-automobiles-john-candy-devil.gif",
    "rudolph-the-red-nosed-reindeer-hermie-dentist.gif",
    "scrooged-toaster.gif",
    "spaceballs-alien-kane.gif",
    "trading-places-dan-aykroyd.gif",
  ];
  const countdownTime = 30;
  const answerTime = 15;

  const trivia = document.getElementById("trivia");
  const out = document.createElement("img");
  trivia.appendChild(out);

  let triviaTimer;
  let triviaTimeout;
  function createAnswer(index) {
    // console.log("index", index+1);
    index = Number(index);
    let answer = document.getElementById("timer");
    answer.innerText = bgs[index];

    const button = document.getElementById("answer");
    // if (button.innerText == "Answer") {
    //   button.innerText = "Next";
    // } else {
    //   button.innerText = "Answer";
    // }



    return setTimeout(()=>{


      if (button.innerText == "Next") {
        button.innerText = "Answer";
      }
      answer.innerText = countdownTime;
      createTrivia(index+1);



    }, 1000*answerTime);
  }



  function startTimer(countdown) {

    clearInterval(triviaTimer);
    let nextCountdown = new Date().getTime() + 1000 * countdown
    let timer = document.getElementById("timer");
    timer.innerText = countdown;

    const trivia = document.getElementById("trivia");




    return setInterval(()=>{
      let now = new Date().getTime();

      const answerButton = document.getElementById("answer");

      if (answerButton.innerText == "Next") {
        const index = trivia.dataset.idx;
        trivia.innerText = bgs[index]
      }




      timer.innerText = Math.floor((nextCountdown - now)%(1000*60)/1000);

      if (timer.innerText <= 0) {
        const index = document.getElementById("trivia").dataset.idx;
        clearInterval(triviaTimer);
        triviaTimeout = createAnswer(index);
      }



    }, 1000);
  }

  function createTrivia(index) {
    // console.log("index", index);
    index = Number(index);
    if (index >= bgs.length) {
      index = 0;
      //TODO: need to make "end" slide w/score
    }
    // console.log("index", index);
    out.src = `assets/${bgs[index]}`;
    trivia.dataset.idx = index;
    triviaTimer = startTimer(countdownTime);
  }

  createTrivia(0);




  let pause = document.getElementById("pause");
  pause.onclick = (e)=>{
    if (e.target.innerText == "Pause") {
      clearInterval(triviaTimer);
      e.target.innerText = "Play";
    } else {
      e.target.innerText = "Pause";
      let time = document.getElementById("timer").innerText;
      triviaTimer = startTimer(time);
    }
  }






  let answer  = document.getElementById("answer");
  answer.onclick = (e)=>{
    // let object = {a:1};
    // console.dir("dir", object);
    // console.log("log", object);

    // object.a = 2;
    // console.dir("dir", object);
    // console.log("log", object);
    // console.table("table", object);
    // console.count("count", object);

    // var people = [ 
    //   { first: 'René', last: 'Magritte', },
    //   { first: 'Chaim', last: 'Soutine', birthday: '18930113', }, 
    //   { first: 'Henri', last: 'Matisse', } 
    // ];
    // console.table({people});
    // console.log({people});


    if (triviaTimer) {
      clearInterval(triviaTimer);
    }
    // const answer = document.getElementById("answer");
    if (e.target.innerText == "Answer") {
      e.target.innerText = "Next";
      const index = document.getElementById("trivia").dataset.idx;
      triviaTimeout = createAnswer(index);
    } else {
      e.target.innerText = "Answer";
      const index = Number(document.getElementById("trivia").dataset.idx);
      clearTimeout(triviaTimeout);
      createTrivia(index+1);
    }
  }

  const prev = document.getElementById("prev");
  prev.onclick = ()=>{
    clearInterval(triviaTimer);
    let index = Number(document.getElementById("trivia").dataset.idx);
    // console.log("index", index);
    if (index-1 < 0) {
      index = bgs.length;
    }
    createTrivia(index-1);
  }

  const next = document.getElementById("next");
  next.onclick = ()=>{
    clearInterval(triviaTimer);
    let index = Number(document.getElementById("trivia").dataset.idx);
    if (index >= bgs.length) {
      index = 0;
    } else {
      index = index + 1;
    }
    createTrivia(index);
  }




}

let lastTime;
function fpsCounter() {
  let currentTime = new Date().getTime();
  let counter = document.getElementById("fps");
  counter.innerText = 1000/(currentTime-lastTime);
  lastTime = currentTime;
  requestAnimationFrame(animationCallback);
}

// play_movie_trivia();


//FrankL81: 
// you do a 
// customElements.define("trivia-game", class extends HTMLElement { 
// connectedCallback(){ //..... } ))

//BakerStaunch: 
// Yeah but I mean just have a setInterval 
// once at the start and inside the 
// interval callback check if it's
// paused or not rather than trying to 
// manage the interval itself
//BakerStaunch: 
// You can treat it like a "main loop" 
// by having a single interval 
// (or requestAnimationFrame)
//BakerStaunch: 
// btw, I'd suggest using performance.now() 
// for the time instead of Date.now() - system 
// clocks can change, performance.now() 
// is meant to be number of milliseconds 
// since the page loaded

let triviaIndex = 0;
let bgs = [
  {answer:"Die Hard",
    question:"die-hard-for-sure-sure.gif"},
  {answer:"Jurassic Park",
    question:"jurassic-park-samuel-l-jackson.gif"},
  {answer:"Kung Pow",
    question:"kung-pow-thats-a-lot-of-nuts.gif"},
  {answer:"Junior",
    question:"junior-arnold-schwarzenegger.gif"},
  {answer:"It's a Wonderful Life",
    question:"its-a-wonderful-life-how-do-you-do-james-stewart.gif"},
  {answer:"Jingle All the Way",
    question:"jingle-all-the-way.gif"},
  {answer:"Planes, Trains and Automobiles",
    question:"planes-trains-and-automobiles-john-candy-devil.gif"},
  {answer:"Rudolph the Red Nosed Reindeer", 
    question:"rudolph-the-red-nosed-reindeer-hermie-dentist.gif"},
  {answer:"Scrooged",
    question:"scrooged-toaster.gif"},
  {answer:"Spaceballs",
    question:"spaceballs-alien-kane.gif"},
  {answer:"Trading Places",
    question:"trading-places-dan-aykroyd.gif"},
];
// let score = [];
let score = {};

function play_trivia()
{

  const countdownTime = 30;
  const answerTime = 15;
  let endTime;
  let timerState = "running";
  let prevState;

  const trivia = document.getElementById("trivia");
  const out = document.createElement("img");
  out.src = `assets/${bgs[0].question}`;
  out.id = "question";
  trivia.appendChild(out);
  const timer   = document.getElementById("timer");
  timer.innerText = countdownTime;

  // function updateButtons() {
  //   const playBtn   = document.getElementById("pause");
  //   if (timerState === "paused") {
  //     playBtn.innerText = "Play";
  //   }
  //   if (timerState === "running") {
  //     playBtn.innerText = "Pause";
  //   }
  // }

  

  function updateTimer() {
    const pauseBtn = document.getElementById("pause");
    pauseBtn.innerText = "Pause";
    const answerBtn = document.getElementById("answer");
    if (answerBtn.innerText !== "Next") {
      const now = performance.now();
      timer.innerText = Math.floor((endTime - now)%(1000*60)/1000);
    }

    if (timer.innerText <= 0) {
      answerBtn.innerText = "Next";
      timer.innerText = bgs[triviaIndex].answer;
    }
    if (performance.now() > endTime + answerTime*1000) {
      //reset timer and load next trivia
      answerBtn.innerText = "Answer";
      nextTrivia();
    }
  }

  function nextTrivia() {
    //increment the trivia index
    triviaIndex += 1;
    if (triviaIndex >= bgs.length) {
      //TODO: create end slide w/score etc
      // triviaIndex = 0;
      timerState = "paused";
      clearRound();
      showScore();
      return;
    }
    //change the trivia out.src to match new index
    out.src = `assets/${bgs[triviaIndex].question}`;
    //reset the timer & switch state to running
    resetTimer();
    multipleChoice();
    clearRound();
  }

  function restartTimer() {
    const countdown = document.getElementById("timer").innerText;
    if (Number(countdown)) {
      endTime = performance.now() + 1000*countdown;
    }
    timerState = "running";
  }
  function resetTimer() {
    timer.innerText = countdownTime;
    endTime = performance.now() + countdownTime*1000;
    timerState = "running";
  }

  function stateMachine() {

    if (timerState !== prevState) {
      // console.log("state1", timerState);
      prevState = timerState;
      // updateButtons();
    }
    if (timerState !== "paused") {
      updateTimer();
    }

    requestAnimationFrame(stateMachine);
  }

  const answerBtn = document.getElementById("answer");
  answerBtn.onclick = (e)=>{
    if (e.target.innerText === "Answer") {
      //change button text to Next
      //and show the answer in the timer label
      e.target.innerText = "Next";
      timer.innerText = bgs[triviaIndex].answer;
    } else {
    //change the button text to Answer
      e.target.innerText = "Answer";
      nextTrivia();
    }
  }
  const playBtn   = document.getElementById("pause");
  playBtn.onclick = (e)=>{
    if (timerState === "paused") {
      playBtn.innerText = "Pause";
      timerState = "running";
      restartTimer();
    } else {
      playBtn.innerText = "Play";
      timerState = "paused";
    }
  }
  const prevBtn   = document.getElementById("prev");
  prevBtn.onclick = ()=>{
    triviaIndex -= 1;

    if (triviaIndex < 0) {
      triviaIndex = bgs.length-1;
    }
    out.src = `assets/${bgs[triviaIndex].question}`;
    resetTimer();
    answerBtn.innerText = "Answer";
  }
  const nextBtn = document.getElementById("next");
  nextBtn.onclick = ()=>{
    nextTrivia();
    answerBtn.innerText = "Answer";
  }

  endTime = performance.now() + 1000*countdownTime;
  multipleChoice();
  stateMachine();
}

function multipleChoice() {
  const choiceDiv = document.getElementById("choiceDiv");
  choiceDiv.innerHTML = "";

  const choiceBtn1 = document.createElement("div");
  const choiceBtn2 = document.createElement("div");
  const choiceBtn3 = document.createElement("div");
  const choiceBtn4 = document.createElement("div");

  const choice1 = document.createElement("div");
  const choice2 = document.createElement("div");
  const choice3 = document.createElement("div");
  const choice4 = document.createElement("div");

  choice1.className = "choice";
  choice2.className = "choice";
  choice3.className = "choice";
  choice4.className = "choice";

  // const wrongAnswer1 = Math.random()*bgs.length;

  // let answers = [];
  // answers.push(bgs[triviaIndex].answer);
  // answers.push(triviaIndex);

  // let tmp = Math.random() * bgs.length;
  // if (answers.includes(tmp)) 
  // answers.push(Math.random() * bgs.length);

  /////////////////////////////////////////////
  let answers = new Set();
  let ansArr = [bgs[triviaIndex].answer];
  answers.add(bgs[triviaIndex].answer);
  while (answers.size < 4) {
    let randAnswer = bgs[Math.floor(Math.random() * bgs.length)].answer;
    if (!answers.has(randAnswer)) {
      answers.add(randAnswer);
      ansArr.push(randAnswer);
    }
  }
  let swap = Math.floor(Math.random()*4);
  let temp = ansArr[swap];
  ansArr[0] = temp;
  ansArr[swap] = bgs[triviaIndex].answer;
  // console.log(ansArr);


  /////////////////////////////////////////////
  //BakerStaunch
  let answersB = [];
  let answerIndex = Math.floor(Math.random() * 4);
  answersB[answerIndex] = bgs[triviaIndex].answer;
  for (let i = 1; i <= 3; i += 1) {
    let wrongAnswer;
    while (answersB.includes(wrongAnswer)) {
      let rng = Math.floor(Math.random() * bgs.length);
      wrongAnswer = bgs[rng].answer;
    }
    answersB[(answerIndex + i) %4] = wrongAnswer;
    /* get another random answer and 
    set it at index (answerIndex + i) % 4 */
  }

  // console.log(answersB)


  /////////////////////////////////////////////
  //Eskiminha
  // const questions = bgs;
  // const { q, a } = { 
  // q: questions[Math.floor(Math.random() * questions.length)],
  // a: ((q, a = Array(4).fill(null),
  //       u = new Set(a[(i = Math.floor(Math.random() * 4))] = q.answer)
  //     ) => (Array(4).fill(0).forEach(
  //       (_, j) => j - i || (
  //       () => {
  //         let x;
  //         do x = questions[Math.floor(Math.random() * questions.length)].answer;
  //         while (
  //           u.has(x)
  //         );
  //         a[j] = x;
  //         u.add(x);
  //       })()),
  //     a))
  //     (questions[Math.floor(
  //       Math.random() * questions.length
  //     )])
  //   };
  //   console.log("Question:", q, "Answers:", a);


  /////////////////////////////////////////////
  //tvjosh
  // const ls = Array(10).fill().map((_, i) => i);
  const ls = bgs;
  console.log(ls);

  const numToShuffle = 4;

  const copyLs = ls.slice().map((x, i, thisLs) => {
    if (i < numToShuffle) {
      // const k = Math.floor(Math.random() * (ls.length/numToShuffle) + i*(ls.length/numToShuffle));
      const k = Math.floor(Math.random() * (ls.length - i)) + i;
      const t = thisLs[i];
      thisLs[i] = thisLs[k];
      thisLs[k] = t;
      return thisLs[i];
    }
    return x
  }).slice(0, numToShuffle);
  
  console.log(copyLs);









  /////////////////////////////////////////////
  choice1.innerText = `${ansArr[0]}`;
  choice2.innerText = `${ansArr[1]}`;
  choice3.innerText = `${ansArr[2]}`;
  choice4.innerText = `${ansArr[3]}`;

  const choiceNum = document.createElement("div");
  choiceNum.innerText = 1;
  choiceNum.className = "choiceNum";

  choiceBtn1.classList = "choiceBtn";
  choiceBtn1.append(choiceNum);
  choiceBtn1.append(choice1);
  choiceBtn2.classList = "choiceBtn";
  choiceBtn2.append(choiceNum);
  choiceBtn2.append(choice2);
  choiceBtn3.classList = "choiceBtn";
  choiceBtn3.append(choiceNum);
  choiceBtn3.append(choice3);
  choiceBtn4.classList = "choiceBtn";
  choiceBtn4.append(choiceNum);
  choiceBtn4.append(choice4);

  choiceDiv.appendChild(choiceBtn4);
  choiceDiv.appendChild(choiceBtn3);
  choiceDiv.appendChild(choiceBtn2);
  choiceDiv.appendChild(choiceBtn1);

}

function clearRound()
{
  const name = document.getElementById("twitchName");
  const chat = document.getElementById("chatMsg");
  name.innerText = "";
  chat.innerText = "";
}

play_trivia();

//connect to twitch chat
const channelName        = 'quantumapprentice';
const TwitchWebSocketUrl = 'wss://irc-ws.chat.twitch.tv:443';

const chatBody = (document.querySelector("#ChatMessages"));
const wsTwitch = new WebSocket(TwitchWebSocketUrl);
wsTwitch.onopen = ()=>{
  wsTwitch.send(`CAP REQ :twitch.tv/commands twitch.tv/tags`);
  wsTwitch.send(`NICK justinfan6969`);
  wsTwitch.send(`JOIN #${channelName}`);
  console.log('WebSocket connection opened');    //debug
}

wsTwitch.onmessage = (fullmsg) => {
  // console.log("fullmsg: ", fullmsg);
  let txt = fullmsg.data;
  // console.log("txt: ", txt);
  let name = '';
  let outmsg = '';
  let indx = 0;
  // let just_tags = '';
  // let tags_obj = {};
  // const emote_list = [];

  if (txt[0] == '@') {
    indx = txt.indexOf(' ');
    // just_tags = txt.slice(0, indx);
    indx++;
    // tags_obj = parse_tags(just_tags);
    // get_emote_list(tags_obj['emotes'], emote_list);
  }

  if (txt[indx] == ':') {
    // get the important data positions
    let pos1 = txt.indexOf('@', indx) + 1;
    let pos2 = txt.indexOf(".", pos1);
    let pos3 = txt.indexOf(`#${channelName}`)+2;
    pos3 += channelName.length + 1;

    // create strings based on those positions
    name = txt.substring(pos1, pos2).trim();

    if ((name == ":tmi")
      || (name == "justinfan6969")
      || (name.includes("@emote-only=0;"))
      || (name == ":justinfan6969"))
      { return; }

    outmsg = txt.substring(pos3).trim();
  }
  else {
    // handle pings
    // other twitch specific things should
    // be handled here too
    let pos2 = txt.indexOf(":");
    name = txt.slice(0, pos2).trim();
    outmsg = txt.slice(pos2).trim();

    if (name == 'PING') {
      // console.log('PONG ' + outmsg);
      wsTwitch.send('PONG ' + outmsg);
    }
  }

  // console.log("name", name);
  // console.log("outmsg", outmsg);

  parseTriviaChat(name, outmsg);
}

function parseTriviaChat(name, outmsg)
{
  // if (outmsg.includes(bgs[triviaIndex].answer)) {
  if (triviaIndex >= bgs.length) {
    return
  }
  if (outmsg.toLowerCase().indexOf(bgs[triviaIndex].answer) != -1) {
    const chatMsg = document.getElementById("chatMsg");
    const twitchName = document.getElementById("twitchName");
    chatMsg.innerText = outmsg;
    twitchName.innerText = name;

    score[name] = score[name] ? (score[name]+=1) : 1;
    // score[name] = score[name] && ++score[name] || 1;
    // console.log("score", score);

    // chat.innerText = name + " got the answer with " + outmsg;
  }
}

function showScore()
{
  const timer = document.getElementById("timer");
  timer.innerText = "";
  const title = document.getElementById("title");
  title.innerText = "Score";
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const pausBtn = document.getElementById("pause");
  const answBtn = document.getElementById("answer");
  nextBtn.disabled = true;
  prevBtn.disabled = true;
  pausBtn.disabled = true;
  // answBtn.disabled = true;
  setTimeout(()=>{
    answBtn.innerText = "Restart?";
  }, 10);
  console.log("answer:", answBtn.innerText);
  answBtn.onclick = ()=>{
    location.reload();
  }

  const trivia = document.getElementById("trivia");
  trivia.removeChild(document.getElementById("question"));
  const scoreCard = document.createElement("table");
  trivia.appendChild(scoreCard);
  scoreCard.className = "scoreCard";

  // const temp = {"abc" : 3, "def": 2, "ghi": 4};

  const scoreArr = Object.entries(score);
  // const scoreArr = Object.entries(temp);
  scoreArr.sort((a, b)=>{
    return b[1]-a[1];
  });
  // console.log("score", scoreArr);
  scoreArr.forEach((e)=>{
    const row = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    td1.innerText = e[0];
    td1.className = "scoreName";

    const r = Math.floor(Math.random()*255);
    const g = Math.floor(Math.random()*255);
    const b = Math.floor(Math.random()*255);

    td1.style = `color : rgb(${r}, ${g}, ${b});`;



    td2.innerText = e[1];
    td2.className = "scoreAmount";

    row.appendChild(td1);
    row.appendChild(td2);
    scoreCard.appendChild(row);


    
    // const li = document.createElement("li");
    // li.innerText = e;
    // scoreCard.appendChild(li);
  });

  // console.log(Object.entries(score));
  // const li = document.createElement("li");
  // li.innerText = Object.entries(score);
  // scoreCard.appendChild(li);
  
  
}
