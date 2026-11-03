/**
 * Data transfer object for a stored record or row entry.
 */
import { CategoryDto } from './category-dto';

/**
 * Represents a single vault record, including the encrypted password payload.
 */
export class RecordDto {
  RecordID!: number;
  Title!: string;
  Username!: string;
  Password!: string;
  EncryptedPassword!: string;
  URL!: string;
  Notes!: string;
  CategoryID!: string;
  Category!: CategoryDto;
}
