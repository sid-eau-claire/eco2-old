export type ProductCode = {
  id: number;
  code: string;
  description: string;
  productType: string;
  commission: number;
  promoted: boolean | null;
  carrierId: string;
  active: boolean;
};