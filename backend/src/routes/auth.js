const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${req.user}`);
});

module.exports = router;
