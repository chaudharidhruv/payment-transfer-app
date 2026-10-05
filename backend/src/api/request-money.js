import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post('/', async (req, res) => {
    try {
        const { amount, sender, recipient, description } = req.body;

        if (!amount || !sender || !recipient) {
            return res.status(400).json({ error: 'Missing required fields: amount, sender, and recipient are required' });
        }

        // Use provided description or fallback to a default one
        const finalDescription = description || `Payment request for $${amount} from ${sender} to ${recipient}`;

        // Insert the request into the transactions table with a valid status ("pending")
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                amount,
                sender_id: sender,
                recipient_id: recipient,
                status: 'pending',            // Changed from "requested" to "pending"
                description: finalDescription,
                type_transaction: 'request'
            }])
            .select(); // Return the inserted record

        if (error) {
            throw new Error(error.message);
        }

        return res.status(201).json({ message: `Request sent from ${sender} to ${recipient}`, request: data[0] });
    } catch (error) {
        console.error("Request Money Error:", error);
        return res.status(500).json({ error: error.message || "An unknown error occurred" });
    }
});

export default router;
