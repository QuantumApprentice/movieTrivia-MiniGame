"use strict";

let twitchChatConnect;
import ("./twitch_chat.js").then((e)=>{
  //this way only works with modules enabled
  //(see script assignments in index.html)
  //(L270 at time of writing this comment)
  twitchChatConnect    = e.twitchChatConnect;
});

// let lastTime;
// function fpsCounter() {
//   let currentTime = new Date().getTime();
//   let counter = document.getElementById("fps");
//   counter.innerText = 1000/(currentTime-lastTime);
//   lastTime = currentTime;
//   requestAnimationFrame(animationCallback);
// }

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

const answerBtn  = document.getElementById("answer");
const playBtn    = document.getElementById("pause");
const prevBtn    = document.getElementById("prev");
const nextBtn    = document.getElementById("next");
const twitchName = document.getElementById("twitchName");
const triviaDiv  = document.getElementById("trivia");
const connectBtn = document.getElementById("connectChatBtn");
const timer      = document.getElementById("timer");
const sound      = document.getElementById("sound");
let   question   = document.createElement("img");



let maxMsgCount   = 5;
let countdownTime = 30;
let answerTime    = 15;
let questionCount = 10;
let twitchChatWS;

let tmdbList;
let answered = [];
let winners  = [];

let triviaIndex = 0;
let score = {};
let endTime;
let correctAnsIdx;
let timerState = "running";
let triviaQuestions;
async function play_trivia()
{
  let prevState;

  // triviaQuestions = await createQuestions();
  await createQuestions();
  initButtons();
  endTime = performance.now() + 1000*countdownTime;

  // question.src = `/Movie-Tracker/bg/${triviaQuestions[0].question}`;
  question.src = await getTriviaURL(0);
  // question.src = `/assets/junior-1994-0.gif`;
  // let p = await new Promise((res)=>{
  //   question.addEventListener('load', ()=>{
  //     console.log("qa",question);
  //     res(true);
  //   });
  //   question.addEventListener('error',()=>{
  //     console.log("qb",question);
  //     res(false);
  //   });
  // });
  // console.log("p",await p);
  // question.src = `https://quantumapprentice.github.io/movieTrivia-MiniGame/assets/junior-1994-1.gif`

  question.id = "question";
  triviaDiv.appendChild(question);
  timer.innerText = countdownTime;

  function updateButtons() {
    if (triviaIndex === 0 || triviaIndex == triviaCount-1) {
      //disable prevBtn if on first trivia or score screen
      prevBtn.disabled = true;
    } else {
      prevBtn.disabled = false;
    }
    // const playBtn   = document.getElementById("pause");
    // if (timerState === "paused") {
    //   playBtn.innerText = "Play";
    // }
    // if (timerState === "running") {
    //   playBtn.innerText = "Pause";
    // }
  }

  function updateTimer() {
    playBtn.innerText = "Pause";
    if (answerBtn.innerText !== "Next") {
      const now = performance.now();
      timer.innerText = Math.floor((endTime - now)%(1000*60)/1000);
    }

    if (timer.innerText <= 0) {
      answerBtn.innerText = "Next";
      timer.innerText = triviaQuestions[triviaIndex].answer;
    }
    if (performance.now() > endTime + answerTime*1000) {
      //reset timer and load next trivia
      answerBtn.innerText = "Answer";
      nextTrivia();
    }
  }

  function stateMachine() {
    if (timerState !== prevState) {
      prevState = timerState;
    }
    if (timerState !== "paused") {
      updateTimer();
      updateButtons();
    }
    requestAnimationFrame(stateMachine);
  }

  multipleChoice();
  stateMachine();
}

async function getTriviaURL(index)
{
  let baseURL = `https://quantumapprentice.github.io/Movie-Tracker/bg/${triviaQuestions[index].question}`;
  // let baseURL = `/Movie-Tracker/bg/${triviaQuestions[index].question}`;
  let imageName = triviaQuestions[index].question.slice(0,-4);
  // let imageName = `junior-1994.jpg`.slice(0,-4);
  // console.log("i",imageName);

  const img = new Image();
  let difficulty = 0;
  let temp;
  let p = false;
  while (!p && difficulty < 3) {
    temp = `/assets/${imageName}-${difficulty++}.gif`;
    img.src = temp;
    p = await new Promise(res=>{
      img.addEventListener('load', ()=>res(true) );
      img.addEventListener('error',()=>res(false));
    });
  }

  if (p) {
    console.log('t',temp);
    return temp;
  }

  return baseURL;

}














function initButtons()
{
  //answer/next
  answerBtn.onclick = (e)=>{
    if (e.target.innerText === "Answer") {
      e.target.innerText = "Next";
      //show the answer in the timer label
      timer.innerText = triviaQuestions[triviaIndex].answer;
    } else {
      e.target.innerText = "Answer";
      nextTrivia();
    }
  }
  //play/pause
  playBtn.onclick = (e)=>{
    if (timerState === "paused") {
      e.target.innerText = "Pause";
      timerState = "running";
      restartTimer();
    } else {
      e.target.innerText = "Play";
      timerState = "paused";
    }
  }
  //next >>
  prevBtn.onclick = async ()=>{
    triviaIndex -= 1;
    if (triviaIndex < 0) {
      triviaIndex = triviaQuestions.length-1;
    }
    // question.src = `/Movie-Tracker/bg/${triviaQuestions[triviaIndex].question}`;
    question.src = await getTriviaURL(triviaIndex);
    resetTimer();
    multipleChoice();
    // clearRound();
    answerBtn.innerText = "Answer";
  }
  //previous <<
  nextBtn.onclick = ()=>{
    nextTrivia();
    answerBtn.innerText = "Answer";
  }

  //sound button
  sound.onclick = (e)=>{
    if (e.currentTarget.classList.value === "soundOn") {
      e.currentTarget.classList = "soundOff";
      document.getElementById("sadTrombone").muted = true;
    } else {
      e.currentTarget.classList = "soundOn";
      document.getElementById("sadTrombone").muted = false;
    }
  }

  //twitch chat connection stuff
  //specifically attached to the connect button
  twitchName.addEventListener("keypress", (e)=>{
    if (e.key === "Enter") {
      e.stopPropagation();
      // console.log("val",e.target.value);




      if (!e.target.value) {
        let chatMSG = document.createElement("div");
        let auth = document.createElement("div");
        parseChatCallback("TriviaBot",
                          `No channel-name provided. Add a channel name in ☰ Options.`,
                          auth, chatMSG);
        return;
      }

      if (connectBtn.innerText === "Connect to Twitch Chat") {
        connectBtn.innerText = "Disconnect";
        startChat(e.target.value, parseChatCallback);
      } else {
        twitchChatWS.onclose = ()=>{
          connectBtn.innerText = "Connect to Twitch Chat";
  
          let chatMSG = document.createElement("div");
          let auth = document.createElement("div");
          parseChatCallback("TriviaBot",
            `Disconnected from twitch chat.`,
            auth, chatMSG);
        }
        twitchChatWS.close();
      }
    }
  });
  connectBtn.onclick = (e)=>{
    e.stopPropagation();

    if (!twitchName.value) {
      let chatMSG = document.createElement("div");
      let auth = document.createElement("div");
      parseChatCallback("TriviaBot",
                        `No channel-name provided. Add a channel name in ☰ Options.`,
                        auth, chatMSG);
      return;
    }


    if (e.target.innerText === "Connect to Twitch Chat") {
      e.target.innerText = "Disconnect";
      startChat(twitchName.value, parseChatCallback);
    } else {
      twitchChatWS.onclose = ()=>{
        e.target.innerText = "Connect to Twitch Chat";

        let chatMSG = document.createElement("div");
        let auth = document.createElement("div");
        parseChatCallback("TriviaBot",
          `Disconnected from twitch chat.`,
          auth, chatMSG);
      }
      twitchChatWS.close();
    }
  }

  //sidebar hamburger button
  const hamburger = document.getElementById("hamburger");
  hamburger.onclick = (e)=>{
    e.stopPropagation();
    e.currentTarget.classList.toggle("change");
    document.getElementById("sidebar").classList.toggle("change");
  }

  //number of trivia elements in this run
  const triviaCount = document.getElementById("triviaCount");
  if (triviaCount.value != questionCount) {
    questionCount = triviaCount.value;
    createQuestions();
  }
  triviaCount.onchange = (e)=>{
    questionCount = e.target.value;
    createQuestions();
  }

  //amount of time trivia question will stay on screen
  const triviaTime = document.getElementById("triviaTime");
  if (triviaTime.value != countdownTime) {
    countdownTime = triviaTime.value;
  }
  triviaTime.onchange = (e)=>{
    countdownTime = e.target.value;
    const countdown = timer.innerText;
    if (countdownTime < Number(countdown)) {
      restartTimer();
    }
  }

  //amount of time the answer stays on screen
  //before starting the next trivia question
  const pauseTime = document.getElementById("pauseTime");
  if (pauseTime.value != answerTime) {
    answerTime = pauseTime.value;
  }
  pauseTime.onchange = (e)=>{
    answerTime = e.target.value;
  }
}

//get the next trivia entry and fill
//the question.src with new entry
async function nextTrivia() {
  triviaIndex += 1;
  if (triviaIndex >= triviaQuestions.length) {
    timerState = "paused";
    // clearRound();
    showScore();
    return;
  }
  //change the trivia question.src to match new index
  // question.src = `/Movie-Tracker/bg/${triviaQuestions[triviaIndex].question}`;
  // question.src = `https://quantumapprentice.github.io/Movie-Tracker/bg/${triviaQuestions[triviaIndex].question}`;
  question.src = await getTriviaURL(triviaIndex);

  //reset for next round
  resetTimer();
  multipleChoice();
  // clearRound();
}

async function restartTrivia()
{
  // triviaQuestions = await createQuestions();

  console.log("restarting");
  resetAnswered();
  resetWinners();

  await createQuestions();
  // endTime = performance.now() + 1000*countdownTime;
  resetTimer();
  triviaIndex = 0;
  multipleChoice();

  const title = document.getElementById("title");
  title.innerText = "Name That Movie";
  const scoreCard = document.getElementById("score");
  question = document.createElement("img");
  // question.src = `/Movie-Tracker/bg/${triviaQuestions[0].question}`;
  question.src = await getTriviaURL(0);
  question.id = "question";

  scoreCard.replaceWith(question);
  // triviaDiv.appendChild(question);
  timer.innerText = countdownTime;
}

function restartTimer() {
  const countdown = timer.innerText;
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

async function startChat(chatName, chatParser)
{
  let chatMSG = document.createElement("div");
  let auth = document.createElement("div");
  if (!twitchChatWS) {
  } else {
    if (twitchChatWS.readyState === twitchChatWS.OPEN) {
      twitchChatWS.close();
      parseChatCallback("TriviaBot",
                        `Disconnecting from ${chatName} and...`,
                        auth, chatMSG);
    }
  }
  //used the globalThis variable to share twitch_chat
  //this bypasses module requirements for import
  twitchChatWS = await globalThis.twitchChatConnect(chatName, chatParser);

  // console.log("twitchChatWS?",twitchChatWS);


}


function parseChatCallback(name, outmsg, auth, chatMSG)
{
  const winner = parseTriviaChat(name, outmsg);

  //for some reason the twitch chat api sends a message
  //back when the chat fails to connect (doesn't find channel)
  //but does nothing when chat connection succeeds
  if (outmsg === "This channel does not exist or has been suspended.") {
    connectBtn.innerText = "Connect to Twitch Chat";
    // console.log("a",auth);
    // console.log("n",name);
    // auth.innerText = name;
  }

  // console.log('chatting?');

  //option to hide chat except for
  //those who guess correctly
  const chatBody = document.getElementById("twitchChat");
  let hideChat = false;
  if (hideChat) {
    if (winner.won) {
      let msg = document.createElement("div");
      msg.classList.add("msg");
      msg.innerHTML = outmsg;

      msg.classList.add("winner");
      auth.classList.add("winner");

      chatMSG.append(auth, msg);
      // chat message has to be prepended to appear on bottom
      chatBody.prepend(chatMSG);
    }
  } else {
    let msg = document.createElement("div");
    msg.classList.add("msg");
    msg.innerHTML = outmsg;

    if (winner.won) {
      msg.classList.add("winner");
      auth.classList.add("winner");
      document.getElementById(`${Number(outmsg)}`).classList.add("winnerChoice");
      document.getElementById("sadTrombone").play();

    }
    msg.innerText += winner.str;

    chatMSG.append(auth, msg);
    // chat message has to be prepended to appear on bottom
    // const chatBody = document.getElementById("twitchChat");
    chatBody.prepend(chatMSG);
  }
  chatMSG.classList.add("message_box");

  // if more than maxMsgCount, delete first message
  if (chatBody.children.length > maxMsgCount) {
    chatBody.lastElementChild.remove();
  }



}
play_trivia();

async function loadTMDB()
{
  // const res = await fetch("/Movie-Tracker/src/tmdbList.json");
  // const res = await fetch(`https://raw.githubusercontent.com/QuantumApprentice/Movie-Tracker/refs/heads/master/src/tmdbList.json`);
  // if (!res.ok) {
  //   throw new Error(`Response failed? ${res.status}`);
  // }
  // return res.json();
  return fetch(`https://raw.githubusercontent.com/QuantumApprentice/Movie-Tracker/refs/heads/master/src/tmdbList.json`)
    .then((r)=>{
      if (!r.ok) {
        throw new Error(`Response failed? ${r.status}`);
      }
      return r.json()
    });
}


async function createQuestions()
{
  if (!tmdbList) {
    tmdbList = await loadTMDB();
  }

  let indexArr = new Array(questionCount);
  for (let i = 0; i < questionCount; i++) {
    let currIndex;
    do {
      currIndex = Math.floor(Math.random() * tmdbList.length);
    } while (
      indexArr.includes(currIndex)
      || !tmdbList[currIndex].bg
    );
    indexArr[i] = currIndex;
  }

  triviaQuestions = indexArr.map((e)=>{
    return {
      answer: tmdbList[e].title,
      question: tmdbList[e].bg
    }
  });
}

function parseTriviaChat(name, outmsg)
{
  if (triviaIndex >= triviaQuestions.length) {
    return {won: false, str: ""};   //should show scoreboard
  }
  if (winners[triviaIndex]) {
    return {won: false, str: ""};   //round over, wait for next round
  }
  if (answered.includes(name)) {
    return {won: false, str: " -- Oops, you already played this round."};   //already answered incorrectly
  }

  // console.log("outmsg: ", outmsg);
  // console.log("answer: ", correctAnsIdx);
  if (Number(outmsg) === correctAnsIdx) {
    winners.push(name);
    endTime = performance.now();
    score[name] = score[name] ? (score[name]+=1) : 1;
    return {won: true, str: ""};    //winner through multiple choice
  }
  if (outmsg.toLowerCase().indexOf(triviaQuestions[triviaIndex].answer) != -1) {
    winners.push(name);
    endTime = performance.now();
    score[name] = score[name] ? (score[name]+=1) : 1;
    return {won: true, str: " -- Oh wow, you actually typed it out?"};    //won by typing name?
  }
  if (!isNaN(outmsg) && (Number(outmsg) > 0 && Number(outmsg) < 5)) {
    answered.push(name);
    return {won: false, str: " -- Sorry, you didn't win this time."};
  }
  return {won: false, str: ""};   //all regular chat
}

function resetAnswered()
{
  answered = [];  //reset so same people can answer again
}

function resetWinners()
{
  winners = [];
}

function createAnswers()
{
  resetAnswered();
  /////////////////////////////////////////////
  //QuantumApprentice
  // let answers = new Set();
  // let ansArr = [triviaQuestions[triviaIndex].answer];
  // answers.add(triviaQuestions[triviaIndex].answer);
  // while (answers.size < 4) {
  //   let randAnswer = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)].answer;
  //   if (!answers.has(randAnswer)) {
  //     answers.add(randAnswer);
  //     ansArr.push(randAnswer);
  //   }
  // }
  // let swap = Math.floor(Math.random()*4);
  // let temp = ansArr[swap];
  // ansArr[0] = temp;
  // ansArr[swap] = triviaQuestions[triviaIndex].answer;
  // correctAnsIdx = swap+1;
  // console.log(ansArr);


  /////////////////////////////////////////////
  //BakerStaunch
  let question = triviaQuestions[triviaIndex]; //does not modify original array
  console.log("answer", question.answer);

  let answersB = Array(4);
  let answerIndex;
  //prevent same answer index from appearing twice in a row
  do {
    answerIndex = Math.floor(Math.random()*4);
  } while (answerIndex == correctAnsIdx-1);

  correctAnsIdx = answerIndex+1;
  answersB[answerIndex] = {...question};

  for (let i = 1; i <= 3; i += 1) {
    let wrongAnswer;
    while (answersB.includes(wrongAnswer)) {

    //TODO: might need to swap out this while loop
    //      for something that deep checks objects?
    // while (answersB.find((e)=>{
    //   console.log("e",e);
    //   if (!e) {
    //     return false;
    //   }
    //   return (e?.answer === wrongAnswer?.answer);
    // })) {



      //get another random answer and 
      //set it at index (answerIndex + i) % 4
      let rng = Math.floor(Math.random() * tmdbList.length);
      wrongAnswer = {
        answer: tmdbList[rng].title,
        question: tmdbList[rng].bg
      }
    }
    answersB[(answerIndex + i) %4] = wrongAnswer;
  }

  const ansArr = answersB;
  // console.log(answersB)

  //Eskiminha (chatGPT)
  /////////////////////////////////////////////
  // const questions = triviaQuestions;
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
  // const ignore = null;

  //tvjosh
  /////////////////////////////////////////////
  // const ls = Array(10).fill().map((_, i) => i);
  // const ls = triviaQuestions;
  // const numToShuffle = 4;
  // const copyLs = ls.slice().map((x, i, thisLs) => {
  //   if (i < numToShuffle) {
  //     // const k = Math.floor(Math.random() * (ls.length/numToShuffle) + i*(ls.length/numToShuffle));
  //     const k = Math.floor(Math.random() * (ls.length - i)) + i;
  //     const t = thisLs[i];
  //     thisLs[i] = thisLs[k];
  //     thisLs[k] = t;
  //     return thisLs[i];
  //   }
  //   return x
  // }).slice(0, numToShuffle);
  // console.log(copyLs);


  /////////////////////////////////////////////
  //FrankL81
  // const Questions = triviaQuestions;
  // console.log(Questions);
  // const schuffle = (array) => array.sort(() => Math.random() < 0.5 ? 1 : -1);
  // const currentQuestion = schuffle(Questions).slice(0,4).map((e)=>e.answer);
  // // const [imgSrc,answer] = currentQuestion[0];
  // ansArr = currentQuestion;
  // console.log("ansArr", ansArr);
  //   document.getElementById("canvas").innerHTML = 
  // `<img alt="${imgSrc}" height="40px" src="${imgSrc}" /><br/> ${schuffle(currentQuestion.map(([,answer],idx) => `<button>${idx+1} ${answer}</button>`)).join("<br />")}
  // <br /><br />
  // currentAnswer is: ${answer}`;


  /////////////////////////////////////////////
  return ansArr;
}

function multipleChoice() {
  const choiceDiv = document.getElementById("choiceDiv");
  choiceDiv.innerHTML = "";   //clear previous answer choices

  // const timeStart = performance.now();
  const ansArr = createAnswers();

  //create array of answer buttons - choiceBtnArr[]
  //and fill with ansArr[] answers
  let choiceBtnArr = [];
  for (let i = 0; i < 4; i++) {
    const choiceBtnDiv = document.createElement("div");
    choiceBtnDiv.className = "choiceBtn";
    choiceBtnDiv.id = `${i+1}`;

    const choiceAns = document.createElement("div");
    choiceAns.className = "choiceTxt";
    choiceAns.innerText = `${ansArr[i].answer}`;

    const choiceNum = document.createElement("div");
    choiceNum.className = "choiceNum";
    choiceNum.innerText = `${i+1}`;

    choiceBtnDiv.append(choiceNum);
    choiceBtnDiv.append(choiceAns);
    choiceBtnDiv.onclick = handleClick;
    choiceBtnArr.push(choiceBtnDiv);
  }

  //onClick for the right answer only
  //(maybe add wrong answer stuff?)
  function  handleClick(e) {
    // console.log("e",e.currentTarget);
    //if button has the correct answer...
    if (e.currentTarget.lastChild.textContent === triviaQuestions[triviaIndex].answer) {
      //display correct answer in timer
      if (answerBtn.innerText !== "Next") {
        answerBtn.innerText = "Next";
        endTime = performance.now();
        timer.innerText = triviaQuestions[triviaIndex].answer;
        score["Me"] = score["Me"] ? (score["Me"]+1) : 1;

        //TODO: wtf? why isn't this pointing
        //      to the parent element directly?
        //Answer: currentTarget actually points to the current element
        //      but it's null if just logging out "e"
        //      need to log out currentTarget to see
        e.currentTarget.classList.add("winnerChoice");
        const sadTrombone = document.getElementById("sadTrombone");
        sadTrombone.play();
      }
    } else {
      e.currentTarget.classList.add("wrongChoice");
      choiceBtnArr.forEach(e => {
        e.classList.add("disabledChoice");
        e.onclick = {};
      });
    }
  }

  choiceBtnArr.map((e, i)=>{
    choiceDiv.append(e);
  });

}

function clearRound()
{
  const name = document.getElementById("twitchName");
  const chat = document.getElementById("chatMsg");
  name.innerText = "";
  chat.innerText = "";
}




function showScore()
{
  // const timer = document.getElementById("timer");
  timer.innerText = "";
  const title = document.getElementById("title");
  title.innerText = "Score";

  nextBtn.disabled = true;
  prevBtn.disabled = true;
  playBtn.disabled = true;
  setTimeout(()=>{
    answerBtn.innerText = "Restart?";
  }, 10);
  // console.log("answer:", answBtn.innerText);
  answerBtn.onclick = ()=>{
    nextBtn.disabled = false;
    prevBtn.disabled = false;
    playBtn.disabled = false;
    setTimeout(()=>{
      answerBtn.innerText = "Answer";
    }, 10);

    initButtons();
    restartTrivia();
  }

  // triviaDiv.removeChild(document.getElementById("question"));
  const scoreCard = document.createElement("table");
  // triviaDiv.appendChild(scoreCard);
  scoreCard.className = "scoreCard";
  scoreCard.id        = "score";

  question.replaceWith(scoreCard);

  const scoreArr = Object.entries(score);
  scoreArr.sort((a, b)=>{
    return b[1]-a[1];
  });
  // console.log("score", scoreArr);
  scoreArr.forEach((e)=>{
    const row = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    td1.className = "scoreName";
    td1.innerText = e[0];

    const r = Math.floor(Math.random()*255);
    const g = Math.floor(Math.random()*255);
    const b = Math.floor(Math.random()*255);

    td1.style = `color : rgb(${r}, ${g}, ${b});`;

    td2.innerText = e[1];
    td2.className = "scoreAmount";

    row.appendChild(td1);
    row.appendChild(td2);
    scoreCard.appendChild(row);
  });
}

// #region this is cool

