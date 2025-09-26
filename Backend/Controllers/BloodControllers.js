import BloodRequest from '../Models/BloodRequest.js';
import BloodDonation from '../Models/BloodDonation.js';
import CommunityStats from '../Models/CommunityStats.js';
import { UserModel  } from '../Models/UserModel.js';
import mongoose from 'mongoose';





export const getCommunityFeed = async (req, res) => {
  try {
    const user = req.user;
    const { city, state, page = 1, limit = 20 } = req.query;
    
    let locationFilter = {};
    if (city) locationFilter['hospital.city'] = { $regex: new RegExp(city, 'i') };
    if (state) locationFilter['hospital.state'] = { $regex: new RegExp(state, 'i') };
    
    // Get recent blood requests
    const recentRequests = await BloodRequest.find({
      status: 'Active',
      isPublic: true,
      ...locationFilter
    })
    .populate({
      path: 'requestedBy',
      populate: {
        path: 'user',
        select: 'name profilePicture'
      },
      select: 'specialization hospital'
    })
    .populate('responses.donor', 'name bloodGroup lastDonationDate profilePicture')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    // Get recent donations
    const recentDonations = await BloodDonation.find({
      addToCommunity: true,
      ...locationFilter
    })
    .populate('donor', 'name bloodGroup profilePicture city state')
    .populate({
      path: 'verifiedBy',
      populate: {
        path: 'user',
        select: 'name'
      },
      select: 'specialization hospital'
    })
    .populate('bloodRequest', 'patient urgency')
    .sort({ donationDate: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    // Combine and sort by timestamp
    const feedItems = [];
    
    // Add requests with type identifier
    recentRequests.forEach(request => {
      feedItems.push({
        type: 'request',
        data: request,
        timestamp: request.createdAt,
        id: request._id
      });
    });

    // Add donations with type identifier
    recentDonations.forEach(donation => {
      feedItems.push({
        type: 'donation',
        data: donation,
        timestamp: donation.donationDate,
        id: donation._id
      });
    });

    // Sort by timestamp (newest first)
    feedItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        feedItems,
        pagination: {
          currentPage: parseInt(page),
          hasNext: feedItems.length === parseInt(limit),
          totalItems: feedItems.length
        }
      }
    });

  } catch (error) {
    console.error('Get community feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community feed'
    });
  }
};

// New function for detailed donations
export const getRecentDonations = async (req, res) => {
  try {
    const user = req.user;
    const { city, state, bloodGroup, page = 1, limit = 20 } = req.query;
    
    let filter = { addToCommunity: true };
    if (city) filter['hospital.city'] = { $regex: new RegExp(city, 'i') };
    if (state) filter['hospital.state'] = { $regex: new RegExp(state, 'i') };
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const donations = await BloodDonation.find(filter)
    .populate({
      path: 'donor',
      select: 'name bloodGroup profilePicture city state phone totalDonations'
    })
    .populate({
      path: 'verifiedBy',
      populate: {
        path: 'user',
        select: 'name'
      },
      select: 'specialization hospital'
    })
    .populate({
      path: 'bloodRequest',
      select: 'patient urgency hospital description',
      populate: {
        path: 'requestedBy',
        populate: {
          path: 'user',
          select: 'name'
        }
      }
    })
    .sort({ donationDate: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await BloodDonation.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        donations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalDonations: total,
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent donations'
    });
  }
};


export const getCommunityStats = async (req, res) => {
  try {
    const user = req.user;
    const { city, state, country = 'India' } = req.query;

    let filter = { country };
    if (city) filter.city = city;
    if (state) filter.state = state;

    const stats = await CommunityStats.findOne(filter);
    
    const activeRequests = await BloodRequest.countDocuments({ 
      status: 'Active',
      'hospital.city': city || user.city,
      'hospital.state': state || user.state
    });

    const recentDonations = await BloodDonation.find({
      'hospital.city': city || user.city,
      'hospital.state': state || user.state,
      addToCommunity: true
    })
    .populate('donor', 'name')
    .sort({ donationDate: -1 })
    .limit(10);

    // Calculate blood group wise availability
    const bloodGroupStats = await BloodDonation.aggregate([
      {
        $match: {
          'hospital.city': city || user.city,
          'hospital.state': state || user.state,
          addToCommunity: true,
          donationDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
        }
      },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$unitsdonated' },
          totalDonations: { $sum: 1 }
        }
      }
    ]);

    const response = {
      communityStats: stats || {
        city: city || user.city,
        state: state || user.state,
        country,
        totalDonations: 0,
        totalDonors: 0,
        activeRequests: 0,
        bloodGroupStats: {}
      },
      activeRequests,
      recentDonations,
      bloodGroupAvailability: bloodGroupStats,
      lastUpdated: new Date()
    };

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community stats'
    });
  }
};
export const getAllBloodRequests = async (req, res) => {
  try {
    const user = req.user;
    const { bloodGroup, urgency, city, state, status = "Active" } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let filter = { status };

    // Only add filters if they are specifically provided in query
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (urgency) filter.urgency = urgency;
    if (city) filter["hospital.city"] = { $regex: new RegExp(city, 'i') };
    if (state) filter["hospital.state"] = { $regex: new RegExp(state, 'i') };

    // Remove user location filter completely - show all active requests
    console.log("Filter applied:", JSON.stringify(filter, null, 2));

    const result = await BloodRequest.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "doctors",
          localField: "requestedBy",
          foreignField: "_id",
          as: "requestedBy",
        },
      },
      {
        $unwind: {
          path: "$requestedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requestedBy.user",
          foreignField: "_id",
          as: "requestedBy.user",
        },
      },
      {
        $unwind: {
          path: "$requestedBy.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          urgencyOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$urgency", "Critical"] }, then: 4 },
                { case: { $eq: ["$urgency", "High"] }, then: 3 },
                { case: { $eq: ["$urgency", "Medium"] }, then: 2 },
                { case: { $eq: ["$urgency", "Low"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $facet: {
          data: [
            { $sort: { urgencyOrder: -1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: { 
                urgencyOrder: 0,
                "requestedBy.user.password": 0,
                "requestedBy.user.refreshToken": 0
              }
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const requests = result[0].data;
    const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

    console.log(`Total found: ${total}, Returned: ${requests.length}`);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRequests: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all blood requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blood requests",
    });
  }
};





// Get my blood requests (for doctors)
export const getMyBloodRequests = async (req, res) => {
  try {
    const doctor = req.doctor;
    const { status } = req.query;

    let filter = { requestedBy: doctor._id };
    if (status) filter.status = status;

    const requests = await BloodRequest.find(filter)
      .populate('responses.donor', 'name phone email bloodGroup lastDonationDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get my blood requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your blood requests'
    });
  }
};

// Create new blood request
export const createBloodRequest = async (req, res) => {
  try {
    console.log("aaya bl me ")
    const doctor = req.doctor;
    const {
      hospital,
      patient,
      bloodGroup,
      urgency,
      unitsRequired,
      requiredBy,
      description,
      isPublic = true
    } = req.body;

    const newRequest = new BloodRequest({
      requestedBy: doctor._id,
      hospital,
      patient,
      bloodGroup,
      urgency,
      unitsRequired,
      requiredBy: new Date(requiredBy),
      description,
      isPublic,
      status: 'Active'
    });

    await newRequest.save();
    await newRequest.populate('requestedBy', 'user specialization hospital');

    // Here you would typically send notifications to eligible donors
    // We'll implement this notification system later

    res.status(201).json({
      success: true,
      data: newRequest,
      message: 'Blood request created successfully'
    });

  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating blood request'
    });
  }
};

// Update blood request
export const updateBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = req.doctor;
    const updateData = req.body;

    const request = await BloodRequest.findOne({
      _id: id,
      requestedBy: doctor._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found or unauthorized'
      });
    }

    // Don't allow updates on fulfilled or cancelled requests
    if (request.status === 'Fulfilled' || request.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update fulfilled or cancelled requests'
      });
    }

    Object.assign(request, updateData);
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
      message: 'Blood request updated successfully'
    });

  } catch (error) {
    console.error('Update blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating blood request'
    });
  }
};

export const respondToBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { message = '' } = req.body;

    const request = await BloodRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (request.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This blood request is no longer active'
      });
    }

    const compatibleBloodGroups = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-']
    };

    if (!compatibleBloodGroups[request.bloodGroup]?.includes(user.bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Your blood group is not compatible with this request'
      });
    }

    // Check if user already responded
    const existingResponse = request.responses.find(
      response => response.donor.toString() === user._id.toString()
    );

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this request'
      });
    }

    // Add response
    request.responses.push({
      donor: user._id,
      status: 'Interested',
      donorDetails: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        lastDonationDate: user.lastDonationDate,
        medicalClearance: false // Will be updated later
      }
    });

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Response submitted successfully'
    });

  } catch (error) {
    console.error('Respond to blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting response'
    });
  }
};

// Add donor details after donation
export const addDonorDetails = async (req, res) => {
  try {
    const doctor = req.doctor;
    const {
      donorId,
      requestId,
      bloodGroup,
      unitsdonated,
      hospital,
      medicalTests,
      addToCommunity = false,
      isEmergency = false
    } = req.body;

    // Verify the donor and request
    const donor = await UserModel.findById(donorId);
    const request = requestId ? await BloodRequest.findById(requestId) : null;

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Create blood donation record
    const donation = new BloodDonation({
      donor: donorId,
      recipient: request?.patient?.name ? null : null, // Can be expanded
      bloodRequest: requestId,
      hospital,
      bloodGroup,
      unitsdonated,
      donationDate: new Date(),
      verifiedBy: doctor._id,
      donorPhoto: req.file ? req.file.path : null,
      medicalTests,
      addToCommunity,
      isEmergency
    });

    await donation.save();

    // Update donor's profile
    await UserModel.findByIdAndUpdate(donorId, {
      lastDonationDate: new Date(),
      $inc: { totalDonations: 1 },
      donorStatus: 'Recently Donated'
    });

    // Update blood request if exists
    if (request) {
      const responseIndex = request.responses.findIndex(
        r => r.donor.toString() === donorId
      );
      
      if (responseIndex !== -1) {
        request.responses[responseIndex].status = 'Donated';
      }
      
      // Check if request is fulfilled
      const totalDonatedUnits = await BloodDonation.aggregate([
        { $match: { bloodRequest: new mongoose.Types.ObjectId(requestId) } },
        { $group: { _id: null, total: { $sum: '$unitsdonated' } } }
      ]);

      const donatedUnits = totalDonatedUnits[0]?.total || 0;
      if (donatedUnits >= request.unitsRequired) {
        request.status = 'Fulfilled';
      }

      await request.save();
    }

    // Update community stats if added to community
    if (addToCommunity) {
      await updateCommunityStats(hospital.city, hospital.state, bloodGroup, unitsdonated);
    }

    res.status(201).json({
      success: true,
      data: donation,
      message: 'Donor details added successfully'
    });

  } catch (error) {
    console.error('Add donor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding donor details'
    });
  }
};

// Helper function to update community stats
const updateCommunityStats = async (city, state, bloodGroup, units) => {
  try {
    const filter = { city, state, country: 'India' };
    
    const updateData = {
      $inc: {
        totalDonations: 1,
        [`bloodGroupStats.${bloodGroup}.donations`]: 1
      },
      lastUpdated: new Date()
    };

    await CommunityStats.findOneAndUpdate(
      filter,
      updateData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating community stats:', error);
  }
};

// Get blood request by ID
export const getBloodRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await BloodRequest.findById(id)
      .populate('requestedBy', 'user specialization hospital experienceYears')
      .populate({
        path: 'requestedBy',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('responses.donor', 'name phone email bloodGroup lastDonationDate');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get blood request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blood request'
    });
  }
};

// Cancel blood request
export const cancelBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = req.doctor;

    const request = await BloodRequest.findOne({
      _id: id,
      requestedBy: doctor._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found or unauthorized'
      });
    }

    request.status = 'Cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Blood request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling blood request'
    });
  }
};

// Update request status
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctor = req.doctor;

    const validStatuses = ['Active', 'Fulfilled', 'Cancelled', 'Expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const request = await BloodRequest.findOne({
      _id: id,
      requestedBy: doctor._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found or unauthorized'
      });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
      message: 'Request status updated successfully'
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating request status'
    });
  }
};
