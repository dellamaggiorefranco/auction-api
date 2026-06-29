package com.subastas.subastas_api.exception;

public class UsuarioBloqueadoException extends RuntimeException {
    public UsuarioBloqueadoException() {
        super("El usuario ya está bloqueado");
    }
}