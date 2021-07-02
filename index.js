const express = require('express');
const bp = require('body-parser');
const table = require('./database');
const app = express();
const md5 = require('md5');
const port = 4000;
var mysql = require('mysql');
const connection = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'aswinapi'
});

app.set('view engine', 'ejs');
app.get('/', (req, res) => {res.render('basic')});
app.use(bp.urlencoded({extended:true}));

app.post('/signup', (req, res) => {
  async function signUp() {
  	const record = await req.body;
	const existing_users = await table.findAll({where:{username:record.username}});
	if (existing_users.length > 0)
		res.send("already have account");
	else {
		res.render('plans', record);
	}
}
	signUp();
});

app.post('/createaccount', (req, res) => {
	async function createAccount() {
		let record = await req.body;
		const data = {"username":record.username, "keycount":0, "maxkey":0, "plan":record.plan};
		if(record.plan == "basic") {
			data.limit = 500;
			data.maxkey = 5;
		}
		else if (record.plan == "advanced") {
			data.limit = 2000;
			data.maxkey = 10;
		}
		else {
			data.limit = 10000;
			data.maxkey = 1;
		}
		data.usage = 0;
		await table.create(record);
		await table.apistatus.create(data);
		res.redirect('/');
	}
	createAccount();
});


app.post('/signin', (req, res) => {
	async function signIn() {
		let record = await req.body;
		const sel = await table.findAll({where:{username:record.username, password:record.password}});
		if(sel.length > 0) {
			let record = sel[0].dataValues.username;
			record = await welcome(record).then((result) => {return result;});
			res.render('welcome', record);
		}
		else {
			res.redirect('/');
		}
	}
	signIn();
});

app.post('/apicreate', (req, res) => {
	function generateApiKey() {
		var key = Math.floor(1000 + Math.random() * 9000);
		return md5(key);
	}
	let key = generateApiKey();
	async function apikeyStore() {
	  let username = await req.body;
	  let record = {};
	  record.username = username.username;
	  record.apikey = key;
	  record.usage = 0;
	  let apistatus = await table.apistatus.findAll({where:{username:record['username']}});
	  apistatus = apistatus[0].dataValues;
	  if(apistatus.keycount < apistatus.maxkey || apistatus.maxkey == 1) {
	    let value = apistatus.keycount;
		await table.apistatus.update({keycount:value+1},{where:{username:record['username']}});
		await table.apikeys.create(record);
		record = await welcome(record.username).then((result) => {return result;});
		res.render('welcome', record);
	  }
	  else {
		res.send("limit excedded");
	  }
	}
    apikeyStore();
});

app.listen(port, () => {console.log("listening at port:" + port);});
app.post('/deletekey', (req, res) => {
	async function deleteKey() {
		let key = await req.body;
		await table.apikeys.destroy({where:{username:key.username, apikey:key.key}});
		let apistatus = await table.apistatus.findAll({where:{username:key.username}});
		apistatus = apistatus[0].dataValues;
		let value = apistatus.keycount;
		await table.apistatus.update({keycount:value-1},{where:{username:key.username}});
		let uname = key.username;
		let record = await welcome(uname).then((result) => {return result;});
		res.render('welcome',record);
	}
	deleteKey();
});

async function apikeyCheck(req, res, next) {
	let url = req.params;
	let apikeys = await table.apikeys.findAll({where:{apikey:url.key}});
	//let len=apikeys.length;

	if(apikeys.length == 0) {
		var errmsg="Invalid api or api call limit exceeded";
        return res.send({ error: errmsg});
	}
	apikeys = apikeys[0].dataValues;
	let user = apikeys.username;
	let apistatus = await table.apistatus.findAll({where:{username:user}});
	apistatus = apistatus[0].dataValues;
	let value = apistatus.usage;
	if(apistatus.usage >= apistatus.limit) {
		return res.send({error:"api limit exceeded"});
	}
	await table.apistatus.update({usage:value+1},{where:{username:user}});
	await table.apikeys.update({usage:apikeys.usage+1}, {where:{apikey:url.key}});
	next()
}

app.get('/word/:mainWord/:type/:key',apikeyCheck, async (req, res) => {
		let url = req.params;
		let word = url.mainWord;
		let type = url.type;
		if(type.localeCompare('definitions') == 0) {
			connection.query('SELECT def FROM definitions where word=?',word,  function (error, results, fields) {
				if (error)
					throw error;
				else if(results.length > 0) {
					return res.send({ data: results });
				}
				else if(results.length == 0) {
					var errmsg="no words present";
        			return res.send({ error: errmsg});
				}
			});
		}
		else if(type.localeCompare('examples') == 0) {
			connection.query('SELECT examples FROM examples where word=?',word,  function (error, results, fields) {
				if (error)
					throw error;
				else if(results.length > 0) {
					return res.send({ data: results });
				}
				else if(results.length == 0) {
					var errmsg="no words present";
					return res.send({ error: errmsg});
				}
			});
		}
		else if(type.localeCompare('relatedWords') == 0) {
			var res4,res2;
			connection.query(' SELECT rel FROM relation where word=?', word,  function (error, results, fields) {
				if (error)
					throw error;
				res4=results;
			});
			connection.query(' SELECT syn FROM synonyms where word=?', word,  function (error, results, fields) {
				if (error)
					throw error;
				res2=results;
				res.send({synonyms:res2,antonyms:res4 });
			});
		}
		else {
			var errmsg="wrong api format";
			return res.send({ error: errmsg});
		}
});


app.get('/words/randomWord/:key', apikeyCheck, (req, res) => {
		var res1,res2,res3,res4,randomword;
		var id =  Math.floor(Math.random() * (42 - 1 + 1)) + 1;
		connection.query(' SELECT * FROM word where id=?', id, function (error, results, fields) {
			if (error)
			  throw error;
			randomword=results[0].word;
			console.log(randomword);
			connection.query(' SELECT def FROM definitions where word=?', randomword,  function (error, results, fields) {
				if (error)
			  	throw error;
				res1=results;
			});
			connection.query(' SELECT examples FROM examples where word=?', randomword,  function (error, results, fields) {
				if (error)
			  	throw error;
				res3=results;
			});
			connection.query(' SELECT rel FROM relation where word=?', randomword,  function (error, results, fields) {
				if (error)
			  	throw error;
				res4=results;
			});
			connection.query(' SELECT syn FROM synonyms where word=?', randomword,  function (error, results, fields) {
				if (error)
				  throw error;
				res2=results;
				res.send({ defintions: res1,examples:res3,synonyms:res2,antonyms:res4 });
			});
		});
		return;
});

async function welcome(record) {
	record={"username":record};
	const record2 = await table.apistatus.findAll({where:{username:record.username}});
	record.plan = record2[0].dataValues.plan;
	record.limit = record2[0].dataValues.limit;
	record.usage = record2[0].dataValues.usage;
	let data;
	data = await apikeysdata(record.username).then((result) => {return result;});
	record.data = data;
	return record;
}

async function apikeysdata(user){
	let key = {};
	let createdAt = {};
	let usage = {};
	const apikeys = await table.apikeys.findAll({where:{username:user}});
	for(let i = 0;i < apikeys.length;i++) {
		createdAt[i] = apikeys[i].dataValues.createdAt;
		key[i] = apikeys[i].dataValues.apikey;
		usage[i] = apikeys[i].dataValues.usage;
	}
	let result = {};
	result.key = key;
	result.createdAt = createdAt;
	result.usage = usage;
	return result;

}
