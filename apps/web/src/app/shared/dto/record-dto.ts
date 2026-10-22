import { CategoryDto } from './category-dto';

export class RecordDto {
  RecordID!: number;
  Title!: string;
  Username!: string;
  Password!: string;
  EncryptedPassword!: string;
  URL!: string;
  Notes!: string;
  CategoryID!: number;
  Category!: CategoryDto;
}
