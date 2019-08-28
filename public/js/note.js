const auth = firebase.auth();
const google = new firebase.auth.GoogleAuthProvider();
const db = firebase.database();
var user = null; // 로그인한 사용자의 정보를 저장하는 변수
var nowKey = null; // 수정상태인 것을 알려주기 위해 nowKey=null (신규생성) / nowkey=id값 (수정모드)

const _btLogin = document.querySelector("#btLogin");
const _btLogout = document.querySelector("#btLogout");
const _btSave = document.querySelector("#btSave");
const _content = document.querySelector("#noteTxt");
const _lists = document.querySelector(".lists");
const _btWing = document.querySelector("#btWing");

//인증기능 만들기
//$("#btLogin").click(function(e){});

auth.onAuthStateChanged(data => {
	user = data;
	if(user == null) viewChg('');
	else {
		viewChg('R');
		dbInit();
	}
});


_btLogin.addEventListener("click", e => {
 auth.signInWithPopup(google);
//  auth.signInWithRedirect(google);
});
_btLogout.addEventListener("click", e => {
	auth.signOut()
});

// note 추가/수정하기
_btSave.addEventListener("click", (e) => {
	var content = _content.value.trim(); //JS value와 firebase.val() 차이
	if(content === "") {
		alert("내용을 입력하세요.");
		_content.focus();
		return false;
	}
	if(nowKey == null) {
		// 신규작성
		db.ref("root/notes/"+user.uid).push({
			content: content,
			time: new Date().getTime(),
			icon: content.substring(0, 1)
		}).key; //내용은 객체로{} 넣는다.
	}
	else {
		//수정
		db.ref("root/notes/"+user.uid+"/"+nowKey).update({
			content: content,
			icon: content.substring(0, 1)
		});
	}
	_content.value = "";
	nowKey = null;
});

// Database init 
function dbInit() {
	_lists.innerHTML = '';
	db.ref("root/notes/"+user.uid).on("child_added", onAdd);
	db.ref("root/notes/"+user.uid).on("child_removed", onRev);
	db.ref("root/notes/"+user.uid).on("child_changed", onChg);
}

// Database onAdd 콜백
function onAdd(data) { //추가된 data 받기
	// console.log(data);
	var html = '';
	html += '<ul id ="'+data.key+'" class="list border border-white rounded p-3 mt-3 bg-info text-light position-relative" onclick="dataGet(this)">';
	html += '<li class="d-flex">';
	html += '<h1 class="icon bg-light text-dark rounded-circle text-center mr-3 flex-shrink-0" style="width: 55px; height: 55px;">'+data.val().icon+'</h1>';
	html += '<div class="cont">'+data.val().content.substring(0, 50)+'</div>';
	html += '</li>';
	html += '<li>'+dspDate(new Date(data.val().time))+'</li>'; //jQuery val()아님주의. firebase 의 객체 중 val이라는 function
	html += '<li class="position-absolute" style="bottom: 10px; right: 10px; cursor: pointer;">';
	html += '<i class="fas fa-trash-alt" onclick="dataRev(this)"></i></li>';
	html += '</ul>';
	_lists.innerHTML = html + _lists.innerHTML;
}

// Database onRev 콜백
function onRev(data) {
	var id = data.key;
	document.querySelector("#"+id).remove(); // JS 의 remove() Method
}
// Database onChg 콜백
function onChg(data) {
	 var id = data.key;
	 document.querySelector("#"+id+" .icon").innerHTML = data.val().icon;
	 document.querySelector("#"+id+" .cont").innerHTML = data.val().content.substring(0, 50);
}

// onclick 함수 : dataRev(this)
function dataRev(obj) {
	event.stopPropagation();
	// console.log(obj.parentNode.getAttribute("id"));
	if(confirm("진심 삭제?")) {
		var key = obj.parentNode.parentNode.getAttribute("id");
		db.ref("root/notes/"+user.uid+"/"+key).remove(); // Firebase 의 remove() Method
	}
}

// onclick 함수 : dataGet(this)
function dataGet(obj) {
	nowKey = obj.getAttribute("id");
	db.ref("root/notes/"+user.uid+"/"+nowKey).once("value").then((data) => {
		_content.value = data.val().content;
	}); // on과 once. once는 event를 한번만 작동. key 의 value를 한번만 가져옴
	//then()은 가져오는 과정이 끝난 이후에 함수를 실행
}

// onclick - btWing
_btWing.addEventListener("click", () => {
	var left = getComputedStyle(_lists).left.replace("px", "");
	var targetLeft = "-" + getComputedStyle(_lists).width;
	if(left == 0) {
		_lists.style.left = targetLeft;
		_btWing.querySelector(".fas").classList.remove("fa-angle-left");
		_btWing.querySelector(".fas").classList.add("fa-angle-right");
	}
	else {
		_lists.style.left = 0;
		_btWing.querySelector(".fas").classList.remove("fa-angle-right");
		_btWing.querySelector(".fas").classList.add("fa-angle-left");
	}
});

// onResize 함수
window.addEventListener("resize", function(e){
	var position = getComputedStyle(_lists).position;
	if(position === "absolute") {

	}
	else {

	}
});

// 화면전환 함수
function viewChg (state){
	switch(state) {
		case "R" :
			imagesLoaded( document.querySelector('.email img'),() => {
				document.querySelector(".email img").setAttribute("src", user.photoURL);
				document.querySelector(".email-txt").innerHTML = user.email;
				document.querySelector(".email").style.display = "flex";
				document.querySelector("#btLogin").style.display = "none";
			});
			document.querySelector(".email img").setAttribute("src", user.photoURL);
			break;
		default :
			document.querySelector(".email-txt").innerHTML = "";
			document.querySelector(".email").style.display = "none";
			document.querySelector("#btLogin").style.display = "inline-block";
			break;
	}
}