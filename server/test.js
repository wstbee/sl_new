var mongoose = require('mongoose');



// mongoose를 mongoDB가 설치되어있는 곳에 접속하는 구문. test라는 Database로 접속!

mongoose.connect('mongodb://localhost/snaplook');



// 이쪽은 꼭 안해도 된다....

var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;



// Collection을 생성하기 전에 Schema를 통해 구조를 만들어 놓는다.

var ThingSchema = new Schema({

  'name': String,

  'age': Number

});



// Thing이라는 Collection을 생성. 

var Thing = mongoose.model('thing', ThingSchema);



// 새로운 인스턴스를 생성하는 방법 + 데이터를 넣고 Insert하는 부분.


var newThing = new Thing();

newThing.name = 'a';

newThing.save(function(err){

  // saving is asynchronous

  if(err) console.log("Something went wrong while saving the thing");

  else console.log("Thing was successfully saved");

});





// 조건을 통해 Select 하는 방법 + 그 해당 Document에서 id라는 부분을 참조하는 방법

Thing.find({ name: 'c' }, function(err, docs){

	for(var i=0, size=docs.length; i<size; i++) {

		var name = docs[i]._id;

		console.log(name);

	}

// 이 부분은 Update문 사용하는 방법, 	

/* 	Thing.update({$inc: {name:'e'}}, { safe: true }, function(err) { console.log(err); }); */

});



// 이 부분은 조건을 통해 Select라는 방법은 똑같지만 1개의 Document만 필요로 할때 유용한 방법.

/*

Thing.findOne({ name: 'c' }, function(err,docs){

	console.log('deleting' + docs); //Remove all the documents that match!

	docs.remove();

	docs.save();

});

*/



// 위에 나왔던 Update는 같지만, multi 프로퍼티를 통해 해당하는 모든 Document를 바꿔주는 방법.

/*

Thing.update(

	{ name: 'c' },

	{ $set: { name : 'd' } },

// 	{ multi: true }, 

	function(err, res) {

		console.log(err, res);

	}

);

*/



// Delete 하는 방법. {} 안에는 조건도 가능함.

/*

Thing.remove({}, function(err) {

	if(!err) {

		console.log('no err');

	} else {

		console.log('err');

	}	

});

*/
