
let maxEnlargedImageSize = 0.9;

let VERSION = "1.02";

class BackendData {
    constructor(response) {
        this.data = document.createElement("div");
        this.data.innerHTML = response;
        this.getDataClass = className => {
            return this.data.getElementsByClassName(className)[0];
        };
        this.getDataId = id => {
            return this.data.getElementById(id);
        };
    }
}

function stripHtml(html) {
    let tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

// get functions
{
    function getTimestamp() {
        return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ');
    }

    function getDeleteButton() {
        let deleteButton = new Image()
        deleteButton.src = "icons/delete.png";
        deleteButton.classList.add("delete_button");
        deleteButton.classList.add("icons");
        deleteButton.title = "Delete this message";

        deleteButton.onclick = e => {
            let id = e.target.parentElement.id;
            deleteMessage(id);
        }
        return deleteButton
    }

    function getReplyButton(side) {
        let replyButton = new Image()
        replyButton.src = "icons/reply.png";
        replyButton.classList.add("delete_button");
        replyButton.classList.add("icons");
        replyButton.title = "Reply to this message";
        if (side === "left") {
            replyButton.style.left = "unset";
            replyButton.style.right = "1%";
            replyButton.style.position = "absolute";
        }


        replyButton.onclick = e => {
            let id = e.target.parentElement.id;
            createReplyPreview(id);
        }
        return replyButton;
    }

    function getTextField() {
        let textField = document.createElement("textarea");
        textField.type = "text";
        textField.classList.add("text_field");
        textField.placeholder = "Type your message here...";
        textField.readOnly = true;

        textField.oninput = e => {
            if (window.innerHeight <= window.innerWidth) {
                return;
            }
            let attach = document.getElementsByClassName("attach_button")[0];
            if (e.target.value.length > 0) {
                attach.src = "icons/send.png";
                attach.onclick = () => {
                    e.preventDefault();
                    sendDirectMessage(e.target.value);
                    e.target.value = "";
                    attach.src = "icons/attach.png";
                    attach.onclick = attachLogic;
                }
            }
            else {
                attach.src = "icons/attach.png";
                attach.onclick = attachLogic;
            }
        }

        textField.onkeydown = e => {
            if (window.innerHeight <= window.innerWidth) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendDirectMessage(e.target.value);
                    e.target.value = "";
                }
            }
        }

        textField.onpaste = textFieldPaste;

        textField.ondragover = e => {
            e.preventDefault();
        }
        textField.ondrop = e => {
            let data = e.dataTransfer;
            if (data.files[0]) {
                if (window.confirm(`Are you sure you want to upload ${data.files[0].name}?`)) {
                    sendFile(data.files[0]);
                }
            }
        }

        return textField;
    }

    function getNewMessage(message, id, side = "right", messageTime = undefined, smoothScroll = true, forceScroll = false, replyId = undefined) {
        let msgDiv = document.createElement("div");
        msgDiv.classList.add("chat_messages");
        msgDiv.id = id;
        msgDiv.setAttribute("side", side);

        if (side === "right") {
            msgDiv.appendChild(getDeleteButton());
        }

        msgDiv.appendChild(getReplyButton(side));

        if (replyId) {
            let replyText = getMessage(replyId);
            if (!replyText) {
                replyText = "Message not found.";
            }
            else {
                if (replyText.length > 30) {
                    replyText = replyText.substring(0, 30) + "...";
                }
                if (document.getElementById(replyId).getAttribute("side") === "right") {
                    replyText = `"${replyText}" ~ You`;
                }
                else {
                    replyText = `"${replyText}" ~ ${info['user_name']}`;
                }
            }
            let reply = document.createElement("i");
            reply.classList.add("reply");

            reply.onclick = () => {
                let scroll = document.getElementById(replyId);
                scroll.parentElement.parentElement.scrollIntoView({ "behavior": "smooth" });
                scroll.style.backgroundColor = "#555";
                setTimeout(() => {
                    scroll.style.backgroundColor = "initial";
                }, 500);
            }

            reply.innerText = replyText;
            if (side === "right") {
                reply.style.right = "1%";
            }
            else {
                reply.style.left = "1%";
            }
            msgDiv.appendChild(reply);

        }

        let msg = document.createElement("p");
        msg.innerText = message;
        msg.style.textAlign = side;

        if (side === "right") {
            msg.style.marginLeft = "auto";
        }
        else {
            msg.style.marginRight = "auto";
            msg.style.color = "white";
            msg.style.marginTop = "3em";
        }

        parseUrls(msg, smoothScroll, forceScroll);

        msgDiv.appendChild(msg);

        let time = document.createElement("span");
        if (messageTime) {
            time.innerText = messageTime;
        }
        else {
            time.innerText = new Date().getHours() + ":" + ('0' + new Date().getMinutes()).slice(-2);
        }
        msgDiv.appendChild(time);

        return msgDiv;
    }

    function getAttachButton() {
        let attachButton = new Image()
        attachButton.src = "icons/attach.png";
        attachButton.classList.add("attach_button");
        attachButton.classList.add("icons");
        attachButton.title = "Send a file...";

        attachButton.onclick = attachLogic;
        return attachButton;
    }

    function getMessage(id) {
        if (!document.getElementById(id)) {
            return undefined;
        }
        let message = document.getElementById(id).getElementsByTagName("p")[0].innerHTML;
        let urlCheck = document.createElement("div");
        urlCheck.innerHTML = message;
        if (urlCheck.firstChild.tagName) {
            message = `(LINK)`;
        }
        else {
            message = document.getElementById(id).getElementsByTagName("p")[0].innerText;
        }
        return message;
    }
}

function createReplyPreview(id) {
    if (!getMessage(id)) {
        sendErrorMsg("Can't reply to this message.");
        return;
    }

    let replyPreview = document.getElementsByClassName("reply_preview");
    if (replyPreview.length === 1) {
        replyPreview = replyPreview[0];
    }
    else {
        replyPreview = document.createElement("p");
        replyPreview.classList.add("reply_preview");
    }

    document.getElementsByClassName("text_field")[0].setAttribute("reply_id", id);
    let message = getMessage(id);
    if (message.length > 30) {
        message = message.substring(0, 30) + "...";
    }
    replyPreview.innerText = `Replying to "${message}" (click to cancel)`;

    replyPreview.onclick = e => {
        document.getElementsByClassName("text_field")[0].removeAttribute("reply_id");
        e.target.parentElement.removeChild(e.target);
    };

    document.body.appendChild(replyPreview);
    document.getElementsByClassName("text_field")[0].focus();

}

function textFieldPaste(e) {
    e.preventDefault();
    let item = ((e.clipboardData || e.originalEvent.clipboardData).items[1] || (e.clipboardData || e.originalEvent.clipboardData).items[0]);
    if (!item) {
        sendErrorMsg("Could not paste the file.");
        return;
    }
    if (item.kind === "string") {
        item.getAsString(s => {
            e.target.value += s;
        });
    }
    else {
        if (window.confirm("Are you sure you want to send the file in your clipboard?")) {
            let file = item.getAsFile();
            sendFile(file);
        }
    }
}

function changeDocTitle() {
    let title = "Chatobahn v" + VERSION;
    if (info['user_name']) {
        title = info['user_name'] + " - " + title;
    }
    if (info['unread_messages']) {
        title = "(1) " + title;
    }
    document.title = title;
}

function sendFile(file) {
    let fileUrl = "http://chatobahn/chatobahn";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "backend/file_upload.php", true);
    let message = sendErrorMsg("Uploading file...", 1000000000000);
    message.style.backgroundColor = "green";

    xhr.onload = () => {
        let response = document.createElement("div");
        response.innerHTML = xhr.response;
        if (!response.getElementsByClassName("response")[0] || response.getElementsByClassName("response")[0].innerText !== "uploaded") {
            sendErrorMsg("Error uploading file!");
            console.log(response.getElementsByClassName("response")[0].innerText);
            return;
        }

        let path = response.getElementsByClassName("file_path")[0].innerText;
        fileUrl += "/" + path;
        clearTimeout(message.getAttribute("hide_after"));
        message.innerText = "File Uploaded!";
        message.hide_func();

        sendDirectMessage(fileUrl, undefined, path);
    }

    let args = new FormData();
    args.append("file", file);

    xhr.send(args);
}

function sendErrorMsg(message, timeout = 5000) {
    let error = document.createElement("div");
    error.classList.add("error_msg");

    setTimeout(() => {
        error.style.transform = "none";
    }, 1);

    error.hide_func = () => {
        error.style.transform = "translateY(-300%)";
        setTimeout(() => {
            if (error) {
                error.parentElement.removeChild(error);
            }
        }, 500);
    };

    error.hide_after = setTimeout(error.hide_func, timeout);

    error.innerText = message;
    document.body.appendChild(error);
    return error;
}

function attachLogic() {
    let input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    input.onchange = e => {
        if (!e.target.files[0]) {
            return;
        }

        if (e.target.files.length > 5) {
            sendErrorMsg("Maximum amount of files you can upload is 5.");
            return;
        }

        let files = e.target.files;

        let msg = `Are you sure you want to upload ${files[0].name}`;
        if (files.length > 1) {
            msg += ` and ${files.length - 1} others`;
        }
        msg += "?";

        if (window.confirm(msg)) {
            for (let file of files) {
                sendFile(file);
            }
        }
    };

    input.click();
}

function imageZoomIn(image) {
    let darken = document.createElement("div");
    darken.classList.add("enlarged_darkness");
    document.body.appendChild(darken);

    let img = new Image();
    img.src = image.src;

    img.onload = () => {
        img.onclick = () => {
            window.open(img.src, '_blank').focus();
        }

        img.style.trasition = "transform 0.5s ease";

        let scale;
        let transform;
        document.body.appendChild(img);
        img.classList.add("enlarged_image");
        let imageReference = getComputedStyle(img);
        let realWidth = parseInt(imageReference.width.replace("px", ""));
        let realHeight = parseInt(imageReference.height.replace("px", ""));
        if (realWidth > realHeight) {
            let desiredWidth = window.innerWidth * maxEnlargedImageSize;
            scale = desiredWidth / realWidth;
            if (img.height * scale > window.innerHeight * maxEnlargedImageSize) {
                let desiredHeight = window.innerHeight * maxEnlargedImageSize;
                scale = desiredHeight / realHeight;
            }
        }
        else {
            let desiredHeight = window.innerHeight * maxEnlargedImageSize;
            scale = desiredHeight / realHeight;

            if (img.width * scale > window.innerWidth * maxEnlargedImageSize) {
                let desiredWidth = window.innerWidth * maxEnlargedImageSize;
                scale = desiredWidth / realWidth;
            }
        }
        transform = 1 / scale * 50;

        setTimeout(() => {
            img.style.transform = `scale(${scale}) translate(${-transform}%, ${-transform}%)`;
        }, 10);

        document.addEventListener("click", imageZoomOut);
    }
}

function imageZoomOut(e) {
    if (e.target.tagName !== 'IMG') {
        let i = document.getElementsByClassName("enlarged_image")[0];
        let d = document.getElementsByClassName("enlarged_darkness")[0];
        document.removeEventListener("click", imageZoomOut);
        document.body.removeChild(i);
        document.body.removeChild(d);
    }
}

function youtubeParser(url) {
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

function isValidUrl(string) {
    let url;
    try {
        url = new URL(string);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

function parseUrls(element, smooth = true, forceScroll = false) {
    function convertToImageOrVideoIfValid(element, smooth, forceScroll, linkText) {
        let urlCheck = new URL(element.firstChild.href);
        let behavior = { "behavior": (smooth ? "smooth" : "auto") };
        if (urlCheck.host !== "chatobahn") {
            // fallback - zwraca errory ale dziala na inne strony
            let url = urlCheck.href;
            let video = document.createElement("video");
            video.classList.add("media");
            video.onerror = () => {
                let img = new Image();
                img.classList.add("media");
                img.onload = () => {
                    let s = isScrolledToBottom();
                    element.innerHTML = "";
                    element.appendChild(img);
                    if (s || forceScroll) {
                        scrollToBottom(behavior);
                    }
                }
                img.src = url;
                img.alt = `<a target='#' href='${url}'>${url}</a>`;
                img.onclick = () => {
                    imageZoomIn(img);
                }

                img.onerror = () => {
                    element.firstChild.innerText = linkText;
                }
            }

            video.oncanplay = () => {
                let s = isScrolledToBottom();
                element.innerHTML = "";
                element.appendChild(video);
                if (s || forceScroll) {
                    scrollToBottom(behavior);
                }
            }

            video.src = url;
            video.controls = true;
            video.volume = 0.5;
        }
        else {
            urlCheck.host = location.host;
            urlCheck.protocol = location.protocol;
            element.firstChild.href = urlCheck.href;
            let xhr = new XMLHttpRequest();
            let url = urlCheck.href;

            xhr.open("GET", url, true);
            xhr.responseType = "blob";

            xhr.onload = () => {
                if (xhr.status === 404) {
                    element.firstChild.innerText = linkText + " (File not found)";
                    element.firstChild.removeAttribute("href");
                    return;
                }
                let file = xhr.response;
                let type = file.type.split("/")[0];

                switch (type) {
                    case "video":
                        let video = document.createElement("video");
                        video.classList.add("media");
                        video.oncanplay = () => {
                            let s = isScrolledToBottom();
                            element.innerHTML = "";
                            element.appendChild(video);
                            if (s || forceScroll) {
                                scrollToBottom(behavior);
                            }
                        }
                        video.src = url;
                        video.controls = true;
                        video.volume = 0.5;
                        break;

                    case "image":
                        let img = new Image();
                        img.classList.add("media");
                        img.onload = () => {
                            let s = isScrolledToBottom();
                            element.innerHTML = "";
                            element.appendChild(img);
                            if (s || forceScroll) {
                                scrollToBottom(behavior);
                            }
                        }
                        img.src = url;
                        img.alt = `<a target='#' href='${url}'>${url}</a>`;
                        img.onclick = () => {
                            imageZoomIn(img);
                        }
                        break;

                    case "audio":
                        let audio = document.createElement("audio");
                        audio.classList.add("media");
                        audio.style.width = "300px";
                        audio.style.height = "58px";
                        audio.oncanplay = () => {
                            let s = isScrolledToBottom();
                            element.innerHTML = "";
                            element.appendChild(audio);
                            if (s || forceScroll) {
                                scrollToBottom(behavior);
                            }
                        }
                        audio.src = url;
                        audio.volume = 0.5;
                        audio.controls = "controls";
                        break;

                    default:
                        element.firstChild.innerText = linkText;
                }
            }

            xhr.send(null);
        }

    }

    function isYouTubeUrl(url) {
        if (url !== undefined || url !== '') {
            let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;
            let match = url.match(regExp);
            return (match && match[2].length === 11);
        }
        else {
            return false;
        }
    }


    if (isValidUrl(element.innerText)) {
        let urlObject = new URL(element.innerText);
        if (isYouTubeUrl(urlObject.href)) {
            element.innerHTML = `<iframe class="media" width="560" height="315" style='border-radius: 10px; position: absolute; ${element.style.textAlign}: 1%;' src="https://www.youtube-nocookie.com/embed/${youtubeParser(element.innerText)}"
            title="PlayerYt" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;
            web-share" allowfullscreen></iframe>`;
            element.style.height = "300px";
        }
        else {
            let linkText;
            if (isChatobahnFile(urlObject.href)) {
                if (urlObject.hostname !== "chatobahn") {
                    urlObject.hostname = "chatobahn";
                }
                let fName = urlObject.href.split("/");
                fName = fName[fName.length - 1];
                linkText = fName;
            }
            else {
                linkText = element.innerHTML
            }
            element.innerHTML = `<a target='#' href='${urlObject.href}'>Loading link...</a>`;
            convertToImageOrVideoIfValid(element, smooth, forceScroll, linkText);
        }
    }
}

function deleteMessage(id, forceConfirm = false, deleteFromServer = true) {
    id = id.replace("msg_", "");
    if (!forceConfirm) {
        if (!window.confirm("Are you sure? You can't undo that!")) {
            return;
        }
    }
    if (!deleteFromServer) {
        let el = document.getElementById(`msg_${id}`);
        if (!el) {
            return;
        }
        let msgDiv = el;
        while (el.tagName !== "TR") {
            el = el.parentElement;
        }
        msgDiv.style.minHeight = 0;
        msgDiv.style.maxHeight = 0;
        msgDiv.style.height = 0;
        msgDiv.style.transformOrigin = "top";
        msgDiv.style.transform = "scale(1, 0)";
        setTimeout(() => {
            el.parentElement.removeChild(el);
        }, 500);
        return;
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "backend/delete_message.php", true);

    xhr.onload = () => {
        if (xhr.response === '1') {
            let el = document.getElementById(`msg_${id}`);
            let msgDiv = el;
            while (el.tagName !== "TR") {
                el = el.parentElement;
            }
            msgDiv.style.minHeight = 0;
            msgDiv.style.maxHeight = 0;
            msgDiv.style.height = 0;
            msgDiv.style.transformOrigin = "top";
            msgDiv.style.transform = "scale(1, 0)";
            setTimeout(() => {
                el.parentElement.removeChild(el);
            }, 200);
        }
        else if (xhr.response === "blocked") {
            sendErrorMsg("Error deletig the message: You have been blocked!");
        }
        else if (xhr.response === "you blocked") {
            sendErrorMsg("Error deleting the message: You have blocked the user.")
        }
        else {
            sendErrorMsg("Error deleting the message!");
            console.log(xhr.response);
        }
    }

    let args = new FormData();
    args.append("id", id);
    xhr.send(args);
}

function clearIntervals() {
    for (let interval in intervals) {
        clearInterval(interval);
    }
}

function isScrolledToBottom(element = content) {
    return Math.abs(element.scrollHeight - Math.abs(element.scrollTop) - element.clientHeight) < 5;
}

function doWhenScrolledToBottom(callback, element = content) {
    element.onscroll = () => {
        if (isScrolledToBottom(element)) {
            callback();
            element.onscroll = undefined;
        }
    };
}

function scrollToBottom(behavior = { "behavior": "auto" }, element = content) {
    behavior['top'] = element.scrollHeight
    element.scrollTo(behavior);
}

function isChatobahnFile(url) {
    url = new URL(url);
    let last = url.href.split("/");
    last = last[last.length - 1];
    return (url.hostname === "chatobahn" || url.hostname === location.hostname) && last.includes(".");
}