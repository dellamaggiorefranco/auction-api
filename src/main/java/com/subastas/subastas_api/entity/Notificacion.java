package com.subastas.subastas_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "notificaciones")
@Getter
@Setter
@NoArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destinatario_id")
    private User destinatario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta_id")
    private Subasta subasta;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Column(nullable = false)
    private Instant fecha = Instant.now();

    @Column(nullable = false)
    private boolean leida = false;
}