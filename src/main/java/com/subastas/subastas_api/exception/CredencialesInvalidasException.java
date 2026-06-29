package com.subastas.subastas_api.exception;

public class CredencialesInvalidasException extends RuntimeException {
    public CredencialesInvalidasException() {
        super("Contraseña incorrecta");
    }
}