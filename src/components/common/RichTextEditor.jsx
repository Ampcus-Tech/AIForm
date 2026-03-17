import React, { useRef, useEffect } from 'react'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li']

/**
 * Sanitize HTML to only allow safe tags (headings, bold, italic, lists).
 */
export function sanitizeDescriptionHtml(html) {
  if (!html || typeof html !== 'string') return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return [node.cloneNode(true)]
    if (node.nodeType !== Node.ELEMENT_NODE) return []
    const tag = node.tagName.toLowerCase()
    if (!ALLOWED_TAGS.includes(tag)) {
      return Array.from(node.childNodes).flatMap((child) => walk(child))
    }
    const el = doc.createElement(tag)
    Array.from(node.childNodes).forEach((child) => {
      walk(child).forEach((cloned) => el.appendChild(cloned))
    })
    return [el]
  }
  const body = doc.body
  const fragment = doc.createDocumentFragment()
  Array.from(body.childNodes).forEach((child) => {
    walk(child).forEach((cloned) => fragment.appendChild(cloned))
  })
  const out = doc.createElement('div')
  out.appendChild(fragment)
  return out.innerHTML
}

/**
 * Renders sanitized description HTML (for display only).
 */
export function SafeDescriptionHtml({ html, className, style, as = 'div' }) {
  const sanitized = sanitizeDescriptionHtml(html || '')
  if (!sanitized) return null
  const cls = [className, 'description-html'].filter(Boolean).join(' ')
  const Tag = as
  return (
    <Tag
      className={cls}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

const TOOLBAR_BUTTONS = [
  { cmd: 'bold', label: 'B', title: 'Bold', tag: 'b' },
  { cmd: 'italic', label: 'I', title: 'Italic', tag: 'i' },
  { cmd: 'underline', label: 'U', title: 'Underline', tag: 'u' },
  { type: 'separator' },
  { cmd: 'formatBlock', value: '<h2>', label: 'H2', title: 'Heading 2' },
  { cmd: 'formatBlock', value: '<h3>', label: 'H3', title: 'Heading 3' },
  { cmd: 'formatBlock', value: '<p>', label: 'P', title: 'Paragraph' },
  { type: 'separator' },
  { cmd: 'insertUnorderedList', label: '•', title: 'Bullet list' },
  { cmd: 'insertOrderedList', label: '1.', title: 'Numbered list' },
]

function RichTextEditor({ value = '', onChange, placeholder = 'Enter description...', minHeight = 120, disabled }) {
  const editorRef = useRef(null)
  const isInternalChange = useRef(false)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (!isInternalChange.current && el.innerHTML !== value) {
      el.innerHTML = value || ''
    }
    isInternalChange.current = false
  }, [value])

  const handleInput = () => {
    const html = editorRef.current?.innerHTML ?? ''
    isInternalChange.current = true
    onChange(html)
  }

  const execCommand = (cmd, val) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    handleInput()
  }

  return (
    <div
      className="rich-text-editor"
      style={{
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px',
          padding: '8px 10px',
          background: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        {TOOLBAR_BUTTONS.map((btn, i) =>
          btn.type === 'separator' ? (
            <span key={i} style={{ width: '1px', background: '#ccc', margin: '0 4px' }} />
          ) : (
            <button
              key={i}
              type="button"
              title={btn.title}
              disabled={disabled}
              onMouseDown={(e) => {
                e.preventDefault()
                execCommand(btn.cmd, btn.value)
              }}
              style={{
                minWidth: '28px',
                height: '28px',
                padding: '0 6px',
                border: 'none',
                borderRadius: '4px',
                background: 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: btn.cmd === 'bold' ? 700 : 400,
                fontStyle: btn.cmd === 'italic' ? 'italic' : 'normal',
                textDecoration: btn.cmd === 'underline' ? 'underline' : 'none',
                fontSize: '0.9em',
              }}
              onMouseEnter={(e) => !disabled && (e.target.style.background = '#e0e0e0')}
              onMouseLeave={(e) => (e.target.style.background = 'transparent')}
            >
              {btn.label}
            </button>
          )
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight: `${minHeight}px`,
          padding: '12px 16px',
          outline: 'none',
          fontSize: '1em',
          lineHeight: 1.5,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      />
      <style>{`
        .rich-text-editor [contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: #999;
        }
        .rich-text-editor [contenteditable] h2 { font-size: 1.25em; margin: 0.75em 0 0.35em; font-weight: 600; }
        .rich-text-editor [contenteditable] h3 { font-size: 1.1em; margin: 0.6em 0 0.25em; font-weight: 600; }
        .rich-text-editor [contenteditable] p { margin: 0.35em 0; }
        .rich-text-editor [contenteditable] ul, .rich-text-editor [contenteditable] ol { margin: 0.35em 0; padding-left: 1.5em; }
        .description-html h2 { font-size: 1.2em; margin: 0.75em 0 0.35em; font-weight: 600; }
        .description-html h3 { font-size: 1.05em; margin: 0.6em 0 0.25em; font-weight: 600; }
        .description-html p { margin: 0.35em 0; }
        .description-html ul, .description-html ol { margin: 0.35em 0; padding-left: 1.5em; }
      `}</style>
    </div>
  )
}

export default RichTextEditor
