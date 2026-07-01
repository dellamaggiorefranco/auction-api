package com.subastas.subastas_api.controller;

import com.subastas.subastas_api.entity.Notificacion;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.repository.NotificacionRepository;
import com.subastas.subastas_api.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notificaciones")
public class NotificacionController {

    private final NotificacionRepository notificacionRepository;
    private final UserRepository userRepository;

    public NotificacionController(NotificacionRepository notificacionRepository,
                                   UserRepository userRepository) {
        this.notificacionRepository = notificacionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/mias")
    public List<Notificacion> miasNotificaciones() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User usuario = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return notificacionRepository.findByDestinatarioIdOrderByFechaDesc(usuario.getId());
    }
}
