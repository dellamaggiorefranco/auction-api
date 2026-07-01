package com.subastas.subastas_api.repository;

import com.subastas.subastas_api.entity.Subasta;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SubastaRepository extends JpaRepository<Subasta, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Subasta s WHERE s.id = :id")
    Optional<Subasta> buscarParaActualizar(Long id);

    @Query("SELECT s FROM Subasta s WHERE " +
            "s.estado IN ('PUBLICADA', 'ACTIVA') AND " +
            "(:categoriaId IS NULL OR s.producto.categoria.id = :categoriaId) AND " +
            "(:precioMin IS NULL OR s.precioBase >= :precioMin) AND " +
            "(:precioMax IS NULL OR s.precioBase <= :precioMax) AND " +
            "(CAST(:nombre AS string) IS NULL OR LOWER(s.producto.nombre) LIKE LOWER(CONCAT('%', CAST(:nombre AS string), '%')))")
    List<Subasta> filtrar(@Param("categoriaId") Long categoriaId,
                          @Param("precioMin") BigDecimal precioMin,
                          @Param("precioMax") BigDecimal precioMax,
                          @Param("nombre") String nombre);

    // Todas las subastas del vendedor, sin importar el estado
    List<Subasta> findByProductoVendedorId(Long vendedorId);
}
