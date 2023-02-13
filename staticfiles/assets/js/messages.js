let input_message = $('#input-message')
let message_body = $('.msg_card_body')
let send_message_form = $('#send-message-form')
const USER_ID = $('#logged-in-user').val()
const days = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
]

// let secF = $('#secF')[0].src
// let secS = $('#secS')[0].src

let loc = window.location
let wsStart = (window.location.protocol === 'https:' ? 'wss' : 'ws') + '://'

// if (loc.protocol === 'https') {
//     wsStart = 'wss://'
// }
let endpoint = wsStart + loc.host + loc.pathname

var socket = new WebSocket(endpoint)

socket.onopen = async function (e) {
    console.log('open', e)
    send_message_form.on('submit', function (e) {
        e.preventDefault()
        let message = input_message.val()
        let send_to = get_active_other_user_id()
        let thread_id = get_active_thread_id()

        let data = {
            'message': message,
            'sent_by': USER_ID,
            'send_to': send_to,
            'thread_id': thread_id
        }
        data = JSON.stringify(data)
        socket.send(data)
        $(this)[0].reset()
        $('.emojionearea-editor').html('')



    })
}

socket.onmessage = async function (e) {
    console.log('message', e)
    let data = JSON.parse(e.data)
    let message = data['message']
    let sent_by_id = data['sent_by']
    let thread_id = data['thread_id']
    newMessage(message, sent_by_id, thread_id)
}

socket.onerror = async function (e) {
    console.log('error', e)
}

socket.onclose = async function (e) {
    console.log('close', e)
}


function newMessage(message, sent_by_id, thread_id) {

    if ($.trim(message) === '') {
        return false;
    }
    let message_element;
    let chat_id = 'chat_' + thread_id;
    const now = new Date(new Date().toLocaleString('en', { timeZone: 'Asia/Manila' }));
    if (sent_by_id == USER_ID) {
        message_element = `
            <div class="media p-3">
                <div class="media-body d-flex justify-content-end">
                <div class="w-100 w-xxl-75">
                    <div class="hover-actions-trigger d-flex align-items-center justify-content-end">
                    <div class="bg-primary text-white p-2 rounded-soft chat-message">${DOMPurify.sanitize(message)}</div>
                    </div>
                    <div class="text-400 fs--2 text-right">${now.getDate()} ${days[now.getDay()]}, ${now.getHours()}:${now.getMinutes()}<span class="fas fa-check ml-2 text-success"></span>
                    </div>
                </div>
                </div>
            </div>
	    `
    }
    else {
        message_element = `
            <div class="media p-3">
                <div class="media-body">
                <div class="w-xxl-75">
                    <div class="hover-actions-trigger d-flex align-items-center">
                    <div class="chat-message bg-200 p-2 rounded-soft">${DOMPurify.sanitize(message)}</div>
                    </div>
                    <div class="text-400 fs--2"><span>${now.getDate()} ${days[now.getDay()]}, ${now.getHours()}:${now.getMinutes()}</span>
                    </div>
                </div>
                </div>
            </div>
        `
    }


    let message_body = $('.tab-pane[chat-id="' + chat_id + '"] .msg_card_body')
    message_body.append($(message_element))
    message_body.animate({
        scrollTop: $(document).height()
    }, 100);
    input_message.val(null);
    x = document.getElementById(`s_${thread_id}`)
    x.scrollTop = x.scrollHeight;

}


$('chat-contact').on('click', function () {
    $('.contacts-list .nav .active').removeClass('active')
    $(this).addClass('active')

    // message wrappers
    let chat_id = $(this).attr('chat-id')
    $('.tab-pane.is_active').removeClass('is_active')
    $('.tab-pane[chat-id="' + chat_id + '"]').addClass('is_active')

})

function get_active_other_user_id() {
    let other_user_id = $('.tab-pane.active').attr('other-user-id')
    other_user_id = $.trim(other_user_id)
    return other_user_id
}

function get_active_thread_id() {
    let chat_id = $('.tab-pane.active').attr('chat-id')
    let thread_id = chat_id.replace('chat_', '')
    return thread_id
}