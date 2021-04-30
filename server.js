require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();
const createError = require("http-errors");


//apis
const { deliveryRouter } = require('./resources/delivery/delivery.router');
const { driverRouter } = require('./resources/driver/driver.router');
const { customerRouter } = require('./resources/customer/customer.router');
const { invitesRouter } = require('./resources/invites/invites.router');
const { signup, signupAuthentication, signin, protect, registerForDriver } = require("./utils/auth");
const { schedulesRouter } = require("./resources/schedule/schedule.router");

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
    console.log("Yeah our middleware");
    next();
});

//Middleware for protecting the api
app.use('/api/v1/', protect);

//Routes for fetching data
app.use('/api/v1/deliveries', deliveryRouter);
app.use('/api/v1/drivers', driverRouter);
app.use('/api/v1/invites', invitesRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/schedules', schedulesRouter);

//Authentication endpoints
app.post('/signup', signup);
app.post('/authenticate', signupAuthentication);
app.post('/signin', signin );
app.post('/driver/signin', registerForDriver);

//error handling object
app.use((err, req, res, next) => {
    console.log(err);
    const error = err.status
    ? err
    : createError(500, "Something went wrong. Notified dev.");

    res.status(error.status).json(error);
});

const port = process.env.PORT || 3005;

app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
})