package com.subastas.subastas_api.repository;

import com.subastas.subastas_api.entity.Subasta;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SubastaRepository extends JpaRepository<Subasta, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Subasta s WHERE s.id = :id")
    Optional<Subasta> buscarParaActualizar(Long id);
}
