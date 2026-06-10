import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerModule } from "./config/logger.module";
import { SqLiteDbModule } from "./config/db.module";
import envValidationScheme from "./config/envValidationScheme";
import { ClientModule } from "./modules/client/client.module";
import { StaffModule } from "./modules/staff/staff.module";
import { CoreModule } from "./modules/core/core.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ".env",
            isGlobal: true,
            validationSchema: envValidationScheme,
        }),
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
        SqLiteDbModule,
        LoggerModule,
        CoreModule,
        ClientModule,
        StaffModule,
    ],
})
export class AppModule {}
