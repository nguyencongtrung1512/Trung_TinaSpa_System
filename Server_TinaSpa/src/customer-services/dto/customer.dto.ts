import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import { PHONE_PATTERN } from '../customer-services.constants.js';

const StripSpaces = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replaceAll(/\s/g, '') : value,
  );

export class LookupCustomerQueryDto {
  @StripSpaces()
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'phone is not a valid phone number' })
  phone: string;
}

export class CreateCustomerDto {
  @StripSpaces()
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'phone is not a valid phone number' })
  phone: string;

  @Trim()
  @IsString()
  @Length(2, 100)
  fullName: string;
}
