import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateAuctionDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Item ID to auction',
    })
    @IsUUID()
    itemId: string;

    @ApiProperty({
        example: 100,
        description: 'Starting price for the auction',
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    startingPrice: number;

    @ApiProperty({
        example: '2024-12-31T23:59:59Z',
        description: 'Auction end date and time',
    })
    @IsDateString()
    endsAt: string;
}
