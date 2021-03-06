"use strict";
const express = require('express');
var passport = require("passport");
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var auth = require('basic-auth');

// const mysql = require('mysql');
// var fs = require('file-system');
var getTokenId = function () {
    return 1;
};
var database = require('../config/config.js');

class UserController {

    static create (req, res, next) {

        //todo save photo and LINK
        if(req.body === undefined || req.body.length === 0){
            res.status(400).send("Erreur in body request should not be empty");
        }else{
            database('localhost', 'PLI', function(err, db) {
                if (err) throw err;
                db.models.users.create({
                        name       : req.body.name,
                        lastname   : req.body.lastname,
                        surname    : req.body.surname,
                        mail       : req.body.mail,
                        password   : req.body.password,
                        link_photo : "test"
                    },
                    function(error, rows) {
                        if (error){
                            res.status(500).send("Erreur Create User")
                            console.log('Erreur Create User', error.message)
                        }
                        else {
                            res.status(200).send("Success Create User")
                            console.log("Success Create User", rows)
                        }
                    }
                );
            });
        }
    }

    static read (req, res, next) {
        if(req.params.id == res.id_user){
            database('localhost', 'PLI', function(err, db) {
                if (err) throw err;
                db.models.users.find({id: req.params.id}, function(err, users) {
                    var result = {};
                    result.name       = users[0].name;
                    result.lastname   = users[0].lastname;
                    result.surname    = users[0].surname;
                    result.mail       = users[0].mail;
                    result.link_photo = users[0].link_photo;
                    result.friends    = [];
                    result.friends_waiting = [];

                    db.models.friends.find({id_owner: getTokenId()}, function(err, friendsRows) {
                        for(var item of friendsRows){
                            if(item.is_friend === true)
                                result.friends.push(item);
                            else
                                result.friends_waiting.push(item);
                        }
                        res.status(200).json(result);
                    });
                });
            });
        }else {
            database('localhost', 'PLI', function(err, db) {
                if (err) throw err;
                db.models.users.find({id: req.params.id}, function(err, users) {

                    var result = {};
                    result.name       = users[0].name;
                    result.lastname   = users[0].lastname;
                    result.surname    = users[0].surname;
                    result.mail       = users[0].mail;
                    result.link_photo = users[0].link_photo;
                    result.is_friend  = false;
                    var id_owner = getTokenId();

                    db.models.friends.find({id_owner: id_owner, id_friend: req.params.id}, function(err, friendsRows) {
                        if(friendsRows.length > 0){
                            for(var item of friendsRows){
                                console.log("ISFRIEND", item.is_friend);
                                if(item.is_friend === true){
                                    console.log("ON EST AMI GNE")
                                    result.is_friend = true;
                                }

                            }
                        }
                        res.status(200).json(result);
                    });
                });
            });
        }
    }

    static askFriend (req, res, next) {
        database('localhost', 'PLI', function(err, db) {
            if (err) throw err;
            var id_owner = getTokenId();
            db.models.friends.create({
                    id_owner: id_owner,
                    id_friend : req.params.id_friend,
                    is_friend : false
                },
                function(error, rows) {
                    if (error){
                        res.status(500).send("Erreur Asking Friend")
                        console.log('Erreur Asking Friend', error.message)
                    }
                    else {
                        res.status(200).send("Success Asking Friend");
                        console.log("Success Asking Friend", rows);
                    }
                }
            );
        });
    }

    static acceptFriend (req, res, next) {
        database('localhost', 'PLI', function(err, db) {
            if (err) throw err;
            var id_owner = getTokenId();
            db.models.friends.find({id_owner: id_owner, id_friend: req.params.id_friend}, function(err, row) {

                row[0].is_friend = true;
                row[0].save(function (err) {
                    if(err) res.status(500).send("Error while Accept Friend, err: ", err);
                    res.status(200).send("Update Accept Friend");
                });
            });
        });
    }

    static readAll (req, res, next) {
        database('localhost', 'PLI', function(err, db) {
            if (err) throw err;
            db.models.users.find({}, function(err, rows) {
                res.status(200).json(rows);
            });
        });
    }

    static update (req, res, next) {
        if(req.params.id === undefined){
            res.status(400).send("Erreur params ID is missing");
        }
        else{
            database('localhost', 'PLI', function(err, db) {
                if (err) throw err;
                db.models.users.find({id: req.params.id}, function(err, users) {
                    console.log(users[0].name);
                    // people[0].save(function (err) {
                    //     // err.msg = "under-age";
                    // });
                });
            });
        }
    }

    static delete (req, res, next) {
        res.status(200).json("delete")
    }

    static login (req, res, next) {
        database('localhost', 'PLI', function(err, db) {
            var authentic = req.headers['Authorization'];
            if (authentic) {
                var user = auth(req);
                var name = user.name;
                var pass = user.pass;

                db.models.users.find({name: name}, function(err, users) {
                    if (users[0]) {
                        if (users[0].name == name && pass == users[0].password) {
                                    var token = jwt.sign({
                                    exp: Math.floor(Date.now() / 1000) + (86400),
                                    username: name
                                  }, "Secret");
                                    var date = new Date();
                                    date.setDate(date.getDate() + 1);
                                  var data = {
                                    token: token
                                  };
                                db.models.tokens.create({
                                    token       : token,
                                    expiration  : date.toLocaleString(),
                                    id_user     : users[0].id
                                },
                                function(error, rows) {
                                    if (error){
                                        console.log('Erreur Create token', error.message)
                                        res.status(500).send("Erreur to create token")
                                    }
                                    else {
                                        console.log('token bien creer !');
                                        res.status(200).json(data);
                                    }
                                });
                        } else {
                            res.status(401).json("Wrong password or login");
                        };
                    } else {
                        res.status(404).json("Wrong password or login");
                    };
                });
            } else {
                res.status(403).json("You need to connect");
            };
        });
    }
}

module.exports = UserController;