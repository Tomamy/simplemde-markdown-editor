var logger = require('koa-logger');
var views = require('co-views');
var route = require('koa-route');
var parse = require('co-busboy');
var kstatic = require('koa-static');
var fs = require('fs');
var path = require("path");
var koa = require('koa');
var app = koa();

var render = views(__dirname + '/demo', {
  map: { html: 'ejs' }
});

// middleware
app.use(logger());

//static file
app.use(kstatic(path.join(__dirname,'bower_components')));
app.use(kstatic(path.join(__dirname,'images')));
app.use(kstatic(path.join(__dirname,'dist')));
app.use(kstatic(path.join(__dirname,'src')));
app.use(kstatic(path.join(__dirname,'widget')));
app.use(kstatic(path.join(__dirname,'upload')));

//route
app.use(route.get('/test', test));
app.use(route.get('/test2', test2));
app.use(route.post('/upload',upload));
function *test(){
  this.body = yield render('test');
}
function *test2(){
  this.body = yield render('test2');
}
function *upload(){
	// multipart upload
	var extname;
	var parts = parse(this,{
		autoFields: true,
		checkField: function (name, value) {
			if (name === '_csrf' && !checkCSRF(ctx, value)) {
				var err =  new Error('invalid csrf token')
				err.status = 400
				return err
			}
		},
		checkFile: function(fieldname,file,filename){
			extname = path.extname(filename);
			console.log("check>"+extname);
			if(extname == '.jpg' || extname == '.jpeg' || extname == '.png'){
			}else {
				var err = new Error("invalid file format");	
				err.status = 400;
				return err;
			}	
		}
	});
	console.log("out>>"+extname);
	var part,file_name;
	while (part = yield parts) {
		file_name = Math.random().toString()+extname
		var stream = fs.createWriteStream(path.join(__dirname,'upload', file_name));
		part.pipe(stream);
		console.log('uploading %s -> %s', part.filename, stream.path);
	}
	this.type = 'text/html';
	var data = JSON.stringify({
		status: true,
		count: 0,
		data: 'http://localhost:3000/'+file_name 
	});
	this.body = '<div id="result">'+data+'</div>';
}

app.listen(3000,function(){
	console.log('listening on port 3000');
	console.log('http://localhost:3000/test');
	console.log('http://localhost:3000/test2');
});

