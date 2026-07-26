import { cn } from '@/lib/utils/cn'
import type { ContentBlock, LegalDocument, LegalSection } from '@/app/Terms/_data/legal-content'

function NoteBox({ text }: { text: string }) {
  return (
    <div role="note" className="border-brand-secondary bg-bg-secondary rounded-md border-l-4 p-3">
      <p className="text-text-secondary text-[14px] leading-6">{text}</p>
    </div>
  )
}

function Block({ block, headingTag }: { block: ContentBlock; headingTag: 'h3' | 'h4' }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-text-secondary text-[15px] leading-7">{block.text}</p>
    case 'list':
      return (
        <ul
          className={cn(
            'text-text-secondary list-disc space-y-1 text-[15px] leading-7',
            block.indented ? 'ml-8' : 'ml-5',
          )}
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-[14px]" aria-label={block.caption}>
            <caption className="sr-only">{block.caption}</caption>
            <thead>
              <tr className="border-border-secondary border-b">
                {block.headers.map((header) => (
                  <th key={header} className="text-text-primary px-3 py-2 font-semibold whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-border-primary border-b">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="text-text-secondary px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'subsection': {
      const SubHeadingTag = headingTag
      return (
        <div className="space-y-2">
          <SubHeadingTag className="text-text-primary text-[15px] font-semibold">{block.title}</SubHeadingTag>
          <div className="space-y-2">
            {block.blocks.map((nested, index) => (
              <Block key={index} block={nested} headingTag={headingTag} />
            ))}
          </div>
        </div>
      )
    }
  }
}

function Section({ section, headingTag }: { section: LegalSection; headingTag: 'h2' | 'h3' }) {
  const HeadingTag = headingTag
  const subHeadingTag = headingTag === 'h2' ? 'h3' : 'h4'

  return (
    <section id={section.id} className="space-y-3">
      <HeadingTag className="text-text-primary text-[16px] font-semibold">{section.title}</HeadingTag>
      <div className="space-y-3">
        {section.blocks.map((block, index) => (
          <Block key={index} block={block} headingTag={subHeadingTag} />
        ))}
      </div>
    </section>
  )
}

export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <article className="flex flex-col gap-6 pb-10">
      <div className="space-y-1">
        <h1 className="text-text-primary text-xl font-semibold">{doc.title}</h1>
        {doc.effectiveDate && <p className="text-text-tertiary text-[13px]">{doc.effectiveDate}</p>}
      </div>

      {doc.note && <NoteBox text={doc.note} />}

      {doc.chapters?.map((chapter) => (
        <div key={chapter.title} className="border-border-primary space-y-6 border-t pt-6 first:border-t-0 first:pt-0">
          <h2 className="text-text-primary text-[17px] font-bold">{chapter.title}</h2>
          <div className="space-y-6">
            {chapter.sections.map((section) => (
              <Section key={section.id} section={section} headingTag="h3" />
            ))}
          </div>
        </div>
      ))}

      {doc.sections?.map((section) => (
        <Section key={section.id} section={section} headingTag="h2" />
      ))}

      {doc.bottomNote && <NoteBox text={doc.bottomNote} />}

      {doc.addendum && (
        <div className="border-border-primary space-y-1 border-t pt-4">
          <p className="text-text-tertiary text-[13px] font-medium">부칙</p>
          <p className="text-text-secondary text-[14px] leading-6">{doc.addendum}</p>
        </div>
      )}
    </article>
  )
}
