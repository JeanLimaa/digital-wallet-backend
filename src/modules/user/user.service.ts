import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(name: string, email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { name, email, passwordHash },
    });
  }

  async findByEmail(email: string) {
    const user = this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findById(id: string) {
    const user = this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  public async getProfile(userId: string) {
    const user = await this.findById(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  public async getProfileByEmail(email: string) {
    const user = await this.findByEmail(email);

    return {
      name: user.name,
      email: user.email,
    };
  }

  public async getBalance(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.id !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso');	
    }

    return {
      balance: user.balance,
    };
  }
}
