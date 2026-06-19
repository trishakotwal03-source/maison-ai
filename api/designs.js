import supabase from './db-client.js';
import { setCorsHeaders, handleOptions } from './gemini-helper.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { type, title, thumbnail, designData } = req.body;

      if (!type || !title) {
        return res.status(400).json({ error: 'Type and title are required.' });
      }

      const { data, error } = await supabase
        .from('designs')
        .insert({
          type,
          title,
          thumbnail: thumbnail || null,
          design_data: designData || null,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Design ID is required.' });

      const { error } = await supabase.from('designs').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Designs API error:', err);
    res.status(500).json({ error: err.message });
  }
}
