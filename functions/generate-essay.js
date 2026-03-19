/*
 * functions/generate-essay.js
 * 실제 Google Gemini AI를 호출하여 에세이를 생성하는 서버리스 함수
 */

// Google AI API 엔드포인트
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// AI에게 전달할 프롬프트를 생성하는 함수
function createPrompt(entries) {
    // 기록들을 시간순으로 정렬
    const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 기록들을 하나의 텍스트로 합침
    const entriesText = sortedEntries.map(entry => 
        `날짜: ${entry.date}\n기록: ${entry.text}`
    ).join('\n\n---\n\n');

    // AI에게 역할을 부여하고, 결과물의 형식과 톤앤매너를 지시하는 프롬프트
    return `
        당신은 감성적인 육아 에세이를 작성하는 전문 작가입니다.
        아래에 주어지는 아기와의 일상 기록들을 바탕으로, 부모의 따뜻하고 사랑스러운 마음이 잘 드러나는 한 편의 에세이를 작성해주세요.

        **지침:**
        1. 모든 기록을 자연스럽게 통합하여 하나의 완성된 이야기로 만들어주세요.
        2. 아기의 행동에 대한 부모의 감정과 생각을 풍부하게 묘사해주세요.
        3. 따뜻하고, 부드럽고, 사랑이 넘치는 문체를 사용해주세요.
        4. 결과물은 HTML 형식으로, 제목은 <h2> 태그로, 각 문단은 <p> 태그로 감싸주세요. 문단 사이에는 <br>을 넣어주세요.

        --- 아기 기록 ---
        ${entriesText}
        --- 종료 ---
    `;
}

// Cloudflare Pages의 POST 요청을 처리하는 기본 핸들러
export async function onRequestPost({ request, env }) {
    // 1. 환경 변수에서 API 키를 안전하게 불러오기
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'AI API 키가 설정되지 않았습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // 2. 프론트엔드에서 보낸 기록 데이터 받기
        const { entries } = await request.json();
        if (!entries || entries.length === 0) {
            return new Response(JSON.stringify({ error: '에세이를 생성할 기록이 없습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 3. AI에게 보낼 프롬프트 생성
        const prompt = createPrompt(entries);

        // 4. Google Gemini API 호출
        const apiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error('Google AI API 오류:', errorBody);
            throw new Error(`AI 서비스에서 오류가 발생했습니다. (상태: ${apiResponse.status})`);
        }

        const data = await apiResponse.json();

        // 5. AI 응답에서 에세이 텍스트 추출 및 클라이언트에 전달
        // Gemini의 응답 구조에 따라 텍스트를 추출합니다.
        const essay = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ essay }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('에세이 생성 중 오류 발생:', error);
        return new Response(JSON.stringify({ error: `서버 내부 오류: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
