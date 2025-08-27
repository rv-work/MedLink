import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 1. Send SMS
export async function sendSMS() {
  try {
    const msg = await client.messages.create({
      body: "Hello 👋 This is a test SMS",
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to: "+91 8957553773",       // Your verified phone number
    });

    console.log("SMS sent ✅ SID:", msg.sid);
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
  }
}

// 2. Send WhatsApp Message
// async function sendWhatsApp() {
//   try {
//     const message = await client.messages.create({
//       from: process.env.TWILIO_WHATSAPP_NUMBER, // ✅ Twilio sandbox number
//       to: "whatsapp:+918957553773",  // ✅ Your verified WhatsApp number
//       body: "Hello from Twilio Whatsapp test",
//     });

//     console.log("✅ Message sent:", message.sid);
//   } catch (err) {
//     console.error("❌ Error sending WhatsApp:", err);
//   }
// }


// 3. Make a Voice Call
export async function makeCall() {
  try {
    const call = await client.calls.create({
     twiml: `<Response>
              <Say voice="alice">Emergency alert for XYZ. 
              They need immediate medical assistance at ABC HOSTPITAL. 
              Situation: fine ok ok . 
              Please check your messages for more details and respond immediately.
              Repeat: This is an emergency alert for XYZ.
              </Say>
            </Response>`,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to: "+91 74994 54264",       // Your phone number
    });

    console.log("Call initiated ✅ SID:", call.sid);
  } catch (error) {
    console.error("❌ Error making call:", error);
  }
}


//  sendSMS();
//  sendWhatsApp();
 makeCall()


