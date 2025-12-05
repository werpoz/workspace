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
    BadRequestException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/context/identity/application/service/jwt-auth.guard';
import { CreateAuctionDto } from '../dto/CreateAuctionDto';
import { PlaceBidDto } from '../dto/PlaceBidDto';
import { CreateAuctionUseCase } from 'src/context/auction/application/CreateAuctionUseCase';
import { PublishAuctionUseCase } from 'src/context/auction/application/PublishAuctionUseCase';
import { PlaceBidUseCase } from 'src/context/auction/application/PlaceBidUseCase';
import type { AuctionRepository } from 'src/context/auction/domain/interface/AuctionRepository';
import { Inject } from '@nestjs/common';
import { AuctionId } from 'src/context/auction/domain/value-object/AuctionId.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

@ApiTags('auctions')
@Controller('auctions')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuctionController {
    constructor(
        private readonly createAuctionUseCase: CreateAuctionUseCase,
        private readonly publishAuctionUseCase: PublishAuctionUseCase,
        private readonly placeBidUseCase: PlaceBidUseCase,
        @Inject('AuctionRepository')
        private readonly auctionRepository: AuctionRepository,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new auction' })
    @ApiResponse({ status: 201, description: 'Auction created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createAuction(@Body() createAuctionDto: CreateAuctionDto, @Req() req: any) {
        const auctionId = AuctionId.random();
        const endsAt = new Date(createAuctionDto.endsAt);

        await this.createAuctionUseCase.execute({
            id: auctionId.value,
            itemId: createAuctionDto.itemId,
            startingPrice: createAuctionDto.startingPrice,
            endsAt,
        });

        const auction = await this.auctionRepository.searchById(auctionId.value);

        return {
            success: true,
            data: auction?.toPrimitives(),
            message: 'Auction created successfully',
        };
    }

    @Post(':id/publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Publish an auction' })
    @ApiParam({ name: 'id', description: 'Auction ID' })
    @ApiResponse({ status: 200, description: 'Auction published successfully' })
    @ApiResponse({ status: 404, description: 'Auction not found' })
    @ApiResponse({ status: 400, description: 'Auction cannot be published' })
    async publishAuction(@Param('id') id: string) {
        try {
            await this.publishAuctionUseCase.execute({ auctionId: id });

            const auction = await this.auctionRepository.searchById(id);

            return {
                success: true,
                data: auction?.toPrimitives(),
                message: 'Auction published successfully',
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    @Post(':id/bids')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Place a bid on an auction' })
    @ApiParam({ name: 'id', description: 'Auction ID' })
    @ApiResponse({ status: 201, description: 'Bid placed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid bid' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async placeBid(@Param('id') id: string, @Body() placeBidDto: PlaceBidDto, @Req() req: any) {
        const bidderId = new AccountID(req.user.accountId);

        try {
            await this.placeBidUseCase.execute({
                auctionId: id,
                amount: placeBidDto.amount,
                bidderId: bidderId.value,
            });

            const auction = await this.auctionRepository.searchById(id);

            return {
                success: true,
                data: auction?.toPrimitives(),
                message: 'Bid placed successfully',
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get auction by ID' })
    @ApiParam({ name: 'id', description: 'Auction ID' })
    @ApiResponse({ status: 200, description: 'Auction found' })
    @ApiResponse({ status: 404, description: 'Auction not found' })
    async getAuctionById(@Param('id') id: string) {
        const auction = await this.auctionRepository.searchById(id);

        if (!auction) {
            throw new NotFoundException('Auction not found');
        }

        return {
            success: true,
            data: auction.toPrimitives(),
        };
    }
}
