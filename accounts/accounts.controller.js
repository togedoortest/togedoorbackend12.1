const express = require('express');
const router = express.Router();
const Joi = require('joi');
// const validateRequest = require('middleware/validate-request');
const validateRequest = require('../middleware/validate-request');
const authorize = require('../middleware/authorize');
// const Role = require('../_helpers/role');
const Role = require('../helpers/role');
const auth = require('../middleware/auth');
const Account = require('../accounts/account.model');
// const accountService = require('./account.service');
const accountService = require('./account.service');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.post('/register', registerSchema, register);
// router.post('/register', test);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);
// router.get('/', auth, getAll);
router.get('/', getAll);
// router.get('/:id', auth, getById);
router.get('/:id', getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.delete('/:id', authorize(), _delete);



module.exports = router;

// function test(req,res) {
//     console.log('succsess');
//    res.status(200)
// }
function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService
        .authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    accountService
        .refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty(''),
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService
        .revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

function registerSchema(req, res, next) {
    // console.log('accounts.controller.js` 92 registerSchema');
    const temp = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=200&q=80'
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        acceptTerms: Joi.boolean().valid(true).required(),
        picture: Joi.string().required(),
        location: Joi.string().required(),
        jobTitle: Joi.string().required(),
        aboutMe: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    // console.log('`accounts.controller.js` register 106 req.body:', req.body);
    accountService
        .register(req.body, req.get('origin'))
        .then(() =>
            res.json({ message: 'Registration successful, please check your email for verification instructions' })
        )
        .catch(next);
}

function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
    accountService
        .verifyEmail(req.body)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    });
    validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
    accountService
        .forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function validateResetToken(req, res, next) {
    accountService
        .validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(next);
}

function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    });
    validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
    accountService
        .resetPassword(req.body)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}

function getAll(req, res, next) {
    accountService
        .getAll()
        .then((accounts) => res.json(accounts))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own account and admins can get any account
    // console.log('reeeeeeq getById' + req.params.id)
    // if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    //     return res.status(401).json({ message: 'Unauthorized' });
    // }

    accountService
        .getById(req.params.id)
        .then((account) => (account ? res.json(account) : res.sendStatus(404)))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required(),
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    accountService
        .create(req.body)
        .then((account) => res.json(account))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
        picture: Joi.string().empty(''),
        location: Joi.string().empty(''),
        jobTitle: Joi.string().empty(''),
        aboutMe: Joi.string().empty(''),
    };

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}


router.patch('/:id', auth, async (req, res) => {
    const user = req.body;
    // console.log(req.params.id, req.body, user.email)
    try {

        const query = { _id: req.params.id };
        const updateUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            location: user.location,
            jobTitle: user.jobTitle,
            aboutMe: user.aboutMe,
        };
        const result = await Account.updateOne(query, updateUser);
        res.json(user);
    } catch (err) {
        console.error('`services.js` err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});
// users can update their own account and admins can update any account
// if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
//     return res.status(401).json({ message: 'Unauthorized' });
// }

// accountService
//     .update(req.params.id, req.body)
//     .then((account) => res.json(account))
//     .catch(next);


function _delete(req, res, next) {
    // users can delete their own account and admins can delete any account
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService
        .delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}

// helper functions

function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    res.cookie('refreshToken', token, cookieOptions);
}
