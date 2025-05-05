// ./libs/application/src/index.ts
/**
 * @fileoverview Entry point for application layer (use cases, application services, ports).
 * Exports all public elements required by other layers (e.g., API, Infrastructure for providing implementations).
 * @module @dfs-invest-flow/application
 */

export * from './leads/ports/qualify-lead.use-case.port';
// --- Leads Ports/UseCases ---
export * from './leads/ports/track-interaction.use-case.port';
// Exportar futuros Use Cases reales de Leads aquí
// export * from './leads/use-cases/track-interaction.use-case';
// export * from './leads/use-cases/qualify-lead.use-case';

// --- Assignment Ports/UseCases ---
// Exportar futuros elementos de Assignment aquí
// export * from './assignment/ports/...';
// export * from './assignment/use-cases/...';

// --- Integration Ports/UseCases ---
// Exportar futuros elementos de Integration aquí
// export * from './integration/ports/...';
// export * from './integration/use-cases/...';

// --- Properties Ports/UseCases ---
// Exportar futuros elementos de Properties aquí
// export * from './properties/ports/...';
// export * from './properties/use-cases/...';

// --- Admin Ports/UseCases ---
// Exportar futuros elementos de Admin aquí
// export * from './admin/ports/...';
// export * from './admin/use-cases/...';

// --- Analytics Ports/UseCases ---
// Exportar futuros elementos de Analytics aquí
// export * from './analytics/ports/...';
// export * from './analytics/use-cases/...';

// ./libs/application/src/index.ts
