// import express from 'express';
// import Stripe from 'stripe';
// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';

// dotenv.config();

// const router = express.Router();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//     apiVersion: '2025-03-31.basil',
// });

// const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_ANON_KEY
// );

// const PROFILE_TABLE = 'profiles';
// const BALANCECHART_TABLE = 'balancechart';

// router.post('/', async (req, res) => {
//     try {
//         const { splits, description, sender, currency } = req.body;

//         if (!Array.isArray(splits) || splits.length === 0) {
//             return res.status(400).json({ error: 'At least one split is required' });
//         }

//         if (!sender || !currency) {
//             return res
//                 .status(400)
//                 .json({ error: 'Missing required fields: sender and currency' });
//         }

//         // Calculate total amount
//         let totalAmount = 0;
//         for (const s of splits) {
//             if (!s.recipient || typeof s.amount !== 'number' || s.amount <= 0) {
//                 return res.status(400).json({
//                     error: 'Each split must have a valid recipient and positive amount',
//                 });
//             }
//             totalAmount += s.amount;
//         }

//         // Fetch sender balance
//         const { data: senderProfile, error: fetchErr } = await supabase
//             .from(PROFILE_TABLE)
//             .select('balance')
//             .eq('email', sender)
//             .single();

//         const senderBalance = (!fetchErr && senderProfile?.balance) || 0;
//         if (senderBalance < totalAmount) {
//             return res.status(400).json({ error: 'Insufficient funds' });
//         }

//         // Update sender balance
//         const newSenderBalance = senderBalance - totalAmount;
//         await supabase
//             .from(PROFILE_TABLE)
//             .upsert(
//                 { email: sender, balance: newSenderBalance },
//                 { onConflict: ['email'], returning: 'minimal' }
//             );

//         // ✅ Add sender row to balancechart
//         const { error: chartInsertErr1 } = await supabase
//             .from(BALANCECHART_TABLE)
//             .insert({
//                 email: sender,
//                 balance: newSenderBalance,
//                 updated_at: new Date().toISOString(),
//             });

//         if (chartInsertErr1) {
//             console.error('Sender balancechart insert error:', chartInsertErr1);
//         }

//         const results = [];

//         for (const { recipient, amount } of splits) {
//             // a) Stripe Payment
//             const paymentIntent = await stripe.paymentIntents.create({
//                 amount: Math.round(amount * 100),
//                 currency,
//                 description: description || `Split payment to ${recipient}`,
//                 payment_method_types: ['card'],
//                 confirm: true,
//                 payment_method: 'pm_card_visa',
//             });

//             // b) Record transaction
//             const { data: tx, error: txErr } = await supabase
//                 .from('transactions')
//                 .insert([
//                     {
//                         amount,
//                         currency,
//                         recipient_id: recipient,
//                         sender_id: sender,
//                         status: 'pending',
//                         stripe_payment_intent_id: paymentIntent.id,
//                         description: description || `Split payment to ${recipient}`,
//                         type_transaction: 'send',
//                     },
//                 ])
//                 .select()
//                 .single();

//             if (txErr) throw txErr;

//             // c) Update recipient balance
//             const { data: recProf, error: recFetchErr } = await supabase
//                 .from(PROFILE_TABLE)
//                 .select('balance')
//                 .eq('email', recipient)
//                 .single();

//             const currentRecBal = (!recFetchErr && recProf?.balance) || 0;
//             const newRecBal = currentRecBal + amount;

//             await supabase
//                 .from(PROFILE_TABLE)
//                 .upsert(
//                     { email: recipient, balance: newRecBal },
//                     { onConflict: ['email'], returning: 'minimal' }
//                 );

//             // ✅ Add recipient row to balancechart
//             const { error: chartInsertErr2 } = await supabase
//                 .from(BALANCECHART_TABLE)
//                 .insert({
//                     email: recipient,
//                     balance: newRecBal,
//                     updated_at: new Date().toISOString(),
//                 });

//             if (chartInsertErr2) {
//                 console.error(
//                     `Recipient (${recipient}) balancechart insert error:`,
//                     chartInsertErr2
//                 );
//             }

//             results.push(tx);
//         }

//         return res.status(201).json({
//             message: 'Split payment completed',
//             transactions: results,
//             newSenderBalance,
//         });
//     } catch (error) {
//         console.error('Send Money Error:', error);
//         return res
//             .status(500)
//             .json({ error: error.message || 'An unknown error occurred' });
//     }
// });

// export default router;
import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil',
});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const PROFILE_TABLE = 'profiles';
const BALANCECHART_TABLE = 'balancechart';

router.post('/', async (req, res) => {
    try {
        const { splits, description, sender, currency } = req.body;

        if (!Array.isArray(splits) || splits.length === 0) {
            return res.status(400).json({ error: 'At least one split is required' });
        }

        if (!sender || !currency) {
            return res
                .status(400)
                .json({ error: 'Missing required fields: sender and currency' });
        }

        // Calculate total amount
        let totalAmount = 0;
        for (const s of splits) {
            if (!s.recipient || typeof s.amount !== 'number' || s.amount <= 0) {
                return res.status(400).json({
                    error: 'Each split must have a valid recipient and positive amount',
                });
            }
            totalAmount += s.amount;
        }

        // Fetch sender balance
        const { data: senderProfile, error: fetchErr } = await supabase
            .from(PROFILE_TABLE)
            .select('balance')
            .eq('email', sender)
            .single();

        const senderBalance = (!fetchErr && senderProfile?.balance) || 0;
        if (senderBalance < totalAmount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Insert old sender balance into balancechart
        const { error: chartInsertErr1 } = await supabase
            .from(BALANCECHART_TABLE)
            .insert({
                email: sender,
                balance: senderBalance,
                updated_at: new Date().toISOString(),
            });

        if (chartInsertErr1) {
            console.error('Sender balancechart insert error:', chartInsertErr1);
        }

        // Update sender balance
        const newSenderBalance = senderBalance - totalAmount;
        await supabase
            .from(PROFILE_TABLE)
            .upsert(
                { email: sender, balance: newSenderBalance },
                { onConflict: ['email'], returning: 'minimal' }
            );

        // ✅ Add new sender balance to balancechart
        const { error: chartInsertErr2 } = await supabase
            .from(BALANCECHART_TABLE)
            .insert({
                email: sender,
                balance: newSenderBalance,
                updated_at: new Date().toISOString(),
            });

        if (chartInsertErr2) {
            console.error('Sender balancechart insert error after update:', chartInsertErr2);
        }

        const results = [];

        for (const { recipient, amount } of splits) {
            // a) Stripe Payment
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                description: description || `Split payment to ${recipient}`,
                payment_method_types: ['card'],
                confirm: true,
                payment_method: 'pm_card_visa',
            });

            // b) Record transaction
            const { data: tx, error: txErr } = await supabase
                .from('transactions')
                .insert([{
                    amount,
                    currency,
                    recipient_id: recipient,
                    sender_id: sender,
                    status: 'pending',
                    stripe_payment_intent_id: paymentIntent.id,
                    description: description || `Split payment to ${recipient}`,
                    type_transaction: 'send',
                }])
                .select()
                .single();

            if (txErr) throw txErr;

            // c) Update recipient balance
            const { data: recProf, error: recFetchErr } = await supabase
                .from(PROFILE_TABLE)
                .select('balance')
                .eq('email', recipient)
                .single();

            const currentRecBal = (!recFetchErr && recProf?.balance) || 0;
            const newRecBal = currentRecBal + amount;

            // Insert old recipient balance into balancechart
            const { error: chartInsertErr3 } = await supabase
                .from(BALANCECHART_TABLE)
                .insert({
                    email: recipient,
                    balance: currentRecBal,
                    updated_at: new Date().toISOString(),
                });

            if (chartInsertErr3) {
                console.error(`Recipient (${recipient}) balancechart insert error:`, chartInsertErr3);
            }

            await supabase
                .from(PROFILE_TABLE)
                .upsert(
                    { email: recipient, balance: newRecBal },
                    { onConflict: ['email'], returning: 'minimal' }
                );

            // ✅ Add new recipient balance to balancechart
            const { error: chartInsertErr4 } = await supabase
                .from(BALANCECHART_TABLE)
                .insert({
                    email: recipient,
                    balance: newRecBal,
                    updated_at: new Date().toISOString(),
                });

            if (chartInsertErr4) {
                console.error(
                    `Recipient (${recipient}) balancechart insert error after update:`,
                    chartInsertErr4
                );
            }

            results.push(tx);
        }

        return res.status(201).json({
            message: 'Split payment completed',
            transactions: results,
            newSenderBalance,
        });
    } catch (error) {
        console.error('Send Money Error:', error);
        return res
            .status(500)
            .json({ error: error.message || 'An unknown error occurred' });
    }
});

export default router;
