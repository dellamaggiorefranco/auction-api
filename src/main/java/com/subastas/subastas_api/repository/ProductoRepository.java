package com.subastas.subastas_api.repository;

import com.subastas.subastas_api.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
