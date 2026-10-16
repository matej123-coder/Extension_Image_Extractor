import type { ImageRect } from "../pdf/getImageCoordinates";

export interface ExtractedImage{
   
    bitmap: ImageBitmap;
    width: number;
    height: number;
}
export interface Images{
    image: Blob;
    imageType: ImageFormat;
    imageUrl: string;
    width:number;
    height: number;
    pageNumber: number;
    position?:ImageRect;
}
export type ImageFormat = 'png' | 'jpg' | 'webp' | 'jpeg';

export interface ImageDimensions{
    width: number;
    height: number;
}