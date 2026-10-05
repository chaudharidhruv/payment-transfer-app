// import express from 'express';
// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';

// dotenv.config();

// const router = express.Router();
// const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_ANON_KEY
// );

// const PROFILE_TABLE = 'profiles';
// const BALANCECHART_TABLE = 'balancechart';

// // GET /api/balance?email=user@domain.com
// router.get('/', async (req, res) => {
//     try {
//         const email = req.query.email;
//         if (!email || Array.isArray(email)) {
//             return res
//                 .status(400)
//                 .json({ error: 'A single email query parameter is required' });
//         }

//         // 1) Try to fetch existing balance
//         const { data, error: fetchError } = await supabase
//             .from(PROFILE_TABLE)
//             .select('balance')
//             .eq('email', email)
//             .single();

//         if (fetchError) {
//             // 2) No profile yet → seed with $500
//             const { data: inserted, error: insertError } = await supabase
//                 .from(PROFILE_TABLE)
//                 .insert({ email, balance: 500 })
//                 .single();

//             if (insertError) throw insertError;

//             // ✅ Log initial balance to balancechart
//             const { error: chartInsertError } = await supabase
//                 .from(BALANCECHART_TABLE)
//                 .insert({
//                     email,
//                     balance: 500,
//                     updated_at: new Date().toISOString(),
//                 });

//             if (chartInsertError) {
//                 console.error('Balancechart insert error on GET:', chartInsertError);
//             }

//             return res.status(200).json({ balance: inserted.balance });
//         }

//         // 3) Found an existing row → return its balance
//         return res.status(200).json({ balance: data.balance || 0 });
//     } catch (err) {
//         console.error('Balance GET Error:', err);
//         return res
//             .status(500)
//             .json({ error: err.message || 'An unknown error occurred' });
//     }
// });

// // POST /api/balance
// // Body: { email: string, amount: number }
// router.post('/', async (req, res) => {
//     try {
//         const { email, amount } = req.body;
//         if (!email || typeof amount !== 'number') {
//             return res
//                 .status(400)
//                 .json({ error: 'Both email and numeric amount are required' });
//         }

//         // 1) Fetch existing balance
//         const { data: existing, error: fetchError } = await supabase
//             .from(PROFILE_TABLE)
//             .select('balance')
//             .eq('email', email)
//             .single();

//         let newBalance = amount;
//         if (!fetchError && existing) {
//             newBalance = (existing.balance || 0) + amount;
//         }

//         // 2) Upsert new balance
//         const { data, error: upsertError } = await supabase
//             .from(PROFILE_TABLE)
//             .upsert(
//                 { email, balance: newBalance },
//                 { onConflict: ['email'] }
//             )
//             .select('balance')
//             .single();

//         if (upsertError) throw upsertError;
//         if (!data) throw new Error('Upsert succeeded but returned no data');

//         // ✅ Log new balance to balancechart
//         const { error: chartInsertError } = await supabase
//             .from(BALANCECHART_TABLE)
//             .insert({
//                 email,
//                 balance: newBalance,
//                 updated_at: new Date().toISOString(),
//             });

//         if (chartInsertError) {
//             console.error('Balancechart insert error on POST:', chartInsertError);
//         }

//         // 3) Respond with updated balance
//         return res.status(200).json({ balance: data.balance });
//     } catch (err) {
//         console.error('Balance POST Error:', err);
//         return res
//             .status(500)
//             .json({ error: err.message || 'An unknown error occurred' });
//     }
// });

// export default router;
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const PROFILE_TABLE = 'profiles';
const BALANCECHART_TABLE = 'balancechart';

// GET /api/balance?email=user@domain.com
router.get('/', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email || Array.isArray(email)) {
            return res
                .status(400)
                .json({ error: 'A single email query parameter is required' });
        }

        // 1) Try to fetch existing balance
        const { data, error: fetchError } = await supabase
            .from(PROFILE_TABLE)
            .select('balance')
            .eq('email', email)
            .single();

        if (fetchError) {
            // 2) No profile yet → seed with $500
            const { data: inserted, error: insertError } = await supabase
                .from(PROFILE_TABLE)
                .insert({ email, balance: 500 })
                .single();

            if (insertError) throw insertError;

            // ✅ Log initial balance to balancechart
            const { error: chartInsertError } = await supabase
                .from(BALANCECHART_TABLE)
                .insert({
                    email,
                    balance: 500,
                    updated_at: new Date().toISOString(),
                });

            if (chartInsertError) {
                console.error('Balancechart insert error on GET:', chartInsertError);
            }

            return res.status(200).json({ balance: inserted.balance });
        }

        // 3) Found an existing row → return its balance
        return res.status(200).json({ balance: data.balance || 0 });
    } catch (err) {
        console.error('Balance GET Error:', err);
        return res
            .status(500)
            .json({ error: err.message || 'An unknown error occurred' });
    }
});

// POST /api/balance
// Body: { email: string, amount: number }
router.post('/', async (req, res) => {
    try {
        const { email, amount } = req.body;
        if (!email || typeof amount !== 'number') {
            return res
                .status(400)
                .json({ error: 'Both email and numeric amount are required' });
        }

        // 1) Fetch existing balance
        const { data: existing, error: fetchError } = await supabase
            .from(PROFILE_TABLE)
            .select('balance')
            .eq('email', email)
            .single();

        if (fetchError) throw fetchError; // Ensure you handle errors during fetch

        let newBalance = amount;
        if (existing) {
            newBalance = (existing.balance || 0) + amount;
        }

        // 2) Insert the old balance into the balancechart before updating
        const { error: oldBalanceInsertError } = await supabase
            .from(BALANCECHART_TABLE)
            .insert({
                email,
                balance: existing.balance, // Old balance before the update
                updated_at: new Date().toISOString(),
            });

        if (oldBalanceInsertError) {
            console.error('Error inserting previous balance into balancechart:', oldBalanceInsertError);
            throw oldBalanceInsertError;
        }

        // 3) Upsert new balance in the profiles table
        const { data, error: upsertError } = await supabase
            .from(PROFILE_TABLE)
            .upsert(
                { email, balance: newBalance },
                { onConflict: ['email'] }
            )
            .select('balance')
            .single();

        if (upsertError) throw upsertError;
        if (!data) throw new Error('Upsert succeeded but returned no data');

        // 4) Log new balance to balancechart
        const { error: newBalanceInsertError } = await supabase
            .from(BALANCECHART_TABLE)
            .insert({
                email,
                balance: newBalance,
                updated_at: new Date().toISOString(),
            });

        if (newBalanceInsertError) {
            console.error('Error inserting new balance into balancechart:', newBalanceInsertError);
            throw newBalanceInsertError;
        }

        // 5) Respond with updated balance
        return res.status(200).json({ balance: data.balance });
    } catch (err) {
        console.error('Balance POST Error:', err);
        return res
            .status(500)
            .json({ error: err.message || 'An unknown error occurred' });
    }
});

export default router;
