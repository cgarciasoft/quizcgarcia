var models = require('../models/models.js');

exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
		where: {id: Number(quizId)},
		include: [{model: models.Comment}]
	}).then(
		function(quiz) {
			if(quiz) {
				req.quiz = quiz;
				next();
			} else {next(new Error('No existe quizId=' + quizId));}
		}
	).catch(function(error) {next(error);})
 };
 
// GET /quizes
exports.index = function(req, res) {
	var searchToken = "%";
	if(req.query.search != undefined)
	{
		searchToken = "%"+ req.query.search.trim().replace(/\s/g,"%") + "%";
	}
	
	models.Quiz.findAll({where:["upper(pregunta) like ?", searchToken.toUpperCase()], include: [{model: models.Comment}]}).then(
		function(quizes) {
			res.render('quizes/index.ejs', { quizes: quizes, errors: []});
		}
	).catch(function(error) {next(error);})
 };

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz, errors: []});	
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado  = 'Correcto';
	}
	res.render('quizes/answer', {  quiz: req.quiz, respuesta: resultado, errors: []});

};

//GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(
	{pregunta: "Pregunta", respuesta: "Respuesta", tema: "Otro"}
	);
	
	res.render('quizes/new', {quiz: quiz, errors: []});

};

//GET /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );

	quiz.validate().then(function(err){
		if (err){
			res.render('quizes/new', {quiz: quiz, errors:err.errors});
		} else{
			//guardar en DB
			quiz.save({fields: ["pregunta","respuesta","tema"]}).then(function(){res.redirect('/quizes');})
		}
	})	
};

//GET /quizes/:quizId/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;
	
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

//put /quizes/:quizId/
exports.update = function(req, res) {
	req.quiz.pregunta =  req.body.quiz.pregunta;
	req.quiz.respuesta =  req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;
	
	req.quiz
	.validate()
	.then(function(err){
		if (err){
			res.render('quizes/edit', {quiz: req.quiz, errors:err.errors});
		} else{
			req.quiz.save({fields: ["pregunta","respuesta","tema"]}).then(function(){res.redirect('/quizes');})
		}
	})
};


//DELETE /quizes/:quizId
exports.destroy = function(req, res) {
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});	
};
