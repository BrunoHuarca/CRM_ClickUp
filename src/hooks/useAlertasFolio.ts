import { useMemo } from 'react';
import type { Folio } from '../types';
import { DIAS_ALERTA_INACTIVIDAD } from '../constants';

export interface AlertaFolio {
  tipo: 'score_bajo' | 'inactividad';
  mensaje: string;
}

export function useAlertasFolio(folio: Folio): AlertaFolio[] {
  return useMemo(() => {
    const alertas: AlertaFolio[] = [];

    // Alert: Score C
    if (folio.score === 'C') {
      alertas.push({
        tipo: 'score_bajo',
        mensaje: 'Score bajo — Requiere atención',
      });
    }

    // Alert: Inactivity
    const ahora = new Date();
    const actividades = folio.actividades || [];
    let ultimaFecha: Date;

    if (actividades.length > 0) {
      const fechas = actividades.map((a) => new Date(a.fecha).getTime());
      ultimaFecha = new Date(Math.max(...fechas));
    } else {
      ultimaFecha = new Date(folio.fechaCreacion);
    }

    const diasSinActividad = Math.floor(
      (ahora.getTime() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasSinActividad >= DIAS_ALERTA_INACTIVIDAD) {
      alertas.push({
        tipo: 'inactividad',
        mensaje: `${diasSinActividad} días sin actividad`,
      });
    }

    return alertas;
  }, [folio]);
}
