const passport = require('passport');

exports.login = passport.authenticate('oauth2');

exports.callback = (req, res) => {
    res.send({ message: 'OAuth callback received', user: req.user });
};
