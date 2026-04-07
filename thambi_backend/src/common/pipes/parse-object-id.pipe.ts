import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string> {
    transform(value: string) {
        if (!value || typeof value !== 'string') {
            throw new BadRequestException(`"${value}" is not a valid ID`);
        }
        return value;
    }
}
