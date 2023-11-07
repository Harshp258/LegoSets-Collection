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
* Published URL:
*
********************************************************************************/
const express = require('express');
const path = require('path');
const app = express();


const legoData = require('./modules/legoSets'); 

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "views")); 

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
    res.render('home', { page: '/' }); 
});



// About route
app.get('/about', (req, res) => {
    res.render('about' , { page: '/' });
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
        res.render('sets', { sets, page: '/lego/sets' });
    } catch (error) {
        res.status(404).render('404', { message: error.toString() });
    }
});


// Route for a specific LEGO set by number
app.get('/lego/sets/:num', async (req, res) => {
    const setNum = req.params.num;

    try {
        const legoSet = await legoData.getSetByNum(app.locals.sets, setNum);
        if (legoSet) {
            res.render("set", { set: legoSet });
        } else {
            res.status(404).render('404', { message: "LEGO set not found" });
        }
    } catch (error) {
        res.status(500).render('500', { message: "Error retrieving LEGO set data" });
    }
});


app.use((req, res) => {
    res.status(404).render('404', { page: req.url, message: "I'm sorry, we're unable to find what you're looking for" });
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
