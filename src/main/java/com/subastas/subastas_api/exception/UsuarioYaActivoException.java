package com.subastas.subastas_api.exception;

public class UsuarioYaActivoException extends RuntimeException {
    public UsuarioYaActivoException() {
        super("El usuario ya está activo");
    }
}