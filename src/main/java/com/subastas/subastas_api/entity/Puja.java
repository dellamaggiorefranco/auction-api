package com.subastas.subastas_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pujas")
@Getter
@Setter
@NoArgsConstructor
public class Puja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta_id")
    private Subasta subasta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "oferente_id")
    private User oferente;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false)
    private Instant fecha = Instant.now();
}