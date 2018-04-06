var express = require('express');
var app = express();
var path = require("path");
var mysql = require("mysql");
var bodyParser = require('body-parser');
var request = require('request');
var url = 'http://store.saif.ms/blocks'
var i;
var blockNum = [];
var nonce = [];
var data_name = [];
var data_date = [];
var data_purchase = [];
var prevHash = [];
var currHash = [];

app.use(express.static('Script'));
app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());


var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "lily0206", 
	database: "blocks"
});

app.get('/', function(req, res){
	res.render('welcome');
});

app.get('/contactus', function(req, res){
	res.render('contact');
});

//To add onto this implementation, I will need to add input sanitization for unique block numbers, set lengths on hashes etc etc
app.post('/post', function(req, res){
	var insertData = [
		[req.body.number, req.body.nonce, req.body.data, req.body.prev_hash, req.body.curr_hash]
	];
	con.query("INSERT INTO blockchain VALUES ?", [insertData], function(err, result){
		if(err) throw err;
		console.log("Number of records affected: " + result.affectedRows);
	});
});

app.get('/test', function(req, res){
	res.render("bootstrap_html");
});

app.get('/blockchain', function (req, res) {
	blockNum.length = 0;
	nonce.length = 0;
	data_name.length = 0;
	data_date.length = 0;
	data_purchase.length = 0;
	prevHash.length = 0;
	currHash.length = 0;

	request({
	    url: url,
	    json: true
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {
	    	var i;
	    	var k;
	    	for(i = 0; i < body.length; i++){
	    		blockNum[i] = body[i].block_num;
				nonce[i] = body[i].nonce;
				data_name[i] = body[i].data.name;
				data_date[i] = new Date(body[i].data.date);
				data_purchase[i] = 'Bought: ';
				for(k = 0; k < body[i].data.products.length; k++){
					data_purchase[i] = data_purchase[i].concat(body[i].data.products[k].quantity).concat(' ').concat(body[i].data.products[k].name).concat('(s) for $').concat(body[i].data.products[k].price).concat(', ');
				}
				data_purchase[i] = data_purchase[i].substring(0, data_purchase[i].length - 2);
				prevHash[i] = body[i].prev_hash;
				currHash[i] = body[i].curr_hash;
	    	}
	    	console.log(nonce[0]);
    		res.render("blockchain", {
    		blockNum, nonce, data_name, data_date, data_purchase, prevHash, currHash
    	});       
	    }
	})

});

app.listen(8080);

