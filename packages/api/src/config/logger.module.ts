import { Module } from "@nestjs/common";
import { utilities as nestWinstonModuleUtilities, WinstonModule } from "nest-winston";
import * as winston from "winston";

const appName = "GetStartedApp";

@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.ms(),
                        nestWinstonModuleUtilities.format.nestLike(appName, {
                            colors: true,
                            prettyPrint: true,
                        }),
                    ),
                }),
            ],
        }),
    ],
})
export class LoggerModule {}
