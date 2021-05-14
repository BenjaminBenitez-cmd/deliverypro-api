require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

//apis
const { deliveryRouter } = require("./resources/delivery/delivery.router");
const { driverRouter } = require("./resources/driver/driver.router");
const { customerRouter } = require("./resources/customer/customer.router");
const { invitesRouter } = require("./resources/invites/invites.router");
const {
  signup,
  signupAuthentication,
  signin,
  protect,
  registerForDriver,
  protectPublicRoute,
} = require("./utils/auth");
const { schedulesRouter } = require("./resources/schedule/schedule.router");
const { companyRouter } = require("./resources/company/company.router");
const { userRouter } = require("./resources/user/user.router");
const { tokenRouter } = require("./resources/tokens/token.router");
const { handleError, ErrorHandler } = require("./helpers/Error");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use((req, res, next) => {
  console.log("Yeah our middleware");
  next();
});

app.get("/error", (req, res) => {
  throw new ErrorHandler(500, "Internal server error");
});

//Middleware for protecting the api
app.use("/api/v1/", protect);

//Routes for fetching data
app.use("/api/v1/deliveries", deliveryRouter);
app.use("/api/v1/drivers", driverRouter);
app.use("/api/v1/invites", invitesRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/schedules", schedulesRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tokens", userRouter);

//Authentication endpoints
app.post("/signup", signup);
app.post("/authenticate", signupAuthentication);
app.post("/signin", signin);
app.post("/driver/signin", registerForDriver);

//Error handling middleware
app.use((err, req, res, next) => {
  handleError(err, res);
});

const port = process.env.PORT || 3005;

app.listen(port, () => {
  console.log(`Server is up and listening on port ${port}`);
});
