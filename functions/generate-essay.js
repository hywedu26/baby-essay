/*
 * functions/generate-essay.js
 * AI 에세이 생성을 위한 서버리스 함수 (Cloudflare Workers with Google Gemini AI)
 */

// AI에게 전달할 프롬프트를 생성하는 함수
function createPrompt(entries) {
    const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let recordsText = '';
    sortedEntries.forEach(entry => {
        recordsText += `- ${entry.date}: ${entry.text}\n`;
    });

    return `
        당신은 아이를 세상에서 가장 사랑하는 부모입니다. 당신의 임무는 아래에 있는 육아 기록들을 바탕으로, 아이에게 보내는 한 편의 따뜻하고 감성적인 에세이를 작성하는 것입니다.

        **에세이 작성 규칙:**
        1. 모든 기록을 자연스럽게 하나로 엮어, 시간의 흐름이 느껴지는 이야기로 만드세요.
        2. 아이에 대한 사랑과 소중함이 문장마다 묻어나오도록 감성적인 표현을 사용하세요.
        3. 부모의 시점에서 아이에게 직접 말하는 듯한 부드러운 문체("~했단다", "~란다", "~해.")를 사용하세요.
        4. 기록에 있는 구체적인 사건들을 언급하며, 그 순간의 감정을 풍부하게 묘사하세요.
        5. 에세이의 시작과 끝은 아이를 향한 사랑의 메시지를 담은 문장으로 감싸주세요.
        6. 결과물은 순수한 에세이 텍스트만 포함해야 하며, 제목이나 추가적인 설명 없이 바로 본문으로 시작하세요.
        7. 최종 결과물은 HTML 형식으로, 단락은 <p> 태그로, 강조하고 싶은 부분은 <strong> 태그를 사용해주세요.

        **다음은 아이의 소중한 기록들입니다:**
        ${recordsText}

        이제, 이 기록들을 바탕으로 아이의 마음을 어루만져 줄 아름다운 에세이를 작성해주세요.
    `;
}

// POST 요청을 처리하는 메인 핸들러
export async function onRequestPost({ request, env }) {
    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    // [FINAL, FINAL, FINAL FIX] The model name was the last point of failure. 
    // Using the specific 'gemini-1.0-pro' model, which is a standard and stable identifier.
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const { entries } = await request.json();

        if (!entries || entries.length === 0) {
            return new Response(JSON.stringify({ error: '에세이를 생성할 기록이 없습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const prompt = createPrompt(entries);

        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text(); 
            console.error("Google AI API Error:", errorBody);
            return new Response(JSON.stringify({
                error: "Google AI API로부터 올바르지 않은 응답을 받았습니다.",
                details: `API가 ${apiResponse.status} 상태 코드로 응답했습니다. API 키와 프로젝트 설정을 확인하세요. 응답 내용: ${errorBody}`
            }), {
                status: apiResponse.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const data = await apiResponse.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
             throw new Error("AI 응답에서 예상된 콘텐츠 구조를 찾을 수 없습니다.");
        }
        
        const essay = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ essay }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in generate-essay function:", error);
        return new Response(JSON.stringify({ error: `에세이 생성 중 내부 서버 오류가 발생했습니다: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
