const router = require("express").Router();
const { google } = require("googleapis");

const GOOGLE_CLIENT_ID =
  "246190552758-iv4qnbua1chul41b87mfch0gsoeqe8bj.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

const REFRESH_TOKEN =
  "1//0g10oJJ3mxeK8CgYIARAAGBASNwF-L9IropbQEQFHtD9LBWalN12vgAmKNq2HUW_g5bIzTjrLKyusWaW9RQWCbFJ2lh2YuN5e4JA";

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "http://localhost:3000"
);

router.get("/", async (req, res, next) => {
  res.send({ message: "Ok api is working 🚀" });
});

router.post("/create-tokens", async (req, res, next) => {
  try {
    const { code } = req.body;
    const { tokens } = await oauth2Client.getToken(code);
    res.send(tokens);
  } catch (error) {
    next(error);
  }
});

router.post("/create-event", async (req, res, next) => {
  try {
    const { summary, description, email, startDateTime, endDateTime } =
      req.body;
    console.log(summary, description, email, startDateTime, endDateTime);
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const calendar = google.calendar("v3");
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: "primary",
      requestBody: {
        summary: summary,
        description: description,
        location: location,
        colorId: "7",
        start: {
          dateTime: new Date(startDateTime),
        },
        end: {
          dateTime: new Date(endDateTime),
        },
        attendees: [{ email: email }],
      },
    });
    console.log(response);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
