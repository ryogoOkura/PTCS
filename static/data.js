let deckData_arcive;

//CSVファイルを読み込んでデッキデータを作成する
const getCSV=(filename,deckName)=>{
  let req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
  req.open("get", filename, true); // アクセスするファイルを指定
  req.send(null); // HTTPリクエストの発行
  // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ
  req.onload=()=>{
    convertCSVtoArray(req.responseText); // 渡されるのは読み込んだCSVデータ
    addData(deckName);
  }
};

const convertCSVtoArray=str=>{ // 読み込んだCSVデータが文字列として渡される
  document.getElementById('msg').innerHTML=str;
  let result = []; // 最終的な二次元配列を入れるための配列
  let tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
  // alert(tmp.length);
  // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
  for(let i=0,imax=tmp.length; i<imax; i++) result[i] = tmp[i].split(',');

  deckData_arcive=[];
  let deckSize=0;
  let copyNum, srcNum, nameNum;
  for(let i=0,imax=result[0].length; i<imax; i++){
    // alert(result[0][i]);
    switch(result[0][i]){
      case '"copy"':
        copyNum=i; break;
      case '"name"':
        nameNum=i; break;
      case '"src"':
        srcNum=i; break;
    }
  }
  // alert(`copy=${copyNum},name=${nameNum},src=${srcNum}`);
  for(let i=1,imax=result.length; i<imax; i++){
    try{//最後の改行(空配列)対策
      deckData_arcive.push({name:result[i][nameNum].match(/"(.+)"/)[1], copy:result[i][copyNum].match(/\d+/)*1, src:result[i][srcNum]});
      deckSize+=deckData_arcive[i-1].copy;
      if(deckSize>=60) break;
      // alert(deckData_arcive[i-1].name+'は'+deckData_arcive[i-1].copy+'枚　ここまでで'+deckSize+'枚');
    }catch(e){}
  }
  alert(deckSize);
  // alert(result.length);
  // alert(deckData_arcive.length);
};

const initialFile=e=>{
  let file = e.target.files[0];
  //FileReaderのインスタンスを作成する
  let reader = new FileReader();
  //読み込んだファイルの中身を取得する
  reader.readAsText(file);
  //ファイルの中身を取得後に処理を行う
  reader.addEventListener('load',  ()=>convertCSVtoArray(reader.result));
}

let indexedDB;
const DBName='deckDatabase';
let dbVersion=10;
let db;
const initialDB=()=>{
  let openReq=window.indexedDB.open(DBName,dbVersion);
  openReq.onerror=event=>alert('ERROR!');
  openReq.onsuccess=event=>{
    db=event.target.result;
    createList();
  };
  openReq.onupgradeneeded=event=>{
    db=event.target.result;
    if(db.objectStoreNames.contains(DBName)) db.deleteObjectStore(DBName);
    let store=db.createObjectStore(DBName, {keyPath:'id', autoIncrement:true});
    store.createIndex('name','name',{unique:true});
  };
};

const addData=(deckName=0)=>{
  if(!db) return;
  if(deckName==0) deckName=document.getElementById('deckname').value;
  if(!deckName) return;
  const data={name:deckName, data:deckData_arcive};
  const transaction=db.transaction([DBName],'readwrite');
  let store=transaction.objectStore(DBName);
  store.put(data);
  createList();
  document.getElementById('deckname').value='';
};

const findData=(deckNum=0)=>{
  if(!db) return;
  const deckName=document.getElementById('deckname').value;
  if(deckNum==0) deckNum=document.getElementById('decknum').value;
  deckNum=deckNum*1;
  let transaction=db.transaction([DBName],'readonly');
  let store=transaction.objectStore(DBName);
  let val, dataExist=false, res=document.createElement('p');
  if(deckName){
    let getReqByName=store.index('name').get(deckName);
    getReqByName.onsuccess=event=>{
      val=getReqByName.result;
      if(val){
        res.innerHTML="<ons-row><ons-col width='70%'>name</ons-col><ons-col><div style='text-align:center'>copy</div></ons-col><ons-col width='20%'></ons-col></ons-row>";
        let nowtext;
        for(let i=0,imax=val.data.length; i<imax; i++){
          nowtext=res.innerHTML;
          res.innerHTML=nowtext+"<ons-row><ons-col width='70%'>"
          +"<a href='javascript:void(0)'  onclick='openImg("+val.data[i].src+',"img"'+")'>"
          +val.data[i].name+"</a></ons-col>"
          +"<ons-col><div style='text-align:center'>"+val.data[i].copy+"</div></ons-col>"
          +"<ons-col width='20%'></ons-col></ons-row>";
        }
        document.getElementById('deckname').value='';
      }else{
        res.innerHTML='not found...';
      }
      let div=document.getElementById('msg');
      div.innerHTML='<p><b>FIND DATA</b></p>';
      div.appendChild(res);
    };
    getReqByName.onerror=event=>alert('ERROR: '+event);
  }
  if(deckNum){
    let getReqById=store.get(deckNum);
    getReqById.onsuccess=event=>{
      val=getReqById.result;
      if(val){
        res.innerHTML="<ons-row><ons-col>name</ons-col><ons-col><div style='text-align:center'>copy</div></ons-col></ons-row>";
        let nowtext;
        for(let i=0,imax=val.data.length; i<imax; i++){
          nowtext=res.innerHTML;
          res.innerHTML=nowtext+"<ons-row><ons-col>"
          +"<a href='javascript:void(0)'  onclick='openImg("+val.data[i].src+',"img"'+")'>"
          +val.data[i].name+"</a></ons-col>"
          +"<ons-col><div style='text-align:center'>"+val.data[i].copy+"</div></ons-col>"
          +"</ons-row>";
        }
        document.getElementById('decknum').value='';
      }else{
        res.innerHTML='not found...';
      }
      let div=document.getElementById('msg');
      div.innerHTML='<p>'+val.id+':<b>'+val.name+'</b></p>';
      div.appendChild(res);
    };
    getReqById.onerror=event=>alert('ERROR: '+event);
  }
};

const deleteData=()=>{
  if(!db) return;
  const deckNum=document.getElementById('decknum').value*1;
  let transaction=db.transaction([DBName],'readwrite');
  let store=transaction.objectStore(DBName);
  let deleteReq=store.delete(deckNum);
  deleteReq.onsuccess=event=>{
    document.getElementById('deckname').value='';
    createList();
  };
  deleteReq.onerror=event=>alert('ERROR: '+event);
};

const openImg=(src,img_id)=>{
  let img=document.getElementById(img_id);
  img.style.display='block';
  img.src=src;
}

const createList=()=>{
  let div=document.getElementById('msg');
  div.innerHTML='<p><b>DATA LIST</b></p>\n<ons-row><ons-col width="10%"><div class="fullright">Number:</div></ons-col><ons-col width="2%"></ons-col><ons-col><b>Deck Name</b></ons-col></ons-row>';
  const transaction=db.transaction([DBName],'readonly');
  const store=transaction.objectStore(DBName);
  const range=IDBKeyRange.lowerBound(0);
  let readReq=store.openCursor(range);
  readReq.onsuccess=event=>{
    let cur=event.target.result;
    if(!cur) return;
    let res=document.createElement('p');
    res.innerHTML="<ons-row><ons-col width='10%'><div class='fullright'>"+cur.value.id+":</div></ons-col><ons-col width='2%'></ons-col><ons-col><b><a href='javascript:void(0)' onclick='findData("+cur.value.id+")'>" +cur.value.name +'</a></b></ons-col></ons-row>';
    div.appendChild(res);
    cur.continue();
  };
  readReq.onerror=event=>alert('ERROR: '+event);
  let img=document.getElementById('img');
  img.style.display="none";
}

// window.addEventListener('load',()=>{
//   initialDB();
//   document.getElementById('myfile').addEventListener('change', e=>initialFile(e));
// });
