package com.subastas.subastas_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "historial_estados")
@Getter
@Setter
@NoArgsConstructor
public class HistorialEstado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta_id")
    private Subasta subasta;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_anterior")
    private EstadoSubasta estadoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_nuevo", nullable = false)
    private EstadoSubasta estadoNuevo;

    @Column(nullable = false)
    private Instant fecha = Instant.now();

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_responsable_id")
    private User usuarioResponsable;

    @Column(length = 1000)
    private String motivo;
}
