import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import fileupload from 'express-fileupload'
import { checkLogin, registerNewFace } from './faceDetection.js'
import { addEmployee, DoesEmployeeExist, getEmployee, init_db } from './db.js'

await init_db()

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const dirname = path.dirname(fileURLToPath(import.meta.url))

const homePageContent = readFileSync(path.resolve(dirname, 'htmlFiles', 'index.html'));
const loginPageContent = readFileSync(path.resolve(dirname, 'htmlFiles', 'login.html'));
const registerPageContent = readFileSync(path.resolve(dirname, 'htmlFiles', 'register.html'));

app.use(express.static('public'));
app.use(fileupload())

app.get('/', (_, res) => {
    res.type('text/html');
    res.send(homePageContent)
})

app.get('/login', (_, res) => {
    res.type('text/html');
    res.send(loginPageContent)
})

app.post('/login', urlencodedParser, async (req, res) => {
    const image = req.body.image;
    let user = await checkLogin(image);
    console.log(user)
    if (user === "ERROR") {
        return res.status(500).send({ message: 'ERROR' });
    }
    user = user.substring(0, user.indexOf(' '))
    const data = await getEmployee(user);
    if (user === 'unknown') {
        return res.send({ message: 'unknown' });
    }
    res.send({
        message: `<h3>Name: ${data[0].Name}</h3>
            <h3>Phone: ${data[0].Phone}</h3>`
    });
})

app.get('/register', (_, res) => {
    res.type('text/html');
    res.send(registerPageContent)
})

app.post('/register', urlencodedParser, async (req, res) => {

    const name = req.body.name, phone = req.body.phone, image = req.files.image, uploadPath = dirname + '/Images/' + image.name, restorePath = '/Images/' + image.name;
    image.mv(uploadPath, err => {
        if (err)
            return res.status(500).send(err);
    })
    const employeeExists = await DoesEmployeeExist(name, phone);
    if (employeeExists) {
        return res.status(500).send('Employee with that name and phone exists')
    }
    if (name && phone && image) {
        try {
            await registerNewFace(name, image.data)
        }
        catch (err) {
            return res.status(500).send('Bad Image')
        }
        addEmployee(name, phone, restorePath);
    }
    res.send('done')
})

app.all('*', (req, res) => {
    res.status(404).send('<h1>Page not found</h1>');
})

const port = 5000;
app.listen(port, () => {
    console.log(`working on http://localhost:${port}`)
})

