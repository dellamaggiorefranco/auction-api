package com.subastas.subastas_api.controller;

import com.subastas.subastas_api.entity.Producto;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.repository.ProductoRepository;
import com.subastas.subastas_api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;
    
    private final UserRepository userRepository;

    public ProductoController(ProductoRepository productoRepository,
                              
                              UserRepository userRepository) {
        this.productoRepository = productoRepository;
       
        this.userRepository = userRepository;
    }

    // Listar todos — cualquier usuario autenticado
    @GetMapping
    public List<Producto> listar() {
        return productoRepository.findAll();
    }

    // Crear producto — solo SELLER
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User vendedor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        producto.setVendedor(vendedor);
        return ResponseEntity.ok(productoRepository.save(producto));
    }

    // Editar — solo el vendedor dueño
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Producto> editar(@PathVariable Long id, @RequestBody Producto datos) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!producto.getVendedor().getEmail().equals(email)) {
            throw new RuntimeException("Solo el dueño puede editar este producto");
        }

        producto.setNombre(datos.getNombre());
        producto.setDescripcion(datos.getDescripcion());
        if (datos.getCategoria() != null) {
            producto.setCategoria(datos.getCategoria());
        }
        return ResponseEntity.ok(productoRepository.save(producto));
    }

    // Eliminar — solo el vendedor dueño o ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User usuarioActual = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        boolean esAdmin = usuarioActual.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN"));

        if (!esAdmin && !producto.getVendedor().getEmail().equals(email)) {
            throw new RuntimeException("No tenés permiso para eliminar este producto");
        }

        productoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}