let content = document.getElementById("chat");
let last_time, conversation_data;
let intervals = {};
let info = {};

let newMessagesInterval = 1000;
let keepOnlineInterval = 10000;


function InitializeChat() {
    content.innerHTML = "<h1>Loading messages...</h1>";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "backend/get_dm_conversations.php", true);
    info = {};

    xhr.onload = () => {
        if (xhr.status !== 200) {
            content.innerHTML = "<h1>Something went wrong.</h1><p>Response code " + xhr.status + "</p>";
            return
        }
        let messages = document.createElement("div");
        messages.innerHTML = xhr.response;


        content.innerHTML = `<h1>Welcome, ${messages.lastChild.innerText}! Here are your conversations:</h1><a style='position: absolute; top: -1%;' href='#' onclick='InitializeChat()'>Refresh</a>`;
        content.appendChild(document.createElement("table"));
        if (messages.firstChild.childNodes.length < 1) {
            let noConvs = document.createElement("h3");
            noConvs.innerText = "You have no conversations...";
            content.appendChild(noConvs);
        }
        for (let msgData of messages.firstChild.childNodes) {
            m = msgData;
            let message = document.createElement("div");
            message.classList.add("messages");
            if (msgData.getElementsByClassName("blocked").length > 0) {
                message.classList.add("blocked");
            }

            if (msgData.getElementsByClassName("unread").length > 0) {
                message.classList.add("unread");
            }

            let name = document.createElement("h2");
            name.innerText = msgData.getElementsByClassName("username")[0].innerText;
            if (msgData.getElementsByClassName("user_status")[0].innerText === "online") {
                name.classList.add("online");
            }
            else {
                name.classList.add("offline");
            }
            message.appendChild(name);

            let status = document.createElement("p");
            status.innerText = msgData.getElementsByClassName("user_status")[0].innerText;
            status.classList.add("status");
            message.appendChild(status);

            let msg = document.createElement("p");
            msg.innerText = stripHtml(msgData.getElementsByClassName("last_message")[0].innerHTML);
            //msg.innerText = msgData.getElementsByClassName("last_message")[0].innerText;
            message.appendChild(msg);
            
            let time = document.createElement("span");
            time.innerText = msgData.getElementsByClassName("last_message_time")[0].innerText;
            message.appendChild(time);
            
            let dm_id = msgData.getElementsByClassName("dm_id")[0].innerText;
            
            let user_id = msgData.getElementsByClassName("user_id")[0].innerText;
            
            let blockButton = document.createElement("button");
            blockButton.classList.add("block_button");
            blockButton.type = "button";
            
            blockButton.innerText = "Block";
            blockButton.onclick = e => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to block ${name.innerText}?`)) {
                    let xhr = new XMLHttpRequest();
                    xhr.open("POST", "backend/block_user.php", true);
                    
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            if (xhr.responseText === "1") {
                                InitializeChat();
                            }
                            else if (xhr.responseText === "blocked") {
                                sendErrorMsg("You have already blocked the user!");
                            }
                            else {
                                sendErrorMsg("Could not block the user.");
                                console.log(xhr.responseText);
                            }
                        }
                        else {
                            sendErrorMsg("Could not block the user.");
                            console.log(xhr.responseText);
                        }
                    }
                    
                    let args = new FormData();
                    args.append("blocked_user_id", user_id);
                    xhr.send(args);
                }
            }
            
            if (msgData.getElementsByClassName("blocked").length > 0) {
                if (msgData.getElementsByClassName("blocked")[0].innerText === "you blocked") {
                    blockButton.innerText = "Unblock";
                    blockButton.style.color = "lime";
                    blockButton.onclick = e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to unblock ${name.innerText}?`)) {
                            let xhr = new XMLHttpRequest();
                            xhr.open("POST", "backend/unblock_user.php", true);
                            
                            xhr.onload = () => {
                                if (xhr.status === 200) {
                                    if (xhr.responseText === "1") {
                                        InitializeChat();
                                    }
                                    else {
                                        sendErrorMsg("Could not unblock the user.");
                                        console.log(xhr.responseText);
                                    }
                                }
                                else {
                                    sendErrorMsg("Could not unblock the user.");
                                    console.log(xhr.responseText);
                                }
                            }
                            
                            let args = new FormData();
                            args.append("blocked_user_id", user_id);
                            xhr.send(args);
                        }
                    }
                }
            }
            
            message.appendChild(blockButton);
            
            message.onclick = () => { loadDirectChat(dm_id, name.innerText); };
            
            let table = content.firstChild;
            table.appendChild(document.createElement("tr"));
            table.lastChild.appendChild(document.createElement("td"));
            table.lastChild.lastChild.appendChild(message);
            
        }
        
        let newConversation = document.createElement("div");
        newConversation.classList.add("messages");
        newConversation.appendChild(document.createElement("form"));
        
        newConversation.firstChild.innerHTML = "<p style='color: #3ba0e6;'>Type the user login to start a new conversation</p>";
        let input = document.createElement("input");
        input.name = "login";
        input.type = "text";
        input.placeholder = "Login...";
        newConversation.firstChild.appendChild(input);
        let button = document.createElement("button");
        button.innerText = "Start Conversation";
        newConversation.firstChild.appendChild(button);
        
        newConversation.firstChild.onsubmit = e => {
            e.preventDefault();
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "backend/new_dm.php", true);
            
            xhr.onload = () => {
                console.log(xhr.response);
                if (xhr.status === 403) {
                    console.log(xhr.statusText);
                    return;
                }
                if (xhr.status === 404) {
                    sendErrorMsg("User not found.");
                    return;
                }
                if (xhr.status === 200) {
                    if (xhr.responseText === "1") {
                        clearIntervals();
                        InitializeChat();
                    }
                    else if (xhr.responseText === "2") {
                        sendErrorMsg("Already started the conversation!");
                        
                    }
                    else {
                        sendErrorMsg("Internal server error.");
                        
                    }
                }
                else {
                    sendErrorMsg("Internal error.");
                    
                }
            }
            
            
            let args = new FormData(e.target);
            xhr.send(args);
            input.value = "";
        }
        
        let table = content.firstChild;
        table.appendChild(document.createElement("tr"));
        table.lastChild.appendChild(document.createElement("td"));
        table.lastChild.lastChild.appendChild(newConversation);
        
        intervals['updateStatus'] = setInterval(updateStatus, keepOnlineInterval);

    };

    xhr.onerror = () => {
        content.innerHTML = "<h1>Unable to load messages!</h1>";
    }

    xhr.send(null);
}

function loadDirectChat(id, username) {
    content.innerHTML = "<h1>Loading conversation...</h1>";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "backend/get_dm_chat.php", true);

    xhr.onload = () => {
        last_time = getTimestamp();
        conversation_data = xhr.response;

        let conversation = document.createElement('div');
        conversation.innerHTML = xhr.response;

        info = {};
        info['dm_id'] = id;
        info['user_id'] = conversation.getElementsByClassName("user_id")[0].innerText;
        info['user_name'] = username;
        info['unread_messages'] = false;

        changeDocTitle();

        let title = document.createElement("h1");
        title.style.position = "fixed";
        title.classList.add("conversation_title");
        title.innerText = username;
        document.body.insertBefore(title, undefined);

        let status = document.createElement("p");
        status.classList.add("user_status");
        status.innerText = "Loading user status...";
        document.body.insertBefore(status, undefined);

        content.innerHTML = ``;
        content.appendChild(document.createElement("table"));

        for (let m of conversation.firstChild.childNodes) {
            let msgData = new BackendData(m.outerHTML);
            let message;
            let replyId = msgData.getDataClass("reply_id");
            if (replyId) {
                replyId = `msg_${replyId.innerText}`;
            }

            if (msgData.getDataClass("sender").innerText === "you") {
                message = getNewMessage(stripHtml(msgData.getDataClass("message").innerHTML), msgData.data.firstChild.id, "right",
                    msgData.getDataClass("time").innerText, false, true, replyId);
            }
            else {
                message = getNewMessage(stripHtml(msgData.getDataClass("message").innerHTML), msgData.data.firstChild.id, "left",
                    msgData.getDataClass("time").innerText, false, true, replyId);
            }

            let table = content.firstChild;
            table.appendChild(document.createElement("tr"));
            table.lastChild.appendChild(document.createElement("td"));
            table.lastChild.lastChild.appendChild(message);
        }


        // scroll to last time span element
        if (content.firstChild.lastChild) {
            scrollToBottom();
        }

        let textField = getTextField();

        content.parentElement.appendChild(textField);

        textField.focus();
        setTimeout(() => {
            textField.readOnly = false;
        }, 10);

        content.parentElement.appendChild(getAttachButton());

        changeDocTitle();

        intervals['checkNewMessages'] = setInterval(checkNewMessages, newMessagesInterval);
        updateStatus();
    }

    xhr.onerror = e => {
        content.innerHTML = "<h1>Something went wrong.</h1>";
        console.log(e);
    }

    let args = new FormData();
    args.append("dm_id", id);
    xhr.send(args);
}

function updateStatus() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "backend/keep_online.php", true);
    xhr.onload = () => {
        if (xhr.response === "1") {
            if (info['user_id']) {
                let statusXhr = new XMLHttpRequest();
                statusXhr.open("POST", "backend/get_dm_status.php", true);

                statusXhr.onload = () => {
                    document.getElementsByClassName("user_status")[0].innerText = statusXhr.response;
                    let title = document.getElementsByClassName("conversation_title")[0];
                    if (statusXhr.response === "online") {
                        title.style.color = "lime";
                        title.style.fontStyle = "normal";
                    }
                    else {
                        title.style.color = "#aaa";
                        title.style.fontStyle = "italic";
                    }

                }

                let args = new FormData();
                args.append("user_id", info['user_id']);

                statusXhr.send(args);
            }
        }
        else {
            sendErrorMsg("Could not update status!", 1500);
            console.log(xhr.response);
        }
    }

    xhr.onerror = e => {
        sendErrorMsg("Could not update status!", 1500);
        console.log(e.message);
    }

    xhr.send(null);
}

function checkNewMessages() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "backend/get_dm_chat.php", true);

    xhr.onload = () => {
        let wasScrolledToBottomBefore = isScrolledToBottom();
        let conversation = new BackendData(xhr.response);
        for (let deleted_message of conversation.getDataClass("deleted_messages").childNodes) {
            if (deleted_message.innerText) {
                deleteMessage(deleted_message.innerText, true, false);
            }

            let confirmXhr = new XMLHttpRequest();
            confirmXhr.open("POST", "backend/delete_message_confirm.php", true);

            let args = new FormData();
            args.append("id", deleted_message.innerText);

            confirmXhr.send(args);
        }

        if (conversation.data.firstChild.childNodes.length < 1 || xhr.response === conversation_data) {
            return;
        }

        conversation_data = xhr.response;

        // if no messages, create the table IDK
        if (!content.firstChild.lastChild) {
            content.firstChild.appendChild(document.createElement("tr"));
            content.firstChild.lastChild.appendChild(document.createElement("td"));
        }
        
        let newMesages = 0;
        let yourMessage = false;
        for (let m of conversation.data.firstChild.childNodes) {
            let msgData = new BackendData(m.outerHTML);
            newMesages++;
            if (document.getElementById(msgData.data.firstChild.id) !== null) {
                continue;
            }
            
            let replyId = msgData.getDataClass("reply_id");
            if (replyId) {
                replyId = `msg_${replyId.innerText}`;
            }
            
            let message;
            if (msgData.getDataClass("sender").innerText === "you") {
                yourMessage = true;
                message = getNewMessage(stripHtml(msgData.getDataClass("message").innerHTML), msgData.data.firstChild.id, "right", msgData.getDataClass("time").innerText, true, true, replyId);
            }
            else {
                message = getNewMessage(stripHtml(msgData.getDataClass("message").innerHTML), msgData.data.firstChild.id, "left", msgData.getDataClass("time").innerText, true, wasScrolledToBottomBefore, replyId);
            }
            
            let table = content.firstChild;
            table.appendChild(document.createElement("tr"));
            table.lastChild.appendChild(document.createElement("td"));
            table.lastChild.lastChild.appendChild(message);
        }
        last_time = getTimestamp()
        
        // scroll to last time span element
        if (newMesages === 0) {
            return;
        }
        if (wasScrolledToBottomBefore || yourMessage) {
            scrollToBottom({ "behavior": "smooth" });
        }
        else {
            let title = document.body.getElementsByClassName("conversation_title")[0];
            title.style.fontWeight = "bolder";
            title.style.textDecoration = "underline";
            info['unread_messages'] = true;
            changeDocTitle();
            if (title.innerText.slice(0, 3) !== "(1)") {
                title.innerText = "(1)" + title.innerText;
            }
            doWhenScrolledToBottom(() => {
                title.style.fontWeight = "initial";
                title.style.textDecoration = "initial";
                title.innerText = title.innerText.slice(3);
                info['unread_messages'] = false;
                changeDocTitle();
            });
        }
    }

    xhr.onerror = e => {
        content.innerHTML = "<h1>Something went wrong.</h1>";
        console.log(e);
    }

    let args = new FormData();
    args.append("dm_id", info['dm_id']);
    args.append("get_messages_from", last_time);
    xhr.send(args);


}

function sendDirectMessage(message, customElement = undefined, fileNameReference) {
    if (message) {
        if (message.length < 1) {
            return;
        }
        if (!message.replace(/\s/g, '').length) {
            return;
        }

        if (isValidUrl(message)) {
            let url = new URL(message);
            if (url.host === location.host) {
                url.host = "chatobahn";
                message = url.href;
            }
        }

        if (info['dm_id']) {
            let id = info["dm_id"];
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "backend/send_dm.php", true);
            xhr.onerror = () => {
                sendErrorMsg("Could not send message!");
            }

            let replyId = undefined;
            if (document.getElementsByClassName("text_field")[0].getAttribute("reply_id")) {
                replyId = document.getElementsByClassName("text_field")[0].getAttribute("reply_id");
                document.getElementsByClassName("text_field")[0].removeAttribute("reply_id");
            }

            xhr.onload = () => {
                if (xhr.status !== 200) {
                    sendErrorMsg(`Could not send the message: ${xhr.status} ${xhr.statusTex}`);
                }
                else if (xhr.response[0] !== "g") {
                    if (xhr.response === "blocked") {
                        sendErrorMsg("Could not send the message: You have been blocked!");
                        return;
                    }
                    else if (xhr.response === "you blocked") {
                        sendErrorMsg("Could not send the message: You have blocked the user");
                        return;
                    }
                    sendErrorMsg(`Could not send the message.`);
                    console.log(xhr.response);
                }
                
                let messageElement;
                if (customElement) {
                    messageElement = customElement;
                }
                else {
                    messageElement = getNewMessage(message, "msg_" + xhr.response.replace("g", ""), "right", undefined, true, true, replyId);
                }
                
                if (replyId) {
                    document.body.removeChild(document.getElementsByClassName("reply_preview")[0]);
                }
                
                content.firstChild.appendChild(document.createElement("tr"));
                content.firstChild.lastChild.appendChild(document.createElement("td"));
                content.getElementsByTagName("table")[0].lastChild.appendChild(messageElement);
                scrollToBottom({ "behavior": "smooth" });
            }

            let args = new FormData();

            // check if it's a file reference here
            if (isValidUrl(message) && !fileNameReference && isChatobahnFile(message)) {
                let url = new URL(message);
                let data = url.pathname.split("/");
                let newUrl = `files/users/${data[4]}/${data[5]}`;
                args.append("filename_reference", newUrl);
                url.host = "chatobahn";
                message = url;
            }

            if (replyId) {
                args.append("reply_id", replyId.replace("msg_", ""));
            }

            args.append("message", message);
            args.append("dm_id", id);
            if (fileNameReference) {
                args.append("filename_reference", fileNameReference);
            }
            xhr.send(args);
        }
    }
}

InitializeChat();
document.getElementById("logo").addEventListener("click", () => {
    clearIntervals();
    InitializeChat();
});