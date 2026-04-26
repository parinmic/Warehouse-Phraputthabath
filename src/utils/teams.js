const TEAMS_WEBHOOK_URL = "https://default8c308e1514804168aed7b0f7a13520.95.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/81d2242fc7604e0da980e0a536facf6e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=KRZ0RER4POavOBuEFKdMTghSx2z5SpPqenVycAgnq34";

export const sendTeamsNotification = async (title, details, imageUrl = null) => {
  try {
    const facts = Object.entries(details).map(([title, value]) => ({ title, value }));

    const card = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              {
                type: "TextBlock",
                text: title,
                weight: "Bolder",
                size: "Medium",
                color: "Accent"
              },
              {
                type: "FactSet",
                facts: facts
              }
            ]
          }
        }
      ]
    };

    if (imageUrl) {
      card.attachments[0].content.body.push({
        type: "Image",
        url: imageUrl,
        size: "Auto"
      });
    }

    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(card),
    });

    if (!response.ok) {
      console.error("Failed to send Teams notification:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending Teams notification:", error);
  }
};
