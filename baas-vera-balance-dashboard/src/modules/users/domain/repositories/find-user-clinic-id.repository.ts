export interface IFindUserClinicIdRepository {
  findClinicIdByUserId(userId: string): Promise<string | null>;
}
