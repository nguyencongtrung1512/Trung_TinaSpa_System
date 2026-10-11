import { SAFE_URL_PATTERN, sanitizeBlogHtml, stripHtml } from './html-sanitizer.util.js';

describe('sanitizeBlogHtml', () => {
  it('keeps normal formatting', () => {
    const html = '<h2>Tiêu đề</h2><p>Nội dung <strong>đậm</strong> và <em>nghiêng</em></p><ul><li>a</li></ul>';
    expect(sanitizeBlogHtml(html)).toBe(html);
  });

  it('removes scripts, styles and their content', () => {
    const out = sanitizeBlogHtml('<p>ok</p><script>alert(1)</script><style>body{display:none}</style>');
    expect(out).toBe('<p>ok</p>');
  });

  it('removes event handlers and inline styles', () => {
    const out = sanitizeBlogHtml('<p onclick="x()" style="color:red">hi</p><img src="https://a.com/i.png" onerror="x()">');
    expect(out).not.toMatch(/onclick|onerror|style=/i);
    expect(out).toContain('<p>hi</p>');
  });

  it('blocks javascript:, data: and vbscript: URLs', () => {
    const out = sanitizeBlogHtml(
      '<a href="javascript:alert(1)">a</a><a href="  JaVaScRiPt:alert(1)">b</a><a href="data:text/html;base64,AAAA">c</a>' +
        '<img src="data:image/svg+xml;base64,AAAA"><a href="vbscript:x">d</a>',
    );
    expect(out).not.toMatch(/javascript|data:|vbscript/i);
  });

  it('drops iframes, objects, embeds, svg and forms', () => {
    const out = sanitizeBlogHtml(
      '<iframe src="https://evil.com"></iframe><object data="x"></object><embed src="x"><svg onload="x()"><circle/></svg><form action="/x"><input></form><p>safe</p>',
    );
    expect(out).not.toMatch(/iframe|object|embed|svg|form|input/i);
    expect(out).toContain('<p>safe</p>');
  });

  it('hardens external links', () => {
    const out = sanitizeBlogHtml('<a href="https://example.com" target="_self">x</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer nofollow ugc"');
  });

  it('rejects protocol-relative links', () => {
    expect(sanitizeBlogHtml('<a href="//evil.com/x">x</a>')).not.toContain('evil.com');
  });

  it('survives mutation-XSS style payloads', () => {
    const out = sanitizeBlogHtml('<noscript><p title="</noscript><img src=x onerror=alert(1)>">');
    expect(out).not.toMatch(/onerror/i);
  });
});

describe('stripHtml / SAFE_URL_PATTERN', () => {
  it('strips tags from plain-text fields', () => {
    expect(stripHtml('Hello <b>world</b><script>alert(1)</script>')).toBe('Hello world');
  });

  it('accepts https and site-relative URLs only', () => {
    expect(SAFE_URL_PATTERN.test('https://cdn.example.com/a.jpg')).toBe(true);
    expect(SAFE_URL_PATTERN.test('/images/a.jpg')).toBe(true);
    expect(SAFE_URL_PATTERN.test('javascript:alert(1)')).toBe(false);
    expect(SAFE_URL_PATTERN.test('http://a.com/x.jpg')).toBe(false);
    expect(SAFE_URL_PATTERN.test('//evil.com/x.jpg')).toBe(false);
    expect(SAFE_URL_PATTERN.test('data:image/png;base64,AAAA')).toBe(false);
  });
});
