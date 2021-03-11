export interface Product {
    id: number,
    title: string,
    price: number,
    image_url: string,
    cartQuantity?: number;
}

export interface ProductsResponse {
    products: Product[]
}

export interface CurrenciesReponse {
    currency: string[]
}