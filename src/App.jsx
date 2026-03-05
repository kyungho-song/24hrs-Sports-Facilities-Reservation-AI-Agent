
import { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [schedule, setSchedule] = useState({});
  const [message, setMessage] = useState("안녕하세요! 예약 현황입니다.");
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch the initial schedule from the in-memory server
    fetch('http://localhost:3000/schedule')
      .then(res => res.json())
      .then(data => {
        console.log("Fetched schedule:", data);
        setSchedule(data);
      })
      .catch(err => {
        console.error("Error fetching schedule:", err);
        setMessage("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      });

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'ko-KR';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice transcript:", transcript);
        handleVoiceCommand(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setMessage("음성 인식 중 오류가 발생했습니다.");
      };
      
      recognitionRef.current = recognition;
    } else {
      setMessage("음성 인식이 지원되지 않는 브라우저입니다.");
    }

  }, []);

  const handleVoiceCommand = (transcript) => {
    // Simple command processing
    const lowerCaseTranscript = transcript.toLowerCase();
    
    // Extract time from the command (e.g., "10시 예약해줘")
    const timeMatch = lowerCaseTranscript.match(/(\d{1,2})시/);
    
    if (lowerCaseTranscript.includes("예약") && timeMatch) {
      const time = `${timeMatch[1]}:00`;
      bookTime(time);
    } else {
      setMessage(`"${transcript}" 라고 말씀하셨네요. 예약을 원하시면 "10시 예약" 과 같이 말씀해주세요.`);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setMessage("네, 말씀하세요...");
      recognitionRef.current.start();
    }
  };

  const bookTime = (time) => {
    if (!schedule[time]) {
      setMessage(`'${time}'은 예약 가능한 시간이 아닙니다.`);
      return;
    }

    if (schedule[time].isBooked) {
      setMessage(`'${time}'은 이미 예약된 시간입니다.`);
      return;
    }
    
    setMessage(`'${time}' 예약을 시도하는 중...`);

    // Make a POST request to the in-memory server to book the time
    fetch('http://localhost:3000/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ time: time, userId: 'voice-user' }), // Using a generic userId
    })
    .then(res => {
      if (res.ok) {
        // Optimistically update the UI
        setSchedule(prevSchedule => ({
          ...prevSchedule,
          [time]: { ...prevSchedule[time], isBooked: true, bookedBy: 'voice-user' }
        }));
        setMessage(`'${time}' 예약이 완료되었습니다!`);
        speak(`'${time}' 예약이 완료되었습니다!`);
      } else {
        return res.text().then(text => {
          throw new Error(text);
        });
      }
    })
    .catch(err => {
      console.error("Error booking time:", err);
      setMessage(`예약에 실패했습니다: ${err.message}`);
    });
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>음성인식 풋살장 예약</h1>
        <p className="message">{message}</p>
        <button onClick={startListening} className="mic-button">
          🎤
        </button>
      </header>
      <main className="schedule-container">
        <h2>예약 현황</h2>
        <div className="time-slots">
          {Object.entries(schedule).sort().map(([time, slot]) => (
            <div key={time} className={`time-slot ${slot.isBooked ? 'booked' : 'available'}`}>
              <span className="time">{time}</span>
              <span className="status">{slot.isBooked ? '예약완료' : '예약가능'}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
