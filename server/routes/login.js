const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {
    
    let {email, password} = req.body;

    Usuario.findOne({email}, (err, usuarioDB) => {

        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        } 

        if (!usuarioDB) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(password, usuarioDB.password )) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        usuarioDB.password = undefined;

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.send({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});




module.exports = app;