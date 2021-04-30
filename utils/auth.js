require('dotenv').config();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { mailer } = require('./mailer');
const bcrypt = require('bcrypt');

const newToken = user => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "1hr"
    })
}

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
          if (err) return reject(err)
          resolve(payload)
        })
    })
}

const hashPassword = async (password, saltRounds = 10) => {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(saltRounds);

        // Hash password
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.log(error);
    }

    // Return null if error
    return null;
};

const comparePassword = async (password, hash) => {
    try {
        // Compare password
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.log(error);
    }

    // Return false if error
    return false;
};


module.exports.signup = async (req, res) => {
    if (!req.body.email || !req.body.company || !req.body.password || !req.body.phone_number || !req.body.name) {
        return res.status(400).send({ message: 'need email, company and password' })
    }
    const {email, company, password, phone_number, name } = req.body;

    try {
        const user = await db.query("SELECT email FROM users WHERE email = $1", [email]);
        if(user.rows[0] !== undefined) return res.status(400).json({ status: 'error', message: 'User with email already exists'});
        const companyQuery = await db.query("SELECT name FROM company WHERE LOWER(name) = LOWER($1)", [company]);
        if(companyQuery.rows[0] !== undefined) return res.status(400).json({ status: 'error', message: 'Company, already added login instead'});

        const token = jwt.sign({email, company, password, phone_number, name}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES});
        const obj = {
            email: email,
            text: 'use token to reset password',
            link: `http://localhost:8000/authenticate/${token}`
        }
        const response = await mailer(obj);
        res.status(200).json({ status: 'success', message: response });

    } catch (e) {
        console.log(e);
        return res.status(500).end()
    }
}

module.exports.signupAuthentication = async (req, res) => {
    if(!req.headers.token){
        return res.status(400).send({ message: 'Invalid or missing token'});
    }
    const {token} = req.headers;
    try {
        const {email, company, password, phone_number, name} = await verifyToken(token);
        //Select user and validate if it exists
        const user = await db.query("SELECT email FROM users WHERE email = $1", [email]);
        if(user.rows[0] !== undefined) return res.status(400).send({ status: 'error', message: 'User with email already exists'});
        const hash = await hashPassword(password);
        //Create new row for company and get the id 
        const companyInsert = await db.query("INSERT INTO company (name) values ($1) RETURNING id", [company]);
        const companyID = companyInsert.rows[0].id;
        //Finally create a new user 
        const result = await db.query("INSERT INTO users (name, phone, email, password, company_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email",
          [name, phone_number, email, hash, companyID, 1]);
        return res.status(201).json({ status: "success", message: 'Successfully registered', user: result.rows[0]});
    } catch(e) {
        console.log(e);
        res.status(500).end()
    }
}


module.exports.signin = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ status: 'erro', message: 'Empty password or email'});
    }
        
    try {
        const user = await db.query("SELECT email, password, id FROM users WHERE email = $1", [req.body.email]);
        if(user.rows[0] === undefined) return res.status(401).send({ status: 'error', message: 'No user with credentials'});
        const { id, email, password } = user.rows[0];
        const isValidPassword = await comparePassword(req.body.password, password);
        if(!isValidPassword) return res.status(401).send({ status: 'error', message: 'Email or password is wrong'});
    
        const token = newToken(user.rows[0]);
        return res.status(201).json({ 
            status: 'success',
            data: {
                token, 
                user: { 
                    email, 
                    id
                } 
            }
        })
    } catch (e) {
        console.error(e)
        res.status(500).end()
    }
}

module.exports.registerForDriver = async (req, res) => {
    if(!req.body.email || !req.body.password || !req.body.phone || !req.body.name ) {
        return res.status(400).json({ status: 'error', message: 'Empty fields'});
    }

    const { email, password, phone, name } = req.body;
    try {
        //check if user's invite exists in database
        const checkForUser = await db.query("SELECT * FROM invites WHERE email = $1", [email]);
        if(checkForUser.rows[0] == undefined) return res.status(400).json({ status: 'success', message: 'No invite found'});
        //hash the password 
        const hash = await hashPassword(password);
        //create the users account
        const newUser = await db.query("INSERT INTO users (name, email, phone, password, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, phone, name", 
        [name, email, phone, hash, checkForUser.rows[0].company_id]);
        res.status(200).json({ status: 'success', message: 'Successfully registered', user: newUser.rows[0]});
    } catch(err) {
        res.status(500).end();
        console.log(err);
    }
}

module.exports.protect = async (req, res, next) => {
    const bearer = req.headers.authorization;
  
    if (!bearer || !bearer.startsWith('Bearer ')) {
      return res.status(401).end();
    }
  
    const token = bearer.split('Bearer ')[1].trim();
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (e) {
      return res.status(401).end();
    }

    let user;
    try {
        user = await db.query("SELECT name, email, id, company_id FROM users WHERE id = $1", [payload.id]);
        if(user.rows[0] === undefined) return res.status(401).json({ status: 'error', message: 'Invalid request'});
    } catch (err) {
        return res.status(401).end();
    }
    
    req.user = user.rows[0];
    next()
}

