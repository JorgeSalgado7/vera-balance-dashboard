export interface IFindUserClinicIdRepository {
  findByUserId(id: string): Promise<string | null>;
}
