import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.get('/', async (req, res) => {
  try {
    const email = req.query.email; // or use `user_id` if your table uses UUIDs

    if (!email) {
      return res.status(400).json({ error: "Email query parameter is required" });
    }

    // Fetch balance history for this email, ordered by date
    const { data, error } = await supabase
      .from('balancechart')
      .select('updated_at, balance')  // Adjust field names if different
      .eq('email', email)
      .order('updated_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ balanceHistory: data });
  } catch (error) {
    console.error("Balance Chart Error:", error);
    return res.status(500).json({ error: error.message || "An unknown error occurred" });
  }
});

export default router;
