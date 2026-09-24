export interface ClinicReaderPort {
  requireExisting(id: string): Promise<void>;
}
