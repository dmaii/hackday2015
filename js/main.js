$(document).ready(function() {

  $('#content').load('html/home.html');

  $('.js-menu').click(function() {
    $('.menu').toggleClass('hidden');
  });

  $('.menu-home').click(function() {
    $('#content').load('html/home.html');
  });

  $('.menu-chat').click(function() {
    $('#content').load('html/chat.html');
    $('.menu').toggleClass('hidden');
  });

});
