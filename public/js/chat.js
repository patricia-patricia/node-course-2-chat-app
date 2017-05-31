var socket = io();

function scrollToBottom() {
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');

  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {
  console.log('Connected to server');
});

socket.on('disconnect', function () {
  console.log('Disconnect from server');
});

socket.on('newMessage', function (message) {
  console.log('New message ', message);

  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);

  scrollToBottom();

  // var li = jQuery('<li></li>');
  // li.text(`${message.from} ${formattedTime}: ${message.text}`)
  //
  // jQuery('#message').append(li);
});

socket.on('newLocationMessage', function (message) {
  console.log('New location message ', message);

  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    url: message.url,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);

  scrollToBottom();

  // var li = jQuery('<li></li>');
  // var a = jQuery('<a target="_blank">My current location</a>')
  //
  // li.text(`${message.from} ${formattedTime}: `)
  // a.attr('href', message.url);
  // li.append(a);
  //
  // jQuery('#message').append(li);
});

jQuery('#message-form').on('submit', function(e) {
  e.preventDefault();

  var messageTextBoxt =jQuery('[name=message]');

  socket.emit('createMessage', {
    from: 'User',
    text: messageTextBoxt.val()
  }, function () {
    messageTextBoxt.val('');
  });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function() {
  if(!navigator.geolocation) {
    return alert('Geolocation not supported.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function(position) {
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
    locationButton.removeAttr('disabled').text('Sending location');
  }, function() {
    locationButton.removeAttr('disabled').text('Sending location');
    alert('Unable to fetch location.')
  })
});