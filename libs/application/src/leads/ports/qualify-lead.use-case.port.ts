// ./libs/application/src/leads/ports/qualify-lead.use-case.port.ts
export interface IQualifyLeadUseCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute(input: { payload: any }): Promise<void>;
}
export const QUALIFY_LEAD_USE_CASE = Symbol('IQualifyLeadUseCase');
// ./libs/application/src/leads/ports/qualify-lead.use-case.port.ts
