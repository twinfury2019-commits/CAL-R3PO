const License = require('../models/License');

const formatCnic = (raw) =>
  `${raw.slice(0, 5)}-${raw.slice(5, 12)}-${raw.slice(12)}`;

const formatDate = (date) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

// GET /verify/:cnic  — public
exports.verifyByCnic = async (req, res, next) => {
  try {
    const cnic = req.params.cnic.replace(/-/g, '');

    if (!/^\d{13}$/.test(cnic)) {
      return res.status(400).json({ found: false, message: 'CNIC must be 13 digits' });
    }

    const license = await License.findOne({ cnic });

    if (!license) {
      return res.status(404).json({ found: false, message: 'No license record found for this CNIC' });
    }

    res.json({
      found: true,
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
    if (req.body.cnic) {
      req.body.cnic = req.body.cnic.replace(/-/g, '');
    }

    const license = await License.create({ ...req.body, createdBy: req.user._id });

    res.status(201).json({ message: 'License created', license });
  } catch (err) {
    next(err);
  }
};

// PUT /license/:id  — admin, operator
exports.updateLicense = async (req, res, next) => {
  try {
    if (req.body.cnic) {
      req.body.cnic = req.body.cnic.replace(/-/g, '');
    }

    const license = await License.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    res.json({ message: 'License updated', license });
  } catch (err) {
    next(err);
  }
};

// GET /licenses  — admin only, with pagination + search
exports.getAllLicenses = async (req, res, next) => {
  try {
    const page   = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit  = Math.min(parseInt(req.query.limit) || 20, 100);
    const search = req.query.search ? req.query.search.trim() : '';

    const query = search
      ? {
          $or: [
            { name:      new RegExp(search, 'i') },
            { cnic:      new RegExp(search, 'i') },
            { licenseNo: new RegExp(search, 'i') }
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
      total,
      page,
      pages:    Math.ceil(total / limit),
      licenses
    });
  } catch (err) {
    next(err);
  }
};
