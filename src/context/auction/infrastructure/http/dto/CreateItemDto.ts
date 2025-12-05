import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsEnum, IsOptional, IsUrl } from 'class-validator';

enum ItemCategoryEnum {
    ELECTRONICS = 'electronics',
    FASHION = 'fashion',
    HOME = 'home',
    SPORTS = 'sports',
    ART = 'art',
    COLLECTIBLES = 'collectibles',
    BOOKS = 'books',
    OTHER = 'other',
}

enum ItemConditionEnum {
    NEW = 'new',
    LIKE_NEW = 'like_new',
    GOOD = 'good',
    FAIR = 'fair',
    POOR = 'poor',
}

export class CreateItemDto {
    @ApiProperty({
        example: 'Vintage Camera',
        description: 'Item title',
        minLength: 1,
        maxLength: 200,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    title: string;

    @ApiProperty({
        example: 'A beautiful vintage camera from the 1960s',
        description: 'Item description',
        minLength: 1,
        maxLength: 1000,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 1000)
    description: string;

    @ApiProperty({
        example: 'collectibles',
        description: 'Item category',
        enum: ItemCategoryEnum,
    })
    @IsEnum(ItemCategoryEnum)
    category: string;

    @ApiProperty({
        example: 'good',
        description: 'Item condition',
        enum: ItemConditionEnum,
    })
    @IsEnum(ItemConditionEnum)
    condition: string;

    @ApiProperty({
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        description: 'Item images URLs',
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsUrl({}, { each: true })
    images?: string[];
}
