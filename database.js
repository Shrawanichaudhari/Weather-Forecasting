const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sql = require("mssql");
const path = require('path'); // Import path module

// Database configuration
const config = {
    server: 'LATITUDE5300\\SQLEXPRESS', // You may need to change this depending on your SQL Server configuration
    database: 'weatherDB',
    options: {
        trustServerCertificate: true, // Change it to false if you're not using self-signed SSL certificates
        useUTC: true
    }
};

// Middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('C:\\Users\\Administrator\\Desktop\\WPProjectFinal'));

// Route for serving signupnew.html
app.get('/signupnew', (req, res) => {
    res.sendFile(path.join('C:\\Users\\Administrator\\Desktop\\WPProjectFinal', 'signupnew.html')); // Assuming signupnew.html is in the same directory as this script
});

// Route for signup form submission
app.post('/signup', (req, res) => {
    // Extract form data
    console.log(req.body);
    const { fname, lname, username, mail, password, loc } = req.body;

    // Connect to the database
    sql.connect(config, (err) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).send('Database connection error');
        }

        // Create a new request object
        const request = new sql.Request();

        // SQL query to insert signup data into the SignUp table
        const query = `INSERT INTO SignUp (FirstName, LastName, Username, EmailAddress, Password, Location) VALUES ('${fname}', '${lname}', '${username}', '${mail}', '${password}', '${loc}')`;

        // Execute the query
        request.query(query, (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Database query error');
            }

            console.log('Signup data inserted successfully');
            res.status(200).send('Signup successful');
        });
    });
});

// Start the server
const port = 3000; // You can change this to any port you like
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
