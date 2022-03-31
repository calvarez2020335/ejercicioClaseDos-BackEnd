const mongoose = require('mongoose');
const usuarioControler = require('./src/controllers/usuario.controller')
const app = require('./app');
const {registrarAdmin} = require('./src/controllers/usuario.controller')

mongoose.Promise = global.Promise;

mongoose.Promise = global.Promise;                                                                  
mongoose.connect('mongodb://localhost:27017/Empresas', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("Conectado a la base de datos.");

    app.listen(3000, function () {
        console.log("Corriendo en el puerto 3000!")
    })

}).catch(error => console.log(error));

registrarAdmin();