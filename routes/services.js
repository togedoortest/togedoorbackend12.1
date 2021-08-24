const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { googlelogin } = require('../middleware/authGoogle');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../accounts/account.model')
const Service = require('../models/Service');
const { db } = require('../models/User');
const authAdmin = require('../middleware/authAdmin');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.png');
    },
});

var upload = multer({ storage: storage });

// @route     GET /services
// @desc      Get all services
// @access    Public
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
        // console.log('services: ', services);
    } catch (err) {
        console.error('34 err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/googlelogin', googlelogin); ///////////////////////////////////////////////////////////////////////
//mongodb+srv://AtlantisApp:atlantis123@atlantisapp-fverx.mongodb.net/atlantis?retryWrites=true&w=majority
// @route     GET /services/:id
// @desc      Get Single Service
// @access    Public
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(400).json({ msg: "Service doesn't exist" });
        }

        // console.log('service-------------', service);

        res.json(service);
    } catch (err) {
        console.error('err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

// @route     GET /services/name/:name
// @desc      Get Single Service
// @access    Public

router.get('/name/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const service = await Service.findById({ name });
        if (!service) {
            return res.status(400).json({ msg: "Service doesn't exist" });
        }

        res.json(service);
    } catch (err) {
        console.error('`services.js` err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

// @route     GET /services/getBysubCategory/:subcategoryID
// @desc      Get Single Service
// @access    Public
router.get('/getBySubCategory/:subcategoryID', async (req, res) => {
    try {
        const subCategoryID = req.params.subcategoryID;
        const filter = { subCategoryID: subCategoryID };
        const services = await Service.find(filter);

        if (!services) {
            return res.status(400).json({ msg: 'No Service Found' });
        }
        res.json(services);
    } catch (err) {
        console.error('`services.js` err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

//////  uploadfile
router.post(
    '/uploadfile',
    auth,
    upload.single('file'),

    async (req, res) => {
        // console.log(req.body);
        try {
            const obj = JSON.parse(req.body.document);
            const Account = JSON.parse(req.body.user);
            // console.log(Account);
            const { JobTitle, description, rating, Salary, subCategoryID, categoryName, avgRating } = obj;
            let Isfile = 'no image';
            try {
                if (req.file) {
                    Isfile = req.file.path;
                }
                // Isfile=req.file.path
            } catch (error) {
                console.log(error);
            }
            const newService = new Service({
                JobTitle,
                description,
                rating,
                Salary,
                subCategoryID,
                categoryName,
                avgRating,
                serviceImage: Isfile,
                userID: Account.auth.user.id,
                userName: Account.auth.user.firstName + " " + Account.auth.user.lastName,
            });

            const service = await newService.save();

            res.json(service);
        } catch (err) {
            console.error('`services.js` err.message: ', err.message);
            res.status(500).send('Server Error');
        }
    }
);

// ###############################################################

//////  updateService
router.patch('/editServiceNoFile', upload.single('file'), async (req, res) => {
    const Service2 = JSON.parse(req.body.service);
    try {

        const query = { _id: Service2._id };
        const updateService = {
            JobTitle: Service2.JobTitle,
            description: Service2.description,
            categoryName: Service2.categoryName,
            subCategoryID: Service2.subCategoryID,
            Salary: Service2.Salary,

        };
        const result = await Service.updateOne(query, updateService);
    } catch (err) {
        console.error('`services.js` err.message: ', err.message);
        res.status(500).send('Server Error');
    }

});

//////  updatefile
// auth,
router.patch('/editServiceWithFile', upload.single('file'), async (req, res) => {
    const Service2 = JSON.parse(req.body.service);
    // console.log(JSON.parse(req.body.service));

    let Isfile = req.file.path;
    try {
        {
            let service = await Service.findById(Service2._id);
            const path = service.serviceImage;
            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('picture removed');
            });
            try {

                const query = { _id: Service2._id };

                const updateService = {
                    JobTitle: Service2.JobTitle,
                    description: Service2.description,
                    categoryName: Service2.categoryName,
                    subCategoryID: Service2.subCategoryID,
                    Salary: Service2.Salary,
                    serviceImage: Isfile
                };
                const result = await Service.updateOne(query, updateService);
                console.log('Picture Update');
            } catch (err) {
                console.error('`services.js` err.message: ', err.message);
                res.status(500).send('Server Error');
            }
        }
        res.json(Service2);
    } catch (err) {
        console.error('`services.js` err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

//###########################################################
router.post('/addrating', async (req, res) => {
    const userId = req.body.userID;
    const newRating = req.body.rating;
    const service = await (await Service.findById(req.body.serviceID)).toObject();

    try {
        const rating = {
            userId,
            newRating,
        };

        const service = await (await Service.findById(req.body.serviceID)).toObject();
        if (!service) {
            return res.status(400).json({ msg: "Service doesn't exist" });
        } else if (service.rating.find((item) => item.userId === rating.userId)) {
            for (let i = 0, l = service.rating.length; i < l; ++i) {
                if (service.rating[i].userId === rating.userId) {
                    console.log('user update rating');

                    const query = { _id: service._id, 'rating.userId': rating.userId };

                    const updateDocument = {
                        $set: { 'rating.$.newRating': rating.newRating },
                    };
                    const result = await Service.updateOne(query, updateDocument);
                    const serviceUpdate = await Service.findById(req.body.serviceID);
                    let sum = 0;
                    for (let i = 0; i < serviceUpdate.rating.length; i++) {
                        sum += serviceUpdate.rating[i].newRating;
                    }
                    let averageRating = ((sum / serviceUpdate.rating.length) * 100) / 100.0;
                    console.log(serviceUpdate);
                    await Service.findByIdAndUpdate(service._id, { $set: { avgRating: averageRating } }, { new: true });
                }
            }
        } else {
            const query = { _id: service._id };

            const updateDocument = {
                ...service,
                rating: [...service.rating, rating],
            };
            const result = await Service.updateOne(query, updateDocument);
            const serviceUpdate = await Service.findById(req.body.serviceID);
            let sum = 0;
            for (let i = 0; i < serviceUpdate.rating.length; i++) {
                sum += serviceUpdate.rating[i].newRating;
            }
            let averageRating = ((sum / serviceUpdate.rating.length) * 100) / 100.0;

            await Service.findByIdAndUpdate(service._id, { $set: { avgRating: averageRating } }, { new: true });
        }

        res.json(service);
    } catch (err) {
        console.error('`services.js` err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

// @route     PATCH /services
// @desc      Update Service
// @access    Private
//router.patch("/:id", auth, async (req, res) => {
router.post('/:id', authAdmin, async (req, res) => {
    const { name, description, rating, price, serviceImage, avgRating } = req.body;

    const serviceFields = {
        name,
        description,
        rating,
        price,
        serviceImage,
        avgRating,
    };

    try {
        let service = await Service.findById(req.params.id);

        service = await Service.findByIdAndUpdate(req.params.id, { $set: serviceFields }, { new: true });

        res.json(service);
    } catch (err) {
        console.error('`services.js` err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

// @route     DELETE /service
// @desc      Delete service
// @access    Private

router.delete('/:id', async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        const path = service.serviceImage;

        fs.unlink(path, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('removed Image');
            //file removed
        });

        console.log(service);
        await Service.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Service Deleted!' });
    } catch (err) {
        console.error('`services.js` err.message: ', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
