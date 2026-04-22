import { ApiProperty } from '@nestjs/swagger';

export class CreateUserPayloadDto {
  @ApiProperty({ description: 'Nome de usuário (mínimo 3 caracteres)' })
  username!: string;

  @ApiProperty({ description: 'Endereço de e-mail único do usuário' })
  email!: string;

  @ApiProperty({ description: 'Senha do usuário em texto claro (mínimo 6 caracteres)' })
  password!: string;

  @ApiProperty({
    description: 'Papéis atribuídos ao usuário',
    type: [String],
    enum: ['admin', 'user'],
    default: ['user'],
    required: false,
  })
  roles?: string[];
}

export class UpdateUserPayloadDto {
  @ApiProperty({ description: 'UUID do usuário' })
  id!: string;

  @ApiProperty({ description: 'Novo nome de usuário' })
  username!: string;

  @ApiProperty({ description: 'Indica se o usuário está ativo' })
  active!: boolean;

  @ApiProperty({ description: 'Papéis do usuário', type: [String] })
  roles!: string[];
}

export class GetUserByIdPayloadDto {
  @ApiProperty({ description: 'UUID do usuário' })
  id!: string;
}

export class GetUserByEmailPayloadDto {
  @ApiProperty({ description: 'E-mail do usuário' })
  email!: string;
}

export class ValidateUserPayloadDto {
  @ApiProperty({ description: 'E-mail do usuário a ser validado' })
  email!: string;

  @ApiProperty({ description: 'Senha do usuário em texto claro' })
  password!: string;
}

export class EmptyPayloadDto {}
