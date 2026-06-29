package com.subastas.subastas_api.exception;

public class UsuarioNoEncontradoException extends RuntimeException {
    public UsuarioNoEncontradoException(String email) {
        super("Usuario no encontrado: " + email);
    }
}