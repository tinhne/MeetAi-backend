import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.name,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
