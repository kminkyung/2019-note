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
const _lists = document.querySelector(".lists");

// 인증관련 이벤트
_btLogin.addEventListener("click", function(){
	auth.signInWithPopup(googleAuth);
});

_btLogout.addEventListener("click", function(){
	auth.signOut();
});

auth.onAuthStateChanged(function(data){  // parameter 는 au, data 등 무엇을 써도 상관없다. onAuthStateChanged Method는 auth 의 변한 상태를 감지해서 param 으로 data를 받아서 event를 실행
	// console.log(data);
	user = data; // 지역변수 값을 전역변수에 넣는다
	if(data) { 
		_email.innerHTML = data.email + "/" + data.uid;
		_lists.innerHTML = "";
		dbInit(); //auth 상태가 변하면(login이 끝났으면) dbInit 하도록 한다.
	}
	else _email.innerHTML = ""; //null
});

// null = false

// 데이터베이스 관련 이벤트
function dbInit() {
  db.ref("root/notes/"+user.uid).on("child_added", onAdd); //firebase database 가 가지고있는 on event method
  db.ref("root/notes/"+user.uid).on("child_removed", onRev);
  db.ref("root/notes/"+user.uid).on("child_changed", onChg);
}


// 데이터가 추가 이벤트 후 실행되는 콜백함수
function onAdd(data) {
	console.log(data.val().content + "/" + data.val().time);
	var html = `
	<ul class="list my-3 row border-bottom border-dark">
		<li class="col-8 p-2">${data.val().content}</li>
		<li class="col-4 p-2">${dspDate(new Date(data.val().time))}</li>
	</ul>`;
	_lists.innerHTML = html + _lists.innerHTML; //기존의 data가 밑으로 오고, 새 data 가 위로 오게 만든다.
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
	db.ref("root/notes/"+user.uid).push({
		content: content, //data명 content 의 input content를 넣는다.
		time: new Date().getTime() //timestamp로 저장
	}).key; // 고유 key를 생성해서 넣기 firebase에서 data에 key붙여준다. 이 구문을 넣지않아도 key값은 생성되지만 정확한 문법은 이것임.
});