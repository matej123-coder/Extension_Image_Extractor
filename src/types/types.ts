export interface ExtractedImage{
   
    bitmap: ImageBitmap;
    width: number;
    height: number;
}
export interface Images{
    image: Promise<Blob>;
    imageType: ImageFormat;
    width:number;
    height: number;
    pageNumber: number;
}
export type ImageFormat = 'png' | 'jpg' | 'webp' | 'jpeg';