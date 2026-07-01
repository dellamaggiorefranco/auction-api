package com.subastas.subastas_api.repository;

import com.subastas.subastas_api.entity.Disputa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputaRepository extends JpaRepository<Disputa, Long> {

    List<Disputa> findByFechaResolucionIsNull();
}
