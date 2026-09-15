export interface IDeleteClinicRepository {
  delete(clinicId: string): Promise<void>;
}