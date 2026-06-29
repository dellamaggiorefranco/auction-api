package com.subastas.subastas_api.exception;

public class RolYaAsignadoException extends RuntimeException {
    public RolYaAsignadoException(String rol) {
        super("El usuario ya tiene el rol: " + rol);
    }
}