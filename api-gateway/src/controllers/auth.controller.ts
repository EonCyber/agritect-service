import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { LoginRequestDto } from '../auth/dto/login-request.dto';
import { LogoutResponseDto } from '../auth/dto/logout-response.dto';
import { SignUpRequestDto } from '../auth/dto/sign-up-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignUpRequestDto })
  @ApiResponse({ status: 201, description: 'User created', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  signUp(@Body() dto: SignUpRequestDto): Promise<AuthResponseDto> {
    return this.authService.signUp(dto.username, dto.email, dto.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive JWT' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (invalidates client token)' })
  @ApiResponse({ status: 200, description: 'Logged out', type: LogoutResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(): LogoutResponseDto {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return authenticated user principal' })
  @ApiResponse({ status: 200, description: 'Authenticated user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@Request() req: { user: { userId: string; email: string; roles: string[] } }) {
    return req.user;
  }
}
