import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserPayload } from './interfaces/UserPayload.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDto) {
    const userExists = await this.userService.findByEmail(dto.email);

    if (userExists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.userService.createUser(dto.name, dto.email, hash);

    return this.generateToken(user.id, user.email, user.name);
  }

  public async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Não foi encontrado um usuário com esse e-mail');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Senha incorreta');

    return this.generateToken(user.id, user.email, user.name);
  }

  private generateToken(userId: string, email: string, name: string) {
    const payload: UserPayload = { 
      email,
      id: userId,
      name
     };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}