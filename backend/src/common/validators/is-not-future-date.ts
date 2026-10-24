import { registerDecorator, ValidationOptions } from 'class-validator';
import { appConfig } from '../../config';
import { isCalendarDate, todayIn } from '../utils/date';

/** Valid YYYY-MM-DD calendar date that is not after today in the app time zone. */
export function IsNotFutureDate(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isNotFutureDate',
      target: target.constructor,
      propertyName: propertyName as string,
      options: {
        message: `${String(propertyName)} must be a YYYY-MM-DD date not in the future`,
        ...options,
      },
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' &&
            isCalendarDate(value) &&
            value <= todayIn(appConfig.timeZone)
          );
        },
      },
    });
  };
}
