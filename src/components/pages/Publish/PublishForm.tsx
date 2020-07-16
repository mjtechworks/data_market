import React, { ReactElement } from 'react'
import * as Yup from 'yup'
import { useNavigate } from '@reach/router'
import { toast } from 'react-toastify'
import styles from './PublishForm.module.css'
import { useOcean, usePublish } from '@oceanprotocol/react'
import { Formik, Form as FormFormik, Field } from 'formik'
import Input from '../../atoms/Input'
import Button from '../../atoms/Button'
import { transformPublishFormToMetadata } from './utils'
import { FormContent, FormFieldProps } from '../../../@types/Form'
import { MetadataPublishForm } from '../../../@types/Metadata'
import { File as FileMetadata } from '@oceanprotocol/lib/dist/node/ddo/interfaces/File'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'

const validationSchema = Yup.object().shape<MetadataPublishForm>({
  // ---- required fields ----
  name: Yup.string().required('Required'),
  author: Yup.string().required('Required'),
  cost: Yup.string().required('Required'),
  files: Yup.array<FileMetadata>().required('Required').nullable(),
  description: Yup.string().required('Required'),
  license: Yup.string().required('Required'),
  access: Yup.string().min(4).required('Required'),
  termsAndConditions: Yup.boolean().required('Required'),

  // ---- optional fields ----
  copyrightHolder: Yup.string(),
  tags: Yup.string(),
  links: Yup.object<FileMetadata[]>()
})

const initialValues: MetadataPublishForm = {
  name: undefined,
  author: undefined,
  cost: undefined,
  files: undefined,
  description: undefined,
  license: undefined,
  access: undefined,
  termsAndConditions: undefined,
  copyrightHolder: undefined,
  tags: undefined,
  links: undefined
}

export default function PublishForm({
  content
}: {
  content: FormContent
}): ReactElement {
  const { ocean, account } = useOcean()
  const { publish } = usePublish()
  const navigate = useNavigate()
  const { marketAddress } = useSiteMetadata()

  async function handleSubmit(values: MetadataPublishForm) {
    const submittingToast = toast.info('submitting asset')

    console.log(`
      Collected form values:
      ----------------------
      ${JSON.stringify(values)}
    `)

    const metadata = transformPublishFormToMetadata(values)
    const tokensToMint = '4' // how to know this?

    console.log(`
      Transformed metadata values:
      ----------------------
      ${JSON.stringify(metadata)}
      Cost: ${values.cost}
      Tokens to mint: ${tokensToMint}
    `)

    try {
      const ddo = await publish(
        metadata as any,
        tokensToMint,
        marketAddress,
        values.cost
      )

      // User feedback and redirect to new asset detail page
      toast.success('asset created successfully')
      toast.dismiss(submittingToast)
      navigate(`/asset/${ddo.id}`)
    } catch (error) {
      console.error(error.message)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      initialStatus="empty"
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        await handleSubmit(values)
        setSubmitting(false)
      }}
    >
      {({ isSubmitting, isValid, status, setStatus }) => (
        <FormFormik
          className={styles.form}
          onChange={() => status === 'empty' && setStatus(null)}
        >
          {content.data.map((field: FormFieldProps) => (
            <Field key={field.name} {...field} component={Input} />
          ))}

          <Button
            style="primary"
            type="submit"
            disabled={
              !ocean ||
              !account ||
              isSubmitting ||
              !isValid ||
              status === 'empty'
            }
          >
            Submit
          </Button>
        </FormFormik>
      )}
    </Formik>
  )
}
