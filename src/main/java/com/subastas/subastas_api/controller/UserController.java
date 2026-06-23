package com.subastas.subastas_api.controller;

import com.subastas.subastas_api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/seller")
    public ResponseEntity<String> assignSeller(@AuthenticationPrincipal String email) {
        userService.assignSellerRole(email);
        return ResponseEntity.ok("Rol SELLER asignado correctamente");
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> assignAdmin(@RequestParam String email) {
        userService.assignAdminRole(email);
        return ResponseEntity.ok("Rol ADMIN asignado correctamente");
    }

    @PutMapping("/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> blockUser(@RequestParam String email) {
        userService.blockUser(email);
        return ResponseEntity.ok("Usuario bloqueado correctamente");
    }

    @PutMapping("/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> unblockUser(@RequestParam String email) {
        userService.unblockUser(email);
        return ResponseEntity.ok("Usuario desbloqueado correctamente");
    }
}