import Rule from '../models/rule.js';
import FileModel from '../models/file.js';
import path from 'path';
import fs from 'fs';

export const createRule = async (req, res) => {
  try {
    const { number, issuedDate, effectiveDate, summary, type, agency } =
      req.body;
    if (
      !number ||
      !issuedDate ||
      !effectiveDate ||
      !summary ||
      !type ||
      !agency
    )
      return res.status(400).json({ error: 'Thiếu dữ liệu bắt buộc' });

    const rule = await Rule.create({
      number,
      issuedDate: new Date(issuedDate),
      effectiveDate: new Date(effectiveDate),
      summary,
      type,
      agency,
      attachments: [],
    });
    res.json({ id: rule._id.toString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Không tạo được văn bản' });
  }
};

export const listRules = async (_req, res) => {
  try {
    const rules = await Rule.find().sort({ createdAt: -1 }).lean();
    res.json({ rules });
  } catch (e) {
    res.status(500).json({ error: 'Không lấy được danh sách' });
  }
};

export const getRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.ruleId)
      .populate('attachments')
      .lean();
    if (!rule) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
    res.json({ rule });
  } catch (e) {
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết' });
  }
};

export const updateRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const { number, issuedDate, effectiveDate, summary, type, agency } =
      req.body;

    const updated = await Rule.findByIdAndUpdate(
      ruleId,
      {
        ...(number !== undefined && { number }),
        ...(issuedDate !== undefined && { issuedDate: new Date(issuedDate) }),
        ...(effectiveDate !== undefined && {
          effectiveDate: new Date(effectiveDate),
        }),
        ...(summary !== undefined && { summary }),
        ...(type !== undefined && { type }),
        ...(agency !== undefined && { agency }),
      },
      { new: true }
    ).lean();

    if (!updated)
      return res.status(404).json({ error: 'Không tìm thấy văn bản' });
    res.json({ ok: true, rule: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Không cập nhật được văn bản' });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const rule = await Rule.findById(ruleId);
    if (!rule) return res.status(404).json({ error: 'Không tìm thấy văn bản' });

    // lấy toàn bộ file đính kèm
    const files = await FileModel.find({ ruleId: rule._id });
    // xoá file vật lý + doc File
    for (const f of files) {
      const abs = path.resolve(f.path);
      if (fs.existsSync(abs)) {
        try {
          fs.unlinkSync(abs);
        } catch {}
      }
      await f.deleteOne();
    }

    await rule.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Không xoá được văn bản' });
  }
};
