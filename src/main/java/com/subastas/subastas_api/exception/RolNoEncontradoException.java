package com.subastas.subastas_api.exception;

public class RolNoEncontradoException extends RuntimeException {
    public RolNoEncontradoException(String nombre) {
        super("Rol no encontrado: " + nombre);
    }
}
