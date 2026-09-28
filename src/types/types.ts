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
}
export type ImageFormat = 'png' | 'jpg' | 'webp' | 'jpeg';