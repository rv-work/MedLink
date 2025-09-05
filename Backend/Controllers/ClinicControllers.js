import {MedicineModel ,Seller } from '../Models/Clinic.js';

// Register as seller
export const Register = async (req, res) => {
  try {
    const user = req.user;
    const {
      shopName,
      licenseNumber,
      address,
      contactNumber
    } = req.body;

    // Check if user is already registered as seller
    const existingSeller = await Seller.findOne({ userId: user._id });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a seller'
      });
    }

    // Check if license number already exists
    const existingLicense = await Seller.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'License number already registered'
      });
    }

    // Create new seller
    const seller = new Seller({
      userId: user._id,
      shopName,
      licenseNumber,
      address,
      contactNumber
    });

    await seller.save();

    res.status(201).json({
      success: true,
      message: 'Successfully registered as seller',
      seller
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add new medicine
export const AddMedicines = async (req, res) => {
  try {
    const user = req.user;
    
    // Find seller
    const seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found'
      });
    }

    const {
      name,
      brand,
      category,
      description,
      price,
      stock,
      expiryDate,
      batchNumber,
      manufacturer,
      requiresPrescription
    } = req.body;

    // Handle photo upload
    let photoUrl = null;
    if (req.file) {
      photoUrl = req.file.path; // Cloudinary URL
    }

    // Create medicine
    const medicine = new MedicineModel({
      sellerId: seller._id,
      name,
      brand,
      category,
      description,
      price,
      stock,
      expiryDate,
      batchNumber,
      manufacturer,
      photo: photoUrl,
      requiresPrescription: requiresPrescription || false
    });

    await medicine.save();

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      medicine
    });
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update medicine stock
export const UpdateMedicine = async (req, res) => {
  try {
    const user = req.user;
    const { medicineId } = req.params;
    const { stock, price, expiryDate } = req.body;

    // Find seller
    const seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found'
      });
    }

    // Find and update medicine
    const medicine = await MedicineModel.findOneAndUpdate(
      { _id: medicineId, sellerId: seller._id },
      { 
        ...(stock !== undefined && { stock }),
        ...(price !== undefined && { price }),
        ...(expiryDate !== undefined && { expiryDate })
      },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      medicine
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all medicines for seller
export const GetSellerMedicines = async (req, res) => {
  try {
    const user = req.user;
    
    // Find seller
    const seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found'
      });
    }

    const medicines = await MedicineModel.find({ sellerId: seller._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      medicines
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search medicines by location and name
export const SearchMedicine = async (req, res) => {
  try {
    const { medicineName, latitude, longitude, radius = 10 } = req.query;

    if (!medicineName || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name, latitude, and longitude are required'
      });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    // Find sellers within radius using aggregation
    const results = await Seller.aggregate([
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: 'sellerId',
          as: 'medicines'
        }
      },
      {
        $match: {
          'medicines.name': { $regex: medicineName, $options: 'i' },
          'medicines.stock': { $gt: 0 },
          'medicines.isActive': true,
          'medicines.expiryDate': { $gt: new Date() }
        }
      },
      {
        $addFields: {
          distance: {
            $multiply: [
              6371, // Earth's radius in kilometers
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $multiply: [{ $divide: [userLat, 57.2958] }] } },
                        { $sin: { $multiply: [{ $divide: ['$address.latitude', 57.2958] }] } }
                      ]
                    },
                    {
                      $multiply: [
                        { $cos: { $multiply: [{ $divide: [userLat, 57.2958] }] } },
                        { $cos: { $multiply: [{ $divide: ['$address.latitude', 57.2958] }] } },
                        { $cos: { $subtract: [
                          { $multiply: [{ $divide: ['$address.longitude', 57.2958] }] },
                          { $multiply: [{ $divide: [userLng, 57.2958] }] }
                        ] } }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          availableMedicines: {
            $filter: {
              input: '$medicines',
              cond: {
                $and: [
                  { $regexMatch: { input: '$$this.name', regex: medicineName, options: 'i' } },
                  { $gt: ['$$this.stock', 0] },
                  { $eq: ['$$this.isActive', true] },
                  { $gt: ['$$this.expiryDate', new Date()] }
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          distance: { $lte: searchRadius },
          availableMedicines: { $ne: [] }
        }
      },
      {
        $sort: { distance: 1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          shopName: 1,
          address: 1,
          contactNumber: 1,
          distance: 1,
          availableMedicines: 1
        }
      }
    ]);

    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Search medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};



// Bulk add medicines with photos
export const BulkAddMedicines = async (req, res) => {
  try {
    const user = req.user;
    const { medicines } = req.body; // Array of medicine objects from frontend
    const uploadedPhotos = req.files || []; // Uploaded photos from multer

    // Validate input
    if (!medicines) {
      return res.status(400).json({
        success: false,
        message: 'No medicines data provided'
      });
    }

    // Parse medicines data if it's a string
    let medicinesArray;
    try {
      medicinesArray = typeof medicines === 'string' ? JSON.parse(medicines) : medicines;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid medicines data format'
      });
    }

    if (!Array.isArray(medicinesArray) || medicinesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No medicines data provided'
      });
    }

    // Find seller
    const seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found'
      });
    }

    // Create a map of uploaded photos by their original names
    const photoMap = {};
    uploadedPhotos.forEach((photo, index) => {
      // Use the original name or index to map photos
      const photoKey = photo.originalname ? 
        photo.originalname.replace(/\.[^/.]+$/, '').toLowerCase() : 
        `photo_${index}`;
      photoMap[photoKey] = photo.path; // Cloudinary URL
    });

    // Process medicines and match with photos
    const processedMedicines = [];
    let errors = [];

    for (let i = 0; i < medicinesArray.length; i++) {
      const medicine = medicinesArray[i];
      
      try {
        // Find matching photo
        const medicineName = medicine.name?.toLowerCase() || '';
        const photoUrl = photoMap[medicineName] || photoMap[`photo_${i}`] || null;

        // Create medicine object
        const processedMedicine = {
          sellerId: seller._id,
          name: medicine.name?.trim(),
          brand: medicine.brand?.trim(),
          category: medicine.category?.trim() || 'General',
          description: medicine.description?.trim() || '',
          price: parseFloat(medicine.price) || 0,
          stock: parseInt(medicine.stock) || 0,
          expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate) : null,
          batchNumber: medicine.batchNumber?.trim() || '',
          manufacturer: medicine.manufacturer?.trim() || '',
          requiresPrescription: medicine.requiresPrescription === true || medicine.requiresPrescription === 'true',
          photo: photoUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Validate required fields
        if (!processedMedicine.name || !processedMedicine.brand || processedMedicine.price <= 0) {
          throw new Error(`Invalid data for medicine: ${medicine.name || 'Unknown'}`);
        }

        processedMedicines.push(processedMedicine);
        
      } catch (error) {
        console.error(`Error processing medicine ${medicine.name}:`, error);
        errors.push({
          medicineName: medicine.name || `Medicine ${i + 1}`,
          error: error.message
        });
      }
    }

    if (processedMedicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid medicines to add',
        errors: errors
      });
    }

    // Insert all valid medicines
    const result = await MedicineModel.insertMany(processedMedicines);

    res.status(201).json({
      success: true,
      message: `${result.length} medicines added successfully`,
      data: {
        totalRequested: medicinesArray.length,
        successfullyAdded: result.length,
        failed: medicinesArray.length - result.length,
        photosUploaded: uploadedPhotos.length,
        errors: errors,
        medicines: result.map(med => ({
          id: med._id,
          name: med.name,
          brand: med.brand,
          hasPhoto: !!med.photo
        }))
      }
    });

  } catch (error) {
    console.error('Bulk add medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
