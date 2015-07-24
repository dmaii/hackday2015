var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();

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
      if (rows[i].external_id.indexOf('REMOVED_FROM_IFA_CAMPAIGN') === -1) {
        var campId = rows[i].external_id.replace('IFA_CAMPAIGN_', '');
        var row = {
          url: "http://advertisers.isocket.com/campaigns/" + campId,
          imprActual: rows[i]['max(stats_item.impressions)'],
          imprExpected: rows[i].impressions,
          startDate: rows[i].start_time,
          endDate: rows[i].end_time
        };
        finalRows.push(row);
      }
    }
    res.json({rows: rows});
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
