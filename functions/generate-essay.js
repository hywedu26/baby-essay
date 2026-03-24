
// Cloudflare Functions: /functions/generate-essay.js

/**
 * Creates a detailed prompt for the Gemini AI based on user entries.
 * @param {Array<Object>} entries - An array of entry objects, each with a date and text.
 * @returns {string} The constructed prompt.
 */
function createPrompt(entries) {
    // Sort entries by date to ensure chronological order
    const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Format the entries into a readable string
    const recordsText = sortedEntries.map(entry => 
        `날짜: ${entry.date}\n기록: ${entry.text}`
    ).join('\n\n');

    // Return the final prompt structure for the AI
    return `
        당신은 아이의 부모가 기록한 육아 일기를 바탕으로, 아이의 입장에서 부모에게 보내는 감동적인 편지 형식의 에세이를 작성하는 AI 작가입니다.
        주어진 기록들을 깊이 분석하여 아이의 감정과 생각을 상상하고, 부모에 대한 사랑과 감사를 표현해주세요.

        **다음은 아이의 소중한 기록들입니다:**
        ${recordsText}

        이제, 이 기록들을 바탕으로 아이의 마음을 어루만져 줄 아름다운 에세이를 작성해주세요.
    `;
}

// POST 요청을 처리하는 메인 핸들러
export async function onRequestPost({ request, env }) {
    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    // Last Attempt: Using the specific 'gemini-1.0-pro' model ID.
    // If this fails, the issue is with the Google Cloud Project configuration (API not enabled).
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;

    try {
        // 1. 인증 확인
        // ...

        // 2. 요청 본문 파싱
        const { entries } = await request.json();

        if (!entries || entries.length === 0) {
            return new Response(JSON.stringify({ error: '에세이를 생성할 기록이 없습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 3. Gemini API 프롬프트 생성
        const prompt = createPrompt(entries);

        // 4. Gemini API 호출
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 8192,
                },
            }),
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error("Google AI API Error:", errorBody);
            return new Response(JSON.stringify({ 
                error: "Google AI API로부터 올바르지 않은 응답을 받았습니다.",
                details: `API가 ${apiResponse.status} 상태 코드로 응답했습니다. API 키와 프로젝트 설정을 확인하세요. 응답 내용: ${errorBody}`
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const data = await apiResponse.json();
        
        // 5. 응답 처리 및 클라이언트에 전송
        const essayText = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ essay: essayText }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in generate-essay function:', error);
        return new Response(JSON.stringify({ 
            error: '내부 서버 오류가 발생했습니다.',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
