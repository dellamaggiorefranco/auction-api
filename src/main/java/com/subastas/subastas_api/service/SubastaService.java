package com.subastas.subastas_api.service;

import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.entity.EstadoSubasta;
import com.subastas.subastas_api.entity.HistorialEstado;
import com.subastas.subastas_api.entity.Puja;
import com.subastas.subastas_api.entity.Subasta;
import com.subastas.subastas_api.repository.HistorialEstadoRepository;
import com.subastas.subastas_api.repository.NotificacionRepository;
import com.subastas.subastas_api.repository.PujaRepository;
import com.subastas.subastas_api.repository.SubastaRepository;
import java.util.List;

@Service
public class SubastaService {

    private final SubastaRepository subastaRepository;
    private final PujaRepository pujaRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final NotificacionRepository notificacionRepository;

    public SubastaService(SubastaRepository subastaRepository,
                          PujaRepository pujaRepository,
                          HistorialEstadoRepository historialEstadoRepository,
                          NotificacionRepository notificacionRepository) {
        this.subastaRepository = subastaRepository;
        this.pujaRepository = pujaRepository;
        this.historialEstadoRepository = historialEstadoRepository;
        this.notificacionRepository = notificacionRepository;
    }

@Transactional
        public Puja registrarPuja(Long subastaId, User oferente, BigDecimal monto) {

        // 1. Traer la subasta con bloqueo pesimista
        Subasta subasta = subastaRepository.buscarParaActualizar(subastaId)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));

        // 2. Validar que esté ACTIVA
        if (subasta.getEstado() != EstadoSubasta.ACTIVA) {
            throw new RuntimeException("La subasta no está activa");
        }

        // 3. Validar que no haya vencido
        if (Instant.now().isAfter(subasta.getFechaCierre())) {
            throw new RuntimeException("La subasta ya cerró");
        }

        // 4. Validar que el oferente no sea el vendedor
        if (subasta.getProducto().getVendedor().getId().equals(oferente.getId())) {
            throw new RuntimeException("El vendedor no puede pujar en su propia subasta");
        }

        // 5. Validar que el usuario no esté bloqueado
        if (!oferente.isActive()) {
            throw new RuntimeException("El usuario está bloqueado");
        }

        // 6. Validar monto mínimo
        BigDecimal montoMinimo = subasta.getMontoActual() != null
                ? subasta.getMontoActual().add(subasta.getIncrementoMinimo())
                : subasta.getPrecioBase();

        if (monto.compareTo(montoMinimo) < 0) {
            throw new RuntimeException("El monto es insuficiente. Mínimo: " + montoMinimo);
        }

        // 7. Guardar la puja
        Puja puja = new Puja();
        puja.setSubasta(subasta);
        puja.setOferente(oferente);
        puja.setMonto(monto);
        pujaRepository.save(puja);

        // 8. Actualizar la subasta
        subasta.setMontoActual(monto);
        subasta.setGanadorActual(oferente);
        subastaRepository.save(subasta);

        return puja;
    }
    @Transactional
    public void cambiarEstado(Subasta subasta, EstadoSubasta nuevoEstado, User responsable, String motivo) {

    EstadoSubasta estadoAnterior = subasta.getEstado();

    // 1. Cambiar el estado en la subasta
    subasta.setEstado(nuevoEstado);
    subastaRepository.save(subasta);

    // 2. Registrar el cambio en el historial
    HistorialEstado historial = new HistorialEstado();
    historial.setSubasta(subasta);
    historial.setEstadoAnterior(estadoAnterior);
    historial.setEstadoNuevo(nuevoEstado);
    historial.setUsuarioResponsable(responsable);
    historial.setMotivo(motivo);
    historialEstadoRepository.save(historial);
}
@Transactional
public Subasta publicarSubasta(Long subastaId, User responsable) {

    Subasta subasta = subastaRepository.findById(subastaId)
            .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));

    // Solo el vendedor dueño puede publicar
    if (!subasta.getProducto().getVendedor().getId().equals(responsable.getId())) {
        throw new RuntimeException("Solo el vendedor puede publicar su subasta");
    }

    // Solo se puede publicar desde BORRADOR
    if (subasta.getEstado() != EstadoSubasta.BORRADOR) {
        throw new RuntimeException("Solo se puede publicar una subasta en estado BORRADOR");
    }

    // Validar que las fechas sean coherentes
    if (!subasta.getFechaCierre().isAfter(subasta.getFechaInicio())) {
        throw new RuntimeException("La fecha de cierre debe ser posterior a la fecha de inicio");
    }

    cambiarEstado(subasta, EstadoSubasta.PUBLICADA, responsable, "Subasta publicada por el vendedor");

    return subasta;
}
@Scheduled(fixedRate = 60000) // se ejecuta cada 60 segundos
@Transactional
public void procesarTransicionesAutomaticas() {

    Instant ahora = Instant.now();

    // PUBLICADA → ACTIVA: subastas cuya fechaInicio ya pasó
    List<Subasta> paraAbrir = subastaRepository.findAll().stream()
            .filter(s -> s.getEstado() == EstadoSubasta.PUBLICADA)
            .filter(s -> ahora.isAfter(s.getFechaInicio()))
            .toList();

    for (Subasta s : paraAbrir) {
        cambiarEstado(s, EstadoSubasta.ACTIVA, null, "Apertura automática por fecha de inicio");
    }

    // ACTIVA → FINALIZADA o ADJUDICADA: subastas cuya fechaCierre ya pasó
    List<Subasta> paraCerrar = subastaRepository.findAll().stream()
            .filter(s -> s.getEstado() == EstadoSubasta.ACTIVA)
            .filter(s -> ahora.isAfter(s.getFechaCierre()))
            .toList();

    for (Subasta s : paraCerrar) {
        boolean tienePujas = s.getMontoActual() != null;
        EstadoSubasta estadoFinal = tienePujas ? EstadoSubasta.ADJUDICADA : EstadoSubasta.FINALIZADA;
        String motivo = tienePujas ? "Cierre automático con ganador" : "Cierre automático sin pujas";
        cambiarEstado(s, estadoFinal, null, motivo);
    }
}

}