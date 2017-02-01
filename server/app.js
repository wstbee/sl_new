var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var app = express();
var Photo = require('./models/photo')

var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now())
  }
})
var upload = multer({ storage: _storage })

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
app.set('views', './views_file');
app.set('view engine','pug');

app.all('/api/photo/clean', function(req, res, next){
    Photo.remove(function(err){if(err){return next(err)}})
    Photo.find(function(err, docs){
	res.json(docs);
    })
})

app.get('/api/photo/init', function(req, res){
    for(i=1;i<=10;i++){
	var photo = new Photo({
            image_path:i+'.jpg'
	})
	console.log(photo)
	photo.save(function (err, post) {
            if (err) { return next(err) }
	})
    }
    res.send("end")
})

app.get(['/api/photo','/api/photo/:path'], function(req, res, next){
    var path = req.params.path
    if (path){
	Photo.find({image_path:path},function(err,docs){
	    res.sendFile('./public/res/photos/'+path, {"root":__dirname})
	})
    }else{
	Photo.find(function(err, docs) {
	    if(err){return next(err)}
	    //res.json(docss)
	    var index = Math.floor((Math.random() * docs.length) + 1)
	    res.sendFile('./public/res/photos/'+docs[index].image_path, {"root": __dirname})
	    console.log(index)
	})
    }
})

app.post('/api/photo', function (req, res, next) {
    console.log("post received")
    var photo = new Photo({
	username: req.body.username,
	body: req.body.body
    })
    console.log(photo)
    photo.save(function (err, post) {
	if (err) { return next(err) }
	else {}
	res.json(201, post)
    })
})

app.get('/upload', function(req, res){
    res.render('upload');
});
app.post('/upload', upload.single('userfile'), function(req,res){
    console.log(req.file);
    res.send('Uploaded : '+req.file.filename);
});
app.get('/topic/new', function(req,res){
    fs.readdir('data', function(err, files){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
	res.render('new',{topics:files});
    });
});
app.get(['/topic','/topic/:id'], function(req, res){
    fs.readdir('data', function(err, files){
	if(err){
	    console.log(err);
	    res.status(500).send('Internal Server Error');
	}
	var id = req.params.id;
	if(id){
            fs.readFile('data/'+id, 'utf8', function(err, data){
		if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
		}
		res.render('view', {topics:files, title:id, description:data});
            });
	}else{
	    res.render('view', {topics:files, title:'Welcome', description:'HIHIHI'});
	}
    });
});
app.post('/topic', function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    fs.writeFile('data/'+title, description, function(err){
	if(err){
	    console.log(err);
	    res.status(500).send('Internal Server Error');
	}
	res.redirect('/topic/'+title);
    });
});
app.listen(3000, function(){
    console.log('Connected, 3000 port!');
});