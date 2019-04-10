$(function() {
  $.get('/entries', function(entries) {
    entries.forEach(function(entry) {
      $('<li></li>')
        .html(convertEntryToDisplay(entry))
        .appendTo('ul#entries');
    });
  });

  $('form').submit(function(event) {
    event.preventDefault();
    var moduleCode = $('input#moduleCode')
      .val()
      .toUpperCase();
    var chatUrl = $('input#chatUrl').val();
    if (moduleCode !== '') {
      var newEntry = { moduleCode: moduleCode, chatUrl: chatUrl };
      $.post('/entries?' + $.param(newEntry), function() {
        $('<li></li>')
          .html(convertEntryToDisplay(newEntry))
          .appendTo('ul#entries');
        $('input#moduleCode').val('');
        $('input#chatUrl').val('');
        $('input#moduleCode').focus();
      });
    }
  });
});

function convertEntryToDisplay(entry) {
  return (
    '<a href="' +
    entry.chatUrl +
    '" target="_blank">' +
    entry.moduleCode +
    '</a>'
  );
}
