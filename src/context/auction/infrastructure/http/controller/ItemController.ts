import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    NotFoundException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/context/identity/application/service/jwt-auth.guard';
import { CreateItemDto } from '../dto/CreateItemDto';
import { CreateItemUseCase } from 'src/context/auction/application/CreateItemUseCase';
import type { ItemRepository } from 'src/context/auction/domain/interface/ItemRepository';
import { Inject } from '@nestjs/common';
import { ItemId } from 'src/context/auction/domain/value-object/ItemId.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

@ApiTags('items')
@Controller('items')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ItemController {
    constructor(
        private readonly createItemUseCase: CreateItemUseCase,
        @Inject('ItemRepository')
        private readonly itemRepository: ItemRepository,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new item' })
    @ApiResponse({ status: 201, description: 'Item created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createItem(@Body() createItemDto: CreateItemDto, @Req() req: any) {
        const ownerId = new AccountID(req.user.accountId);
        const itemId = ItemId.random();

        await this.createItemUseCase.execute({
            id: itemId.value,
            title: createItemDto.title,
            description: createItemDto.description,
            category: createItemDto.category,
            condition: createItemDto.condition,
            ownerId: ownerId.value,
            images: createItemDto.images || [],
        });

        const item = await this.itemRepository.searchById(itemId.value);

        return {
            success: true,
            data: item?.toPrimitives(),
            message: 'Item created successfully',
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get item by ID' })
    @ApiParam({ name: 'id', description: 'Item ID' })
    @ApiResponse({ status: 200, description: 'Item found' })
    @ApiResponse({ status: 404, description: 'Item not found' })
    async getItemById(@Param('id') id: string) {
        const item = await this.itemRepository.searchById(id);

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        return {
            success: true,
            data: item.toPrimitives(),
        };
    }

    @Get('owner/:ownerId')
    @ApiOperation({ summary: 'Get items by owner ID' })
    @ApiParam({ name: 'ownerId', description: 'Owner ID' })
    @ApiResponse({ status: 200, description: 'Items retrieved' })
    async getItemsByOwner(@Param('ownerId') ownerId: string) {
        const items = await this.itemRepository.findByOwnerId(ownerId);

        return {
            success: true,
            data: items.map(item => item.toPrimitives()),
        };
    }
}
