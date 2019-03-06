//アクションシート
let nowButton=null;
let selected=null;//in openList number of selected listItem
let cardData={"stadium_player1":[], "battlefield_player1":[], "bench1_player1":[], "bench2_player1":[], "bench3_player1":[], "bench4_player1":[], "bench5_player1":[], "deck_player1":[], "hand_player1":[], "prize_player1":[], "discardpile_player1":[], "lostzone_player1":[], "stadium_player2":[], "battlefield_player2":[], "bench1_player2":[], "bench2_player2":[], "bench3_player2":[], "bench4_player2":[], "bench5_player2":[], "deck_player2":[], "hand_player2":[], "prize_player2":[], "discardpile_player2":[], "lostzone_player2":[]};
let newDeckData=null;

const coinToss=()=>{
  let coin=Math.random();
  if(coin>=0.5) coin='heads';
  else coin='tails';
  ons.notification.alert({
    title:'Coin Toss',
    messageHTML:coin,
    buttonLabel:'OK',
    animation:'default'
  });
}

const reset=()=>{
  let n,text,size,nexttext;
  for(name in cardData){
    for(let i=cardData[name].length-1; i>=0; i--){
      n=name.match(/player(\d)/)[1];
      cardData["deck_player"+n].push(cardData[name][i]);
      cardData[name].splice(i,1);
    }
    text=document.getElementById(name).innerHTML;
    if(text){
      size=text.match(/(\d+)/);
      nexttext=text.replace(new RegExp(size[1]),0);
      document.getElementById(name).innerHTML=nexttext;
    }
    document.getElementById(name).style.backgroundImage=null;
  }
  document.getElementById("deck_player1").innerHTML='Deck 60';
  document.getElementById("deck_player2").innerHTML='Deck 60';
  document.getElementById("img_player1").style.display="none";
  document.getElementById("img_player2").style.display="none";
}

const openList=(button=nowButton, flag=1)=>{
  let n=nowButton.match(/player(\d)/)[1];
  let div=document.getElementById('msg_player'+n);
  let last=div.lastChild;
  div.removeChild(last);
  div.innerHTML='<p><b>'+button.match(/(.+)_/)[1]+' DATA</b></p>';//idの_の前の部分を使用
  if(flag){
    let res=document.createElement('p');
    for(let i=0,imax=cardData[button].length; i<imax; i++){
      res.innerHTML=res.innerHTML+"<a href='javascript:void(0)'  onclick='openImg("+cardData[button][i].src+',"img_player'+n+'"'+")'>"+cardData[button][i].name+'</a><br>';
    }
    let listItem=res.getElementsByTagName('a');
    for(let i=0,imax=cardData[button].length; i<imax; i++){
      listItem[i].addEventListener('click',()=>{
        selected=i;
        listOption.show();
      });
    }
    div.appendChild(res);
  }
}

const shuffle=(button=nowButton)=>{
  let num=cardData[button].length, i, tmp;
  while(num){
    i=Math.floor(Math.random()*num--);
    tmp=cardData[button][num];
    cardData[button][num]=cardData[button][i];
    cardData[button][i]=tmp;
  }
  const n=nowButton.match(/player(\d)/)[1];// 1 or 2
  let div=document.getElementById('msg_player'+n);
  let last=div.lastChild;
  div.removeChild(last);
  div.innerHTML='<p><b>Shuffled</b></p>';
}

const handShuffle=()=>{
  const n=nowButton.match(/player(\d)/)[1];// 1 or 2
  let text1, size1, nexttext1, text2, size2, nexttext2;
  for(let i=cardData['hand_player'+n].length-1; i>=0; i--){
    cardData["deck_player"+n].push(cardData['hand_player'+n][i]);
    text1=document.getElementById("deck_player"+n).innerHTML;
    size1=text1.match(/(\d+)/);
    nexttext1=text1.replace(new RegExp(size1[1]),size1[1]*1+1);
    document.getElementById("deck_player"+n).innerHTML=nexttext1;

    cardData['hand_player'+n].splice(i,1);
    text2=document.getElementById('hand_player'+n).innerHTML;
    size2=text2.match(/(\d+)/);
    nexttext2=text2.replace(new RegExp(size2[1]),size2[1]*1-1);
    document.getElementById('hand_player'+n).innerHTML=nexttext2;
  }
  shuffle('deck_player'+n);
}

const draw=(num, orgn='deck_player', dest='hand_player')=>{
  let text1, size1, nexttext1, text2, size2, nexttext2;
  const n=nowButton.match(/player(\d)/)[1];// 1 or 2
  const destination=dest+n;
  const origin=orgn+n;
  for(i=0;i<num;i++){
    text2=document.getElementById(origin).innerHTML;
    size2=text2.match(/(\d+)/);
    if(size2[1]==0){
      break;
    }else{
      cardData[destination].push(cardData[origin][0]);
      text1=document.getElementById(destination).innerHTML;
      size1=text1.match(/(\d+)/);
      nexttext1=text1.replace(new RegExp(size1[1]),size1[1]*1+1);
      document.getElementById(destination).innerHTML=nexttext1;

      cardData[origin].splice(0,1);
      nexttext2=text2.replace(new RegExp(size2[1]),size2[1]*1-1);
      document.getElementById(origin).innerHTML=nexttext2;
    }
  }
  nowButton='hand_player'+n;
  openList('hand_player'+n);
}

const damage=n=>{
  let text=document.getElementById(nowButton).innerHTML;
  // \s=空白文字, \d=[0-9], +=1個以上の連続, ()=matchで配列の2番目以降に保存
  const dmgText=/DMG\s(\d+)/;
  let dmg=text.match(dmgText);
  dmg[1]=dmg[1]*1+n;
  if(dmg[1]<0) dmg[1]=0;
  const nexttext=text.replace(new RegExp(dmg[0]),'DMG '+dmg[1]);
  document.getElementById(nowButton).innerHTML=nexttext;
}

//bench<=>battlefield
const field2Battlefield=()=>{
  let choiced=document.getElementById(nowButton);
  const n=nowButton.match(/player(\d)/)[1];// 1 or 2
  let active=document.getElementById('battlefield_player'+n);
  let tmp=active.innerHTML;
  active.innerHTML=choiced.innerHTML;
  choiced.innerHTML=tmp;
  tmp=active.style.backgroundImage;
  active.style.backgroundImage=choiced.style.backgroundImage;
  choiced.style.backgroundImage=tmp;
  tmp=cardData[nowButton];
  cardData[nowButton]=cardData['battlefield_player'+n];
  cardData['battlefield_player'+n]=tmp;
  openList('hand_player'+n);
}

const field2away=dest=>{
  const n=nowButton.match(/player(\d)/)[1];// 1 or 2
  const destination=dest+n;
  for(let i=cardData[nowButton].length - 1; i>=0; i--){
    cardData[destination].push(cardData[nowButton][i]);
    const text1=document.getElementById(destination).innerHTML;
    const size1=text1.match(/(\d+)/);
    const nexttext1=text1.replace(new RegExp(size1[1]),size1[1]*1+1);
    document.getElementById(destination).innerHTML=nexttext1;
    cardData[nowButton].splice(i,1);
  }
  document.getElementById(nowButton).style.backgroundImage=null;
  damage(-9999);
  openList();
}

const toField=(dest, flag=0)=>{//flag 1:pokemon 2:stadium
  const n=nowButton.match(/player(\d)/)[1];// 1 or 2
  const other=3-n*1;
  const destination=dest+n;
  let choiced=document.getElementById(destination);
  if(flag){
    choiced.style='background-image:url('+cardData[nowButton][selected].src+')';
    if(flag==2){
      let another=document.getElementById(dest+other);
      another.style='background-image:url('+cardData[nowButton][selected].src+')';
      choiced.innerHTML='Player'+n;
      another.innerHTML='Player'+n;
      let text1, size1, nexttext1;
      if(cardData[destination].length){
        cardData['discardpile_player'+n].push(cardData[destination].pop());
        text1=document.getElementById('discardpile_player'+n).innerHTML;
        size1=text1.match(/(\d+)/);
        nexttext1=text1.replace(new RegExp(size1[1]), size1[1]*1+1);
        document.getElementById('discardpile_player'+n).innerHTML=nexttext1;
      }
      else if(cardData[dest+other].length){
        cardData['discardpile_player'+other].push(cardData[dest+other].pop());
        text1=document.getElementById('discardpile_player'+other).innerHTML;
        size1=text1.match(/(\d+)/);
        nexttext1=text1.replace(new RegExp(size1[1]), size1[1]*1+1);
        document.getElementById('discardpile_player'+other).innerHTML=nexttext1;
      }
    }
  }
  if(choiced.style.backgroundImage){
    cardData[destination].push(cardData[nowButton][selected]);
    cardData[nowButton].splice(selected,1);
    const text2=document.getElementById(nowButton).innerHTML;
    if(text2.match(/DMG/)){
    }else{
      if(text2.match(/(\d+)/)){
        const size2=text2.match(/(\d+)/);
        const nexttext2=text2.replace(new RegExp(size2[1]),size2[1]*1-1);
        document.getElementById(nowButton).innerHTML=nexttext2;
      }
    }
    openList();
  }
}

const toAway=dest=>{
  let n=nowButton.match(/player(\d)/)[1];
  let destination=dest+n;
  cardData[destination].push(cardData[nowButton][selected]);
  const text1=document.getElementById(destination).innerHTML;
  const size1=text1.match(/(\d+)/);
  const nexttext1=text1.replace(new RegExp(size1[1]),size1[1]*1+1);
  document.getElementById(destination).innerHTML=nexttext1;

  cardData[nowButton].splice(selected,1);
  const text2=document.getElementById(nowButton).innerHTML;
  if(text2.match(/DMG/)){
  }else{
    const size2=text2.match(/(\d+)/);
    const nexttext2=text2.replace(new RegExp(size2[1]),size2[1]*1-1);
    document.getElementById(nowButton).innerHTML=nexttext2;
  }
  openList();
}

const selectDeck=n=>{
  if(!db) return;
  let deckName;
  // alert(nowButton);
  deckName=document.getElementById('deckname_player'+n).value;
  // alert(deckName);
  const transaction=db.transaction([DBName],'readonly');
  const store=transaction.objectStore(DBName).index('name');
  let findReq=store.get(deckName);
  findReq.onsuccess=event=>{
    const val=findReq.result;
    let res=document.createElement('p');
    if(!val){
      res.innerHTML='not found...';
    }else{
      newDeckData=[];
      for(let i=0,imax=val.data.length; i<imax; i++){
        for(let j=0,jmax=val.data[i].copy; j<jmax; j++){
          newDeckData.push({name:val.data[i].name, src:val.data[i].src});
          res.innerHTML=res.innerHTML+val.data[i].name+'<br>';
        }
      }
    }
    let div;
    div=document.getElementById('msg_player'+n);
    div.innerHTML='<p><b>FIND DATA</b></p>';
    div.appendChild(res);
  };
  findReq.onerror=event=>alert('ERROR: '+event);
};

const setDeck=n=>{
  if(newDeckData){
    document.getElementById('selectDeck_player'+n).disabled=true;
    document.getElementById('setDeck_player'+n).disabled=true;
    cardData["deck_player"+n]=newDeckData;
    // for(let i=0,imax=deck_player1_data.length; i<imax; i++){
    //   console.log(cardData["deck_player1"][i]);
    // }
    document.getElementById('deck_player'+n).innerHTML='Deck 60';
  }else{
    alert('Select Deck');
  }
};
