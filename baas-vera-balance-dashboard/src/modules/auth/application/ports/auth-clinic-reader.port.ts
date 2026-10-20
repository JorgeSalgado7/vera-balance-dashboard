export interface AuthClinicReaderPort {
  isActive(clinicId: string): Promise<boolean>;
}
