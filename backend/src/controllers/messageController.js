const { supabase } = require('../config/db');

const getMessages = async (req, res) => {
    const { data, error } = await supabase.from('messages').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const postMessage = async (req, res) => {
    const { text } = req.body;
    const { data, error } = await supabase.from('messages').insert([{ text, user: req.user.name }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

module.exports = { getMessages, postMessage };
