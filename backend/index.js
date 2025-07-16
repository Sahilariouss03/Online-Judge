const express = require('express');
const app = express();
const path = require('path');
const DBConnection = require('./database/db');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('./models/user');

DBConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/',(req,res) =>{
    res.send("Hello World!");
});

app.post('/register',async (req,res)=>{
try{
        // Here you would handle user registration logic
    const{firstName, LastName, email, password} = req.body;
    if(!firstName || !LastName || !email || !password) {
        return res.status(400).send("All fields are required");
    }
    // return res.status(201).send(`User ${firstName} ${lastName} registered successfully!`);
    //Add more validation as needed
    //check if the user already exists
    const ExistingUser = await User.findOne({ email });
    if (ExistingUser) {
        return res.status(400).send("User already exists");
    }
    //hashing and encrypting the password using bcrypt js
    const hashedPassword = bcrypt.hashSync(password, 10);
    //Save user in a database
    const newUser = await User.create({
        firstName,
        LastName,
        email,
        password: hashedPassword
    });
   // return res.status(201).send(`User ${firstName} ${LastName} registered successfully!`);
    
    //save sensitive data in jwt
    const token = jwt.sign({ id: newUser._id ,email}, process.env.JWT_SECRET, { expiresIn: '1h' });

    User.token = token;
   newUser.password = undefined; // remove password before sending response
   res.status(201).json({ message: "User registered successfully", user: newUser, token }); // Do not send password in response
}
catch(error){
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
}
});




app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
    
});