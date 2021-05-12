var Currentuid;
var chatKey='';
var ToId = '';
function sendMessage() {
    chatMessage = {
        id: '', text:'', fromId: '', toId: '', timeStamp: Math.floor(new Date().getTime() / 1000)
    };

    var a = document.getElementById('txtMessage');
    if (a.value != '') {
    chatMessage.fromId = firebase.auth().currentUser.uid;
    chatMessage.toId = ToId;
    chatMessage.text = a.value;
    var ref = firebase.database().ref('/user-messages/' + chatMessage.fromId.toString() + '/' + chatMessage.toId.toString()).push();
    var toref = firebase.database().ref('/user-messages/' + chatMessage.toId.toString() + '/' + chatMessage.fromId.toString()).push();
    
    chatMessage.id = ref.getKey();
    ref.set(
        {
            fromId: chatMessage.fromId,
            id: chatMessage.id,
            text: chatMessage.text,
            timeStamp: chatMessage.timeStamp,
            toId: chatMessage.toId
        });
    toref.set(
        {
            fromId: chatMessage.fromId,
            id: chatMessage.id,
            text: chatMessage.text,
            timeStamp: chatMessage.timeStamp,
            toId: chatMessage.toId
        });
    var latestMessageFromRef = firebase.database().ref('/latest-messages/' + chatMessage.fromId.toString() + '/' + chatMessage.toId.toString());
    var latestMessageToRef = firebase.database().ref('/latest-messages/' + chatMessage.toId.toString() + '/' + chatMessage.fromId.toString());
    latestMessageFromRef.set(
        {
            fromId: chatMessage.fromId,
            id: chatMessage.id,
            text: chatMessage.text,
            timeStamp: chatMessage.timeStamp,
            toId: chatMessage.toId
        });
    latestMessageToRef.set(
        {
            fromId: chatMessage.fromId,
            id: chatMessage.id,
            text: chatMessage.text,
            timeStamp: chatMessage.timeStamp,
            toId: chatMessage.toId
        });
    var objToday = new Date(),
        curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
        curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes();
    

    var message = `<div class="row justify-content-end">
                       <div class="col-7 col-sm-7 col-md-7">
                           <p class="sent float-right"  >
                             ${a.value}
                               <span class="time float-right">${curHour + ":" + curMinute + " PM"}</span>
                           </p>
                       </div>
                       <div class="col-2 col-sm-1 col-md-1">
                           <img src="${firebase.auth().currentUser.photoURL}" class="chat-pic rounded-circle"  />
                       </div>
                   </div>`;

    document.getElementById("txtMessage").value = '';
        document.getElementById("txtmessage").focus();
    }
}
function startChat(friendKey, friendName, friendImg, currentUserImgURL) {
    ToId = friendKey
    document.getElementById('chatPanel').removeAttribute("style");
    document.getElementById('divStart').setAttribute("style", "display:none");
    //display friend name and photo
    document.getElementById('divChatName').innerHTML = friendName;
    document.getElementById('divChatImg').src = friendImg;
    /*   });*/
    LoadChatMessages(friendKey, friendImg, currentUserImgURL);
}
function loadChatList() {
    document.getElementById("Message").innerHTML = '';
    var fromId = firebase.auth().currentUser.uid;
    var db = firebase.database().ref('latest-messages/' + fromId.toString())
    db.on('value', function (lists) {
        document.getElementById('lstChat').innerHTML = ` <li class="list-group-item" style="background-color:#f8f8f8;">
                            <input type="text" placeholder="Search or new chat" class="form-control form-rounded" />
                        </li>`;
        lists.forEach(function (data) {
            var user = data.val();
            var chatPartnerId = ''
            if (user.fromId == firebase.auth().currentUser.uid) {
                chatPartnerId = user.toId

            } else {

                chatPartnerId = user.fromId
            }
            var userdb = firebase.database().ref('/users/')
            userdb.on('value', function (userlists) {
                userlists.forEach(function (userdata) {
                    var usr = userdata.val();
                    if (chatPartnerId == usr.uid) {
                        document.getElementById('lstChat').innerHTML += `<li class="list-group-item list-group-item-action"  onclick="startChat('${chatPartnerId}','${usr.username}','${usr.profileImageUrl}','${firebase.auth().currentUser.photoURL}')">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${usr.profileImageUrl}" class="rounded-circle friend-pic" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">
                                        ${usr.username}
                                    </div>
                                    <div class="ltstmsg">
                                    ${user.text}
                                    </div>
                                </div>
                            </div>
                        </li>`;

                    }
                })
            })

        })
    })


}
function LoadChatMessages(toID, friendImg, currentUserImgURL) {
  
    var messageDisplay = ''
    var fromId = firebase.auth().currentUser.uid;
    var db = firebase.database().ref('/user-messages/' + fromId.toString() + '/' + toID.toString());
    db.on('value', function (chat) {
        document.getElementById("Message").innerHTML = '';
        chat.forEach(function (data) {
            var message = data.val();
            var dateTime = timeConverter(message.timeStamp);
            if (message.fromId == firebase.auth().currentUser.uid) {
                messageDisplay = `<div class="row justify-content-end">
                       <div class="col-7 col-sm-7 col-md-7">
                           <p class="sent float-right"  >
                             ${message.text}
                               <span class="time float-right">${dateTime}</span>
                           </p>
                       </div>
                       <div class="col-2 col-sm-1 col-md-1">
                           <img src="${currentUserImgURL}" class="chat-pic rounded-circle"  />
                       </div>
                   </div>`;

            } else {

                messageDisplay = `<div class="row">
                            <div class="col-2 col-sm-1 col-md-1">
                                <img src="${friendImg}" class="chat-pic rounded-circle" />
                            </div>
                            <div class="col-7 col-sm-7 col-md-7">
                                <p class="recieve">
                                    ${message.text}
                                    <span class="time float-right">${dateTime}</span>
                                </p>
                            </div>
                           
                        </div>`;
            }
            
            document.getElementById("Message").innerHTML += messageDisplay;
            document.getElementById("Message").scrollTo(0, document.getElementById("Message").scrollHeight);

        })
    })
}
function populateFriendList() {
    document.getElementById("lstFriend").innerHTML = `<div class="text-center">
<span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem;"></span>    
</div>`
    var db = firebase.database().ref('/users/')
    var lst;
    db.on('value', function (users) {
        if (users.hasChildren()) {

            lst = `<li class="list-group-item" style="background-color:#f8f8f8;">
                            <input type="text" placeholder="Search or new chat" class="form-control form-rounded" />
                        </li>`;

        }
        Currentuid = firebase.auth().currentUser.uid;
        users.forEach(function (data) {
            var user = data.val();
            if (user.uid != Currentuid) {

                lst += `<li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="startChat('${user.uid}','${user.username}','${user.profileImageUrl}','${firebase.auth().currentUser.photoURL}')">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${user.profileImageUrl}" class="rounded-circle friend-pic" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">
                                        ${user.username}
                                    </div>
                                    
                                </div>
                            </div>

                        </li>`;


            } 
        });
        document.getElementById("lstFriend").innerHTML = lst;
    });


}
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}
function chat() {
    var fruits = ["Banana", "Orange", "Apple", "Mango", "Kiwi"]
}
function showChatList() {
    document.getElementById("box1").classList.remove("d-none", "d-md-block");
    document.getElementById('box2').classList.add('d-none');
}
function hideChatList() {
    document.getElementById("box2").classList.remove("d-none", "d-md-block");
    document.getElementById('box1').classList.add('d-none');
}
function onKeydown() {
    document.addEventListener('keydown', function (key) {
        if (key.which === 13) {
            sendMessage();
        }
    });
}
function onStateChange(user) {
    if (user) {
        var userProfile = { uid: '', email: '', username: '', profileImageUrl: '' }
        userProfile.uid = user.uid;
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        uid = user.uid;
        userProfile.profileImageUrl = firebase.auth().currentUser.photoURL;
        firebase.database().ref('users/' + userProfile.uid.toString()).set(
            {
                email: userProfile.email,
                profileImageUrl: userProfile.profileImageUrl,
                uid: userProfile.uid,
                username: userProfile.name
            });
        var a = firebase.auth().displayName
        document.getElementById('profile-img').src = firebase.auth().currentUser.photoURL;
        document.getElementById('profile-img').title = firebase.auth().currentUser.displayName;
        document.getElementById('signInLink').style = 'display:none;';
        document.getElementById('signOutLink').style = '';
        document.getElementById('lnkNewChat').classList.remove('disable');
        loadChatList();
    } else {

        document.getElementById('profile-img').src = 'imgs/pp.png';
        document.getElementById('profile-img').title = '';
        document.getElementById('signInLink').style = '';
        document.getElementById('signOutLink').style = 'display:none;';
        document.getElementById('lnkNewChat').classList.add('disable');
    }
}
function onFirebaseStateChange() {

    firebase.auth().onAuthStateChanged(onStateChange)

}
function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider;
    firebase.auth().signInWithPopup(provider);


}
function signOut() {

    firebase.auth().signOut();
}
function callback(error) {
    if (error) {
        alert(error)
    } else {
        document.getElementById('profile-img').src = firebase.auth().currentUser.photoURL;
        document.getElementById('profile-img').title = firebase.auth().currentUser.displayName;

        document.getElementById('signInLink').style = 'display:none;';
        document.getElementById('signOutLink').style = '';
        document.getElementById('lnkNewChat').style = 'display:none;';
    }
}