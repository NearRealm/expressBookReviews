const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the session and the authorization details exist
    if (req.session && req.session.authorization) {
        let token = req.session.authorization['accessToken']; // Assuming token is stored like this { 'accessToken': '...' }

        // Check if the token exists
        if (!token) {
            return res.status(403).json({ message: "User not logged in (token missing)" });
        }

        // Verify the token
        jwt.verify(token, "Secret_JWT_Phrase", (err, decoded) => { // Replace "YOUR_JWT_SECRET" with your actual secret
            if (err) {
                // Token is invalid or expired
                return res.status(401).json({ message: "User not authenticated (invalid token)" });
            } else {
                // Token is valid, store decoded info in request (optional, but good practice)
                req.user = decoded; // 'decoded' typically contains user info payload
                // Proceed to the next middleware or route handler
                next();
            }
        });
    } else {
        // Session or authorization details are missing
        return res.status(403).json({ message: "User not logged in (no session/authorization)" });
    }
});



 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
