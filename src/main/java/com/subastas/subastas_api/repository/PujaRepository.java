package com.subastas.subastas_api.repository;

import com.subastas.subastas_api.entity.Puja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PujaRepository extends JpaRepository<Puja, Long> {

    List<Puja> findBySubastaIdOrderByMontoDesc(Long subastaId);

    List<Puja> findByOferenteIdAndSubastaId(Long oferenteId, Long subastaId);
}
