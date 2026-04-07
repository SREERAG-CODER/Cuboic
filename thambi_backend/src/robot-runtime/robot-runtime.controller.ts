import { Controller } from '@nestjs/common';
import { RobotRuntimeService } from './robot-runtime.service';

@Controller('robot-runtime')
export class RobotRuntimeController {
  constructor(private readonly robotRuntimeService: RobotRuntimeService) {}
}
