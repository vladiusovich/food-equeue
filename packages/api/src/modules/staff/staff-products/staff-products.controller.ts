import { Body, Controller, Delete, Get, Inject, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { StaffProductsService } from './staff-products.service';
import CreateProductRequest from './models/requests/create-product.request';
import FindProductRequest from './models/requests/find-product.request';
import UpdateProductRequest from './models/requests/update-product.request';

@Controller('staff')
export class StaffProductsController {
    constructor(
        private readonly staffProductService: StaffProductsService,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger) { }


    @Get('/products')
    async find(@Query() request: FindProductRequest) {
        return await this.staffProductService.find(request);
    }

    @Post('/products')
    async create(@Body() product: CreateProductRequest) {
        return this.staffProductService.create(product);
    }

    @Put('/products')
    async update(@Body() order: UpdateProductRequest) {
        return await this.staffProductService.update(order);
    }

    @Delete('/products')
    async delete(@Query("id", ParseIntPipe) id: number) {
        return await this.staffProductService.delete(id);
    }
}
