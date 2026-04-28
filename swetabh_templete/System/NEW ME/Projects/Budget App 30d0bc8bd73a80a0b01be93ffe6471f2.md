# Budget App

Owner: Vinayak Yadav

### Income and Expense

1. easy expense tracker 
- Category (need, fun etc)
- amount
- account (kotak,slice,cash)
- virtual account (fun,parent,main etc)
- recurring/one time
1. Mapping virtual accounts with real accounts
2. automatic budget allocation to other stuff based on income and expense

| Field | Purpose |
| --- | --- |
| **Amount** | Required. Positive for income, negative for expense (or separate type field). |
| **Date** | Default to today, but editable. |
| **Type** | Income or Expense. |
| **Category** | e.g., Food, Rent, Salary, Gift. Helps with reports. |
| **Real Account** | The bank, card, or cash you used/received. |
| **Virtual Account** | The budget bucket this belongs to (optional? — but core to your system, so probably required). |
| **Description / Note** | Optional text for extra context. |
| **Recurring?** | Yes/No. If yes, you can later add frequency (weekly, monthly). |

**Virtual Accounts**

Virtual accounts are user-defined budget buckets (e.g., “Fun”, “Rent”, “Savings”) that are **not tied to real bank accounts**. Their balances come solely from transactions:

- **Income** assigned to a virtual account increases its balance.
- **Expenses** assigned to a virtual account decrease its balance.

Every transaction must specify **both** a real account (where money physically is) and a virtual account (what it’s for).

**Allocation rules** (optional) automate splitting income from real accounts into virtual buckets.

**Data fields:**

- `name`
- `current_balance` (computed from transactions)

Overspending can be allowed (negative balance) or restricted.

### Dashboard

1. All accounts
2. Virtual Accounts
3. Investments
4. Net Worth

### Message parser

1. if possible directly attach to my banks
2. transaction to my app transaction mapping

### Investment

1. Investment entries (possible automated)
2. interest calculator for my investments
3. Option for generic investment account like wint wealth
4. from excel to transaction for funds