// ./libs/application/src/leads/ports/track-interaction.use-case.port.ts
export interface ITrackInteractionUseCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute(input: { payload: any }): Promise<void>;
}
export const TRACK_INTERACTION_USE_CASE = Symbol('ITrackInteractionUseCase');
// ./libs/application/src/leads/ports/track-interaction.use-case.port.ts
