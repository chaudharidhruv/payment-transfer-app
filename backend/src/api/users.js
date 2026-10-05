import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// GET /api/users?search=foo
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        if (!search || Array.isArray(search)) {
            return res.json([]);
        }

        // match on email only, case-insensitive, limit 8
        const { data, error } = await supabase
            .from('profiles')
            .select('email')
            .ilike('email', `%${search}%`)
            .limit(8);

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        console.error('Users search error:', err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
