$(document).ready(function() {

  $('#content').load('html/home.html');

  $('.js-menu').click(function() {
    $('.menu').toggleClass('hidden');
  });

  $('.menu-home').click(function() {
    $('#content').load('html/home.html');
    $('.site-wrapper .cover-container .inner h2').html('RP Now');
  });

  $('.menu-chat').click(function() {
    $('#content').load('html/chat.html');
    $('.menu').toggleClass('hidden');
    $('.site-wrapper .cover-container .inner h2').html('Chat');
  });

  $('.menu-inbox').click(function() {
    $('#content').load('html/inbox.html');
    $('.menu').toggleClass('hidden');
    $('.site-wrapper .cover-container .inner h2').html('Inbox');
  });
});

var readList = [];
pollInbox = true;
function openBrowser(url) {
  window.open(url);
}


function inboxTemplate(item) {
  var rv = "";
  var icon = '';
  var heading = '';
  var unread = (readList.indexOf(''+item.id) === -1);
  switch (item.type) {
    case 'under-serving':
      icon = 'heartbeat';
      heading = "Campaign Under-Serving";
    break;
    case 'negotiation':
      icon = 'money';
      heading = "Counter-Offer Received";
    break;
    case 'change-order':
      icon = 'exchange';
      heading = "Change Order Requested";
    break;
  }
  rv += "<li class=\""+item.type+" "+(unread?'unread':'')+"\" data-id=\""+item.id+"\" data-url=\""+item.url+"\">";
  rv += "  <i class=\"fa fa-"+icon+"\"></i>";
  rv += "  <h3>"+heading+"</h3>";
  rv += "  <p>"+item.name+"</p>";
  //rv += "  <p class=\"date\">"+item.date+"</p>";
  rv += "</li>";
  return rv;
};

function processTemplate(templateFunction, data) {
  var rv = '';
  for (var x=0; x<data.length; x++) {
    rv += templateFunction(data[x]);
  }
  return rv;
};

function poll() {
  $.ajax({
    dataType: "json",
    xurl: './orders',
    url: './mock2.json',
    success: function(data) {
      $('.inbox').html(processTemplate(inboxTemplate, rawDataToInboxData(data)));
      $('.inbox li').click(function(e) {
        openBrowser($(e.currentTarget).attr('data-url'));
        markRead(e.currentTarget);
      });
      if (pollInbox) setTimeout(poll, 1000);
    },
    error: function() {
    }
  });
};

function markRead(node) {
  node = $(node);
  readList.push(node.attr('data-id'));
  node.removeClass('unread');
};

function rawDataToInboxData(rawData) {
  var rv = [];
  $('.count').html('<b>(' + (rawData.rows.length - readList.length) + ')<b>');
  for (var x=0; x<rawData.rows.length; x++) {
    rv.push({
      id: rawData.rows[x].uid,
      type: 'under-serving',
      name: rawData.rows[x].propertyName,
      date: '30 seconds ago',
      url: rawData.rows[x].url
    });
    if (notRandomInt(x) > 6) {
      if (notRandomInt(x+1) > 5) {
        rv.push({
          id: rawData.rows[x].uid+notRandomInt(2),
          type: 'negotiation',
          name: rawData.rows[x].propertyName,
          date: '30 seconds ago',
          url: rawData.rows[x].url
        });
      } else {
        rv.push({
          id: rawData.rows[x].uid+notRandomInt(1),
          type: 'change-order',
          name: rawData.rows[x].propertyName,
          date: '30 seconds ago',
          url: rawData.rows[x].url
        });
      }
    }
  }
  return rv;
};

function notRandomInt(seed) {
  return Math.floor(('0.'+Math.sin(seed).toString().substr(6)) * 9)+1;
};

poll();
