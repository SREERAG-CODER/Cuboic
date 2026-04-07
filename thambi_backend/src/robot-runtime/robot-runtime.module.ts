import { Module, forwardRef } from '@nestjs/common';
import { RobotRuntimeGateway } from './robot-runtime.gateway';
import { RobotRuntimeService } from './robot-runtime.service';
import { RobotsModule } from '../robots/robots.module';
import { TelemetryModule } from '../telemetry/telemetry.module';

@Module({
  imports: [
    forwardRef(() => RobotsModule),
    TelemetryModule, // 🔥 ADD THIS
  ],
  providers: [RobotRuntimeGateway, RobotRuntimeService],
  exports: [RobotRuntimeService],
})
export class RobotRuntimeModule { }