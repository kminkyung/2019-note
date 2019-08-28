// 전역변수
const auth = firebase.auth();
const googleAuth = new firebase.auth.GoogleAuthProvider(); //new Array 와 같은 원리. 대상의 instance 생성
var user = null;
const db = firebase.database(); // 현존하는 Database는 두가지 : SQL(Sequence Query Language)(80%) / noSQL(Not Only SQL)(20%) 

// 인증관련 전역변수
const _btLogin = document.querySelector("#btLogin");
const _btLogout = document.querySelector("#btLogout");
const _email = document.querySelector("#email");

// 데이터베이스 관련 전역변수
const _btSave = document.querySelector("#btSave");
const _content = document.querySelector("#content");
const _chats = document.querySelector(".chats");

// 인증관련 이벤트
_btLogin.addEventListener("click", function(){
	auth.signInWithPopup(googleAuth);
});

_btLogout.addEventListener("click", function(){
	auth.signOut();
});

auth.onAuthStateChanged(function(data){  // parameter 는 au, data 등 무엇을 써도 상관없다. onAuthStateChanged Method는 auth 의 변한 상태를 감지해서 param 으로 data를 받아서 event를 실행
	console.log(data);
	user = data; // 지역변수 값을 전역변수에 넣는다
	if(data) {
		_email.innerHTML = data.email + "/" + data.uid;
		_chats.innerHTML = "";
		dbInit(); //auth 상태가 변하면(login이 끝났으면) dbInit 하도록 한다.
	}
	else _email.innerHTML = "";
});

// null = false

// 데이터베이스 관련 이벤트
function dbInit() {
  db.ref("root/chats/").on("child_added", onAdd); //firebase database 가 가지고있는 on event method
  db.ref("root/chats/").on("child_removed", onRev);
  db.ref("root/chats/").on("child_changed", onChg);
}


// 데이터가 추가 이벤트 후 실행되는 콜백함수
function onAdd(data) {
	console.log(data.val().content + "/" + data.val().time);
	var outerCls = "justify-content-start";
	var innerCls = "bg-primary";
	if(data.val().uid == user.uid) {
		outerCls = "justify-content-end";
		innerCls = "bg-success";
	}
/* 	var html = `
	<div class="d-flex ${outerCls}" style="flex: 1 0 100%;">
		<ul class="chat p-3 text-left text-light rounded mb-5 position-relative ${innerCls}">
			<li class="f-0875">${data.val().name} : </li>
			<li class="f-125">${data.val().content}</li>
			<li class="f-0875 text-secondary position-absolute mt-3">${dspDate(new Date(data.val().time), 5)}</li>
		</ul>
	</div>`; */
	var html = '<div class="d-flex '+outerCls+'" style="flex: 1 0 100%;">';
	html += '<ul class="chat p-3 text-left text-light rounded mb-5 position-relative '+innerCls+'">';
	html += '<li class="f-0875">'+data.val().name+' : </li>';
	html += '<li class="f-125">'+data.val().content+'</li>';
	html += '<li class="f-0875 text-secondary position-absolute mt-3">';
	html += dspDate(new Date(data.val().time), 5)+'</li>';
	html += '</ul>';
	html += '</div>';
	_chats.innerHTML = html + _chats.innerHTML; //기존의 data가 밑으로 오고, 새 data 가 위로 오게 만든다.
}

// 데이터가 삭제 이벤트 후 실행되는 콜백함수
function onRev(data) {

}
// 데이터가 변경 이벤트 후 실행되는 콜백함수
function onChg(data) {

}

// 실제 데이터 저장 구현
_btSave.addEventListener("click", function(e){
	var content = _content.value.trim();
	if (content == "") {
		alert("글을 작성하세요");
		_content.focus();
		return false;
	}
	db.ref("root/chats/").push({
		uid: user.uid,
		name: user.displayName,
		content: content, //data명 content 의 input content를 넣는다.
		time: new Date().getTime() //timestamp로 저장
	}).key; // 고유 key를 생성해서 넣기
	_content.val()= "";
});