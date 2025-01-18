//old way of exporting a function without modules
globalThis.twitchChatConnect = twitchChatConnect;

const TwitchWebSocketUrl = 'wss://irc-ws.chat.twitch.tv:443';
const maxMsgCount        = 5;
const chatBody = (document.querySelector("#ChatMessages"));
let wsTwitch;
let channelName;
let parseChat;
export function twitchChatConnect(name, chatParseCallback)
{
  parseChat = chatParseCallback;
  channelName = name;
  wsTwitch = new WebSocket(TwitchWebSocketUrl);
  wsTwitch.onopen = ()=>{
    console.log("chat opened");
    wsTwitch.send(`CAP REQ :twitch.tv/commands twitch.tv/tags`);
    wsTwitch.send(`NICK justinfan6969`);
    wsTwitch.send(`JOIN #${channelName}`);
    console.log('WebSocket connection opened');    //debug
  }
  wsTwitch.onmessage = onMessage;
}


function onMessage(fullmsg)
{
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
    return;
  }

  //not running bot commands here
  if (outmsg[0] == '!') {
    return;
  }

  display_msg(name, outmsg);
  // console.log("name", name);
  // console.log("outmsg", outmsg);

}




// display chat message on stream
function display_msg(name, outmsg, tags_obj, emote_list)
{
  let emote;
  let chatMSG = document.createElement("div");

  if (outmsg.startsWith('\x01ACTION')) {
    outmsg = outmsg.substring(7, outmsg.length - 1).trim();
    chatMSG.classList.add('msg_is_emote');
  }

  let auth = document.createElement("div");
  auth.classList.add("name");

  if (tags_obj?.color) {
    chatMSG.style.setProperty('--name-color', tags_obj['color']);
  }

  auth.textContent = (tags_obj?.display_name || name) + ' ';

  if (tags_obj?.emotes) {
      let parts = [];
      let end_indx = outmsg.length;

    for (let i = emote_list.length; --i >= 0; ) {
      emote = document.createElement("img");
      emote.setAttribute('src', emote_list[i].url);
      if (i!==0) {
        emote.style = 'margin-left: -14px';
      }

      let last_half = esc_html(outmsg.slice(emote_list[i].end + 1, end_indx));
      parts.unshift(last_half);
      parts.unshift(emote.outerHTML);
      end_indx = emote_list[i].start;
    }
    parts.unshift(esc_html(outmsg.slice(0, end_indx)));
    outmsg = parts.join('');
  }







  const winner = parseChat(name, outmsg);

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
    }
    msg.innerText += winner.str;

    chatMSG.append(auth, msg);
    // chat message has to be prepended to appear on bottom
    const chatBody = document.getElementById("twitchChat");
    chatBody.prepend(chatMSG);
  }
  chatMSG.classList.add("message_box");

  // if more than maxMsgCount, delete first message
  if (chatBody.children.length > maxMsgCount) {
    chatBody.lastElementChild.remove();
  }

}