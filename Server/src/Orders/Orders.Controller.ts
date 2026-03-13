import { Controller } from "@nestjs/common";
import { OrdersService } from "./Orders.Service";

@Controller('orders')
export class OrdersController {
    constructor(private readonly orderService: OrdersService) {}
}