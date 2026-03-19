/*
 * functions/generate-essay.js
 * [FINAL DIAGNOSTIC VERSION]
 * This version removes all AI-related logic to test if the function deployment is working correctly.
 * It should always return a fixed success message.
 */

export async function onRequestPost({ request, env }) {

    try {
        // We still parse the request to ensure the client-side call is valid.
        const { entries } = await request.json();

        if (!entries || entries.length === 0) {
            return new Response(JSON.stringify({ error: '[Test] No entries received.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Instead of calling any external API, return a fixed success JSON object.
        // This is the message we expect to see on the client-side.
        const successResponse = {
            essay: "<p><strong>진단 성공:</strong> 서버 기능이 성공적으로 업데이트되었습니다.</strong></p><p>만약 이 메시지가 보인다면, 배포 시스템은 정상적으로 작동하고 있습니다. AI 에세이 생성 실패의 원인은 Google AI API 키의 권한, 청구 설정 또는 API 자체의 일시적인 문제일 가능성이 매우 높습니다.</p>"
        };

        return new Response(JSON.stringify(successResponse), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // If an error occurs even in this simplified version, it's likely a fundamental issue.
        return new Response(JSON.stringify({ 
            error: '[Test] An unexpected error occurred in the diagnostic function.',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
