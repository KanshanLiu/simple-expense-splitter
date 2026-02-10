
import { Participant, Settlement, Summary } from '../types';

export const calculateSummary = (participants: Participant[]): Summary => {
  const total = participants.reduce((sum, p) => sum + p.spent, 0);
  const count = participants.length;
  const average = count > 0 ? total / count : 0;

  // Calculate net balances: spent - share
  const balances = participants.map(p => ({
    name: p.name,
    balance: p.spent - average
  }));

  const creditors = balances
    .filter(b => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);
    
  const debtors = balances
    .filter(b => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);

  const settlements: Settlement[] = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    if (amount > 0.001) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(amount.toFixed(2))
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return {
    total,
    average,
    settlements
  };
};
