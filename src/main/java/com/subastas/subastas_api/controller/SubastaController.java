package com.subastas.subastas_api.controller;

import com.subastas.subastas_api.entity.Disputa;
import com.subastas.subastas_api.entity.Subasta;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.repository.DisputaRepository;
import com.subastas.subastas_api.repository.SubastaRepository;
import com.subastas.subastas_api.repository.UserRepository;
import com.subastas.subastas_api.service.SubastaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/subastas")
public class SubastaController {

    private final SubastaService subastaService;
    private final SubastaRepository subastaRepository;
    private final UserRepository userRepository;
    private final DisputaRepository disputaRepository;

    public SubastaController(SubastaService subastaService,
                             SubastaRepository subastaRepository,
                             UserRepository userRepository,
                             DisputaRepository disputaRepository) {
        this.subastaService = subastaService;
        this.subastaRepository = subastaRepository;
        this.userRepository = userRepository;
        this.disputaRepository = disputaRepository;
    }

    // Listar con filtros opcionales — cualquier usuario autenticado
    @GetMapping
    public List<Subasta> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(required = false) String nombre) {
        return subastaRepository.filtrar(categoriaId, precioMin, precioMax, nombre);
    }

    // Todas mis subastas como vendedor, sin importar el estado — solo SELLER
    @GetMapping("/mias")
    @PreAuthorize("hasRole('SELLER')")
    public List<Subasta> misSubastas() {
        User usuario = getUsuarioActual();
        return subastaRepository.findByProductoVendedorId(usuario.getId());
    }

    // Ver una subasta — cualquier usuario autenticado
    @GetMapping("/{id}")
    public ResponseEntity<Subasta> obtener(@PathVariable Long id) {
        Subasta subasta = subastaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));
        return ResponseEntity.ok(subasta);
    }

    // Crear subasta en BORRADOR — solo SELLER
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Subasta> crear(@RequestBody Subasta subasta) {
        return ResponseEntity.ok(subastaRepository.save(subasta));
    }

    // Publicar — solo SELLER dueño
    @PostMapping("/{id}/publicar")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Subasta> publicar(@PathVariable Long id) {
        User usuario = getUsuarioActual();
        return ResponseEntity.ok(subastaService.publicarSubasta(id, usuario));
    }

    // Cancelar — SELLER dueño (sin pujas) o ADMIN
    @PostMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Void> cancelar(@PathVariable Long id,
                                         @RequestBody(required = false) String motivo) {
        User usuario = getUsuarioActual();
        subastaService.cancelarSubasta(id, usuario, motivo != null ? motivo : "Cancelada por el usuario");
        return ResponseEntity.noContent().build();
    }

    // Abrir disputa — SELLER o ganador
    @PostMapping("/{id}/disputas")
    @PreAuthorize("hasAnyRole('SELLER', 'USER')")
    public ResponseEntity<?> abrirDisputa(@PathVariable Long id,
                                          @RequestBody DisputaRequest request) {
        User usuario = getUsuarioActual();
        return ResponseEntity.ok(subastaService.abrirDisputa(id, usuario, request.motivo(), request.descripcion()));
    }

    // Listar disputas pendientes de resolver — solo ADMIN
    @GetMapping("/disputas/pendientes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Disputa> disputasPendientes() {
        return disputaRepository.findByFechaResolucionIsNull();
    }

    // Resolver disputa — solo ADMIN
    @PostMapping("/disputas/{disputaId}/resolver")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolverDisputa(@PathVariable Long disputaId,
                                             @RequestBody ResolverDisputaRequest request) {
        User usuario = getUsuarioActual();
        return ResponseEntity.ok(subastaService.resolverDisputa(disputaId, usuario, request.categoriaResolucion()));
    }

    // Método auxiliar para obtener el usuario autenticado
    private User getUsuarioActual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Records para los request bodies
    record DisputaRequest(String motivo, String descripcion) {}
    record ResolverDisputaRequest(String categoriaResolucion) {}
}