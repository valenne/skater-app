const express = require("express");
const expressFileUpload = require("express-fileupload");
const session = require("express-session");

const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { get } = require("express/lib/response");

// importing files
const {
  newUser,
  getSkaters,
  getSkater,
  setSkaterStatus,
  getUpdateSkater,
  getSkaterForID,
  deleteSkater,
} = require(__dirname + "/consult.js");

// variables
const app = express();
const port = 3000;
const secretKey = "secret";

// conect to the server with the port
app.listen(port, () => {
  console.log(`listening on port ${port} 🎈`);
});

// middleswares

app.use(
  expressFileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: `File size is too big (max: 5MB)`,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use(express.static(__dirname + "/public"));
app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: `main`,
    layoutsDir: `${__dirname}/views/mainLayout`,
    extname: ".hbs",
    helpers: {
      inc: (value, options) => {
        return parseInt(value) + 1;
      },
    },
  })
);

app.set("view engine", "hbs");

// session midlewares

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// routes for the app
app.get("/", (req, res) => {
  res.render("front", {
    title: "Home",
    cssFile: "front",
  });
});

app.get("/participantes", async (req, res) => {
  try {
    const skaters = await getSkaters();

    res.render("index", {
      title: `Participantes`,
      cssFile: `estilos`,
      skaters,
    });
  } catch (err) {
    res.status(500).send({
      error: `Something failed ${err}`,
      code: 500,
    });
  }
});

app.get("/registro", (req, res) => {
  res.render("registro", {
    title: `Registro`,
    cssFile: `estilos`,
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: `Login`,
    cssFile: `estilos`,
  });
});

app.get("/admin", async (req, res) => {
  try {
    const skaters = await getSkaters();

    res.render("admin", {
      title: `Admin`,
      cssFile: `estilos`,
      skaters,
    });
  } catch (err) {
    res.status(500).send({
      error: `Something failed ${err}`,
      code: 500,
    });
  }
});

app.post("/registro", async (req, res) => {
  const imagen = req.files.foto;

  const { email, nombre, password, passwordDos, experiencia, especialidad } =
    req.body;

  try {
    if (password !== passwordDos) {
      req.session.message = {
        type: `danger`,
        intro: `The passwords don't match`,
        message: `Please try again`,
      };
      res.redirect("/registro");
    } else {
      await newUser(
        email,
        nombre,
        password,
        experiencia,
        especialidad,
        imagen.name
      ).then((response) => {
        imagen.mv(`${__dirname}/public/uploads/${response.foto}`, (err) => {
          if (err) {
            console.log(err);
          }
        });

        console.log(`${response.nombre} has been registered`);

        res.status(200).redirect("/login");
      });
    }
  } catch (err) {
    console.log(`Error: The password is not the same`);
  }
});

// verify the user

app.post("/verify", async (req, res) => {
  const { email, password } = req.body;

  const user = await getSkater(email, password);

  if (user) {
    if (user.estado) {
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          data: user,
        },
        secretKey
      );
      res.status(200).send({
        token,
        user,
      });
    } else {
      console.log("User not verified");
      res.status(401).send({
        error: `you are not authorized to access this page`,
        code: 401,
      });
    }
  } else {
    res.status(404).send({
      error: `user not found`,
      code: 404,
    });
  }
});

// routes that modifies the value of the checkbox in the admin page

app.put("/skaters/change", async (req, res) => {
  const { id, estado } = req.body;
  try {
    const skater = await setSkaterStatus(id, estado);
    res.status(200).send(JSON.stringify(skater));
  } catch (e) {
    res.status(500).send({
      error: `Something failed ${e}`,
      code: 500,
    });
  }
});

// verify the token, then send the user to a datos page

app.get("/datos", async (req, res) => {
  const { token } = req.query;
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (decoded == undefined) {
      res.status(401).send({
        error: `you are not authorized to access this page`,
        code: 401,
      });
    }
    const { data } = decoded;
    if (err) {
      throw new Error(`ACA ESA EL ERRIOR`, err);
    }
    const { id, email, nombre, password, anos_experiencia, especialidad } =
      data;

    console.log(decoded);
    res.render("update-user/datos", {
      title: `Datos`,
      cssFile: `estilos`,
      data: { id, email, nombre, password, anos_experiencia, especialidad },
    });
  });
});

// update the user data
app.get("/update", (req, res) => {
  const { id, email } = req.query;
  res.render("update-user/datosUpdate", {
    title: `Actualizar datos`,
    cssFile: `estilos`,
    dataToverify: { id, email },
  });
});

app.post("/update", async (req, res) => {
  const {
    idUser,
    email,
    nombre,
    password,
    passwordRepeat,
    experiencia,
    especialidad,
  } = req.body;

  try {
    if (password !== passwordRepeat) {
      console.log(`passwords don't match`);
      res.status(401).send({
        error: `passwords don't match`,
        code: 400,
      });
    } else {
      const user = await getSkaterForID(email, idUser);
      if (user) {
        await getUpdateSkater(
          nombre,
          password,
          experiencia,
          especialidad,
          idUser
        ).then((response) => {
          console.log(`${nombre} has been Updated`);
          res.status(200).send({
            response,
          });
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`app.delete`, id);

  try {
    const data = await deleteSkater(id);
    console.log(data);
    if (data > 0) {
      res.status(200).send(`skater with ${id} has been deleted`);
    } else {
      res.status(404).send(`skater with ${id} has not been deleted`);
    }
  } catch (err) {
    res.status(500).send({
      error: `Something failed ${err}`,
      code: 500,
    });
  }
});
