
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(express.json());

const dbPath = path.join(__dirname, 'database.json');

// Function to read the database
const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { futsal_schedule: {} }; // Return a default structure on error
  }
};

// Function to write to the database
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing database:", error);
  }
};

// Simple Intent Recognition
const getSimpleIntent = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('예약') && (lowerText.includes('하고 싶어') || lowerText.includes('할게'))) {
        // Extract time (this is a very basic example)
        const match = lowerText.match(/(\d{1,2}시)/);
        return { intent: 'BOOK', time: match ? match[1] : null };
    }
    if (lowerText.includes('예약') || lowerText.includes('가능') || lowerText.includes('시간')) {
        return { intent: 'INQUIRE_AVAILABILITY' };
    }
    return { intent: 'UNKNOWN' };
};


app.post('/api/call', (req, res) => {
  const { transcribedText, conversationState } = req.body;
  const db = readDatabase();
  let aiResponseText = "";
  let actions = [];

  const { intent, time } = getSimpleIntent(transcribedText || '');
  const today = '2024-10-26'; // For simplicity, we assume today is this date

  if (intent === 'INQUIRE_AVAILABILITY') {
    const availableSlots = Object.entries(db.futsal_schedule[today] || {})
      .filter(([time, details]) => !details.isBooked)
      .map(([time]) => time);

    if (availableSlots.length > 0) {
      aiResponseText = `네, 예약 가능한 시간은 ${availableSlots.join(', ')} 입니다. 몇 시로 예약하시겠어요?`;
    } else {
      aiResponseText = "죄송합니다, 오늘은 모든 시간이 마감되었습니다.";
      actions.push("HANG_UP");
    }
  } else if (intent === 'BOOK' && time) {
    const formattedTime = `${time.replace('시', '')}:00`;
    const schedule = db.futsal_schedule[today];

    if (schedule && schedule[formattedTime] && !schedule[formattedTime].isBooked) {
      schedule[formattedTime].isBooked = true;
      schedule[formattedTime].bookedBy = "사용자"; // In a real app, get user info
      writeDatabase(db);
      aiResponseText = `${time}에 예약이 완료되었습니다. 확정 문자를 보내드리겠습니다.`;
      actions.push("SEND_SMS"); // Hypothetical action
      actions.push("HANG_UP");
    } else {
      aiResponseText = `죄송합니다, ${time}은 이미 예약되었거나 유효하지 않은 시간입니다. 다른 시간을 선택해주세요.`;
    }
  } else if (intent === 'BOOK' && !time) {
      aiResponseText = "몇 시로 예약을 원하시나요? 시간을 말씀해주세요.";
  } else {
    aiResponseText = "안녕하세요, 풋살장 예약 AI입니다. 예약 가능한 시간을 알려드릴까요, 아니면 바로 예약을 도와드릴까요?";
  }

  res.json({
    response: aiResponseText,
    actions: actions,
    updatedState: { ...conversationState, lastIntent: intent },
  });
});

app.listen(port, () => {
  console.log(`AI server listening on http://localhost:${port}`);
});
