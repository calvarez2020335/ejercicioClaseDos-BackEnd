const Usuario = require("../models/usuario.model");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");

function registrarAdmin() {
  var modeloUsuario = new Usuario();

  Usuario.find({ email: "SuperAdmin" }, (err, usuarioEncontrado) => {
    if (usuarioEncontrado.length > 0) {
      return console.log("el SuperAdmin Ya Esta Registrado");
    } else {
      modeloUsuario.nombre = "SuperAdmin";
      modeloUsuario.email = "SuperAdmin";
      modeloUsuario.rol = "ROL_ADMIN";

      bcrypt.hash("123456", null, null, (err, passwordEncriptada) => {
        modeloUsuario.password = passwordEncriptada;

        modeloUsuario.save((err, usuarioGuardado) => {
          if (err) return console.log("Error en la peticion");
          if (!usuarioGuardado)
            return console.log("Error al registrar Admin");

          return console.log("SuperAdmin:" + " " + usuarioGuardado);
        });
      });
    }
  });
}

function Login(req, res) {
  var parametros = req.body;
  Usuario.findOne({ email: parametros.email }, (err, usuarioEncontrado) => {
    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
    if (usuarioEncontrado) {
      // COMPARO CONTRASENA SIN ENCRIPTAR CON LA ENCRIPTADA
      bcrypt.compare(
        parametros.password,
        usuarioEncontrado.password,
        (err, verificacionPassword) => {
          //TRUE OR FALSE
          // VERIFICO SI EL PASSWORD COINCIDE EN BASE DE DATOS
          if (verificacionPassword) {
            // SI EL PARAMETRO OBTENERTOKEN ES TRUE, CREA EL TOKEN
            if (parametros.obtenerToken === "true") {
              return res
                .status(200)
                .send({ token: jwt.crearToken(usuarioEncontrado) });
            } else {
              usuarioEncontrado.password = undefined;
              return res.status(200).send({ usuario: usuarioEncontrado });
            }
          } else {
            return res
              .status(500)
              .send({ mensaje: "Las contrasena no coincide" });
          }
        }
      );
    } else {
      return res
        .status(500)
        .send({ mensaje: "Error, el correo no se encuentra registrado." });
    }
  });
}

function RegistrarEmpresa(req, res) {
  var parametro = req.body;
  var usuarioModel = new Usuario();


  if (parametro.nombre && parametro.email && parametro.password && parametro.tipoEmpresa) {
  
    usuarioModel.nombre = parametro.nombre;
    usuarioModel.email = parametro.email;
    usuarioModel.telefono = parametro.telefono;
    usuarioModel.direccion = parametro.direccion
    usuarioModel.password = parametro.password;
    usuarioModel.rol = "ROL_EMPRESA";
    usuarioModel.tipoEmpresa = parametro.tipoEmpresa;
    usuarioModel.ProductoEmpresa = [];

    Usuario.find({ email: parametro.email }, (err, usuarioEncontrado) => {
      if (usuarioEncontrado.length == 0) {
        bcrypt.hash(
          parametro.password,
          null,
          null,
          (err, passwordEncriptada) => {
            usuarioModel.password = passwordEncriptada;

            usuarioModel.save((err, usuarioGuardado) => {
              if (err)
                return res
                  .status(500)
                  .send({ mensaje: "Error en la peticion" });
              if (!usuarioGuardado)
                return res
                  .status(500)
                  .send({ mensaje: "Error al agregar Empresa" });

              return res.status(200).send({ usuario: usuarioGuardado });
            });
          }
        );
      } else {
        return res.status(500).send({ mensaje: "La empresa ya a sido creada" });
      }
    });
  }else {
    return res.status(500).send({ mensaje: "Enviar parametros obligatorios" });
  }
}







function EditarEmpresa(req, res) {
  var idUser = req.params.idUser;
  var parametros = req.body;

  if (req.user.rol !== "ROL_ADMIN") {
    return res.status(500).send({ mensaje: "No tiene acceso a este recurso" });
  }

  Usuario.findByIdAndUpdate(
    idUser,
    parametros,
    { new: true },
    (err, usuarioEditado) => {
      if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
      if (!usuarioEditado)
        return res.status(403).send({ mensaje: "Error al editar la empresa" });

      return res.status(200).send({ usuario: usuarioEditado });
    }
  );
}

function EliminarEmpresas(req, res) {
    var idUsua = req.params.idUser;

    if( req.user.rol !== "ROL_ADMIN" ) {
        return res.status(500).send({ mensaje: 'No tiene los permisos para eliminar Empresas.' });
    }
    
    if( req.user.sub == idUsua){
        console.log(req.user.nombre);
        return res.status(500).send({ mensaje: 'El admin no se puede borrar' });
    }

    Usuario.findByIdAndDelete(idUsua, (err, UsuarioEliminado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!UsuarioEliminado) return res.status(500)
            .send({ mensaje: 'Error al eliminar el producto' })

        return res.status(200).send({ usuario: UsuarioEliminado });
    })
}

function VerEmpresas(req, res) {
  Usuario.find({}, (err, UsuarioEncontrado)=>{
    return res.status(200).send({Empresas: UsuarioEncontrado})
  })
}

module.exports = {
  registrarAdmin,
  Login,
  RegistrarEmpresa,
  EditarEmpresa,
  EliminarEmpresas,
  VerEmpresas
};
