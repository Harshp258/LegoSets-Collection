/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Harsh Patel Student ID: 114085228 Date: 10/27/2023
*
* Published URL: https://viridian-duck-wrap.cyclic.app/
*
********************************************************************************/

const express = require('express');
const path = require('path');

const app = express();
const legoData = require('./modules/legoSets');
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
    try {
        if (!app.locals.sets) {
            app.locals.sets = await legoData.initialize();
        }
        next();
    } catch (error) {
        console.error("Initialization error:", error);
        res.status(500).send("Initialization error");
    }
});

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

// About route
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// Route for all LEGO sets
app.get('/lego/sets', async (req, res) => {
    try {
        let sets;
        if (req.query.theme) {
            sets = await legoData.getSetsByTheme(app.locals.sets, req.query.theme);
        } else {
            sets = await legoData.getAllSets(app.locals.sets);
        }
        res.json(sets);
    } catch (error) {
        res.status(404).send(error.toString());
    }
});

// Route for a specific LEGO set by number
app.get('/lego/sets/:set_num', async (req, res) => {
    try {
        const set = await legoData.getSetByNum(app.locals.sets, req.params.set_num);
        res.json(set);
    } catch (error) {
        res.status(404).send(error.toString());
    }
});

// Custom 404 error page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});






