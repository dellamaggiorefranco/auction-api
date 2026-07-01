package com.subastas.subastas_api.repository;

import com.subastas.subastas_api.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByDestinatarioIdOrderByFechaDesc(Long destinatarioId);
}