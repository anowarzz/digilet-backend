import { Router } from "express";

const router = Router() ;

//  user actions route
router.post("/add-money", transactionControllers.addMoney);
router.post("/withdraw", transactionControllers.withdrawMoney);
router.post("/send-money", transactionControllers.sendMoney);

// agent actions Router
router.post("/cash-in", transactionControllers.cashIn);
router.post("/cash-out", transactionControllers.cashOut);


// transaction history
router.get("/history", transactionControllers.getTransactionHistory);



export const TransactionRoutes = router;