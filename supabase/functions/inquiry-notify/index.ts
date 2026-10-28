// 온라인 문의 접수 시 관리자 메일 알림
// 트리거: Supabase Database Webhook (public.inquiries INSERT) → 이 함수
// 필요 Secret: RESEND_API_KEY

const NOTIFY_TO = 'cpmaui@paratec.co.kr';
const ADMIN_URL = 'https://www.paratec.co.kr/admin/dashboard.html';
const LANG_LABEL: Record<string, string> = { ko: '한국어', en: '영어', zh: '중국어' };

function esc(v: unknown): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function row(label: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  return `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0;color:#111">${esc(value)}</td></tr>`;
}

// 서명 검증은 게이트웨이(Verify JWT)가 하므로 여기선 역할만 확인 — anon 키로는 호출 불가
function callerRole(req: Request): string {
  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part)).role ?? '';
  } catch {
    return '';
  }
}

Deno.serve(async (req) => {
  if (callerRole(req) !== 'service_role') {
    return new Response('forbidden', { status: 403 });
  }

  const payload = await req.json().catch(() => null);
  const r = payload?.record;
  if (payload?.type !== 'INSERT' || payload?.table !== 'inquiries' || !r) {
    return new Response('ignored', { status: 200 });
  }

  const attachments: { name: string }[] = r.attachments ?? [];
  const date = new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const html = `
    <div style="font-family:-apple-system,'Malgun Gothic',sans-serif;font-size:14px;max-width:600px">
      <h2 style="font-size:18px;margin:0 0 16px">새 온라인 문의가 접수되었습니다</h2>
      <table style="border-collapse:collapse;margin-bottom:16px">
        ${row('접수일시', date)}
        ${row('언어', LANG_LABEL[r.language] ?? r.language)}
        ${row('이름', r.name)}
        ${row('회사명', r.company)}
        ${row('연락처', r.phone)}
        ${row('이메일', r.email)}
        ${row('문의 제품', r.product)}
        ${row('문의 유형', r.inquiry_type)}
        ${row('제목', r.title)}
        ${attachments.length ? row('첨부파일', `${attachments.length}개 (${attachments.map(a => a.name).join(', ')})`) : ''}
      </table>
      <div style="background:#f9fafb;border-radius:8px;padding:14px;white-space:pre-wrap;line-height:1.7;color:#374151">${esc(r.content)}</div>
      <p style="margin-top:20px"><a href="${ADMIN_URL}" style="color:#0066cc;font-weight:600">관리자 페이지에서 확인하기 →</a></p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '파라이엔티 홈페이지 <noreply@paratec.co.kr>',
      to: [NOTIFY_TO],
      reply_to: r.email || undefined,
      subject: `[홈페이지 문의] ${r.title} - ${r.name}${r.company ? ` (${r.company})` : ''}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error', res.status, err);
    return new Response(err, { status: 500 });
  }
  return new Response('sent', { status: 200 });
});
