# 💰 Expense Settler

A modern expense-splitting web application that helps groups of friends or colleagues track shared expenses and settle debts efficiently.

## 🚀 Features

- Add and manage group members
- Track shared expenses
- Automatically calculate who owes whom
- Settle debts with minimal transactions
- Premium UI with dark mode & animations

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Data | JSON file-based storage |

## 📦 Project Structure

```
expense-settler/
├── frontend/        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
├── backend/         # Express API server
│   ├── routes/
│   ├── data/
│   ├── server.js
│   └── package.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/expense-settler.git
cd expense-settler
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env   # configure your environment
npm run dev
```
Backend runs on **http://localhost:5000**

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members |
| POST | `/api/members` | Add a member |
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add an expense |
| GET | `/api/debts` | Get debt settlements |

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
