const router = require("express").Router();
const { google } = require("googleapis");

const GOOGLE_CLIENT_ID =
  "246190552758-iv4qnbua1chul41b87mfch0gsoeqe8bj.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

const REFRESH_TOKEN = "1//0giltSolzyouKCgYIARAAGBASNwF-L9IrGD-Bl5LuIk0h49KDzLEjR7DwJJ7fmq0uaS8GckYKgUxFnXhDb9h_YFX3tYBYhluiIIk"

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
    const authHeader = req.headers.authorization;
    const refreshToken = REFRESH_TOKEN;
    const { bookingConfirm } = req.body;
    const { summary, description, email, startTime, endTime } = bookingConfirm;
    console.log(summary, description, email, startTime, endTime);

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar("v3");
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendNotifications: true,
      requestBody: {
        summary: summary,
        description: description,
        colorId: "7",
        start: {
          dateTime: startTime,
        },
        end: {
          dateTime: endTime,
        },
        attendees: [{ email: email }],
        conferenceData: {
          createRequest: {
              requestId: "sample123",
              conferenceSolutionKey: { type: "hangoutsMeet" },
          },
      },
      },
    });
    res.send(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
