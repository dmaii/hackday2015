var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var propNames = require('./propNames')

var app = express();

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'coreapp_batman'
});

connection.connect();

orderQuery = 'SELECT orders.external_id, line_items.uid, line_items.impressions, line_items.start_time, line_items.end_time, max(stats_item.impressions) from line_items, orders, line_item_stats, stats_item where channel_group_uid="G-LZUFZBYC7H" and line_item_stats.id = stats_item.line_item_stats_id and line_items.uid = line_item_stats.line_item_uid and line_items.order_uid = orders.uid and line_items.end_time > now() group by line_items.uid;';

function days_between(date1, date2) {
  // The number of milliseconds in one day
  var ONE_DAY = 1000 * 60 * 60 * 24

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime()
  var date2_ms = date2.getTime()

  // Calculate the difference in milliseconds
  var difference_ms = Math.abs(date1_ms - date2_ms)

  // Convert back to days and return
  return Math.round(difference_ms/ONE_DAY)
}

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname));
app.set('views', __dirname + '/html');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  res.render(__dirname + '/html/index.html');
});

app.get('/orders', function(req, res) {
  connection.query(orderQuery, function(err, rows, fields) {
    finalRows = [];
    for (var i = 0; i < rows.length; i++) {
      var endDate = new Date(rows[i].end_time);

      if (rows[i].external_id.indexOf('REMOVED_FROM_IFA_CAMPAIGN') === -1 && endDate > new Date()) {
        var campId = rows[i].external_id.replace('IFA_CAMPAIGN_', '');
        var row = {
          url: "http://advertisers.isocket.com/campaigns/" + campId,
          imprActual: rows[i]['max(stats_item.impressions)'],
          imprExpected: rows[i].impressions,
          startDate: rows[i].start_time,
          propertyName: propNames[rows[i].uid],
          endDate: rows[i].end_time,
          isHealthy: true
        };

        var startEndDiff = days_between(new Date(row.startDate), endDate);
        var nowEndDiff = days_between(new Date(), endDate);

        var percent = nowEndDiff / startEndDiff;

        if ((percent + .1) < (row.imprActual / row.imprExpected)) {
          row['isHealthy'] = false;
          finalRows.push(row);
        }
      }
    }
    res.json({rows: finalRows});
  });
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

var server = app.listen(4000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = app;
