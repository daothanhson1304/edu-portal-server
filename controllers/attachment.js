import fs from 'fs';
import path from 'path';
import mime from 'mime';
import Rule from '../models/rule.js';
import FileModel from '../models/file.js';

export const uploadAttachment = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.ruleId);
    if (!rule) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
    if (!req.file) return res.status(400).json({ error: 'Thiếu file' });

    const f = await FileModel.create({
      ruleId: rule._id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mime: req.file.mimetype,
      size: req.file.size,
      path: path.join('uploads', req.file.filename),
    });

    rule.attachments.push(f._id);
    await rule.save();

    res.json({ fileId: f._id, name: f.originalName, size: f.size });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Upload thất bại' });
  }
};

export const listAttachments = async (req, res) => {
  try {
    const files = await FileModel.find({ ruleId: req.params.ruleId })
      .select('_id originalName size mime createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ files });
  } catch (e) {
    res.status(500).json({ error: 'Không lấy được danh sách tệp' });
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const f = await FileModel.findById(req.params.fileId).lean();
    if (!f) return res.status(404).send('Not found');

    const abs = path.resolve(f.path);
    if (!fs.existsSync(abs)) return res.status(404).send('Not found');

    res.setHeader(
      'Content-Type',
      f.mime || mime.getType(f.originalName) || 'application/octet-stream'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(f.originalName)}`
    );
    fs.createReadStream(abs).pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send('Download error');
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const f = await FileModel.findById(req.params.fileId);
    if (!f) return res.status(404).json({ error: 'Không tìm thấy tệp' });

    // rút tham chiếu khỏi Rule
    await Rule.updateOne({ _id: f.ruleId }, { $pull: { attachments: f._id } });

    // xoá file vật lý
    const abs = path.resolve(f.path);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);

    await f.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Không xoá được tệp' });
  }
};
