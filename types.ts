
export interface Participant {
  id: string;
  name: string;
  spent: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface Summary {
  total: number;
  average: number;
  settlements: Settlement[];
}
