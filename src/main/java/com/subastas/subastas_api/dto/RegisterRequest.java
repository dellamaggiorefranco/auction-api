package com.subastas.subastas_api.dto;

public record RegisterRequest(
        String name,
        String email,
        String password
) {}
