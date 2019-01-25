const jwt = require('jsonwebtoken');

// Verificar token
let verificaToken = (req, res, next) => {
    let token = req.get('Authorization');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                ok: false,
                err
            });
        } 

        req.usuario = decoded.usuario;
        
        next();
    });

};

// Verifica admin role
let verifica_Admin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(401).send({
            ok: false,
            err:{
                messsage: 'El usuario no es administrador'
            }
        });
    } else {
        next();
    }
};

module.exports = {
    verificaToken,
    verifica_Admin_Role
};