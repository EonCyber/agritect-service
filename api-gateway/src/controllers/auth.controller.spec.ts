import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { LoginRequestDto } from '../auth/dto/login-request.dto';
import { LogoutResponseDto } from '../auth/dto/logout-response.dto';
import { SignUpRequestDto } from '../auth/dto/sign-up-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthController } from './auth.controller';

const mockAuthResponse: AuthResponseDto = {
  accessToken: 'token.jwt',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: { id: 'uuid-1', email: 'a@b.com', username: 'alice', roles: ['user'] },
};

const mockAuthService = {
  signUp: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  validate: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp()', () => {
    const dto: SignUpRequestDto = { username: 'alice', email: 'a@b.com', password: 'pass1234' };

    it('calls AuthService.signUp with correct args and returns result', async () => {
      mockAuthService.signUp.mockResolvedValue(mockAuthResponse);

      const result = await controller.signUp(dto);

      expect(mockAuthService.signUp).toHaveBeenCalledTimes(1);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(dto.username, dto.email, dto.password);
      expect(result).toEqual(mockAuthResponse);
    });

    it('propagates ConflictException when email is already in use', async () => {
      mockAuthService.signUp.mockRejectedValue(new ConflictException('Email already in use'));

      await expect(controller.signUp(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login()', () => {
    const dto: LoginRequestDto = { email: 'a@b.com', password: 'pass1234' };

    it('calls AuthService.login with correct args and returns token', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(mockAuthResponse);
    });

    it('propagates UnauthorizedException on invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout()', () => {
    it('calls AuthService.logout and returns result', () => {
      const response: LogoutResponseDto = { message: 'Logged out successfully' };
      mockAuthService.logout.mockReturnValue(response);

      const result = controller.logout();

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });
  });

  describe('me()', () => {
    it('returns user from request principal', () => {
      const req = { user: { userId: 'uuid-1', email: 'a@b.com', roles: ['user'] } };

      const result = controller.me(req);

      expect(result).toEqual(req.user);
    });
  });
});
