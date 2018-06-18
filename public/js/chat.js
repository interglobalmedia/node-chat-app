var socket = io();

// scroll to bottom every time add a new message
// determines whether should scroll to bottom
// scroll to bottom if necessary
function scrollToBottom() {

    // selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');
    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function() {
    console.log('Connected to the server ...');
});
socket.on('disconnect', function() {
    console.log('Disconnected from the server ...');
});
socket.on('newMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('H:mm:ss a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
})

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();
    var messageTextBox = jQuery('[name=message]');
    socket.emit('createMessage', {
        from: 'User',
        text: messageTextBox.val()
    }, function() {
        messageTextBox.val('')
    })
});

var locationButton = jQuery('#send-location');

locationButton.on('click', function() {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!');
    }
    locationButton.attr('disabled', 'disabled').text('Sending location ...');
    navigator.geolocation.getCurrentPosition(function(position) {
        locationButton.removeAttr('disabled').text('Send location');
        // adding coords object in users position
        socket.emit('createLocationMessage', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            })
            // for creating location url
        socket.on('newLocationMessage', function(message) {
            var formattedTime = moment(message.createdAt).format('H:mm:ss a');
            var template = jQuery('#location-message-template').html();
            var html = Mustache.render(template, {
                from: message.from,
                url: message.url,
                createdAt: formattedTime
            })
            jQuery('#messages').append(html);
            scrollToBottom();
        })
    }, function() {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location');
    })
})