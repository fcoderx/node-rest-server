const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const {verificaToken, verifica_Admin_Role} = require('../middlewares/autenticacion');

const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite;
    limite = Number(limite);

    Usuario.find({estado: true}, 'nombre email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec( (err, usuarios) => {
        if (err) {
            return res.status(400).send({
                ok: false,
                err
            });
        }

        Usuario.countDocuments({estado: true}, (err, total) => {

            res.send({
                ok: true,
                usuarios,
                total
            });
        });
    });
});

app.post('/usuario', [verificaToken, verifica_Admin_Role], (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    }); 

    usuario.save( (err, usuarioDB) => {
        if (err) {
            return res.status(400).send({
                ok: false,
                err
            });
        }

        usuarioDB.password = undefined;

        res.send({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', [verificaToken, verifica_Admin_Role], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioDB) => {
        if (err) {
            return res.status(400).send({
                ok: false,
                err
            });
        }
        
        res.send({
            ok: true,
            usuario: usuarioDB
        });
    });
});


app.delete('/usuario/:id', [verificaToken, verifica_Admin_Role], (req, res) => {
    let id = req.params.id;

        // Usuario.findByIdAndRemove(id, (err, usuarioDelete) => {
        Usuario.findByIdAndUpdate(id, {estado: false}, {new:true}, (err, usuarioDelete) => {

        if (err) {
            return res.status(400).send({
                ok: false,
                err
            });
        }

        if (!usuarioDelete) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.send({
            ok: true,
            usuario: usuarioDelete
        });
    });
});

module.exports = app;