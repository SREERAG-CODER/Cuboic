"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotRuntimeModule = void 0;
const common_1 = require("@nestjs/common");
const robot_runtime_gateway_1 = require("./robot-runtime.gateway");
const robot_runtime_service_1 = require("./robot-runtime.service");
const robots_module_1 = require("../robots/robots.module");
const telemetry_module_1 = require("../telemetry/telemetry.module");
let RobotRuntimeModule = class RobotRuntimeModule {
};
exports.RobotRuntimeModule = RobotRuntimeModule;
exports.RobotRuntimeModule = RobotRuntimeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => robots_module_1.RobotsModule),
            telemetry_module_1.TelemetryModule,
        ],
        providers: [robot_runtime_gateway_1.RobotRuntimeGateway, robot_runtime_service_1.RobotRuntimeService],
        exports: [robot_runtime_service_1.RobotRuntimeService],
    })
], RobotRuntimeModule);
//# sourceMappingURL=robot-runtime.module.js.map