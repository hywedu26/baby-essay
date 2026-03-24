const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

// --- Gemini API 설정 ---
const GEMINI_API_KEY = "AIzaSyDHPHbd9HqzRhnc3bXe4WYMiDV4wkHZUnY";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.generateEssay = functions.https.onRequest(async (req, res) => {
  // CORS 허용 (로컬 테스트 및 웹 앱에서 호출하기 위함)
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-control-allow-headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
  }

  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  try {
    const { entries } = req.body;
    if (!entries || entries.length === 0) {
      return res.status(400).send({ error: "육아 기록이 필요합니다." });
    }

    // Gemini API에 전달할 프롬프트 구성
    const prompt = `
      당신은 아기의 성장 과정을 지켜보는 따뜻한 작가입니다.
      아래의 육아 기록들을 바탕으로, 아기에 대한 사랑과 애정이 듬뿍 담긴 짧은 에세이를 작성해주세요.
      아기의 작은 행동 하나하나에 의미를 부여하고, 미래에 대한 기대를 아름다운 문장으로 표현해주세요.
      
      --- 육아 기록 ---
      ${entries.map(e => `날짜: ${e.date}\n기록: ${e.text}`).join("\n\n")}
      ------------------

      위 기록을 바탕으로 감성적인 에세이를 작성해주세요.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const essayText = response.text();

    return res.status(200).send({ essay: essayText });

  } catch (error) {
    console.error("에세이 생성 중 오류 발생:", error);
    return res.status(500).send({ error: "AI 에세이 생성에 실패했습니다." });
  }
});
