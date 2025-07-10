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
      allergies,
      chronicConditions,
      medications,
      surgeries,
      familyHistory,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bloodSugar,
      cholesterol,
      heartRate,
      smokingStatus,
      alcoholConsumption,
      exerciseFrequency,
      dietType,
      sleepDuration,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
      faceDescriptor
    } = req.body

    console.log("1" , req.body)

    const existingUser = await UserModel.findOne({ email })
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

 
    

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      dob,
      weightRecords: [{ value: weight, dateBy: new Date() }],
      heightRecords: [{ value: height, dateBy: new Date() }],
      bloodGroup,
      allergies,
      walletAddress : "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
      faceDescriptor
    })

    console.log("2" , newUser)


    await newUser.save()



    const medHistory = new MedicalHistory({
      owner: newUser._id,
      chronicConditions: EncryptArrayField(chronicConditions || ''),
      medications: EncryptArrayField(medications || ''),
      surgeries: EncryptArrayField(surgeries || ''),
      familyHistory: EncryptArrayField(familyHistory || '')
    })

    const vitals = new Vitals({
      owner: newUser._id,
      bloodPressure: {
        systolic: bloodPressureSystolic,
        diastolic: bloodPressureDiastolic
      },
      bloodSugar,
      cholesterol,
      heartRate
    })

    const lifestyle = new Lifestyle({
      owner: newUser._id,
      smokingStatus,
      alcoholConsumption,
      exerciseFrequency,
      dietType,
      sleepDuration
    })

    const emergency = new EmergencyContact({
      owner: newUser._id,
      name: emergencyName,
      phone: emergencyPhone,
      relation: emergencyRelation
    })

    await Promise.all([
      medHistory.save(),
      vitals.save(),
      lifestyle.save(),
      emergency.save()
    ])

    newUser.medicalHistory = medHistory._id;
    newUser.vitals = vitals._id;
    newUser.lifestyle = lifestyle._id;
    newUser.emergencyContact = emergency._id;

    await newUser.save(); 

    const token = jwt.sign({ id: newUser._id }, 'secretkey', { expiresIn: '7d' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    })
  } catch (error) {
    console.error('Signup Error:', error)
    res.status(500).json({ message: 'Server error during signup' })
  }
}






export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success : true, msg: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const CheckAuth = async (req, res) => {
  try {
     const token = req.cookies.token;
     if (!token) return res.status(401).json({ msg: 'No token. Auth denied' });

     res.json({success : true})

   } catch (err) {
     res.status(401).json({ msg: 'Token is not valid' });
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
