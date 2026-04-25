import type { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { type EntityManager } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { LedgerTransaction, TransactionType, TransactionStatus } from '../entities/LedgerTransaction.js';
import { User } from '../entities/User.js';
import { WithdrawalRequest, WithdrawalStatus } from '../entities/WithdrawalRequest.js';

const getRazorpayInstance = () => new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKey123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mockSecret123',
});

// Create Order for Buying Credits
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { amount, credits } = req.body;

        if (!amount || !credits) {
            res.status(400).json({ message: 'Amount and credits required' });
            return;
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        const existingUser = await AppDataSource.getRepository(User).findOneBy({ id: userId });
        if (!existingUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options);

        const transactionRepo = AppDataSource.getRepository(LedgerTransaction);
        const transaction = transactionRepo.create({
            user: existingUser,
            amount: credits,
            type: TransactionType.PURCHASE_CREDITS,
            status: TransactionStatus.PENDING,
            referenceId: order.id,
            balanceSnapshot: existingUser.credits
        });
        await transactionRepo.save(transaction);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error: any) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
};

// Verify Payment Signature
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mockSecret123';
        const expectedSignature = crypto.createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');
        
        console.log(`[verifyPayment] Order: ${razorpay_order_id}, Secret length: ${secret.length}, Expected: ${expectedSignature}, Received: ${razorpay_signature}`);

        const transactionRepo = AppDataSource.getRepository(LedgerTransaction);
        const userRepo = AppDataSource.getRepository(User);

        // Run within a transaction to maintain atomic safety
        await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
            const transaction = await transactionalEntityManager.findOne(LedgerTransaction, {
                where: { referenceId: razorpay_order_id },
                relations: ['user']
            });

            if (!transaction) {
                throw new Error("Transaction not found");
            }

            if (expectedSignature === razorpay_signature) {
                if (transaction.status === TransactionStatus.COMPLETED) {
                    res.json({ success: true, message: 'Payment already verified' });
                    return;
                }

                transaction.user.credits += transaction.amount;
                transaction.balanceSnapshot = transaction.user.credits;
                transaction.status = TransactionStatus.COMPLETED;

                await transactionalEntityManager.save(transaction.user);
                await transactionalEntityManager.save(transaction);

                res.json({ success: true, credits: transaction.user.credits });
            } else {
                transaction.status = TransactionStatus.FAILED;
                await transactionalEntityManager.save(transaction);
                res.status(400).json({ success: false, message: 'Invalid signature' });
            }
        });

    } catch (error: any) {
        console.error("Razorpay Verification Error:", error);
        res.status(500).json({ message: 'Failed to verify payment', error: error.message });
    }
};

// Initiate Withdrawal
export const requestWithdrawal = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { amount, upiVpa } = req.body;

        if (!amount || amount <= 0 || !upiVpa) {
            res.status(400).json({ message: 'Valid amount and UPI VPA required' });
            return;
        }

        // Basic format verification for VPA
        if (!upiVpa.includes('@')) {
            res.status(400).json({ message: 'Invalid UPI format' });
            return;
        }

        await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
            const user = await transactionalEntityManager.findOneBy(User, { id: userId });
            if (!user) throw new Error("User not found");

            if (user.credits < amount) {
                res.status(400).json({ message: 'Insufficient credits for withdrawal' });
                return;
            }

            // Deduct the credits immediately to prevent double spending
            user.credits -= amount;
            await transactionalEntityManager.save(user);

            // Record Ledger entry for deduction
            const transaction = transactionalEntityManager.create(LedgerTransaction, {
                user: user,
                amount: -Math.abs(amount), // Negative amount
                type: TransactionType.WITHDRAWAL,
                status: TransactionStatus.PENDING,
                balanceSnapshot: user.credits
            });
            await transactionalEntityManager.save(transaction);

            // Record Withdrawal Request for admin
            const request = transactionalEntityManager.create(WithdrawalRequest, {
                user: user,
                amount: amount,
                upiVpa: upiVpa,
                status: WithdrawalStatus.PENDING
            });
            const savedRequest = await transactionalEntityManager.save(request);

            // Update the transaction reference to point to withdrawal request ID
            transaction.referenceId = savedRequest.id;
            await transactionalEntityManager.save(transaction);

            res.json({ success: true, message: 'Withdrawal request created successfully' });
        });

    } catch (error: any) {
        console.error("Withdrawal Request Error:", error);
        res.status(500).json({ message: 'Failed to process withdrawal request', error: error.message });
    }
};

export const getLedger = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;

        const transactionRepo = AppDataSource.getRepository(LedgerTransaction);
        const transactions = await transactionRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' }
        });
        console.log(`[getLedger] UserId: ${userId}, Transactions Found: ${transactions.length}`);

        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch ledger history' });
    }
}
