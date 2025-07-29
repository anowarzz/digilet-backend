/* eslint-disable @typescript-eslint/no-explicit-any */
import bcryptjs from "bcryptjs";
import passport from "passport";
import { Strategy as localStrategy } from "passport-local";
import { User } from "../modules/user/user.model";

// passport local auth

passport.use(
  new localStrategy(
    {
      usernameField: "phone",
      passwordField: "pin",
    },
    async (phone: string, pin: string, done) => {
      try {
        // check if use exist
        const isUserExist = await User.findOne({ phone });

        if (!isUserExist) {
          return done(null, false, { message: "User does not exist" });
        }

        // check pin match
        const isPinMatched = await bcryptjs.compare(
          pin as string,
          isUserExist.pin as string
        );
        if (!isPinMatched) {
          return done(null, false, { message: "Incorrect Pin Provided" });
        }

        return done(null, isUserExist);
      } catch (err) {
        console.log(err);
        done(err);
      }
    }
  )
);

// serialize user
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});



// deserialize user
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
});
