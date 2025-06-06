import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "src/common/decorators/GetUser.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('profile/:email')
    getProfile(
        @Param('email') email: string,
    ) {
        return this.userService.getProfileByEmail(email);
    }

    @Get('profile/me')
    getMyProfile(
        @GetUser('id') userId: string,
    ) {
        return this.userService.getProfile(userId);
    }

    @Get('balance')
    getBalance(
        @GetUser('id') userId: string,
    ) {
        return this.userService.getBalance(userId);
    }
}