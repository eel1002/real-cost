export interface Navigate {
    title: string;
    link: string;
}

export interface BcSuggestion {
    slug: string;
    name: string;
}

export type Market =
    | 'tiki'
    | 'tiki-shopee'
    | 'tiki-lazada'
    | 'shopee'
    | 'shopee-tiki'
    | 'shopee-lazada'
    | 'lazada'
    | 'lazada-tiki'
    | 'lazada-shopee'
    | 'all';

export interface SearchResult {
    name: string;
    img: string;
    price: string;
    totalSales: string;
    link: string;
    market: Market;

    priceBeforeDiscount?: number;
    discountPercent?: number;
    qtyRemainPercent?: number;
    product_base_id?: string;
}

export interface ItemsWithKeyword {
    keyword: string;
    items: SearchResult[];
}

export interface ItemHistory {
    price: number[];
    priceTs: number[];
}

export interface Product
    extends Pick<SearchResult, 'name' | 'price' | 'totalSales' | 'market'> {
    brand: string;
    description: string;
    images: string[];
    priceBeforeDiscount?: string | null;
    product_base_id?: string;
}
