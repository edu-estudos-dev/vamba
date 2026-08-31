export type TravelCategory =
  | 'Comer'
  | 'Conhecer'
  | 'Passear'
  | 'Praia'
  | 'Compras'
  | 'Vida noturna'
  | 'Surpreenda-me';

export type TravelIntent = {
  category: TravelCategory;
  prompt?: string;
};
