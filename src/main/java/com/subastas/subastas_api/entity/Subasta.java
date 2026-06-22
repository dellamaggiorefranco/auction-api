package com.subastas.subastas_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "subastas")
@Getter
@Setter
@NoArgsConstructor
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSubasta estado = EstadoSubasta.BORRADOR;

    @Column(name = "precio_base", nullable = false, precision = 19, scale = 2)
    private BigDecimal precioBase;

    @Column(name = "monto_actual", precision = 19, scale = 2)
    private BigDecimal montoActual;

    @Column(name = "incremento_minimo", nullable = false, precision = 19, scale = 2)
    private BigDecimal incrementoMinimo;

    @Column(name = "fecha_inicio", nullable = false)
    private Instant fechaInicio;

    @Column(name = "fecha_cierre", nullable = false)
    private Instant fechaCierre;

    @ManyToOne
    @JoinColumn(name = "ganador_actual_id")
    private User ganadorActual;
}
