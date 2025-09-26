import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  UserModel,
  EmergencyContact,
  Vitals,
  MedicalHistory,
  Lifestyle
} from '../Models/UserModel.js'
import { EncryptArrayField } from '../Utils/Encrypt.js'
import { ethers } from 'ethers';



export const Signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      dob,
      weight,
      height,
      bloodGroup,
      
      // New wallet address field
      walletAddress,
      
      // Address fields
      houseNumber,
      street,
      area,
      city,
      state,
      country = 'India',
      pincode,
      landmark,
      coordinates, // [longitude, latitude]
      
      // Blood donation fields
      donorStatus = 'Available',
      lastDonationDate,
      totalDonations = 0,
      maxDistance = 50,
      availableForEmergency = true,
      preferredHospitals,
      
      // Medical history arrays
      allergies, 
      chronicConditions, 
      surgicalHistory, 
      immunizations,
      
      // Vitals
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bloodSugar,
      cholesterol,
      heartRate,
      
      // Lifestyle
      smokingStatus,
      alcoholConsumption,
      exerciseFrequency,
      dietType,
      sleepDuration,
      
      // Emergency contacts and settings
      emergencyContacts,
      emergencyEnabled = false,
      pushNotificationToken,
      bloodRequestAlerts = true,
      emergencyAlerts = true,
      communityUpdates = true,
      
      
    } = req.body;
console.log("aaya nya ")
    const existingUser = await UserModel.findOne({ 
      $or: [
        { email },
        { walletAddress: walletAddress && walletAddress.trim() !== '' ? walletAddress : null }
      ].filter(Boolean)
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      if (existingUser.walletAddress === walletAddress) {
        return res.status(400).json({ message: 'User with this wallet address already exists' });
      }
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

 
    const allergiesArray = JSON.parse(allergies || '[]');
    const chronicConditionsArray = JSON.parse(chronicConditions || '[]');
    const surgicalHistoryArray = JSON.parse(surgicalHistory || '[]');
    const immunizationsArray = JSON.parse(immunizations || '[]');
    const emergencyContactsArray = JSON.parse(emergencyContacts || '[]');
    

    let parsedCoordinates = [0, 0];
    if (coordinates) {
      try {
        parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
      } catch (error) {
        console.warn('Invalid coordinates format, using default [0, 0]');
      }
    }

 
    let preferredHospitalsArray = [];
    if (preferredHospitals && typeof preferredHospitals === 'string') {
      preferredHospitalsArray = preferredHospitals.split(',').map(hospital => hospital.trim()).filter(Boolean);
    }

    // Get uploaded file
    const file = req.file;

    // Create new user with all fields
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      dob: dob ? new Date(dob) : null,
      profilePicture: file?.path,
      
      // Wallet address
      walletAddress: walletAddress || undefined,
      
      // Physical data
      weightRecords: weight ? [{ value: parseFloat(weight), date: new Date() }] : [],
      heightRecords: height ? [{ value: parseFloat(height), date: new Date() }] : [],
      bloodGroup,
      
      // Address
      city,
      state,
      address: {
        houseNumber,
        street,
        area,
        city,
        state,
        country,
        pincode,
        landmark,
        location: {
          type: 'Point',
          coordinates: parsedCoordinates
        }
      },
      
      // Blood donation fields
      donorStatus,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      totalDonations: parseInt(totalDonations) || 0,
      donationPreferences: {
        maxDistance: parseInt(maxDistance) || 50,
        availableForEmergency: Boolean(availableForEmergency),
        preferredHospitals: preferredHospitalsArray
      },
      
      // Emergency and notification settings
      emergencyEnabled: Boolean(emergencyEnabled),
      pushNotificationToken,
      notificationPreferences: {
        bloodRequestAlerts: Boolean(bloodRequestAlerts),
        emergencyAlerts: Boolean(emergencyAlerts),
        communityUpdates: Boolean(communityUpdates)
      },
      
      
    });

    // Save user first
    await newUser.save();


    console.log("user saved")

    // Process medical history arrays
    const processedAllergies = allergiesArray.map(allergy => ({
      allergen: allergy.allergen || '',
      type: allergy.type || '',
      severity: allergy.severity || '',
      reaction: allergy.reaction || '',
      onsetDate: allergy.onsetDate ? new Date(allergy.onsetDate) : null,
      verifiedBy: allergy.verifiedBy || '',
      avoidanceInstructions: allergy.avoidanceInstructions || '',
      emergencyMedication: allergy.emergencyMedication || '',
      lastReaction: allergy.lastReaction ? new Date(allergy.lastReaction) : null,
      notes: allergy.notes || ''
    }));

    const processedChronicConditions = chronicConditionsArray.map(condition => ({
      conditionName: condition.conditionName || '',
      diagnosedOn: condition.diagnosedOn ? new Date(condition.diagnosedOn) : null,
      severityLevel: condition.severityLevel || '',
      medicines: condition.medicines?.map(medicine => ({
        name: medicine.name || '',
        form: medicine.form || '',
        dose: medicine.dose || '',
        frequency: medicine.frequency || '',
        timing: Array.isArray(medicine.timing) ? medicine.timing : []
      })) || [],
      triggers: Array.isArray(condition.triggers) ? condition.triggers : [],
      precautions: Array.isArray(condition.precautions) ? condition.precautions : [],
      lastReviewDate: condition.lastReviewDate ? new Date(condition.lastReviewDate) : null
    }));

    const processedSurgicalHistory = surgicalHistoryArray.map(surgery => ({
      procedure: surgery.procedure || '',
      date: surgery.date ? new Date(surgery.date) : null,
      surgeon: surgery.surgeon || '',
      hospital: surgery.hospital || '',
      indication: surgery.indication || '',
      complications: surgery.complications || '',
      recoveryTime: surgery.recoveryTime || '',
      anesthesia: surgery.anesthesia || '',
      pathologyReport: surgery.pathologyReport || '',
      followUpDate: surgery.followUpDate ? new Date(surgery.followUpDate) : null,
      notes: surgery.notes || ''
    }));

    const processedImmunizations = immunizationsArray.map(immunization => ({
      vaccine: immunization.vaccine || '',
      doses: immunization.doses || '',
      lastDate: immunization.lastDate ? new Date(immunization.lastDate) : null,
      nextDue: immunization.nextDue ? new Date(immunization.nextDue) : null,
      provider: immunization.provider || '',
      lotNumber: immunization.lotNumber || '',
      sideEffects: immunization.sideEffects || '',
      status: immunization.status || 'Current'
    }));

    const medHistory = new MedicalHistory({
      owner: newUser._id,
      allergiesEncrypted: EncryptArrayField(processedAllergies),
      chronicConditionsEncrypted: EncryptArrayField(processedChronicConditions),
      surgicalHistoryEncrypted: EncryptArrayField(processedSurgicalHistory),
      immunizationsEncrypted: EncryptArrayField(processedImmunizations),
    });

    const latestWeight = newUser.weightRecords?.[newUser.weightRecords.length - 1]?.value;
    const latestHeight = newUser.heightRecords?.[newUser.heightRecords.length - 1]?.value;
    
    const calculatedBMI = latestWeight && latestHeight
      ? parseFloat((latestWeight / ((latestHeight / 100) ** 2)).toFixed(2))
      : null;

    const vitals = new Vitals({
      owner: newUser._id,
      bloodPressure: bloodPressureSystolic && bloodPressureDiastolic ? [
        {
          systolic: parseInt(bloodPressureSystolic),
          diastolic: parseInt(bloodPressureDiastolic),
          date: new Date()
        }
      ] : [],
      bloodSugar: bloodSugar ? [
        {
          value: parseInt(bloodSugar),
          date: new Date()
        }
      ] : [],
      cholesterol: cholesterol ? [
        {
          value: parseInt(cholesterol),
          date: new Date()
        }
      ] : [],
      heartRate: heartRate ? [
        {
          value: parseInt(heartRate),
          date: new Date()
        }
      ] : [],
      bmi: calculatedBMI ? [
        {
          value: calculatedBMI,
          date: new Date()
        }
      ] : []
    });

    const lifestyle = new Lifestyle({
      owner: newUser._id,
      smokingStatus,
      alcoholConsumption,
      exerciseFrequency,
      dietType,
      sleepDuration
    });

    const emergencyContactPromises = emergencyContactsArray.map(contact => {
      const emergency = new EmergencyContact({
        owner: newUser._id,
        name: contact.name || '',
        phone: contact.phone || '',
        relation: contact.relation || ''
      });
      return emergency.save();
    });

    const savedEmergencyContacts = await Promise.all(emergencyContactPromises);
   console.log("before a;;")
    await Promise.all([
      medHistory.save(),
      vitals.save(),
      lifestyle.save()
    ]);

    console.log("after promise ")

    newUser.medicalHistory = medHistory._id;
    newUser.vitals = vitals._id;
    newUser.lifestyle = lifestyle._id;
    newUser.emergencyContacts = savedEmergencyContacts.map(contact => contact._id);
    console.log("all done")
    await newUser.save();

    console.log("saved")

    const token = jwt.sign({ id: newUser._id },  'secret', { expiresIn: '7d' });

    console.log("token")

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

   console.log("return")
    return res.status(200).json({
      success: true,
      message: 'Signup successful',
      token,
      user: { 
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        walletAddress: newUser.walletAddress,
        bloodGroup: newUser.bloodGroup,
        donorStatus: newUser.donorStatus,
        city: newUser.city,
        state: newUser.state,
        isDoctor : newUser.isDoctor
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};





export const Login = async (req, res) => {
  try {
    console.log("aaya")
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(200).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'None', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success : true, msg: 'Login successful' , token, isDoctor  : user.isDoctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const CheckAuth = async (req, res) => {
  try {
    let token = null;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ msg: "No token. Auth denied" });
    }

    const decoded = jwt.verify(token, 'secret');

    const user = await UserModel.findById(decoded.id).select("name email isDoctor");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ success: true, user , isDoctor : user.isDoctor });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};





export const Logout = async (req, res) => {
  try {
     const token = req.cookies.token;
     if (!token) return res.status(401).json({ msg: 'No token. Auth denied' });
     res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Lax', 
     })
     res.json({success : true})

   } catch (err) {
     res.status(401).json({ msg: 'Token is not valid' });
   }
};







export const Metamask = async (req, res) => {
  const VERIFY_MESSAGE = "Please sign this message to verify ownership of your wallet.";
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res.status(401).json({ error: "Missing wallet signature or address" });
  }

  try {
    const recoveredAddress = ethers.verifyMessage(VERIFY_MESSAGE, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(403).json({ error: "Signature does not match address" });
    }

  
    const user = await UserModel.findOne ({
       walletAddress: recoveredAddress  
    });

    if(!user) {
      return res.status(403).json({ success : false ,  message: "address is not assosiated with any account " });
    }


    res.json({ success: true, message: "Signature verified successfully", address: recoveredAddress });
  } catch (err) {
    console.error("Signature verification failed", err);
    res.status(401).json({ error: "Invalid signature" });
  }
};
