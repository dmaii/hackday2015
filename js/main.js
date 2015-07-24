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
