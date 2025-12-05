import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class PlaceBidDto {
    @ApiProperty({
        example: 150,
        description: 'Bid amount',
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    amount: number;
}
