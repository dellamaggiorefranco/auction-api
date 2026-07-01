package com.subastas.subastas_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

// Le dice a Spring que esta clase es una tabla en la base de datos
@Entity
// El nombre de la tabla en PostgreSQL será "likes"
@Table(name = "likes", uniqueConstraints = {
    // Restricción: un mismo usuario NO puede darle like dos veces a la misma subasta
    @UniqueConstraint(columnNames = {"usuario_id", "subasta_id"})
})
// Lombok genera automáticamente todos los getters (getId(), getUsuario(), etc.)
@Getter
@Setter
// Lombok genera el constructor vacío que JPA necesita para crear objetos
@NoArgsConstructor
public class Like {

    // Clave primaria — la BD asigna el ID automáticamente (1, 2, 3...)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Muchos likes pueden pertenecer a un mismo usuario
    // optional = false → todo like DEBE tener un usuario, no puede ser null
    // @JoinColumn → en la tabla "likes" habrá una columna "usuario_id"
    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    // Muchos likes pueden pertenecer a una misma subasta
    // optional = false → todo like DEBE tener una subasta, no puede ser null
    // @JoinColumn → en la tabla "likes" habrá una columna "subasta_id"
    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta_id")
    private Subasta subasta;

    // Momento exacto en que el usuario dio like — se asigna automáticamente en UTC
    @Column(nullable = false)
    private Instant fecha = Instant.now();

    // Flag para saber si ya mandamos la notificación de "empieza en 1 hora"
    // false = todavía no notificamos, true = ya notificamos → el scheduler no la manda dos veces
    @Column(nullable = false)
    private boolean notificado = false;
}