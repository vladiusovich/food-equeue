import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { SeederService } from "./modules/infrastructure/seeder/seeder.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const seederService = app.get(SeederService);
    const configService = app.get(ConfigService);

    const isDevelopment = configService.get<boolean>("IS_DEV", false);

    if (isDevelopment) {
        await seederService.seed();
    }

    const port = configService.get<number>("port", 3000);

    app.enableCors();

    await app.listen(port);

    console.log(`Application (${isDevelopment ? "development" : "production"} mode) is running on: ${await app.getUrl()}`);
}

bootstrap();
