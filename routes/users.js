const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const fs = require('fs');
const authAdmin = require('../middleware/authAdmin');
const db = require('../accounts/account.model');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.png');
    },
});

var upload = multer({ storage: storage });

router.get('/', authAdmin, async (req, res) => {
    try {
        const Users = await User.find();

		res.json(Users);
		console.log('Users: ', Users);
    } catch (err) {
        console.error('`users.js` 29 err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

router.post(
    '/uploadfilee',
    upload.single('file'),

    async (req, res) => {
        try {
            console.log('ssss');
            const file = req.file.path;
            res.json({ filenameName: file });
        } catch (err) {
            console.error('`users.js` 44 err.message', err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route     GET /users
// @desc      Get all users
// @access    Public
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
		res.json(users);
		console.log('users: ', users);
		console.log('req: ', req);
    } catch (err) {
        console.error('`users.js` 60 err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET users/single
// @desc     Get user by token, the logged in user
// @access   Private
// router.get("/single", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

router.get('/single', auth, async (req, res) => {
    try {
        console.log('req.user');
        console.log(req.user);
        // const user = await db.findById(req.user.id);
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (err) {
        console.error('`users.js` /single 86 err.message:_ ', err.message);
        res.status(500).send('Server Error');
    }
});


// @route     GET /users/:id
// @desc      Get Single user
// @access    Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(400).json({ msg: "User doesn't exist" });
        }

        res.json(user);
    } catch (err) {
        console.error('`users.js` /:id 105 err.message', err.message);
        res.status(500).send('Server Error');
    }
});

// @route     GET /users/email/:email
// @desc      Get Single user
// @access    Public
router.get('/email/:email', async (req, res) => {
    try {
        const email = req.params.email;
        let user = await User.findOne({ email });
        // const user = await db.findById(req.user.id);

        if (!user) {
            return res.status(400).json({ msg: "User doesn't exist" });
        }

        res.json(user);
    } catch (err) {
        console.error('`users.js` /email/:email 125', err.message);
        res.status(500).send('Server Error');
    }
});

// @route     GET users
// @desc      Verify Token
// @access    Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error('`users.js` err.message 138', err.message);
        res.status(500).send('Server Error');
    }
});

// @route     POST /users/signup
// @desc      Register User
// @access    Public
router.post('/signup', async (req, res) => {
    const { firstname, lastname, email, address, password, picture } = req.body;
    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            firstname,
            lastname,
            email,
            address,
            password,
            picture,
            userType: 'Local User',
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // const payload = {
        //     user: {
        //         id: user.id,
        //     },
        // };

        const payload = {
            
                id: user.id,
          
        };


        jwt.sign(
            payload,
            'secret',
            {
                expiresIn: 360000,
            },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('`users.js` /signup 189', err.message);
        res.status(500).send('Server Error');
    }
});

// @route     POST /users/login
// @desc      Login User
// @access    Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('email login');
    console.log(email);
    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials...' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials...' });
        }

        // const payload = {
        //     user: {
        //         id: user.id,
        //     },
        // };

           const payload = {
           
                id: user.id,
         
        };
        jwt.sign(
            payload,
            'secret',
            {
                expiresIn: 360000,
            },
            (err, token) => {
				if (err) {
					console.log("`users.js` '/login ,jwt.sign() 229:");
					throw err
				};
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('`users.js` /login 236: ',err.message);
        res.status(500).send('Server Error');
    }
});

// @route     PATCH /users
// @desc      Update user
// @access    Public
router.patch('/uploadfile', upload.single('file'), async (req, res) => {
    console.log(req.body);
    console.log(req.body.user);
    const User2 = JSON.parse(req.body.user);
    console.log(User2._id);
    let Isfile = 'no image';
    try {
        if (req.file) {
            Isfile = req.file.path;
        }
        // Isfile=req.file.path
    } catch (error) {
        console.log('`users.js` /uploadfile 256', error);
    }
    const updateFields = {
        firstname: User2.firstname,
        lastname: User2.lastname,
        email: User2.email,
        address: User2.address,
        password: User2.password,
        picture: Isfile,
    };
    console.log(updateFields);
    try {
        let user = await User.findById(User2._id);
        const path = user.picture;

        fs.unlink(path, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('picture removed');
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

    try {
        let user = await User.findById(User2._id);

        console.log(user._id);

        user = await User.findByIdAndUpdate(User2._id, { $set: { picture: Isfile } }, { new: true });
        res.json(user);
        console.log('Picture Update');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route     DELETE /users
// @desc      Delete user
// @access    Public
router.post('/:id', async (req, res) => {
    try {
        await User.findByIdAndRemove(req.params.id);

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error('`users.js` /:id err.message 306', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
