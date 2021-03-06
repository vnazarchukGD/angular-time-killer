export interface Product {
  id?: number;
  name: string;
  description: string;
  picture: string;
  counts?: {
    location: string;
    quantityAvailable: number;
    price: number;
  }[];
}
