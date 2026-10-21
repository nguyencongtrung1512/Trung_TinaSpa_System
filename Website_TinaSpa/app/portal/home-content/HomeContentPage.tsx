import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { ImageUpload } from '~/components/ui/ImageUpload'
import { Select } from '~/components/ui/Select'
import {
  HOME_PROCESS_ICONS,
  HOME_PROCESS_MAX_STEPS,
  HOME_TEAM_MAX_MEMBERS,
  homeContentApi,
  type HomeProcessStep,
  type HomeTeamMember
} from '~/lib/home-content'
import { formatPortalDate } from '~/portal/format'
import { Field, inputClass } from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { ContentListEditor, type RowErrors } from './ContentListEditor'

const required = (value: string, message: string) => (value.trim() ? undefined : message)

/** Optional translations are sent as null when left empty. */
const orNull = (value: string | null) => value?.trim() || null

function validateMember(member: HomeTeamMember): RowErrors<HomeTeamMember> {
  return {
    image: required(member.image, 'Tải lên ảnh.'),
    nameVietnamese: required(member.nameVietnamese, 'Nhập tên.'),
    roleVietnamese: required(member.roleVietnamese, 'Nhập chức danh.')
  }
}

function validateStep(step: HomeProcessStep): RowErrors<HomeProcessStep> {
  return {
    titleVietnamese: required(step.titleVietnamese, 'Nhập tiêu đề.'),
    descriptionVietnamese: required(step.descriptionVietnamese, 'Nhập mô tả.')
  }
}

const loadTeam = () => homeContentApi.getTeam().then((value) => value.members)
const saveTeam = (members: readonly HomeTeamMember[]) =>
  homeContentApi
    .saveTeam(
      members.map((member) => ({
        nameVietnamese: member.nameVietnamese.trim(),
        nameEnglish: orNull(member.nameEnglish),
        roleVietnamese: member.roleVietnamese.trim(),
        roleEnglish: orNull(member.roleEnglish),
        image: member.image.trim()
      }))
    )
    .then((value) => value.members)

const loadProcess = () => homeContentApi.getProcess().then((value) => value.steps)
const saveProcess = (steps: readonly HomeProcessStep[]) =>
  homeContentApi
    .saveProcess(
      steps.map((step) => ({
        icon: step.icon,
        titleVietnamese: step.titleVietnamese.trim(),
        titleEnglish: orNull(step.titleEnglish),
        descriptionVietnamese: step.descriptionVietnamese.trim(),
        descriptionEnglish: orNull(step.descriptionEnglish)
      }))
    )
    .then((value) => value.steps)

const blankMember = (): HomeTeamMember => ({
  nameVietnamese: '',
  nameEnglish: null,
  roleVietnamese: '',
  roleEnglish: null,
  image: ''
})

const blankStep = (): HomeProcessStep => ({
  icon: 'spa',
  titleVietnamese: '',
  titleEnglish: null,
  descriptionVietnamese: '',
  descriptionEnglish: null
})

const iconOptions = HOME_PROCESS_ICONS.map((option) => ({ value: option.value, label: option.label }))

/** Nội dung trang chủ (chỉ quản trị): đội ngũ chuyên môn và quy trình làm việc. */
export function HomeContentPage() {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header>
        <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
          <span>{portalRoleLabel.admin}</span>
          <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
        </div>
        <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Nội dung trang chủ</h1>
        <p className='mt-1 text-sm text-muted'>
          Chỉnh các mục cố định trên trang chủ. Bản tiếng Anh để trống sẽ dùng nội dung tiếng Việt.
        </p>
      </header>

      <div className='mt-6 space-y-6'>
        <ContentListEditor<HomeTeamMember>
          title='Đội ngũ chuyên môn'
          description='Mục "Người đồng hành cùng bạn": ảnh, tên và chức danh của từng người.'
          icon='groups'
          itemLabel='Thành viên'
          max={HOME_TEAM_MAX_MEMBERS}
          load={loadTeam}
          save={saveTeam}
          blank={blankMember}
          validate={validateMember}
          renderRow={({ item, errors, update, onUploadingChange }) => (
            <div className='grid gap-4 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]'>
              <Field label='Ảnh' required error={errors.image} hint='Ảnh dọc tỉ lệ 4:5.'>
                {(id) => (
                  <ImageUpload
                    id={id}
                    folder='settings'
                    value={item.image}
                    onChange={(url) => update('image', url)}
                    onUploadingChange={onUploadingChange}
                  />
                )}
              </Field>
              <div className='grid gap-4 sm:grid-cols-2'>
                <Field label='Tên (Tiếng Việt)' required error={errors.nameVietnamese}>
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      value={item.nameVietnamese}
                      maxLength={255}
                      placeholder='BS. Nguyễn Lan'
                      onChange={(event) => update('nameVietnamese', event.target.value)}
                    />
                  )}
                </Field>
                <Field label='Tên (English)'>
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      value={item.nameEnglish ?? ''}
                      maxLength={255}
                      onChange={(event) => update('nameEnglish', event.target.value)}
                    />
                  )}
                </Field>
                <Field label='Chức danh (Tiếng Việt)' required error={errors.roleVietnamese}>
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      value={item.roleVietnamese}
                      maxLength={255}
                      placeholder='Bác sĩ thẩm mỹ'
                      onChange={(event) => update('roleVietnamese', event.target.value)}
                    />
                  )}
                </Field>
                <Field label='Chức danh (English)'>
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      value={item.roleEnglish ?? ''}
                      maxLength={255}
                      onChange={(event) => update('roleEnglish', event.target.value)}
                    />
                  )}
                </Field>
              </div>
            </div>
          )}
        />

        <ContentListEditor<HomeProcessStep>
          title='Quy trình làm việc'
          description='Mục "Các bước đồng hành": số bước tự đánh theo thứ tự, tiêu đề trang chủ đổi theo số bước.'
          icon='format_list_numbered'
          itemLabel='Bước'
          max={HOME_PROCESS_MAX_STEPS}
          load={loadProcess}
          save={saveProcess}
          blank={blankStep}
          validate={validateStep}
          renderRow={({ item, errors, update }) => (
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field label='Biểu tượng' className='sm:col-span-2'>
                {(id) => (
                  <div className='flex items-center gap-3'>
                    <span className='grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-clinic shadow-sm'>
                      <Icon name={item.icon} size={22} />
                    </span>
                    <Select
                      id={id}
                      value={item.icon}
                      onChange={(value) => update('icon', value)}
                      options={iconOptions}
                      className='sm:max-w-xs'
                    />
                  </div>
                )}
              </Field>
              <Field label='Tiêu đề (Tiếng Việt)' required error={errors.titleVietnamese}>
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    value={item.titleVietnamese}
                    maxLength={255}
                    placeholder='Đặt lịch hẹn'
                    onChange={(event) => update('titleVietnamese', event.target.value)}
                  />
                )}
              </Field>
              <Field label='Tiêu đề (English)'>
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    value={item.titleEnglish ?? ''}
                    maxLength={255}
                    onChange={(event) => update('titleEnglish', event.target.value)}
                  />
                )}
              </Field>
              <Field label='Mô tả (Tiếng Việt)' required error={errors.descriptionVietnamese}>
                {(id) => (
                  <textarea
                    id={id}
                    rows={3}
                    className={inputClass}
                    value={item.descriptionVietnamese}
                    maxLength={500}
                    onChange={(event) => update('descriptionVietnamese', event.target.value)}
                  />
                )}
              </Field>
              <Field label='Mô tả (English)'>
                {(id) => (
                  <textarea
                    id={id}
                    rows={3}
                    className={inputClass}
                    value={item.descriptionEnglish ?? ''}
                    maxLength={500}
                    onChange={(event) => update('descriptionEnglish', event.target.value)}
                  />
                )}
              </Field>
            </div>
          )}
        />
      </div>
    </motion.div>
  )
}
