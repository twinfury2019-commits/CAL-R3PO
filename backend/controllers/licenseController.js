const License = require('../models/License');

const formatCnic = (raw) =>
  `${raw.slice(0, 5)}-${raw.slice(5, 12)}-${raw.slice(12)}`;

const formatDate = (date) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

// GET /verify/:cnic  — public
exports.verifyByCnic = async (req, res, next) => {
  try {
    const cnic = req.params.cnic.replace(/-/g, '');
    const license = await License.findOne({ cnic });

    if (!license) {
      return res.status(404).json({
        success: false,
        found:   false,
        message: 'No license record found for this CNIC'
      });
    }

    res.json({
      success: true,
      found:   true,
      data: {
        name:    license.name,
        father:  license.fatherName,
        cnic:    formatCnic(license.cnic),
        addr:    license.address,
        weapon:  `${license.weaponNo} · ${license.weaponType}`,
        lnodate: `${license.licenseNo} · ${formatDate(license.issueDate)}`,
        lictype: license.licenseType
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /license  — admin, operator
exports.createLicense = async (req, res, next) => {
  try {
    const cnic = req.body.cnic.replace(/-/g, '');

    // Explicit duplicate check before insert
    const existing = await License.findOne({ cnic });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A license for this CNIC already exists',
        errors:  [`cnic: ${formatCnic(cnic)} is already registered`]
      });
    }

    const license = await License.create({ ...req.body, cnic, createdBy: req.user._id });

    res.status(201).json({
      success: true,
      message: 'License created successfully',
      data:    license
    });
  } catch (err) {
    next(err);
  }
};

// PUT /license/:id  — admin, operator
exports.updateLicense = async (req, res, next) => {
  try {
    if (req.body.cnic) {
      req.body.cnic = req.body.cnic.replace(/-/g, '');

      // If CNIC is being changed, check it doesn't clash with another record
      const clash = await License.findOne({ cnic: req.body.cnic, _id: { $ne: req.params.id } });
      if (clash) {
        return res.status(409).json({
          success: false,
          message: 'That CNIC is already assigned to a different license',
          errors:  [`cnic: ${formatCnic(req.body.cnic)} belongs to another record`]
        });
      }
    }

    const license = await License.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!license) {
      return res.status(404).json({ success: false, message: 'License not found' });
    }

    res.json({ success: true, message: 'License updated successfully', data: license });
  } catch (err) {
    next(err);
  }
};

// DELETE /license/:id  — admin only
exports.deleteLicense = async (req, res, next) => {
  try {
    const license = await License.findByIdAndDelete(req.params.id);
    if (!license) {
      return res.status(404).json({ success: false, message: 'License not found' });
    }
    res.json({ success: true, message: 'License deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /licenses  — admin only, with pagination + search
exports.getAllLicenses = async (req, res, next) => {
  try {
    const page   = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit  = Math.min(parseInt(req.query.limit) || 20, 100);
    const rawSearch = req.query.search ? req.query.search.trim().slice(0, 100) : '';
    // Escape regex special chars to prevent ReDoS from crafted search strings
    const escapedSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const query = escapedSearch
      ? {
          $or: [
            { name:      new RegExp(escapedSearch, 'i') },
            { cnic:      new RegExp(escapedSearch, 'i') },
            { licenseNo: new RegExp(escapedSearch, 'i') }
          ]
        }
      : {};

    const [licenses, total] = await Promise.all([
      License.find(query)
        .populate('createdBy', 'username role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      License.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        total,
        page,
        pages: Math.ceil(total / limit),
        licenses
      }
    });
  } catch (err) {
    next(err);
  }
};
