/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Harsh Patel Student ID: 114085228 Date: 25/11/2023
*
* Published URL:
*
********************************************************************************/
const express = require('express');
const path = require('path');
const legoData = require('./modules/legoSets');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
    try {
        await legoData.initialize(app); // Pass the app object to the initialize function
        next();
    } catch (error) {
        console.error('Initialization error:', error);
        res.status(500).send('Initialization error');
    }
});

// Home route
app.get('/', (req, res) => {
    res.render('home', { page: '/' });
});

// About route
app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

// Route for all LEGO sets with a specific theme
app.get('/lego/sets', async (req, res) => {
    try {
        let sets;

        if (req.query.theme) {
            sets = await legoData.getSetsByTheme(req.query.theme);
        } else {
            sets = await legoData.getAllSets();
        }

        res.render('sets', { sets, page: '/lego/sets' });
    } catch (error) {
        res.status(404).render('404', { message: error.toString(), page: '/lego/sets' });
    }
});

// Route for a specific LEGO set by number
app.get('/lego/sets/:num', async (req, res) => {
    const setNum = req.params.num;

    try {
        const legoSet = await legoData.getSetByNum(setNum);
        if (legoSet) {
            res.render('set', { set: legoSet });
        } else {
            res.status(404).render('404', { message: 'LEGO set not found', page: '/lego/sets' });
        }
    } catch (error) {
        res.status(500).render('500', { message: 'Error retrieving LEGO set data', page: '/lego/sets' });
    }
});

// Route to render the form for adding a new set
app.get('/lego/addSet', async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render('addSet', { themes });
    } catch (error) {
        res.status(500).render('500', { message: `Error retrieving themes: ${error}`, page: '/lego/addSet' });
    }
});

// Route to handle form submission for adding a new set
app.post('/lego/addSet', async (req, res) => {
    try {
        const setData = {
            set_num: req.body.set_num,
            name: req.body.name,
            year: parseInt(req.body.year),
            num_parts: parseInt(req.body.num_parts),
            img_url: req.body.img_url,
            theme_id: parseInt(req.body.theme_id),
        };

        await legoData.addSet(setData);
        res.redirect('/lego/sets');
    } catch (error) {
        console.error('Error adding set:', error);
        res.status(500).render('500', { message: `Error adding set: ${error.message}`, page: '/lego/addSet' });
    }
});


// Route to edit a specific LEGO set
app.get('/lego/editSet/:num', async (req, res) => {
    const setNum = req.params.num;

    try {
        const set = await legoData.getSetByNum(setNum);
        const themes = await legoData.getAllThemes();

        // Render the editSet view with set and themes data
        res.render('editSet', { set, themes });
    } catch (error) {
        res.status(404).render('404', { message: error.toString() });
    }
});

// Route to handle form submission for editing a set
app.post('/lego/editSet', async (req, res) => {
    const setNum = req.body.set_num;
    const setData = {
        name: req.body.name,
        year: parseInt(req.body.year),
        num_parts: parseInt(req.body.num_parts),
        img_url: req.body.img_url,
        theme_id: parseInt(req.body.theme_id),
    };

    try {
        await legoData.editSet(setNum, setData);
        res.redirect('/lego/sets');
    } catch (error) {
        res.status(500).render('500', { message: `Error updating set: ${error}` });
    }
});
app.get('/lego/deleteSet/:num', async (req, res) => {
    const setNum = req.params.num;
    console.log('Deleting set with set_num:', setNum);

    try {
        await legoData.deleteSet(setNum);
        res.redirect('/lego/sets');
    } catch (error) {
        console.error('Error deleting set:', error);
        res.status(500).render('500', { message: `Error deleting set: ${error.message}`, page: '/lego/sets' });
    }
});

// 404 Route
app.use((req, res) => {
    res.status(404).render('404', { page: req.url, message: "I'm sorry, we're unable to find what you're looking for" });
});

// 500 Route
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { message: "I'm sorry, something went wrong", page: req.url });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});