package com.subastas.subastas_api.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PujaPublicaDTO(
    Long id,
    BigDecimal monto,
    Instant fecha
) {}

