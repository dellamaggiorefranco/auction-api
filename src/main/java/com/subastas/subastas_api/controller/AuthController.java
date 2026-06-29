package com.subastas.subastas_api.controller;

import com.subastas.subastas_api.dto.LoginRequest;
import com.subastas.subastas_api.dto.RegisterRequest;
import com.subastas.subastas_api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }


    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        userService.register(request.name(), request.email(), request.password());
        return ResponseEntity.ok("Usuario registrado correctamente");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        String token = userService.login(request.email(), request.password());
        return ResponseEntity.ok(token);
    }
}