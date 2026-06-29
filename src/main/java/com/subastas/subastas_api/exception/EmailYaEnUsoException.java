package com.subastas.subastas_api.exception;

public class EmailYaEnUsoException extends RuntimeException {
    public EmailYaEnUsoException(String email) {
        super("El email ya está en uso: " + email);
    }
}