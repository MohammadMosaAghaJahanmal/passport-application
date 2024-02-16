const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const Sequelize = require('sequelize');
const User = require("../model/User");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const SERVER_URL = process.env.SERVER_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/auth/google/callback`,
      scope: ['profile', 'email']
    },
    function (accessToken, refreshToken, profile, callback) {
      callback(null, profile)
    }
  )
)


passport.use(
  new FacebookStrategy(
    {
      clientID: APP_ID,
      clientSecret: APP_SECRET,
      callbackURL: `${SERVER_URL}/auth/facebook/callback`,
      // scope: ['public_profile', 'email']
    },
    function (accessToken, refreshToken, profile, callback) {
      callback(null, profile)
    }
  )
)


passport.serializeUser(async (profile, done) =>{
  console.log(profile, "PAS")

  
  try {
      const defaults = {
        image: profile?.provider === "google" ? (profile?.photos[0]?.value || "") : (profile?.profileUrl || "") ,
        firstName: profile?.name?.givenName,
        lastName: profile?.name?.familyName,
        displayName: profile?.displayName,
        provider: profile?.provider,
        providerId: profile?.id,
      }
      await User.findOrCreate({
        where: {
          [Sequelize.Op.or]: [{ providerId: profile?.id}],
        },
        defaults: defaults,
      });
      done(null, defaults);
    } catch (error) {      
      done({error: error.message}, profile)
    }
});
passport.deserializeUser((user, done) =>{
  done(null, user)
});