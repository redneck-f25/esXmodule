"use strict";
var express = require('express');
var router = express.Router();

var RessourceDispatcher = require( '../components/web/RessourceDispatcher' );

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get( RessourceDispatcher.routerRegExp, RessourceDispatcher.handleRequest );

module.exports = router;
