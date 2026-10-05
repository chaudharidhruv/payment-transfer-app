import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.get('/', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ error: 'Email query parameter is required' });
        }

        // Fetch only request‐type transactions where recipient_id matches the user
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('type_transaction', 'request')
            .eq('recipient_id', email)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ requests: data });
    } catch (err) {
        console.error("Requests Error:", err);
        return res.status(500).json({ error: err.message || 'Unknown error' });
    }
});

export default router;
