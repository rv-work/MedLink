import {
  UserModel,
} from '../Models/UserModel.js'







export const Emergency = async (req, res) => {
    const { faceDescriptor } = req.body;


  if (!faceDescriptor || faceDescriptor.length !== 128) {
    return res.status(400).json({ error: "Invalid descriptor" });
  }

  try {
    const users = await UserModel.find({ faceDescriptor: { $exists: true } });

    for (let user of users) {
      const distance = euclideanDistance(faceDescriptor, user.faceDescriptor);
      if (distance < 0.5) {
        return res.status(200).json({ name: user.name });
      }
    }
    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    console.error("Emergency login error:", err);
    res.status(500).json({ error: "Server error" });
  }
}


function euclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== 128 || desc2.length !== 128) return Infinity;

  let sum = 0;
  for (let i = 0; i < 128; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}



