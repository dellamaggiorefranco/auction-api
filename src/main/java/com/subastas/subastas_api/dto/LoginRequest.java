package com.subastas.subastas_api.dto;

public record LoginRequest(
        String email,
        String password
) {}
