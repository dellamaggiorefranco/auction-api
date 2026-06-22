package com.subastas.subastas_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "disputas")
@Getter
@Setter
@NoArgsConstructor
public class Disputa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta_id")
    private Subasta subasta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_inicia_id")
    private User usuarioInicia;

    @Column(nullable = false, length = 1000)
    private String motivo;

    @Column(length = 2000)
    private String descripcion;

    @Column(name = "categoria_resolucion")
    private String categoriaResolucion;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant fechaCreacion = Instant.now();

    @Column(name = "fecha_resolucion")
    private Instant fechaResolucion;
}