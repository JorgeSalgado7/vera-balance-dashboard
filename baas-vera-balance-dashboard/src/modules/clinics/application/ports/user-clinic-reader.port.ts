export interface UserClinicReaderPort {
  getClinicIdByUserId(userId: string): Promise<string | null>;
}