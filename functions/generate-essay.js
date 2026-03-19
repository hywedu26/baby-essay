/*
 * functions/generate-essay.js
 * AI 에세이 생성을 위한 서버리스 함수 (Cloudflare Workers)
 */

// 서버 사이드 Mock 에세이 생성 로직
function generateMockEssayFromServer(entries) {
    let essayText = '<h2>우리의 소중한 순간들 (서버 생성)</h2><br>';
    essayText += '<p>함께한 모든 날들이 모여, 반짝이는 하나의 이야기가 되었습니다. 너의 작은 발자취 하나하나가 우리에겐 큰 기쁨이었어.</p><br>';

    // 클라이언트에서 정렬하여 보냈지만, 여기서 다시 정렬하여 안정성을 높일 수 있습니다.
    const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedEntries.forEach(entry => {
        // 간단한 텍스트 정제 (XSS 방지 등 실제 프로덕션에서는 더 강력한 처리가 필요)
        const cleanText = entry.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        essayText += `<strong>${entry.date}</strong><p>${cleanText}</p><br>`;
    });

    essayText += '<p>이 기록들은 단순한 하루의 나열이 아니라, 너와 함께 성장하는 우리의 사랑 이야기야. 앞으로도 모든 순간을 소중히 간직할게. 사랑한다, 우리 아가.</p>';
    return essayText;
}

// POST 요청을 처리하는 핸들러
export async function onRequestPost({ request }) {
    try {
        // 요청 본문에서 JSON 데이터를 파싱합니다.
        const { entries } = await request.json();

        if (!entries || entries.length === 0) {
            return new Response(JSON.stringify({ error: '에세이를 생성할 기록이 없습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Mock 에세이를 생성합니다.
        const essay = generateMockEssayFromServer(entries);

        // 생성된 에세이를 JSON 형태로 응답합니다.
        return new Response(JSON.stringify({ essay }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: `에세이 생성 중 오류가 발생했습니다: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
