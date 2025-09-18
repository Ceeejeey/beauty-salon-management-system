const { pool } = require("../../config/db");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg, .jpeg, and .png images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('image');

// Validate base64 image
const validateImage = (image) => {
  if (!image) return true; // Image is optional
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    return false;
  }
  const base64Data = image.split(",")[1];
  if (!base64Data) return false;
  const buffer = Buffer.from(base64Data, "base64");
  // Check size (5MB limit)
  if (buffer.length > 5 * 1024 * 1024) {
    return false;
  }
  return true;
};

// Create service
const createService = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log("req.body:", req.body);
      const { name, category, description, price, duration } = req.body;
      const imageFile = req.file; // multer stores file buffer here

      // Validation
      if (!name || !category || !price || !duration) {
        return res
          .status(400)
          .json({ error: "Name, category, price, and duration are required" });
      }

      // Check for duplicate service
      const [existing] = await pool.execute(
        "SELECT * FROM services WHERE name = ?",
        [name]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: "Service name already exists" });
      }

      const imageBuffer = imageFile ? imageFile.buffer : null;

      // Insert service
      const [result] = await pool.execute(
        `INSERT INTO services (name, category, description, price, duration, image)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [name, category, description || null, price, duration, imageBuffer]
      );

      // Fetch created service
      const [newService] = await pool.execute(
        "SELECT service_id, name, category, description, price, duration, image FROM services WHERE service_id = ?",
        [result.insertId]
      );

      const service = newService[0];
      if (service.image) {
        service.image = `data:image/jpeg;base64,${service.image.toString(
          "base64"
        )}`;
      }

      res.status(201).json({
        message: "Service created successfully",
        service,
      });
    } catch (err) {
      console.error("Create service error:", err);
      res.status(500).json({ error: "Server error during service creation" });
    }
  });
};

// Update service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, duration, image } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid service ID is required" });
    }
    if (!name || !category || !price || !duration) {
      return res
        .status(400)
        .json({ error: "Name, category, price, and duration are required" });
    }
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Name must be a non-empty string" });
    }
    if (typeof category !== "string" || category.trim() === "") {
      return res
        .status(400)
        .json({ error: "Category must be a non-empty string" });
    }
    if (typeof price !== "number" || price < 0) {
      return res
        .status(400)
        .json({ error: "Price must be a non-negative number" });
    }
    if (typeof duration !== "string" || duration.trim() === "") {
      return res
        .status(400)
        .json({ error: "Duration must be a non-empty string" });
    }
    if (!validateImage(image)) {
      return res
        .status(400)
        .json({ error: "Image must be a valid base64 string (max 5MB)" });
    }

    // Check if service exists
    const [services] = await pool.execute(
      "SELECT * FROM services WHERE service_id = ?",
      [id]
    );
    if (services.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Check for duplicate name (excluding current service)
    const [existingServices] = await pool.execute(
      "SELECT * FROM services WHERE name = ? AND service_id != ?",
      [name, id]
    );
    if (existingServices.length > 0) {
      return res.status(400).json({ error: "Service name already exists" });
    }

    // Convert base64 image to buffer (or null if not provided)
    const imageBuffer = image
      ? Buffer.from(image.split(",")[1], "base64")
      : null;

    // Update service
    await pool.execute(
      `UPDATE services SET name = ?, category = ?, description = ?, price = ?, duration = ?, image = ? WHERE service_id = ?`,
      [name, category, description || null, price, duration, imageBuffer, id]
    );

    // Fetch updated service
    const [updatedService] = await pool.execute(
      "SELECT service_id, name, category, description, price, duration, image FROM services WHERE service_id = ?",
      [id]
    );
    const service = updatedService[0];
    if (service.image) {
      service.image = `data:image/jpeg;base64,${service.image.toString(
        "base64"
      )}`;
    }

    res.status(200).json({
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ error: "Server error during service update" });
  }
};

// Get all services
const getServices = async (req, res) => {
  try {
    const [services] = await pool.execute(
      "SELECT service_id, name, category, description, price, duration, image FROM services"
    );
    const formattedServices = services.map((service) => {
      if (service.image) {
        service.image = `data:image/jpeg;base64,${service.image.toString(
          "base64"
        )}`;
      }
      return service;
    });
    res.status(200).json({
      message: "Services retrieved successfully",
      services: formattedServices,
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ error: "Server error during services retrieval" });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid service ID is required" });
    }
    const [services] = await pool.execute(
      "SELECT service_id, name, category, description, price, duration, image FROM services WHERE service_id = ?",
      [id]
    );
    if (services.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    const service = services[0];
    if (service.image) {
      service.image = `data:image/jpeg;base64,${service.image.toString(
        "base64"
      )}`;
    }
    res.status(200).json({
      message: "Service retrieved successfully",
      service,
    });
  } catch (error) {
    console.error("Get service by ID error:", error);
    res.status(500).json({ error: "Server error during service retrieval" });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid service ID is required" });
    }
    const [services] = await pool.execute(
      "SELECT * FROM services WHERE service_id = ?",
      [id]
    );
    if (services.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    await pool.execute("DELETE FROM services WHERE service_id = ?", [id]);
    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ error: "Server error during service deletion" });
  }
};

module.exports = {
  createService: [createService],
  getServices: [getServices],
  getServiceById: [getServiceById],
  updateService: [updateService],
  deleteService: [deleteService],
};
