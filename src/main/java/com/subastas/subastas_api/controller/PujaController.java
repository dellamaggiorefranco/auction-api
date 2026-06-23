package com.subastas.subastas_api.controller;

import com.subastas.subastas_api.dto.PujaCompletaDTO;
import com.subastas.subastas_api.dto.PujaPublicaDTO;
import com.subastas.subastas_api.entity.EstadoSubasta;
import com.subastas.subastas_api.entity.Puja;
import com.subastas.subastas_api.entity.Subasta;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.repository.PujaRepository;
import com.subastas.subastas_api.repository.UserRepository;
import com.subastas.subastas_api.service.SubastaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/subastas/{subastaId}/pujas")
public class PujaController {

    private final SubastaService subastaService;
    private final PujaRepository pujaRepository;
    private final UserRepository userRepository;

    public PujaController(SubastaService subastaService,
                          PujaRepository pujaRepository,
                          UserRepository userRepository) {
        this.subastaService = subastaService;
        this.pujaRepository = pujaRepository;
        this.userRepository = userRepository;
    }

    // Registrar puja — cualquier usuario autenticado (no SELLER dueño, validado en service)
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'SELLER')")
    public ResponseEntity<Puja> pujar(@PathVariable Long subastaId,
                                      @RequestBody PujaRequest request) {
        User oferente = getUsuarioActual();
        Puja puja = subastaService.registrarPuja(subastaId, oferente, request.monto());
        return ResponseEntity.ok(puja);
    }

    // Ver pujas de una subasta — con privacidad según rol
    @GetMapping
    public ResponseEntity<?> listar(@PathVariable Long subastaId) {
        User usuario = getUsuarioActual();
        Subasta subasta = subastaService.obtenerSubasta(subastaId);

        boolean esAdmin = usuario.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN"));

        boolean esVendedor = subasta.getProducto().getVendedor().getId()
                .equals(usuario.getId());

        boolean subastaFinalizada = subasta.getEstado() == EstadoSubasta.FINALIZADA
                || subasta.getEstado() == EstadoSubasta.ADJUDICADA;

        // ADMIN ve todo siempre. Vendedor ve todo solo si ya cerró.
        if (esAdmin || (esVendedor && subastaFinalizada)) {
            List<PujaCompletaDTO> pujas = pujaRepository
                    .findBySubastaIdOrderByMontoDesc(subastaId).stream()
                    .map(p -> new PujaCompletaDTO(
                            p.getId(), p.getMonto(), p.getFecha(),
                            p.getOferente().getId(), p.getOferente().getEmail()))
                    .toList();
            return ResponseEntity.ok(pujas);
        }

        // Cualquier otro ve solo monto y fecha
        List<PujaPublicaDTO> pujas = pujaRepository
                .findBySubastaIdOrderByMontoDesc(subastaId).stream()
                .map(p -> new PujaPublicaDTO(p.getId(), p.getMonto(), p.getFecha()))
                .toList();
        return ResponseEntity.ok(pujas);
    }

    // Ver mis pujas en una subasta
    @GetMapping("/mias")
    public List<Puja> misPujas(@PathVariable Long subastaId) {
        User usuario = getUsuarioActual();
        return pujaRepository.findByOferenteIdAndSubastaId(usuario.getId(), subastaId);
    }

    private User getUsuarioActual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    record PujaRequest(BigDecimal monto) {}
}