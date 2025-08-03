import { User } from '@/domain/entities/order.entities';

export interface IFileParser {
  parseAndNormalize(fileContent: string): User[];
}
