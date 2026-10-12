import { Icon } from '~/components/ui/Icon'
import { ImageUpload } from '~/components/ui/ImageUpload'
import { Field, iconButtonClass, inputClass, outlineButtonClass } from '../services/form-ui'
import { detailTypeMeta, detailTypes, type ProductDetail, type ProductDetailType } from './product.api'

export interface DetailRow {
  /** Local key only; never sent to the API. */
  readonly key: string
  readonly detailType: ProductDetailType
  readonly nameVietnamese: string
  readonly nameEnglish: string
  readonly contentVietnamese: string
  readonly contentEnglish: string
  readonly icon: string
  readonly image: string
  readonly imageAlt: string
}

const englishLabel: Record<ProductDetailType, string> = {
  STORY: 'Story',
  HIGHLIGHT: 'Highlight',
  EFFECT: 'Effect',
  INGREDIENT: 'Ingredient',
  USAGE: 'Usage',
  NOTE: 'Note',
  GALLERY: 'Gallery'
}

let counter = 0
const nextKey = () => `detail-${(counter += 1)}`

export function newRow(detailType: ProductDetailType): DetailRow {
  return {
    key: nextKey(),
    detailType,
    nameVietnamese: detailType === 'EFFECT' ? '' : detailTypeMeta[detailType].label,
    nameEnglish: detailType === 'EFFECT' ? '' : englishLabel[detailType],
    contentVietnamese: '',
    contentEnglish: '',
    icon: detailType === 'EFFECT' ? 'spa' : '',
    image: '',
    imageAlt: ''
  }
}

export function rowsFromDetails(details: readonly ProductDetail[] | undefined): DetailRow[] {
  return [...(details ?? [])]
    .sort((a, b) => detailTypes.indexOf(a.detailType) - detailTypes.indexOf(b.detailType) || a.sortOrder - b.sortOrder)
    .map((detail) => ({
      key: nextKey(),
      detailType: detail.detailType,
      nameVietnamese: detail.nameVietnamese,
      nameEnglish: detail.nameEnglish ?? '',
      contentVietnamese: detail.contentVietnamese ?? '',
      contentEnglish: detail.contentEnglish ?? '',
      icon: detail.icon ?? '',
      image: detail.image ?? '',
      imageAlt: detail.imageAlt ?? ''
    }))
}

const blank = (value: string) => value.trim() || null

/** Empty rows are dropped; sortOrder restarts at 1 for each detail type. */
export function rowsToDetails(rows: readonly DetailRow[]): ProductDetail[] {
  const seen = new Map<ProductDetailType, number>()
  const details: ProductDetail[] = []
  for (const type of detailTypes) {
    for (const row of rows.filter((item) => item.detailType === type)) {
      const isGallery = type === 'GALLERY'
      const hasContent = isGallery
        ? row.image.trim() !== ''
        : row.contentVietnamese.trim() !== '' || (type === 'EFFECT' && row.nameVietnamese.trim() !== '')
      if (!hasContent) continue
      const order = (seen.get(type) ?? 0) + 1
      seen.set(type, order)
      details.push({
        detailType: type,
        nameVietnamese: row.nameVietnamese.trim() || detailTypeMeta[type].label,
        nameEnglish: blank(row.nameEnglish),
        nameCambodia: null,
        contentVietnamese: isGallery ? null : blank(row.contentVietnamese),
        contentEnglish: isGallery ? null : blank(row.contentEnglish),
        contentCambodia: null,
        icon: type === 'EFFECT' ? blank(row.icon) : null,
        image: isGallery ? blank(row.image) : null,
        imageAlt: isGallery ? blank(row.imageAlt) : null,
        sortOrder: order
      })
    }
  }
  return details
}

export interface ProductDetailsEditorProps {
  readonly rows: readonly DetailRow[]
  readonly onChange: (rows: DetailRow[]) => void
  readonly onUploadingChange: (uploading: boolean) => void
}

export function ProductDetailsEditor({ rows, onChange, onUploadingChange }: ProductDetailsEditorProps) {
  const patch = (key: string, changes: Partial<DetailRow>) =>
    onChange(rows.map((row) => (row.key === key ? { ...row, ...changes } : row)))
  const remove = (key: string) => onChange(rows.filter((row) => row.key !== key))

  return (
    <div className='space-y-5'>
      {detailTypes.map((type) => {
        const group = rows.filter((row) => row.detailType === type)
        return (
          <section key={type} aria-label={detailTypeMeta[type].label}>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <h3 className='text-sm font-bold text-ink'>{detailTypeMeta[type].label}</h3>
                <p className='text-xs text-muted'>{detailTypeMeta[type].hint}</p>
              </div>
              <button type='button' className={outlineButtonClass} onClick={() => onChange([...rows, newRow(type)])}>
                <Icon name='add' size={16} />
                Thêm
              </button>
            </div>
            {group.length > 0 ? (
              <ul className='mt-3 space-y-3'>
                {group.map((row, index) => (
                  <li key={row.key} className='rounded-2xl border border-rose-soft/70 bg-canvas/40 p-3'>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-xs font-bold text-muted'>#{index + 1}</span>
                      <button
                        type='button'
                        className={`${iconButtonClass} hover:text-red-600`}
                        aria-label={`Xóa mục ${index + 1} của ${detailTypeMeta[type].label}`}
                        onClick={() => remove(row.key)}
                      >
                        <Icon name='delete' size={18} />
                      </button>
                    </div>
                    {type === 'GALLERY' ? (
                      <div className='grid gap-3 sm:grid-cols-2'>
                        <Field label='Ảnh'>
                          {(id) => (
                            <ImageUpload
                              id={id}
                              folder='products'
                              value={row.image}
                              onChange={(url) => patch(row.key, { image: url })}
                              onUploadingChange={onUploadingChange}
                            />
                          )}
                        </Field>
                        <Field label='Mô tả ảnh (alt)'>
                          {(id) => (
                            <input
                              id={id}
                              className={inputClass}
                              value={row.imageAlt}
                              maxLength={255}
                              onChange={(event) => patch(row.key, { imageAlt: event.target.value })}
                            />
                          )}
                        </Field>
                      </div>
                    ) : (
                      <div className='grid gap-3 sm:grid-cols-2'>
                        {type === 'EFFECT' ? (
                          <>
                            <Field label='Tiêu đề (Việt)'>
                              {(id) => (
                                <input
                                  id={id}
                                  className={inputClass}
                                  value={row.nameVietnamese}
                                  maxLength={255}
                                  onChange={(event) => patch(row.key, { nameVietnamese: event.target.value })}
                                />
                              )}
                            </Field>
                            <Field label='Title (English)'>
                              {(id) => (
                                <input
                                  id={id}
                                  className={inputClass}
                                  value={row.nameEnglish}
                                  maxLength={255}
                                  onChange={(event) => patch(row.key, { nameEnglish: event.target.value })}
                                />
                              )}
                            </Field>
                            <Field label='Icon' hint='Tên Material Symbols, VD: spa, water_drop.' className='sm:col-span-2'>
                              {(id) => (
                                <input
                                  id={id}
                                  className={inputClass}
                                  value={row.icon}
                                  maxLength={100}
                                  onChange={(event) => patch(row.key, { icon: event.target.value })}
                                />
                              )}
                            </Field>
                          </>
                        ) : null}
                        <Field label='Nội dung (Việt)'>
                          {(id) => (
                            <textarea
                              id={id}
                              rows={2}
                              className={`${inputClass} resize-y`}
                              value={row.contentVietnamese}
                              maxLength={4000}
                              onChange={(event) => patch(row.key, { contentVietnamese: event.target.value })}
                            />
                          )}
                        </Field>
                        <Field label='Content (English)'>
                          {(id) => (
                            <textarea
                              id={id}
                              rows={2}
                              className={`${inputClass} resize-y`}
                              value={row.contentEnglish}
                              maxLength={4000}
                              onChange={(event) => patch(row.key, { contentEnglish: event.target.value })}
                            />
                          )}
                        </Field>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
