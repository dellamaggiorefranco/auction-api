package com.subastas.subastas_api.repository;

import com.subastas.subastas_api.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

// Repositorio que habla con la tabla "likes" en la base de datos
// JpaRepository<Like, Long> → hereda findAll(), save(), delete(), findById(), etc.
public interface LikeRepository extends JpaRepository<Like, Long> {

    // Busca el like de un usuario específico en una subasta específica
    // Spring genera automáticamente: SELECT * FROM likes WHERE usuario_id = ? AND subasta_id = ?
    // Devuelve Optional porque puede no existir (el usuario capaz no dio like)
    Optional<Like> findByUsuarioIdAndSubastaId(Long usuarioId, Long subastaId);

    // Trae todos los likes de una subasta donde notificado = false
    // El scheduler usa esto para saber a quién notificar cuando falta 1 hora
    // Spring genera: SELECT * FROM likes WHERE subasta_id = ? AND notificado = false
    List<Like> findBySubastaIdAndNotificadoFalse(Long subastaId);

    // Verifica si ya existe un like de ese usuario en esa subasta — devuelve true o false
    // Se usa en el controller para evitar likes duplicados antes de intentar guardar
    // Spring genera: SELECT COUNT(*) > 0 FROM likes WHERE usuario_id = ? AND subasta_id = ?
    boolean existsByUsuarioIdAndSubastaId(Long usuarioId, Long subastaId);
}