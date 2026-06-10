import { Module } from "@nestjs/common";
import { BranchModule } from "./branches/branches.module";
import { OrderExecutionCalculatorModule } from "./execution-calculator/order-execution-calculator.module";
import { SeederModule } from "./seeder/seeder.module";

@Module({
    imports: [
        BranchModule,
        OrderExecutionCalculatorModule,
        SeederModule,
    ],
    exports: [BranchModule],
})
export class CoreModule {}
