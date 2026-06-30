package com.subastas.subastas_api.controller;

import com.subastas.subastas_api.entity.EstadoSubasta;
import com.subastas.subastas_api.entity.Like;
import com.subastas.subastas_api.entity.Subasta;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.repository.LikeRepository;
import com.subastas.subastas_api.repository.SubastaRepository;
import com.subastas.subastas_api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

// Esta clase maneja los requests HTTP relacionados a likes
@RestController
// Todos los endpoints de este controller empiezan con /subastas/{subastaId}/likes
@RequestMapping("/subastas/{subastaId}/likes")
public class LikeController {

    private final LikeRepository likeRepository;
    private final SubastaRepository subastaRepository;
    private final UserRepository userRepository;

    // Spring inyecta los tres repositorios automáticamente al arrancar
    public LikeController(LikeRepository likeRepository,
                          SubastaRepository subastaRepository,
                          UserRepository userRepository) {
        this.likeRepository = likeRepository;
        this.subastaRepository = subastaRepository;
        this.userRepository = userRepository;
    }

    // POST /subastas/{subastaId}/likes — dar like a una subasta
    @PostMapping
    public ResponseEntity<?> darLike(@PathVariable Long subastaId) {
        User usuario = getUsuarioActual();

        // Busca la subasta en la BD, lanza excepción si no existe
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));

        // Solo se puede dar like si la subasta está PUBLICADA (todavía no arrancó)
        if (subasta.getEstado() != EstadoSubasta.PUBLICADA) {
            throw new RuntimeException("Solo se puede dar like a subastas PUBLICADAS");
        }

        // Verifica que el usuario no haya dado like antes — la BD también lo rechazaría
        // pero es mejor dar un mensaje claro antes de llegar a la BD
        if (likeRepository.existsByUsuarioIdAndSubastaId(usuario.getId(), subastaId)) {
            throw new RuntimeException("Ya le diste like a esta subasta");
        }

        // Crea el like y lo guarda → INSERT en la tabla likes
        Like like = new Like();
        like.setUsuario(usuario);
        like.setSubasta(subasta);
        likeRepository.save(like);

        // 200 OK sin body — el front solo necesita saber que salió bien
        return ResponseEntity.ok().build();
    }

    // DELETE /subastas/{subastaId}/likes — quitar like de una subasta
    @DeleteMapping
    public ResponseEntity<?> quitarLike(@PathVariable Long subastaId) {
        User usuario = getUsuarioActual();

        // Busca el like de este usuario en esta subasta
        // Si no existe, lanza excepción con mensaje claro
        Like like = likeRepository.findByUsuarioIdAndSubastaId(usuario.getId(), subastaId)
                .orElseThrow(() -> new RuntimeException("No tenés like en esta subasta"));

        // Borra el like → DELETE en la tabla likes
        likeRepository.delete(like);

        // 204 No Content — operación exitosa sin nada que devolver
        return ResponseEntity.noContent().build();
    }

    // Método privado reutilizable: obtiene el usuario autenticado a partir del token JWT
    // SecurityContextHolder tiene el email del usuario que mandó el request
    private User getUsuarioActual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}