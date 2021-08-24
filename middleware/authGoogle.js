const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const accountModel = require('../accounts/account.model');

exports.googlelogin = (reqm, resm) => {
    const client = new OAuth2Client('584638914485-2tdlq9omj9crtfevmucsj5d0rq6v90nt.apps.googleusercontent.com');
    const { tokenId } = reqm.body;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: '584638914485-2tdlq9omj9crtfevmucsj5d0rq6v90nt.apps.googleusercontent.com', // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        const { email_verified, name, email } = payload;
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        if (email_verified) {
            const { given_name, family_name, email, picture, iss } = payload;
            try {
                let user = await accountModel.findOne({ email });

                if (user) {
                    // const payload2 = { user: { id: user.id } };
                      const payload2 = { id: user.id  };
                    jwt.sign(payload2, 'secret', { expiresIn: 360000 }, (err, token) => {
                        // console.log('if user');
                        //  resm.json({token:token});
                        const userwithToken = { ...user, jwtToken: token, id: user._id }; //////////
                        // const userwithToken = { jwtToken: token, id: user._id.id };
                        // console.log('after adding the token');
                        // console.log(userwithToken);
                        resm.json(userwithToken);
                        if (err) throw err;
                    });
                }

                else {
                    // email: { type: String, unique: true, required: true },
                    // passwordHash: { type: String, required: true },
                    // title: { type: String, required: true },
                    // firstName: { type: String, required: true },
                    // lastName: { type: String, required: true },
                    // acceptTerms: Boolean,
                    // role: { type: String, required: true },

                    // console.log('else worked');
                    account = new accountModel({
                        email: email,
                        passwordHash: 'Google',
                        title: 'no',
                        firstName: given_name,
                        lastName: family_name,
                        acceptTerms: true,
                        role: 'user from Google',
                        picture: picture,
                        location: '',
                        jobTitle: '',
                        aboutMe: ''
                        // picture:picture,
                    });

                    await account.save();

                    //signup
                    let SignupUser = await accountModel.findOne({ email });

                    if (SignupUser) {
                        //   // return resm.status(400).json({ msg: "User already exists" });
                        // console.log('SignupUser');
                        // console.log(SignupUser);


                        // const payload3 = { SignupUser: { id: SignupUser.id } };


                        const payload3 = {   id: SignupUser.id  };

                        jwt.sign(payload3, 'secret', { expiresIn: 360000 }, (err, token) => {
                            // console.log('if user');
                            //  resm.json({token:token});
                            const userwithToken = { ...SignupUser, AwtToken: token };
                            // console.log('after adding the token');
                            // console.log(userwithToken);
                            resm.json(userwithToken);
                            if (err) throw err;
                        });
                    }
                    // end signup
                }
            } catch (err) {
                console.error(err.message);
                resm.status(500).send('Server Error');
            }
            //   });

            ////
        }

        // console.log(payload);
    }
    verify().catch(console.error);
};
