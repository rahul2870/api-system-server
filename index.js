const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./utils/mongodb');

const accountSid = "AC76d34b5e87adddd340cdd78613d692fe";
const authToken = "a5b40a189020614a68ce2f65145e3f31";
const client = require('twilio')(accountSid, authToken);

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON body data

app.get('/', (req, res) => {
    res.json({ status: "working 4" });
});

app.post('/send-sms', async (req, res) => {
    try {
        const data = req.body; // Access the parsed JSON data from the request body
        const { db } = await connectToDatabase();

        const message = await client.messages.create({
            body: data?.text || '',
            from: '+14302335118',
            to: '+918448443891',
            // to: '+919810153260', 
        });

        await db.collection('sent-messages').insertOne({
            ...data,
            createdAt: new Date(),
            twilioSid: message.sid,
        });

        res.json({ success: true });
    } catch (error) {
        console.log("error : ", error)
        res.status(400).json({ success: false, error });
    }
});

app.post('/sent-sms-list', async (req, res) => {
    try {
        const { sortByTime } = req.body;
        const { db } = await connectToDatabase();
        const messagesCollection = db.collection('sent-messages');
        const messages = await messagesCollection.find().sort({ createdAt: sortByTime || 1 }).toArray();
        res.json({ success: true, messages });
    } catch (error) {
        res.status(400).json({ success: false, error });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log("server is running")
});