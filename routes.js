var LocalStrategy = require('passport-local').Strategy;
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json()
var count;
module.exports = function(app, passport, connection) {
     // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(username, done) {
        console.log("serializeUser")
        done(null, username);
    });

    // used to deserialize the user
    passport.deserializeUser(function(username, done) {
        done(null, username);
      });
    passport.use('local-login', new LocalStrategy({

        usernameField: 'username',
      
        passwordField: 'password',
      
        passReqToCallback: true //passback entire req to call back
      } , function (req, username, password, done){
            var request = new Request(
                "select * from Admin where Username = @Acc and Password = @Pass",
                function(err, rowCount, rows) {
                    if (err) {
                        console.log(err);
                    } 
                    else {
                        console.log(rowCount + ' row(s) showed');
                        count = rowCount;
                        if(count > 0){
                            return done(null,username);
                        }
                        return done(null, false);
                    }
                });
            request.addParameter('Acc', TYPES.NVarChar, username);
            request.addParameter('Pass', TYPES.NVarChar, password);
        
            // Execute SQL statement
            connection.execSql(request);
          }
      
      ));

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form

    // process the login form
    // app.post('/login', function(req, res, next) {
    //     passport.authenticate('local-login', function(err, user, info) {
    //       if (err) {
    //         return next(err); // will generate a 500 error
    //       }
    //       // Generate a JSON response reflecting authentication status
    //       if (!user) {
    //         return res.redirect("/login");
    //       }
    //       else if (user){
    //         return res.redirect("/user");
    //       }             
    //     })(req, res, next);
    //   });
    
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/user', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    // app.get('/signup', function(req, res) {
    //     // render the page and pass in any flash data if it exists
    //     res.render('signup.ejs', { message: req.flash('signupMessage') });
    // });

    // // process the signup form
    // app.post('/signup', passport.authenticate('local-signup', {
    //     successRedirect : '/profile', // redirect to the secure profile section
    //     failureRedirect : '/signup', // redirect back to the signup page if there is an error
    //     failureFlash : true // allow flash messages
    // }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    // app.get('/user', isLoggedIn, function(req, res) {
    //     res.render('user.ejs', {
    //         user : req.user // get the user out of session and pass to template
    //     });
    // });
    
    // =====================================
    // REGISTER ==============================
    // =====================================
    app.post('/register', function(req, res) {
        console.log(req.body.username);
        console.log(req.body.password);
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    app.get('/listAdminJson', jsonParser, function(req, res){       
        // return(res.json({
        //     firstName:"Viet",
        //     lastName:"Tran"
        // }));
            var request = new Request(
                "select * from Admin",
                function(err, rowCount, rows) {
                    if (err) {
                        console.log(err);
                    } 
                    else {
                        console.log(rowCount + ' row(s) showed');
                    }
                });

                var result = "";
                var arr = [];
                request.on('row', function(columns) {
                    columns.forEach(function(column) {
                        if (column.value === null) {
                            console.log('NULL');
                        } else {
                            result += column.value + " ";
                            // for(var i = 0 ; i < column.length ; i++ ){                              
                            //     arr[i] = column[i].value
                            // }
                        }
                    });
                    console.log(result);
                    // return(res.json({
                    //     result
                    // }));
                });
                
        
            // Execute SQL statement
            connection.execSql(request);

          
      });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}