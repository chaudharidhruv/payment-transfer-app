import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.get('/', async (req, res) => {
    try {
        const email = req.query.email; // Get email from query string
        if (!email) {
            return res.status(400).json({ error: "Email query parameter is required" });
        }

        // Fetch transactions where type_transaction equals 'send' and either sender_id or recipient_id equals the provided email
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('type_transaction', 'send')
            .or(`sender_id.eq.${email},recipient_id.eq.${email}`)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return res.status(200).json({ transactions: data });
    } catch (error) {
        console.error("Transactions Error:", error);
        return res.status(500).json({ error: error.message || "An unknown error occurred" });
    }
});

export default router;
