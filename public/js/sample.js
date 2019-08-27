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
const content = document.querySelector("#content");
const _lists = document.querySelector(".lists");

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
		dbInit(); //auth 상태가 변하면(login이 끝났으면) dbInit 하도록 한다.
	}
	else _email.innerHTML = "";
});

// null = false

// 데이터베이스 관련 이벤트
function dbInit() {
  db.ref("root/notes/"+user.uid.add).on("child_added", onAdd); //firebase database 가 가지고있는 on event method
  db.ref("root/notes/"+user.uid.add).on("child_removed", onRev);
  db.ref("root/notes/"+user.uid.add).on("child_changed", onChg);
}


// 데이터가 추가 이벤트 후 실행되는 콜백함수
function onAdd(data) {

}
// 데이터가 삭제 이벤트 후 실행되는 콜백함수
function onRev(data) {

}
// 데이터가 변경 이벤트 후 실행되는 콜백함수
function onChg(data) {

}

// 실제 데이터 저장